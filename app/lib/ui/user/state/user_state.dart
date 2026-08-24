part of 'user_bloc.dart';

sealed class UserState extends Equatable {
  const UserState();
  @override
  List<Object?> get props;
}

class UnauthenticatedUserState extends UserState {
  const UnauthenticatedUserState();

  @override
    List<Object?> get props => [];
}

class AuthenticatedUserState extends UserState {
  final String userId;
  final String username;
  final String? currentPuzzleId;
  final UserRole role;
  final String? imageUrl;

  const AuthenticatedUserState({
    required this.userId,
    required this.username,
    required this.role,
    this.currentPuzzleId,
    this.imageUrl,
  });
  AuthenticatedUserState copyWith({
    String? username,
    String? currentPuzzleId,
    String? imageUrl,
  }) {
    return AuthenticatedUserState(
      userId: userId,
      username: username ?? this.username,
      role: role,
      currentPuzzleId: currentPuzzleId ?? this.currentPuzzleId,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }

  @override
  List<Object?> get props => [
    userId,
    username,
    currentPuzzleId,
    role,
    imageUrl,
  ];
}

class LoadingUserState extends UserState {
  const LoadingUserState();
  @override
    List<Object?> get props => [];
}

class UserErrorState extends UserState {
  const UserErrorState();

  @override
    List<Object?> get props => [];
}
