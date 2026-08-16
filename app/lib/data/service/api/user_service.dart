import 'package:app/domain/models/user.dart';
import 'package:app/utils/result.dart';

abstract class UserService {
  Future<Result<User>> login(String username, String password);

  Future<Result<void>> logout();

  Future<Result<User?>> register(
    String username,
    String password,
    String? displayName,
  );
}
