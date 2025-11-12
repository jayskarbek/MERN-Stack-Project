import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../controllers/auth_controller.dart';
import '../../../controllers/parks_controller.dart';
import '../../../models/park.dart';
import '../../../models/review.dart';
import '../../../utils/wikipedia_image_helper.dart';

class ParkDetailsArguments {
  const ParkDetailsArguments({required this.parkId});

  final String parkId;
}

class ParkDetailsScreen extends StatefulWidget {
  const ParkDetailsScreen({super.key, required this.arguments});

  static const String routeName = '/park-details';

  final ParkDetailsArguments arguments;

  @override
  State<ParkDetailsScreen> createState() => _ParkDetailsScreenState();
}

class _ParkDetailsScreenState extends State<ParkDetailsScreen>
    with TickerProviderStateMixin {
  Park? _park;
  List<Review> _reviews = <Review>[];
  bool _isLoading = true;
  String? _error;
  bool _isSubmittingReview = false;
  
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    
    // Initialize animations
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );
    
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));
    
    _loadData();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final parksController = context.read<ParksController>();
    final park = await parksController.fetchPark(
      widget.arguments.parkId,
      forceRefresh: true,
    );
    final reviews = await parksController.fetchReviews(
      widget.arguments.parkId,
      forceRefresh: true,
    );

    if (!mounted) return;

    setState(() {
      _park = park;
      _reviews = reviews;
      _isLoading = false;
      _error = parksController.errorMessage;
    });
    
    // Start animations
    _fadeController.forward();
    _slideController.forward();
  }

  Future<void> _handleComposerSubmit(ReviewSubmission submission) async {
    final authController = context.read<AuthController>();
    if (!authController.isAuthenticated) {
      _showMessage('Please login to leave a review.', isError: true);
      return;
    }

    setState(() => _isSubmittingReview = true);
    final parksController = context.read<ParksController>();
    final success = await parksController.submitReview(
      parkId: widget.arguments.parkId,
      submission: submission,
    );

    if (!mounted) return;

    setState(() => _isSubmittingReview = false);

    if (success) {
      _showMessage('Review submitted successfully!', isError: false);
      final reviews = await parksController.fetchReviews(
        widget.arguments.parkId,
        forceRefresh: true,
      );
      if (!mounted) return;
      setState(() => _reviews = reviews);
    } else {
      final error = parksController.errorMessage ?? 
          'Unable to submit review at this time.';
      _showMessage(error, isError: true);
    }
  }

  void _showMessage(String message, {required bool isError}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                isError ? Icons.error_outline : Icons.check_circle_outline,
                color: Colors.white,
              ),
              const SizedBox(width: 12),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: isError ? Colors.red.shade700 : Colors.green.shade700,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final park = _park;
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: _isLoading
          ? const _LoadingView()
          : park == null
              ? _ErrorView(
                  message: _error ?? 'We could not load this park. Please try again.',
                  onRetry: _loadData,
                )
              : CustomScrollView(
                  slivers: [
                    // Enhanced App Bar with Image
                    Builder(builder: (context) {
                      final heroUrl = WikipediaImageHelper.getDisplayUrl(
                        park.imageUrl,
                        targetWidth: 2000,
                      );
                      final hasHeroImage = heroUrl.isNotEmpty;
                      return SliverAppBar(
                        expandedHeight: size.height * 0.4,
                        pinned: true,
                        elevation: 0,
                        backgroundColor: theme.primaryColor,
                        iconTheme: const IconThemeData(color: Colors.white),
                        flexibleSpace: FlexibleSpaceBar(
                          title: FadeTransition(
                            opacity: _fadeAnimation,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.black.withOpacity(0.7),
                                    Colors.transparent,
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                park.name,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  shadows: [
                                    Shadow(
                                      blurRadius: 8,
                                      color: Colors.black54,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          background: hasHeroImage
                              ? Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Hero(
                                      tag: 'park-image-${park.id}',
                                      child: CachedNetworkImage(
                                        imageUrl: heroUrl,
                                        fit: BoxFit.cover,
                                        memCacheHeight: 1200,
                                        memCacheWidth: 1200,
                                        fadeInDuration:
                                            const Duration(milliseconds: 500),
                                        placeholder: (context, url) => Container(
                                          color: Colors.grey.shade300,
                                          child: const Center(
                                            child: CircularProgressIndicator(
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                        errorWidget: (context, url, error) =>
                                            Container(
                                          color: Colors.grey.shade300,
                                          child: const Icon(
                                            Icons.landscape,
                                            size: 64,
                                            color: Colors.white54,
                                          ),
                                        ),
                                      ),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            Colors.transparent,
                                            Colors.black.withOpacity(0.7),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                              : Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        theme.primaryColor.withOpacity(0.8),
                                        theme.primaryColor,
                                      ],
                                    ),
                                  ),
                                  child: const Icon(
                                    Icons.landscape,
                                    size: 64,
                                    color: Colors.white54,
                                  ),
                                ),
                        ),
                      );
                    }),
                    
                    // Content
                    SliverToBoxAdapter(
                      child: FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
                          child: RefreshIndicator(
                            onRefresh: _loadData,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Location Card
                                  if (park.city != null && park.state != null)
                                    _InfoCard(
                                      icon: Icons.location_on,
                                      title: 'Location',
                                      content: '${park.city}, ${park.state}',
                                    ),
                                  
                                  const SizedBox(height: 16),
                                  
                                  // Ratings Card
                                  _RatingsCard(park: park),
                                  
                                  const SizedBox(height: 16),
                                  
                                  // Description Card
                                  if (park.description != null && 
                                      park.description!.isNotEmpty)
                                    _DescriptionCard(description: park.description!),
                                  
                                  const SizedBox(height: 24),
                                  
                                  // Review Section Title
                                  Row(
                                    children: [
                                      Container(
                                        width: 4,
                                        height: 24,
                                        decoration: BoxDecoration(
                                          color: theme.primaryColor,
                                          borderRadius: BorderRadius.circular(2),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Text(
                                        'Share Your Experience',
                                        style: theme.textTheme.headlineSmall?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  
                                  const SizedBox(height: 16),
                                  
                                  // Enhanced Review Composer
                                  _EnhancedReviewComposer(
                                    isSubmitting: _isSubmittingReview,
                                    onSubmit: _handleComposerSubmit,
                                  ),
                                  
                                  const SizedBox(height: 32),
                                  
                                  // Reviews Section
                                  Row(
                                    children: [
                                      Container(
                                        width: 4,
                                        height: 24,
                                        decoration: BoxDecoration(
                                          color: theme.primaryColor,
                                          borderRadius: BorderRadius.circular(2),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Text(
                                        'Visitor Reviews',
                                        style: theme.textTheme.headlineSmall?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const Spacer(),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: theme.primaryColor.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          '${_reviews.length} Reviews',
                                          style: TextStyle(
                                            color: theme.primaryColor,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  
                                  const SizedBox(height: 16),
                                  
                                  if (_reviews.isEmpty)
                                    Center(
                                      child: Container(
                                        padding: const EdgeInsets.all(32),
                                        child: Column(
                                          children: [
                                            Icon(
                                              Icons.rate_review_outlined,
                                              size: 48,
                                              color: Colors.grey.shade400,
                                            ),
                                            const SizedBox(height: 16),
                                            Text(
                                              'No reviews yet',
                                              style: theme.textTheme.titleLarge?.copyWith(
                                                color: Colors.grey.shade600,
                                              ),
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              'Be the first to share your experience!',
                                              style: theme.textTheme.bodyMedium?.copyWith(
                                                color: Colors.grey.shade500,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  
                                  // Reviews List
                                  ...List.generate(_reviews.length, (index) {
                                    return TweenAnimationBuilder<double>(
                                      tween: Tween(begin: 0.0, end: 1.0),
                                      duration: Duration(milliseconds: 300 + (index * 100)),
                                      curve: Curves.easeOutCubic,
                                      builder: (context, value, child) {
                                        return Transform.translate(
                                          offset: Offset(0, 20 * (1 - value)),
                                          child: Opacity(
                                            opacity: value,
                                            child: child,
                                          ),
                                        );
                                      },
                                      child: _EnhancedReviewCard(
                                        review: _reviews[index],
                                        index: index,
                                      ),
                                    );
                                  }),
                                  
                                  const SizedBox(height: 80),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}

// Loading View Widget
class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: const CircularProgressIndicator(
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Loading park details...',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}

// Error View Widget
class _ErrorView extends StatelessWidget {
  const _ErrorView({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline,
                size: 48,
                color: Colors.red.shade400,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try again'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Info Card Widget
class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.content,
  });

  final IconData icon;
  final String title;
  final String content;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                content,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Ratings Card Widget
class _RatingsCard extends StatelessWidget {
  const _RatingsCard({required this.park});

  final Park park;

  @override
  Widget build(BuildContext context) {
    if (park.ratingBreakdown == null && park.averageRating == null) {
      return const SizedBox.shrink();
    }
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.amber.shade50,
            Colors.orange.shade50,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                park.averageRating?.toStringAsFixed(1) ?? '0.0',
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.orange.shade800,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: List.generate(5, (index) {
                      final rating = park.averageRating ?? 0;
                      return Icon(
                        index < rating ? Icons.star : Icons.star_border,
                        color: Colors.amber.shade600,
                        size: 20,
                      );
                    }),
                  ),
                  if (park.reviewCount != null)
                    Text(
                      '${park.reviewCount} reviews',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                      ),
                    ),
                ],
              ),
            ],
          ),
          if (park.ratingBreakdown != null) ...[
            const SizedBox(height: 20),
            _RatingBar(
              label: 'Views',
              rating: park.ratingBreakdown!.views,
              color: Colors.blue,
            ),
            const SizedBox(height: 12),
            _RatingBar(
              label: 'Location',
              rating: park.ratingBreakdown!.location,
              color: Colors.green,
            ),
            const SizedBox(height: 12),
            _RatingBar(
              label: 'Amenities',
              rating: park.ratingBreakdown!.amenities,
              color: Colors.purple,
            ),
          ],
        ],
      ),
    );
  }
}

// Rating Bar Widget
class _RatingBar extends StatelessWidget {
  const _RatingBar({
    required this.label,
    required this.rating,
    required this.color,
  });

  final String label;
  final double rating;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Stack(
            children: [
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              FractionallySizedBox(
                widthFactor: rating / 5,
                child: Container(
                  height: 8,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Text(
          rating.toStringAsFixed(1),
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}

// Description Card Widget
class _DescriptionCard extends StatelessWidget {
  const _DescriptionCard({required this.description});

  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: Theme.of(context).primaryColor,
              ),
              const SizedBox(width: 8),
              Text(
                'About',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

// Enhanced Review Composer
class _EnhancedReviewComposer extends StatefulWidget {
  const _EnhancedReviewComposer({
    required this.onSubmit,
    required this.isSubmitting,
  });

  final Future<void> Function(ReviewSubmission submission) onSubmit;
  final bool isSubmitting;

  @override
  State<_EnhancedReviewComposer> createState() => 
      _EnhancedReviewComposerState();
}

class _EnhancedReviewComposerState extends State<_EnhancedReviewComposer> 
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _commentController = TextEditingController();
  int _views = 0;
  int _location = 0;
  int _amenities = 0;
  
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _commentController.addListener(() => setState(() {}));
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  bool get _canSubmit =>
      _views > 0 && _location > 0 && _amenities > 0 && !_commentEmpty;

  bool get _commentEmpty => _commentController.text.trim().isEmpty;

  @override
  void dispose() {
    _commentController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_canSubmit) return;

    _animationController.forward().then((_) {
      _animationController.reverse();
    });

    await widget.onSubmit(
      ReviewSubmission(
        views: _views.toDouble(),
        location: _location.toDouble(),
        amenities: _amenities.toDouble(),
        comment: _commentController.text.trim(),
      ),
    );
    
    if (!mounted) return;
    setState(() {
      _views = 0;
      _location = 0;
      _amenities = 0;
      _commentController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _EnhancedStarSelector(
              label: 'Views',
              value: _views,
              color: Colors.blue,
              icon: Icons.landscape,
              onChanged: (value) => setState(() => _views = value),
            ),
            const SizedBox(height: 16),
            _EnhancedStarSelector(
              label: 'Location',
              value: _location,
              color: Colors.green,
              icon: Icons.map,
              onChanged: (value) => setState(() => _location = value),
            ),
            const SizedBox(height: 16),
            _EnhancedStarSelector(
              label: 'Amenities',
              value: _amenities,
              color: Colors.purple,
              icon: Icons.spa,
              onChanged: (value) => setState(() => _amenities = value),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _commentController,
              decoration: InputDecoration(
                labelText: 'Share your experience',
                hintText: 'What did you enjoy about your visit?',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.primaryColor,
                    width: 2,
                  ),
                ),
                prefixIcon: const Icon(Icons.edit_note),
              ),
              maxLines: 4,
              maxLength: 500,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please share a few words about your visit';
                }
                if (value.trim().length < 10) {
                  return 'Please write at least 10 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),
            ScaleTransition(
              scale: _scaleAnimation,
              child: Container(
                width: double.infinity,
                height: 56,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _canSubmit
                        ? [theme.primaryColor, theme.primaryColor.withBlue(200)]
                        : [Colors.grey.shade400, Colors.grey.shade500],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: _canSubmit
                      ? [
                          BoxShadow(
                            color: theme.primaryColor.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ]
                      : [],
                ),
                child: MaterialButton(
                  onPressed: widget.isSubmitting || !_canSubmit ? null : _handleSubmit,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: widget.isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.send, color: Colors.white),
                            const SizedBox(width: 8),
                            const Text(
                              'Submit Review',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Enhanced Star Selector
class _EnhancedStarSelector extends StatefulWidget {
  const _EnhancedStarSelector({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
    required this.onChanged,
  });

  final String label;
  final int value;
  final Color color;
  final IconData icon;
  final ValueChanged<int> onChanged;

  @override
  State<_EnhancedStarSelector> createState() => _EnhancedStarSelectorState();
}

class _EnhancedStarSelectorState extends State<_EnhancedStarSelector> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  int _hoveredStar = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: widget.color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(widget.icon, color: widget.color),
                    const SizedBox(width: 8),
                    Text(
                      widget.label,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: widget.color,
                          ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: widget.value > 0
                            ? widget.color
                            : Colors.grey.shade400,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        widget.value > 0 ? '${widget.value}/5' : '--',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: List<Widget>.generate(5, (index) {
                    final starValue = index + 1;
                    final isSelected = starValue <= widget.value;
                    final isHovered = starValue <= _hoveredStar;

                    return MouseRegion(
                      onEnter: (_) => setState(() => _hoveredStar = starValue),
                      onExit: (_) => setState(() => _hoveredStar = 0),
                      child: GestureDetector(
                        onTap: () {
                          widget.onChanged(starValue);
                          _controller.forward().then((_) {
                            _controller.reverse();
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(4),
                          child: AnimatedScale(
                            scale:
                                isSelected || isHovered ? 1.2 : 1.0,
                            duration: const Duration(milliseconds: 200),
                            child: Icon(
                              isSelected ? Icons.star : Icons.star_border,
                              color: widget.color,
                              size: 28,
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Enhanced Review Card
class _EnhancedReviewCard extends StatelessWidget {
  const _EnhancedReviewCard({
    required this.review,
    required this.index,
  });

  final Review review;
  final int index;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final overall = review.ratings.overall ??
        ((review.ratings.views +
                review.ratings.location +
                review.ratings.amenities) /
            3);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            // Background gradient
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.amber.shade400,
                      Colors.orange.shade400,
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade50,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.star, 
                                color: Colors.amber.shade700, size: 20),
                            const SizedBox(width: 4),
                            Text(
                              overall.isNaN ? '—' : overall.toStringAsFixed(1),
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.amber.shade800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          Icon(Icons.access_time, 
                              size: 14, color: Colors.grey.shade400),
                          const SizedBox(width: 4),
                          Text(
                            _formatDate(review.createdAt),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    review.comment,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _MiniRating(
                        label: 'Views',
                        rating: review.ratings.views,
                        color: Colors.blue,
                      ),
                      _MiniRating(
                        label: 'Location',
                        rating: review.ratings.location,
                        color: Colors.green,
                      ),
                      _MiniRating(
                        label: 'Amenities',
                        rating: review.ratings.amenities,
                        color: Colors.purple,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks ${weeks == 1 ? 'week' : 'weeks'} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    }
  }
}

// Mini Rating Widget
class _MiniRating extends StatelessWidget {
  const _MiniRating({
    required this.label,
    required this.rating,
    required this.color,
  });

  final String label;
  final double rating;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
