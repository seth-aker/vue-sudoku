import 'package:app/data/model/user/user_dto.dart';

enum UserRole { user, admin;

  factory UserRole.fromString(String str) {
    switch (str) {
      case 'user':
	return user;
      case 'admin':
	return admin;
      default:
	return user;
    }
  }
}

class User {
  final String userId;

  final String email;

  final String username;

  final UserRole role;

  final String? imageUrl;

  final String? currentPuzzleId;

  const User({
    required this.userId,
    required this.email,
    required this.username,
    required this.role,
    this.imageUrl,
    this.currentPuzzleId,
  });

  factory User.fromDto(UserDto dto) {
    return User(
      userId: dto.id,
      email: dto.email,
      username: dto.username,
      role: UserRole.fromString(dto.role),
      imageUrl: dto.imageUrl,
      currentPuzzleId: dto.currentPuzzleId,
    );
  }

  UserDto toDto() {
    return UserDto(
      id: userId,
      username: username,
      email: email,
      role: role.name,
      imageUrl: imageUrl,
      currentPuzzleId: currentPuzzleId,
    );
  }
}
