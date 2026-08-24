import 'package:app/data/repositories/auth_repository.dart';
import 'package:app/domain/models/user.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:app/utils/result.dart';
part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends HydratedBloc<UserEvent, UserState> {
  final AuthRepository _authRepository;
  UserBloc({required this._authRepository})
    : super(const UnauthenticatedUserState()) {
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<UserState> emit,
  ) async {
    emit(const LoadingUserState());
    final username = event.username;
    final password = event.password;

    final result = await _authRepository.login(username, password);
    switch (result) {
      case Error<User>():
        emit(const UserErrorState());
      case Ok<User>():
        final user = result.value;
        emit(
          AuthenticatedUserState(
            userId: user.userId,
            username: user.username,
            role: user.role,
            currentPuzzleId: user.currentPuzzleId,
            imageUrl: user.imageUrl,
          ),
        );
    }
  }

  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<UserState> emit,
  ) async {
    emit(const LoadingUserState());

    final username = event.username;
    final password = event.password;
    final displayName = event.displayName;

    final result = await _authRepository.register(
      username,
      password,
      displayName,
    );

    switch (result) {
      case Error<User?>():
        emit(const UserErrorState());
        return;
      case Ok<User?>():
        final user = result.value;
        if (user == null) {
          emit(const UserErrorState());
          return;
        }
        emit(
          AuthenticatedUserState(
            userId: user.userId,
            username: user.username,
            currentPuzzleId: user.currentPuzzleId,
            imageUrl: user.imageUrl,
            role: user.role,
          ),
        );
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<UserState> emit,
  ) async {
    emit(const LoadingUserState());

    final result = await _authRepository.logout();

    switch (result) {
      case Error<void>():
        emit(const UserErrorState());
        return;
      case Ok<void>():
        emit(const UnauthenticatedUserState());
        return;
    }
  }

  @override
  UserState? fromJson(Map<String, dynamic> json) {
    try {
      final type = json['type'];
      switch (type) {
        case 'AuthenticatedUserState':
          return AuthenticatedUserState(
            userId: json['userId'],
            username: json['username'],
            role: UserRole.fromString(json['role']),
            currentPuzzleId: json['currentPuzzleId'],
            imageUrl: json['imageUrl'],
          );
        case 'UserLoadingState':
          return const LoadingUserState();
        default:
          return const UnauthenticatedUserState();
      }
    } catch (e) {
      // TODO: Implement Error Handling
      return null;
    }
  }

  @override
  Map<String, dynamic>? toJson(UserState state) {
    try {
      switch (state) {
        case AuthenticatedUserState():
          return {
            'type': 'AuthenticatedUserState',
            'userId': state.userId,
            'username': state.username,
            'role': state.role.toString(),
            'currentPuzzleId': state.currentPuzzleId,
            'imageUrl': state.imageUrl,
          };
        case LoadingUserState():
          return {'type': 'LoadingUserState'};
        default:
          return {'type': 'UnauthenticatedUserState'};
      }
    } catch (e) {
      return null;
    }
  }
}
