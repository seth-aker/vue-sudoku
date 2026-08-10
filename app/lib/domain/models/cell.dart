import 'package:equatable/equatable.dart';

class Cell extends Equatable {
  final int idx;
  final int value;
  final List<int> candidates;

  const Cell(this.idx, this.value, this.candidates);

  Cell copyWith({int? value, List<int>? candidates}) =>
      Cell(idx, value ?? this.value, candidates ?? this.candidates);

  @override
  List<Object?> get props => [idx, value, candidates];
}
