class UserProfile {
  const UserProfile({
    required this.id,
    required this.login,
    required this.firstName,
    required this.lastName,
  });

  final String id;
  final String login;
  final String firstName;
  final String lastName;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final idValue =
        json['id'] ?? json['_id'] ?? json['userId'] ?? json['UserID'];
    final loginValue = json['login'] ?? json['Login'] ?? '';
    return UserProfile(
      id: idValue?.toString() ?? '',
      login: loginValue.toString(),
      firstName: (json['firstName'] ?? json['FirstName'] ?? '').toString(),
      lastName: (json['lastName'] ?? json['LastName'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'login': login,
        'firstName': firstName,
        'lastName': lastName,
      };
}
