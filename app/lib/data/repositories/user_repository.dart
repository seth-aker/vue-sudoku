import 'package:app/data/service/api/api_client_service.dart';
import 'package:app/domain/models/user.dart';
import 'package:app/utils/result.dart';

class UserRepository {
  final ApiClientService _clientService;

  const UserRepository({required this._clientService});

  Future<Result<User>> login(String username, String password) async {
    try {
      return await _clientService.login(username, password);
    } on Exception catch (err) {
      return Result.error(err);
    }
  }

  Future<Result<void>> logout() async {
    try {
      return await _clientService.logout();
    } on Exception catch (err) {
      return Result.error(err);
    }
  }

  Future<Result<User?>> register(
    String username,
    String password,
    String? displayName,
  ) async {
    try {
      return await _clientService.register(username, password, displayName);
    } on Exception catch (err) {
      return Result.error(err);
    }
  }
}
