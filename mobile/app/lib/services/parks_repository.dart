import '../models/park.dart';
import '../models/review.dart';
import 'api_client.dart';
import 'api_exception.dart';

class ParksRepository {
  ParksRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<List<Park>> fetchParks() async {
    final response = await _apiClient.get('/parks');
    if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map(Park.fromJson)
          .toList();
    }
    throw ApiException('Unexpected response while fetching parks');
  }

  Future<Park> fetchPark(String id) async {
    final response = await _apiClient.get('/parks/$id');
    if (response is Map<String, dynamic>) {
      return Park.fromJson(response);
    }
    throw ApiException('Unexpected response while fetching park details');
  }

  Future<List<Review>> fetchReviews(String parkId) async {
    final response = await _apiClient.get('/parks/$parkId/reviews');
    if (response is List) {
      return response
          .whereType<Map<String, dynamic>>()
          .map(Review.fromJson)
          .toList();
    }
    throw ApiException('Unexpected response while fetching reviews');
  }

  Future<Review> submitReview(
    String parkId,
    ReviewSubmission submission, {
    String? userId,
  }) async {
    final response = await _apiClient.post(
      '/parks/$parkId/reviews',
      body: submission.toJson(userId: userId),
    );
    if (response is Map<String, dynamic>) {
      return Review.fromJson(response);
    }
    throw ApiException('Unexpected response while creating review');
  }

  Future<Review> updateReview({
    required String parkId,
    required String reviewId,
    required ReviewSubmission submission,
  }) async {
    final response = await _apiClient.patch(
      '/parks/$parkId/reviews/$reviewId',
      body: submission.toJson(),
    );
    if (response is Map<String, dynamic>) {
      return Review.fromJson(response);
    }
    throw ApiException('Unexpected response while updating review');
  }

  Future<void> deleteReview({
    required String parkId,
    required String reviewId,
  }) async {
    await _apiClient.delete('/parks/$parkId/reviews/$reviewId');
  }
}
