import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../controllers/auth_controller.dart';
import '../../../controllers/parks_controller.dart';
import '../../../models/park.dart';
import '../../../models/review.dart';

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

class _ParkDetailsScreenState extends State<ParkDetailsScreen> {
  Park? _park;
  List<Review> _reviews = <Review>[];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final parksController = context.read<ParksController>();
    final park =
        await parksController.fetchPark(widget.arguments.parkId, forceRefresh: true);
    final reviews =
        await parksController.fetchReviews(widget.arguments.parkId, forceRefresh: true);

    if (!mounted) return;

    setState(() {
      _park = park;
      _reviews = reviews;
      _isLoading = false;
      _error = parksController.errorMessage;
    });
  }

  Future<void> _submitReview() async {
    final authController = context.read<AuthController>();
    if (!authController.isAuthenticated) {
      _showMessage('Please login to leave a review.');
      return;
    }

    final result = await showModalBottomSheet<ReviewSubmission>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _ReviewFormSheet(),
    );

    if (result == null) return;

    final parksController = context.read<ParksController>();
    final success = await parksController.submitReview(
      parkId: widget.arguments.parkId,
      submission: result,
    );

    if (!mounted) return;

    if (success) {
      _showMessage('Review submitted!');
      await _loadData();
    } else {
      final error =
          parksController.errorMessage ?? 'Unable to submit review at this time.';
      _showMessage(error);
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final park = _park;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(park?.name ?? 'Park Details')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isLoading ? null : _submitReview,
        icon: const Icon(Icons.rate_review),
        label: const Text('Write a review'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : park == null
              ? _ErrorView(
                  message:
                      _error ?? 'We could not load this park. Please try again.',
                  onRetry: _loadData,
                )
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                    children: <Widget>[
                      if (park.imageUrl != null && park.imageUrl!.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            park.imageUrl!,
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              height: 200,
                              color: Colors.grey.shade200,
                              alignment: Alignment.center,
                              child: const Icon(Icons.photo, size: 48),
                            ),
                          ),
                        ),
                      const SizedBox(height: 16),
                      Text(
                        park.name,
                        style: theme.textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      if (park.city != null && park.state != null)
                        Row(
                          children: <Widget>[
                            const Icon(Icons.place, size: 18),
                            const SizedBox(width: 8),
                            Text('${park.city}, ${park.state}'),
                          ],
                        ),
                      const SizedBox(height: 16),
                      _RatingsSection(park: park),
                      const SizedBox(height: 16),
                      if (park.description != null && park.description!.isNotEmpty)
                        Text(
                          park.description!,
                          style: theme.textTheme.bodyMedium,
                        ),
                      const SizedBox(height: 24),
                      Text(
                        'Visitor Reviews',
                        style: theme.textTheme.titleLarge,
                      ),
                      const SizedBox(height: 12),
                      if (_reviews.isEmpty)
                        const Text(
                            'No reviews yet. Be the first to share your experience!'),
                      for (final review in _reviews)
                        Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Icon(Icons.star,
                                        color: Colors.amber.shade700),
                                    const SizedBox(width: 4),
                                    Text(
                                      review.ratings.overall?.toStringAsFixed(1) ??
                                          '—',
                                      style: theme.textTheme.titleMedium,
                                    ),
                                    const Spacer(),
                                    Text(
                                      review.createdAt.toLocal().toString(),
                                      style: theme.textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  review.comment,
                                  style: theme.textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Views: ${review.ratings.views.toStringAsFixed(1)} • '
                                  'Location: ${review.ratings.location.toStringAsFixed(1)} • '
                                  'Amenities: ${review.ratings.amenities.toStringAsFixed(1)}',
                                  style: theme.textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
    );
  }
}

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
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RatingsSection extends StatelessWidget {
  const _RatingsSection({required this.park});

  final Park park;

  @override
  Widget build(BuildContext context) {
    if (park.ratingBreakdown == null && park.averageRating == null) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            Icon(Icons.star, color: Colors.amber.shade700),
            const SizedBox(width: 8),
            Text(
              park.averageRating != null
                  ? '${park.averageRating!.toStringAsFixed(1)} / 5'
                  : 'No rating yet',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (park.reviewCount != null) ...<Widget>[
              const SizedBox(width: 8),
              Text('(${park.reviewCount} reviews)'),
            ],
          ],
        ),
        const SizedBox(height: 8),
        if (park.ratingBreakdown != null)
          Text(
            'Views: ${park.ratingBreakdown!.views.toStringAsFixed(1)} • '
            'Location: ${park.ratingBreakdown!.location.toStringAsFixed(1)} • '
            'Amenities: ${park.ratingBreakdown!.amenities.toStringAsFixed(1)}',
          ),
      ],
    );
  }
}

class _ReviewFormSheet extends StatefulWidget {
  const _ReviewFormSheet();

  @override
  State<_ReviewFormSheet> createState() => _ReviewFormSheetState();
}

class _ReviewFormSheetState extends State<_ReviewFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _viewsController = TextEditingController();
  final _locationController = TextEditingController();
  final _amenitiesController = TextEditingController();
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _viewsController.dispose();
    _locationController.dispose();
    _amenitiesController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final views = double.parse(_viewsController.text);
    final location = double.parse(_locationController.text);
    final amenities = double.parse(_amenitiesController.text);

    Navigator.of(context).pop(
      ReviewSubmission(
        views: views,
        location: location,
        amenities: amenities,
        comment: _commentController.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: bottomInset + 24,
      ),
      child: Form(
        key: _formKey,
        child: ListView(
          shrinkWrap: true,
          children: <Widget>[
            Text(
              'Share your experience',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            _RatingField(
              label: 'Views',
              controller: _viewsController,
            ),
            const SizedBox(height: 12),
            _RatingField(
              label: 'Location',
              controller: _locationController,
            ),
            const SizedBox(height: 12),
            _RatingField(
              label: 'Amenities',
              controller: _amenitiesController,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _commentController,
              decoration: const InputDecoration(
                labelText: 'Comment',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter a comment';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: _submit,
              icon: const Icon(Icons.check),
              label: const Text('Submit review'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RatingField extends StatelessWidget {
  const _RatingField({
    required this.label,
    required this.controller,
  });

  final String label;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: '$label rating (1-5)',
        border: const OutlineInputBorder(),
      ),
      keyboardType: TextInputType.number,
      validator: (value) {
        final parsed = double.tryParse(value ?? '');
        if (parsed == null || parsed < 1 || parsed > 5) {
          return 'Enter a value between 1 and 5';
        }
        return null;
      },
    );
  }
}
