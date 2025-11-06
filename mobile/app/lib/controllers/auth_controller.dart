import 'package:flutter/foundation.dart';

import '../models/user_profile.dart';
import '../services/api_client.dart';
import '../services/api_exception.dart';
import '../services/auth_repository.dart';

class AuthController extends ChangeNotifier {
  AuthController({
    required AuthRepository repository,
    required ApiClient apiClient,
  })  : _repository = repository,
        _apiClient = apiClient;

  final AuthRepository _repository;
  final ApiClient _apiClient;

  bool _isLoading = false;
  String? _errorMessage;
  String? _token;
  UserProfile? _user;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null;
  UserProfile? get user => _user;

  Future<bool> login({
    required String username,
    required String password,
  }) async {
    _setLoading(true);
    _errorMessage = null;

    try {
      final result =
          await _repository.login(login: username, password: password);
      _token = result.token;
      _user = result.user;
      _apiClient.updateAuthToken(_token);
      _setLoading(false);
      return true;
    } on ApiException catch (err) {
      _handleError(err.message);
      return false;
    } catch (err) {
      _handleError('Unable to login. Please try again.');
      if (kDebugMode) {
        debugPrint('Login error: $err');
      }
      return false;
    }
  }

  Future<bool> register({
    required String username,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    _setLoading(true);
    _errorMessage = null;

    try {
      await _repository.register(
        login: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
      );
      _setLoading(false);

      // Auto-login after registration
      return loginUser(username: username, password: password);
    } on ApiException catch (err) {
      _handleError(err.message);
      return false;
    } catch (err) {
      _handleError('Unable to register. Please try again.');
      if (kDebugMode) {
        debugPrint('Register error: $err');
      }
      return false;
    }
  }

  Future<bool> loginUser({
    required String username,
    required String password,
  }) {
    return login(username: username, password: password);
  }

  void logout() {
    _token = null;
    _user = null;
    _apiClient.updateAuthToken(null);
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _handleError(String message) {
    _errorMessage = message;
    _setLoading(false);
  }
}
