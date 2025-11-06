import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../controllers/auth_controller.dart';
import '../../../controllers/parks_controller.dart';
import '../../../models/park.dart';
import '../../auth/screens/login_screen.dart';
import 'park_details_screen.dart';

class ParksListScreen extends StatefulWidget {
  const ParksListScreen({super.key});

  static const String routeName = '/parks';

  @override
  State<ParksListScreen> createState() => _ParksListScreenState();
}

class _ParksListScreenState extends State<ParksListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ParksController>().loadParks(forceRefresh: true);
    });
  }

  Future<void> _refresh() {
    return context.read<ParksController>().loadParks(forceRefresh: true);
  }

  void _logout() {
    final authController = context.read<AuthController>();
    authController.logout();
    Navigator.pushNamedAndRemoveUntil(
      context,
      LoginScreen.routeName,
      (route) => false,
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Florida State Parks'),
        actions: <Widget>[
          IconButton(
            tooltip: 'Refresh',
            onPressed: isLoading ? null : _refresh,
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: _logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: Builder(
          builder: (context) {
            if (isLoading && parks.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            if ((error?.isNotEmpty ?? false) && parks.isEmpty) {
              return _ErrorPlaceholder(message: error!, onRetry: _refresh);
            }
            if (parks.isEmpty) {
              return _ErrorPlaceholder(
                message: 'No parks available yet. Try refreshing.',
                onRetry: _refresh,
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemBuilder: (context, index) {
                final park = parks[index];
                return Card(
                  elevation: 2,
                  child: ListTile(
                    title: Text(park.name),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        if (park.city != null && park.state != null)
                          Text('${park.city}, ${park.state}'),
                        if (park.averageRating != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Row(
                              children: <Widget>[
                                Icon(Icons.star,
                                    color: Colors.amber.shade700, size: 18),
                                const SizedBox(width: 4),
                                Text(
                                  '${park.averageRating?.toStringAsFixed(1) ?? '0.0'} / 5',
                                ),
                                if (park.reviewCount != null)
                                  Text('  (${park.reviewCount} reviews)'),
                              ],
                            ),
                          ),
                      ],
                    ),
                    onTap: () => _openDetails(park),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemCount: parks.length,
            );
          },
        ),
      ),
    );
  }
}

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
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
