import 'package:app/data/model/user/user_dto.dart';

enum UserRole { user, admin }

class User {
  final String userId;

  final String username;

  final UserRole role;

  final String? displayName;

  final String? imageUrl;

  const User({
    required this.userId,
    required this.username,
    required this.role,
    this.displayName,
    this.imageUrl,
  });

  factory User.fromDto(UserDto dto) {
    return User(
      userId: dto.id,
      username: dto.username,
      role: UserRole.values.byName(dto.role),
      displayName: dto.displayName,
      imageUrl: dto.imageUrl,
    );
  }

  UserDto toDto() {
    return UserDto(
      id: userId,
      username: username,
      role: role.name,
      displayName: displayName,
      imageUrl: imageUrl,
    );
  }
}
