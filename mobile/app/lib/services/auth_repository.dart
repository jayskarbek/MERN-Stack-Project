import '../models/auth_result.dart';
import '../models/user_profile.dart';
import 'api_client.dart';
import 'api_exception.dart';

class AuthRepository {
  AuthRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<AuthResult> login({
    required String login,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/login',
      body: <String, dynamic>{
        'login': login,
        'password': password,
      },
    );

    if (response is Map<String, dynamic>) {
      final error = response['error']?.toString();
      if (error != null && error.isNotEmpty) {
        throw ApiException(error);
      }
      final token = response['token']?.toString();
      if (token == null || token.isEmpty) {
        throw ApiException('Missing token in response');
      }
      return AuthResult.fromJson(response);
    }

    throw ApiException('Unexpected login response format');
  }

  Future<UserProfile> register({
    required String login,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    final response = await _apiClient.post(
      '/register',
      body: <String, dynamic>{
        'login': login,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
      },
    );

    if (response is Map<String, dynamic>) {
      final error = response['error']?.toString();
      if (error != null && error.isNotEmpty) {
        throw ApiException(error);
      }

      return UserProfile.fromJson(response);
    }

    throw ApiException('Unexpected register response format');
  }
}
