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

  final String username;

  final UserRole role;

  final String? displayName;

  final String? imageUrl;

  final String? currentPuzzleId;

  const User({
    required this.userId,
    required this.username,
    required this.role,
    this.displayName,
    this.imageUrl,
    this.currentPuzzleId,
  });

  factory User.fromDto(UserDto dto) {
    return User(
      userId: dto.id,
      username: dto.username,
      role: UserRole.values.byName(dto.role),
      displayName: dto.displayName,
      imageUrl: dto.imageUrl,
      currentPuzzleId: dto.currentPuzzleId,
    );
  }

  UserDto toDto() {
    return UserDto(
      id: userId,
      username: username,
      role: role.name,
      displayName: displayName,
      imageUrl: imageUrl,
      currentPuzzleId: currentPuzzleId,
    );
  }
}
