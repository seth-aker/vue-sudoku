import 'package:app/ui/sudoku_app.dart';
import 'package:app/data/repositories/puzzle_repository.dart';
import 'package:app/data/service/api/api_client_service_remote.dart';
import 'package:flutter/material.dart';

void main() {
  const clientService = ApiClientServiceRemote();
  const puzzleRepository = PuzzleRepository(clientService: clientService);
  runApp(const SudokuApp(puzzleRepository: puzzleRepository));
}
