part of 'user_bloc.dart';

sealed class UserEvent extends Equatable {
  const UserEvent();

  @override
    List<Object?> get props;
}

class LoginRequested extends UserEvent {
  final String username;
  final String password;

  const LoginRequested({
    required this.username,
    required this.password,
    });

  @override
    List<Object?> get props => [
      username,
      password,
    ];
}

class LogoutRequested extends UserEvent {
  const LogoutRequested();

  @override
    List<Object?> get props => [];
}

class RegisterRequested extends UserEvent {
  final String username;
  final String password;
  final String? displayName;

  const RegisterRequested({
    required this.username,
    required this.password,
    this.displayName,
    });

  @override
    List<Object?> get props => [
      username,
      password,
      displayName,
    ];
}
