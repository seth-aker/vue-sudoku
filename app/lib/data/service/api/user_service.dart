import 'package:app/data/model/authentication/login_request_dto.dart';
import 'package:app/data/model/authentication/login_response_dto.dart';
import 'package:app/domain/models/user.dart';
import 'package:app/utils/result.dart';

abstract class UserService {
  Future<Result<LoginResponseDto>> login(LoginRequestDto loginRequest);

  Future<Result<void>> logout();

  Future<Result<User?>> register(
    String username,
    String password,
    String? displayName,
  );

  Future<Result<void>> refreshAccessToken(String refreshToken);
}
