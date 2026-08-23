import 'dart:convert' show jsonDecode, jsonEncode, utf8;
import 'dart:io';

import 'package:app/utils/result.dart';

typedef AuthHeaderProvider = String? Function();

class ApiClient {
  final String _host;
  final int _port;
  final HttpClient Function() _clientFactory;

  AuthHeaderProvider? authHeaderProvider;
  
  ApiClient({
    this._host = '127.0.0.1',
    this._port = 3666,
    this._clientFactory = HttpClient.new,
  });


  Future<Result<T>> send<T>(
    String method,
    String path, {
    Object? body,
    int expectedStatus = 200,
    required T Function(dynamic json) parse,
  }) async {
    final client = _clientFactory();
    try {
      final request = await client.open(method, _host, _port, path);

      final authHeader = authHeaderProvider?.call();
      if (authHeader != null) {
        request.headers.add(HttpHeaders.authorizationHeader, authHeader);
      }
      request.headers.contentType = ContentType.json;

      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close();
      if (response.statusCode != expectedStatus) {
        return Result.error(
          HttpException('Invalid response code: ${response.statusCode}'),
        );
      }

      final stringData = await response.transform(utf8.decoder).join();
      final json = stringData.isEmpty ? null : jsonDecode(stringData);
      return Result.ok(parse(json));
    } on Exception catch (err) {
      return Result.error(err);
    } finally {
      client.close();
    }
  }
}
