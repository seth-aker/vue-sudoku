import 'dart:convert' show jsonDecode, jsonEncode, utf8;
import 'dart:io';

import 'package:app/data/model/authentication/login_request_dto.dart';
import 'package:app/data/model/authentication/login_response_dto.dart';
import 'package:app/data/model/user/user_dto.dart';
import 'package:app/data/service/api/api_client_service.dart';
import 'package:app/domain/models/difficulty.dart';
import 'package:app/domain/models/puzzle.dart';
import 'package:app/data/model/puzzle/puzzle_dto.dart';
import 'package:app/domain/models/user.dart';
import 'package:app/utils/result.dart';
import 'package:app/utils/serilization.dart';

// TODO: Split this into parts.

class ApiClientServiceRemote extends ApiClientService {
  const ApiClientServiceRemote({
    this._host = '127.0.0.1',
    this._port = 3666,
    this._authProvider,
    this._clientFactory = HttpClient.new,
  });
  final String _host;
  final int _port;
  final HttpClient Function() _clientFactory;
  final Function()? _authProvider;

  @override
  Future<void> setAuthHeader(HttpHeaders headers) async {
    final header = _authProvider?.call();
    if (header != null) {
      headers.add(HttpHeaders.authorizationHeader, header);
    }
  }

  @override
  void setContentTypeJson(HttpHeaders headers) {
    headers.contentType = ContentType.json;
  }

  @override
  Future<dynamic> parseResponseBody(HttpClientResponse response) async {
    final stringData = await response.transform(utf8.decoder).join();
    return jsonDecode(stringData);
  }

  @override
  Future<Result<Puzzle>> getNewPuzzle(DifficultyRating difficulty) async {
    final client = _clientFactory();
    try {
      final request = await client.get(
        _host,
        _port,
        '/api/sudoku/new?difficulty=${difficulty.toString().toLowerCase()}',
      );
      await setAuthHeader(request.headers);
      setContentTypeJson(request.headers);

      final response = await request.close();
      if (response.statusCode == 200) {
        final stringData = await response.transform(utf8.decoder).join();
        final json = jsonDecode(stringData) as dynamic;
        final dto = NewPuzzleDTO.fromJson(json);
        return Result.ok(_mapDtoToPuzzle(dto));
      } else {
        return Result.error(
          HttpException("Invalid response code: ${response.statusCode}"),
        );
      }
    } on Exception catch (err) {
      return Result.error(err);
    } finally {
      client.close();
    }
  }

  @override
  Future<Result<Puzzle>> getPuzzle(String puzzleId) async {
    final client = _clientFactory();
    try {
      final request = await client.get(_host, _port, '/api/sudoku/$puzzleId');
      await setAuthHeader(request.headers);
      setContentTypeJson(request.headers);

      final response = await request.close();
      if (response.statusCode == 200) {
        final json = await parseResponseBody(response);
        final dto = UserPuzzleDTO.fromJson(json);
        return Result.ok(_mapDtoToPuzzle(dto));
      } else {
        return Result.error(
          HttpException("Invalid Response Code: ${response.statusCode}"),
        );
      }
    } on Exception catch (err) {
      return Result.error(err);
    } finally {
      client.close();
    }
  }

  @override
  Future<Result<void>> saveProgress(Puzzle state) async {
    final client = _clientFactory();
    try {
      final serializedCells = PuzzleSerializer.serializeCells(state.cells);
      final actions = state.actions
          .map(PuzzleSerializer.serializeAction)
          .toList();
      final request = await client.put(
        _host,
        _port,
        "/api/sudoku/${state.puzzleId}",
      );

      setContentTypeJson(request.headers);
      final payload = {
        'puzzleId': state.puzzleId,
        'cells': serializedCells.cells,
        'candidates': serializedCells.candidates,
        'actions': actions,
        'time': state.elapsedSeconds,
        'isCompleted': state.isCompleted,
      };
      request.write(jsonEncode(payload));
      final result = await request.close();
      if (result.statusCode == 204) {
        return Result.ok(null);
      } else {
        return Result.error(
          HttpException('Invalid Response Code: ${result.statusCode}'),
        );
      }
    } on Exception catch (error) {
      return Result.error(error);
    } finally {
      client.close();
    }
  }

  Puzzle _mapDtoToPuzzle(PuzzleDto dto) {
    switch (dto) {
      case UserPuzzleDTO():
        return Puzzle.fromUserPuzzleDto(dto);
      case NewPuzzleDTO():
        return Puzzle.fromNewPuzzleDto(dto);
      default:
        throw UnsupportedError(
          "An unknown type of PuzzleDto was used in the function _mapDtoToPuzzle",
        );
    }
  }

  @override
  Future<Result<LoginResponseDto>> login(LoginRequestDto dto) async {
    final client = _clientFactory();
    try {
      final request = await client.post(_host, _port, '/api/auth/token');

      await setAuthHeader(request.headers);
      setContentTypeJson(request.headers);

      request.write(jsonEncode(dto.toJson()));

      final response = await request.close();

      if (response.statusCode == 200) {
        final json = await parseResponseBody(response);
        final loginResponseDto = LoginResponseDto.fromJson(json);

        return Result.ok(loginResponseDto);
      } else {
        return Result.error(
          HttpException('Invalid response code: ${response.statusCode}'),
        );
      }
    } on Exception catch (err) {
      return Result.error(err);
    } finally {
      client.close();
    }
  }

  @override
  Future<Result<void>> logout() async {
    final client = _clientFactory();

    try {
      final request = await client.post(_host, _port, '/api/auth/logout');

      await setAuthHeader(request.headers);

      final response = await request.close();

      if (response.statusCode != 204) {
        return Result.error(
          HttpException('Invaid response code: ${response.statusCode}'),
        );
      } else {
        return Result.ok(null);
      }
    } on Exception catch (err) {
      return Result.error(err);
    } finally {
      client.close();
    }
  }

  @override
  Future<Result<User?>> register(
    String username,
    String password,
    String? displayName,
  ) async {
    final client = _clientFactory();

    try {
      final request = await client.post(_host, _port, '/api/auth/register');

      setContentTypeJson(request.headers);

      request.write(
        jsonEncode({
          'username': username,
          'password': password,
          'displayName': displayName,
        }),
      );

      final response = await request.close();

      if (response.statusCode == 201) {
        final json = await parseResponseBody(response);
        final dto = UserDto.fromJson(json);

        return Result.ok(User.fromDto(dto));
      } else {
        return Result.error(
          HttpException('Invalid Response Code: ${response.statusCode}'),
        );
      }
    } on Exception catch (error) {
      return Result.error(error);
    } finally {
      client.close();
    }
  }

  @override
  Future<Result<void>> refreshAccessToken(String refreshToken) {
    // TODO: implement refreshAccessToken
    throw UnimplementedError();
  }
  // @override
  // Future<Result<User?>> getSession() async {
  //   final client = _clientFactory();

  //   try {
  //     final request = await client.get(
  //       _host,
  //       _port,
  //       '/api/auth/session'
  //     );
  //     setContentTypeJson(request.headers);
  //     await setAuthHeader(request.headers);

  //     final response = await request.close();

  //     if(response.statusCode == 200) {
  //       final json = await parseResponseBody(response);

  //     }
  //   } on Exception catch (err) {
  //     return Result.error(err);
  //   } finally {
  //     client.close();
  //   }
  // }
}
