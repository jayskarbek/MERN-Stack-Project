import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../controllers/auth_controller.dart';
import '../../../controllers/parks_controller.dart';
import '../../../models/park.dart';
import '../../auth/screens/login_screen.dart';
import '../../../utils/wikipedia_image_helper.dart';
import 'park_details_screen.dart';

class ParksListScreen extends StatefulWidget {
  const ParksListScreen({super.key});

  static const String routeName = '/parks';

  @override
  State<ParksListScreen> createState() => _ParksListScreenState();
}

class _ParksListScreenState extends State<ParksListScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );
    
    _scrollController.addListener(() {
      final isScrolled = _scrollController.offset > 50;
      if (isScrolled != _isScrolled) {
        setState(() => _isScrolled = isScrolled);
      }
    });
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ParksController>().loadParks(forceRefresh: true);
      _fadeController.forward();
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _refresh() {
    return context.read<ParksController>().loadParks(forceRefresh: true);
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Row(
          children: [
            Icon(Icons.logout, color: Colors.red.shade600),
            const SizedBox(width: 12),
            const Text('Confirm Logout'),
          ],
        ),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              final authController = context.read<AuthController>();
              authController.logout();
              Navigator.pushNamedAndRemoveUntil(
                context,
                LoginScreen.routeName,
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  void _openDetails(Park park) {
    Navigator.pushNamed(
      context,
      ParkDetailsScreen.routeName,
      arguments: ParkDetailsArguments(parkId: park.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    final parksController = context.watch<ParksController>();
    final parks = parksController.parks;
    final isLoading = parksController.isLoading;
    final error = parksController.errorMessage;
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: CustomScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // Enhanced App Bar
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            elevation: _isScrolled ? 4 : 0,
            backgroundColor: theme.primaryColor,
            flexibleSpace: FlexibleSpaceBar(
              title: AnimatedOpacity(
                opacity: _isScrolled ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 200),
                child: const Text(
                  'Florida State Parks',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      theme.primaryColor,
                      theme.primaryColor.withBlue(200),
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.landscape,
                        size: 64,
                        color: Colors.white.withOpacity(0.9),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Florida State Parks',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Discover & Review Natural Wonders',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                tooltip: 'Refresh',
                onPressed: isLoading ? null : _refresh,
                icon: AnimatedRotation(
                  turns: isLoading ? 1 : 0,
                  duration: const Duration(seconds: 1),
                  child: const Icon(Icons.refresh, color: Colors.white),
                ),
              ),
              IconButton(
                tooltip: 'Logout',
                onPressed: _logout,
                icon: const Icon(Icons.logout, color: Colors.white),
              ),
            ],
          ),
          
          // Content
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: Builder(
              builder: (context) {
                if (isLoading && parks.isEmpty) {
                  return const SliverToBoxAdapter(
                    child: _LoadingView(),
                  );
                }
                
                if ((error?.isNotEmpty ?? false) && parks.isEmpty) {
                  return SliverToBoxAdapter(
                    child: _ErrorPlaceholder(
                      message: error!,
                      onRetry: _refresh,
                    ),
                  );
                }
                
                if (parks.isEmpty) {
                  return SliverToBoxAdapter(
                    child: _EmptyState(onRefresh: _refresh),
                  );
                }
                
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final park = parks[index];
                      return FadeTransition(
                        opacity: _fadeAnimation,
                        child: TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0.0, end: 1.0),
                          duration: Duration(milliseconds: 400 + (index * 100)),
                          curve: Curves.easeOutCubic,
                          builder: (context, value, child) {
                            return Transform.translate(
                              offset: Offset(0, 30 * (1 - value)),
                              child: Opacity(
                                opacity: value,
                                child: child,
                              ),
                            );
                          },
                          child: _EnhancedParkCard(
                            park: park,
                            onTap: () => _openDetails(park),
                            index: index,
                          ),
                        ),
                      );
                    },
                    childCount: parks.length,
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: AnimatedOpacity(
        opacity: _isScrolled ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 200),
        child: FloatingActionButton(
          onPressed: _isScrolled
              ? () => _scrollController.animateTo(
                    0,
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeOutCubic,
                  )
              : null,
          backgroundColor: theme.primaryColor,
          child: const Icon(Icons.arrow_upward),
        ),
      ),
    );
  }
}

