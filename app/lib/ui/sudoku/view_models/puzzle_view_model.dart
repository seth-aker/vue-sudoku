import 'package:app/domain/models/cell.dart';
import 'package:app/domain/models/puzzle.dart';
import 'package:flutter/material.dart';

class PuzzleViewModel extends ChangeNotifier {
  PuzzleViewModel({this._puzzle});
  Puzzle? _puzzle;

  List<Cell>? get cells => _puzzle?.cells;
  List<Cell>? get originalCells => _puzzle?.orginalCells;
}
