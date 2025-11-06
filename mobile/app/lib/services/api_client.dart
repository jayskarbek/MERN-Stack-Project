import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import 'api_exception.dart';

class ApiClient {
  ApiClient({http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;
  String? _authToken;

  /// Updates the bearer token that should be sent with authenticated requests.
  void updateAuthToken(String? token) {
    _authToken = token?.isNotEmpty == true ? token : null;
  }

  /// Builds a [Uri] from a relative [path] or absolute URL.
  Uri _buildUri(String path, {Map<String, dynamic>? queryParameters}) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return Uri.parse(path);
    }
    final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:5000/api';
    final uri = Uri.parse(baseUrl);
    final cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return uri.replace(
      path: '${uri.path.replaceFirst(RegExp(r'/+$'), '')}/$cleanPath',
      queryParameters: queryParameters?.map(
        (key, value) => MapEntry(key, value?.toString()),
      ),
    );
  }

  Map<String, String> _defaultHeaders([Map<String, String>? extra]) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (_authToken != null) 'Authorization': 'Bearer $_authToken',
    };
    if (extra != null) {
      headers.addAll(extra);
    }
    return headers;
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParameters: queryParameters);
    try {
      final response =
          await _httpClient.get(uri, headers: _defaultHeaders(headers));
      return _processResponse(response);
    } catch (error) {
      throw ApiException('Failed to GET $uri: $error');
    }
  }

  Future<dynamic> post(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParameters: queryParameters);
    try {
      final response = await _httpClient.post(
        uri,
        headers: _defaultHeaders(headers),
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (error) {
      throw ApiException('Failed to POST $uri: $error');
    }
  }

  Future<dynamic> patch(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParameters: queryParameters);
    try {
      final response = await _httpClient.patch(
        uri,
        headers: _defaultHeaders(headers),
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (error) {
      throw ApiException('Failed to PATCH $uri: $error');
    }
  }

  Future<dynamic> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParameters: queryParameters);
    try {
      final response = await _httpClient.delete(
        uri,
        headers: _defaultHeaders(headers),
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (error) {
      throw ApiException('Failed to DELETE $uri: $error');
    }
  }

  dynamic _processResponse(http.Response response) {
    if (kDebugMode) {
      debugPrint(
          '[API] ${response.request?.method} ${response.request?.url} -> ${response.statusCode}');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _decodeBody(response.body);
    }

    throw ApiException(
      _decodeErrorMessage(response.body) ??
          'Request failed with status ${response.statusCode}',
      statusCode: response.statusCode,
    );
  }

  dynamic _decodeBody(String body) {
    if (body.isEmpty) return null;
    try {
      return jsonDecode(body);
    } catch (_) {
      return body;
    }
  }

  String? _decodeErrorMessage(String body) {
    if (body.isEmpty) return null;
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        return decoded['error']?.toString();
      }
      return decoded.toString();
    } catch (_) {
      return body;
    }
  }

  void dispose() {
    _httpClient.close();
  }
}
