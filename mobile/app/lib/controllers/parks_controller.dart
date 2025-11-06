import 'package:flutter/foundation.dart';

import '../models/park.dart';
import '../models/review.dart';
import '../services/api_exception.dart';
import '../services/parks_repository.dart';
import 'auth_controller.dart';

class ParksController extends ChangeNotifier {
  ParksController({
    required ParksRepository repository,
    required AuthController authController,
  })  : _repository = repository,
        _authController = authController {
    _authController.addListener(_handleAuthChange);
  }

  final ParksRepository _repository;
  final AuthController _authController;

  bool _isLoading = false;
  String? _errorMessage;
  List<Park> _parks = <Park>[];
  final Map<String, Park> _parkCache = <String, Park>{};
  final Map<String, List<Review>> _reviewsCache = <String, List<Review>>{};

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<Park> get parks => _parks;

  Future<void> loadParks({bool forceRefresh = false}) async {
    if (_parks.isNotEmpty && !forceRefresh) return;

    _setLoading(true);
    try {
      final items = await _repository.fetchParks();
      _parks = items;
      for (final park in items) {
        _parkCache[park.id] = park;
      }
      _errorMessage = null;
      _setLoading(false);
    } on ApiException catch (err) {
      _handleError(err.message);
    } catch (err) {
      _handleError('Unable to load parks. Please try again.');
      if (kDebugMode) {
        debugPrint('Load parks error: $err');
      }
    }
  }

  Future<Park?> fetchPark(String id, {bool forceRefresh = false}) async {
    if (!forceRefresh && _parkCache.containsKey(id)) {
      return _parkCache[id];
    }
    _setLoading(true);
    try {
      final park = await _repository.fetchPark(id);
      _parkCache[id] = park;
      _setLoading(false);
      return park;
    } on ApiException catch (err) {
      _handleError(err.message);
      return null;
    } catch (err) {
      _handleError('Unable to load park details.');
      if (kDebugMode) {
        debugPrint('Fetch park error: $err');
      }
      return null;
    }
  }

  Future<List<Review>> fetchReviews(String parkId,
      {bool forceRefresh = false}) async {
    if (!forceRefresh && _reviewsCache.containsKey(parkId)) {
      return _reviewsCache[parkId] ?? <Review>[];
    }
    try {
      final reviews = await _repository.fetchReviews(parkId);
      _reviewsCache[parkId] = reviews;
      notifyListeners();
      return reviews;
    } on ApiException catch (err) {
      _errorMessage = err.message;
      notifyListeners();
      return _reviewsCache[parkId] ?? <Review>[];
    } catch (err) {
      if (kDebugMode) {
        debugPrint('Fetch reviews error: $err');
      }
      _errorMessage = 'Unable to load reviews.';
      notifyListeners();
      return _reviewsCache[parkId] ?? <Review>[];
    }
  }

  Future<bool> submitReview({
    required String parkId,
    required ReviewSubmission submission,
  }) async {
    try {
      final review = await _repository.submitReview(
        parkId,
        submission,
        userId: _authController.user?.id,
      );
      final existing = _reviewsCache[parkId] ?? <Review>[];
      _reviewsCache[parkId] = <Review>[review, ...existing];
      notifyListeners();
      return true;
    } on ApiException catch (err) {
      _errorMessage = err.message;
      notifyListeners();
      return false;
    } catch (err) {
      if (kDebugMode) {
        debugPrint('Submit review error: $err');
      }
      _errorMessage = 'Unable to submit review.';
      notifyListeners();
      return false;
    }
  }

  void _handleAuthChange() {
    if (!_authController.isAuthenticated) {
      _reviewsCache.clear();
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _handleError(String message) {
    _errorMessage = message;
    _setLoading(false);
  }

  @override
  void dispose() {
    _authController.removeListener(_handleAuthChange);
    super.dispose();
  }
}
