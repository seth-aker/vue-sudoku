import 'dart:io';

import 'package:app/ui/sudoku_app.dart';
import 'package:app/data/repositories/puzzle_repository.dart';
import 'package:app/data/service/api/api_client_service_remote.dart';
import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const clientService = ApiClientServiceRemote();
  const puzzleRepository = PuzzleRepository(clientService: clientService);

  Directory appData = await getApplicationDocumentsDirectory();
  HydratedBloc.storage = await HydratedStorage.build(
    storageDirectory: HydratedStorageDirectory(appData.path),
  );

  runApp(const SudokuApp(puzzleRepository: puzzleRepository));
}
