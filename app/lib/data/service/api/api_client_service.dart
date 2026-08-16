import 'dart:io';

import 'package:app/data/service/api/puzzle_service.dart';
import 'package:app/data/service/api/user_service.dart';

abstract class ApiClientService implements PuzzleService, UserService {
  const ApiClientService();
  Future<void> setAuthHeader(HttpHeaders headers);

  void setContentTypeJson(HttpHeaders headers);

  Future<dynamic> parseResponseBody(HttpClientResponse response);
}
