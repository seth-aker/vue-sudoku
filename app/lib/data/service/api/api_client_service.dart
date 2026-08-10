import 'dart:io';

import 'package:app/data/service/api/puzzle_service.dart';

abstract class ApiClientService implements PuzzleService {
  const ApiClientService();
  Future<void> setAuthHeader(HttpHeaders headers);
}
