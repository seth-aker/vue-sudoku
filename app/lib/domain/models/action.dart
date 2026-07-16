import 'package:app/domain/models/cell.dart';

class Action {
  final Cell cell;

  final bool isParent;

  Action({required this.cell, required this.isParent});
}
