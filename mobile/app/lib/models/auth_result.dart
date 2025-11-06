import 'user_profile.dart';

class AuthResult {
  const AuthResult({
    required this.token,
    required this.user,
  });

  final String token;
  final UserProfile user;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    final tokenValue = (json['token'] ?? json['jwt'])?.toString() ?? '';
    return AuthResult(
      token: tokenValue,
      user: UserProfile.fromJson(json),
    );
  }
}