// Enhanced Park Card
class _EnhancedParkCard extends StatefulWidget {
  const _EnhancedParkCard({
    required this.park,
    required this.onTap,
    required this.index,
  });

  final Park park;
  final VoidCallback onTap;
  final int index;

  @override
  State<_EnhancedParkCard> createState() => _EnhancedParkCardState();
}

class _EnhancedParkCardState extends State<_EnhancedParkCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.98,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    setState(() => _isPressed = true);
    _controller.forward();
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imageUrl = WikipediaImageHelper.getDisplayUrl(
      widget.park.imageUrl,
      targetWidth: 1600,
    );
    final hasImage = imageUrl.isNotEmpty;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: GestureDetector(
          onTap: widget.onTap,
          onTapDown: _handleTapDown,
          onTapUp: _handleTapUp,
          onTapCancel: _handleTapCancel,
          child: Container(
            height: 280,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(_isPressed ? 0.15 : 0.1),
                  blurRadius: _isPressed ? 25 : 20,
                  offset: Offset(0, _isPressed ? 12 : 10),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Background Image with CachedNetworkImage
                  if (hasImage)
                    Hero(
                      tag: 'park-image-${widget.park.id}',
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        memCacheHeight: 600,
                        memCacheWidth: 600,
                        maxHeightDiskCache: 800,
                        maxWidthDiskCache: 800,
                        fadeInDuration: const Duration(milliseconds: 500),
                        placeholder: (context, url) => Container(
                          color: Colors.grey.shade300,
                          child: Center(
                            child: CircularProgressIndicator(
                              color: theme.primaryColor,
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.grey.shade400,
                                Colors.grey.shade600,
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
                    )
                  else
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.grey.shade400,
                            Colors.grey.shade600,
                          ],
                        ),
                      ),
                      child: const Icon(
                        Icons.landscape,
                        size: 64,
                        color: Colors.white54,
                      ),
                    ),
                  
                  // Gradient Overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.8),
                        ],
                        stops: const [0.5, 1.0],
                      ),
                    ),
                  ),
                  
                  // Content
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Park Name
                        Text(
                          widget.park.name,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            shadows: [
                              const Shadow(
                                blurRadius: 8,
                                color: Colors.black54,
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        // Location
                        if (widget.park.city != null && 
                            widget.park.state != null)
                          Row(
                            children: [
                              Icon(
                                Icons.location_on,
                                color: Colors.white.withOpacity(0.9),
                                size: 18,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.park.city}, ${widget.park.state}',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white.withOpacity(0.9),
                                ),
                              ),
                            ],
                          ),
                        
                        const SizedBox(height: 12),
                        
                        // Rating Row
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ...List.generate(5, (index) {
                                final rating = widget.park.averageRating ?? 0;
                                final filled = index < rating;
                                return Icon(
                                  filled ? Icons.star : Icons.star_border,
                                  color: Colors.amber.shade400,
                                  size: 20,
                                );
                              }),
                              const SizedBox(width: 8),
                              Text(
                                widget.park.averageRating != null
                                    ? widget.park.averageRating!.toStringAsFixed(1)
                                    : 'New',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (widget.park.reviewCount != null) ...[
                                const SizedBox(width: 4),
                                Text(
                                  '(${widget.park.reviewCount})',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.8),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Top Badge (if new or featured)
                  if (widget.park.reviewCount == null || 
                      widget.park.reviewCount == 0)
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.green.shade400,
                              Colors.green.shade600,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.new_releases,
                              color: Colors.white,
                              size: 16,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'NEW',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Loading View
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
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Loading parks...',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}

// Empty State
class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onRefresh});

  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: theme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.landscape_outlined,
                size: 64,
                color: theme.primaryColor,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'No Parks Available',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Pull down to refresh and discover amazing parks!',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: onRefresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Refresh'),
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

// Error Placeholder
class _ErrorPlaceholder extends StatelessWidget {
  const _ErrorPlaceholder({
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
          children: [
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
              'Oops! Something went wrong',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
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
