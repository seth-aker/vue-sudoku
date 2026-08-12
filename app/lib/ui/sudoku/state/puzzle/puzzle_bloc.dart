import 'package:app/data/repositories/puzzle_repository.dart';
import 'package:app/domain/models/constants/puzzle_constants.dart';
import 'package:app/domain/models/puzzle.dart';
import 'package:app/utils/result.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app/domain/models/action.dart';
import 'package:app/domain/models/cell.dart';
import 'package:app/domain/models/difficulty.dart';
import 'package:equatable/equatable.dart';

part 'puzzle_state.dart';
part 'puzzle_event.dart';

class PuzzleBloc extends Bloc<PuzzleEvent, PuzzleState> {
  PuzzleBloc({required this._puzzleRepository})
    : super(const PuzzleInitialState()) {
    on<NewPuzzleFetched>(_onNewPuzzleFetched);
    on<PuzzleFetched>(_onPuzzleFetched);
    on<CellSelected>(_onCellSelected);
    on<PencilToggled>(_onPencilToggled);
    on<ValuePlaced>(_onValuePlaced);
    on<CellCleared>(_onCellCleared);
    on<CandidateToggled>(_onCandidateToggled);
    on<UndoPressed>(_onUndoPressed);
    on<RedoPressed>(_onRedoPressed);
    on<AutoCandidateModeToggled>(_onAutoCandidateModeToggled);
    on<ResetBoardRequested>(_onResetBoardRequested);
  }

  final PuzzleRepository _puzzleRepository;

  Future<void> _onNewPuzzleFetched(
    NewPuzzleFetched event,
    Emitter<PuzzleState> emit,
  ) async {
    emit(const PuzzleLoadingState());
    final difficulty = event.difficultyRating;
    final emptyCells = _generateEmptyCells();
    emit(
      PuzzleSuccessState(
        puzzleId: 'test',
        rating: difficulty,
        score: 0,
        cells: emptyCells,
        originalCells: emptyCells,
        history: const [],
        elapsedSeconds: 0,
      ),
    );
    return;
    final result = await _puzzleRepository.getNewPuzzle(difficulty);
    switch (result) {
      case Error<Puzzle>():
        emit(const PuzzleErrorState());
        return;
      case Ok<Puzzle>():
    }
    final puzzle = result.value;

    emit(
      PuzzleSuccessState(
        puzzleId: puzzle.puzzleId,
        rating: puzzle.rating,
        score: puzzle.score,
        cells: puzzle.cells,
        originalCells: puzzle.orginalCells,
        history: puzzle.actions,
        elapsedSeconds: puzzle.elapsedSeconds,
      ),
    );
  }

  Future<void> _onPuzzleFetched(
    PuzzleFetched event,
    Emitter<PuzzleState> emit,
  ) async {
    emit(const PuzzleLoadingState());
    final puzzleId = event.puzzleId;
    final result = await _puzzleRepository.getPuzzle(puzzleId);
    switch (result) {
      case Error<Puzzle>():
        emit(const PuzzleErrorState());
        return;
      case Ok<Puzzle>():
    }
    final puzzle = result.value;
    emit(
      PuzzleSuccessState(
        puzzleId: puzzle.puzzleId,
        rating: puzzle.rating,
        score: puzzle.score,
        cells: puzzle.cells,
        originalCells: puzzle.orginalCells,
        history: puzzle.actions,
        elapsedSeconds: puzzle.elapsedSeconds,
      ),
    );
  }

  void _onCellSelected(CellSelected event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      emit(state.copyWith(selectedIdx: event.selectedIdx));
    }
  }

  void _onPencilToggled(PencilToggled event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      emit(state.copyWith(usingPencil: !state.usingPencil));
    }
  }

  void _onValuePlaced(ValuePlaced event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      final newValue = event.value;
      final idx = state.selectedIdx;
      if (newValue < 0 || newValue > 9 || idx == null || idx < 0 || idx > 80) {
        return;
      }
      final cells = state.cells;
      final originalCells = state.cells;
      if (originalCells[idx].value != 0) {
        return;
      }
      final prevCell = cells[idx];
      final history = [...state.history];
      history.add(Action(cell: prevCell, isParent: true));
      if (prevCell.value == 0 && newValue != 0) {
        // Apply new value to target.
        cells[idx] = prevCell.copyWith(value: newValue, candidates: const []);

        // Loop through cell peers and remove candidates that equal new value;
        final cellPeers = peers[idx];
        for (final peer in cellPeers) {
          final cell = cells[peer];
          if (cell.idx != idx && cell.candidates.contains(newValue)) {
            history.add(Action(cell: cell.copyWith(), isParent: false));
            cells[peer] = cell.copyWith(
              candidates: cell.candidates
                  .where((candidate) => candidate != newValue)
                  .toList(),
            );
          }
        }
      }
      // TODO: Save Local()
      emit(
        state.copyWith(
          cells: cells, 
          history: history, 
          redoActions: const []
        ),
      );
    }
  }

  void _onCellCleared(CellCleared event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      final idx = event.idx;
      if (state.originalCells[idx].value != 0) {
        return;
      }
      final prevCell = state.cells[idx];
      final history = List<Action>.from(state.history);
      final cells = List<Cell>.from(state.cells);
      history.add(Action(cell: prevCell, isParent: true));
      if (state.usingPencil) {
        cells[idx] = cells[idx].copyWith(candidates: const []);
      } else {
        cells[idx] = cells[idx].copyWith(value: 0);
      }
      // TODO: saveLocal()
      emit(
        state.copyWith(cells: cells, history: history, redoActions: const []),
      );
    }
  }

  void _onCandidateToggled(CandidateToggled event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      final idx = event.idx;
      final value = event.value;
      if (state.originalCells[idx].value != 0) {
        return;
      }
      final prevCell = state.cells[idx];
      final candidates = List<int>.from(prevCell.candidates);
      if (!candidates.contains(value)) {
        candidates.add(value);
      } else {
        candidates.remove(value);
      }
      final cells = List<Cell>.from(state.cells);
      cells[idx] = prevCell.copyWith(candidates: candidates);
      // TODO: saveLocal()
      emit(
        state.copyWith(
          cells: cells,
          history: [
            ...state.history,
            Action(cell: prevCell, isParent: true),
          ],
          redoActions: const [],
        ),
      );
    }
  }

  void _onUndoPressed(UndoPressed event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      final redoActions = [...state.redoActions];
      final cells = List<Cell>.from(state.cells);
      final history = [...state.history];
      var action = history.isNotEmpty ? history.removeLast() : null;
      int? selectedIdx = state.selectedIdx;
      // loop through each action that is not a parent action and add it to the redo stack
      // and then make the change to the cells array.
      while (action != null && !action.isParent) {
        final prevCell = cells[action.cell.idx];
        redoActions.add(Action(cell: prevCell, isParent: false));
        cells[action.cell.idx] = action.cell;
        action = history.isNotEmpty ? history.removeLast() : null;
      }
      // remove the parent action
      if (action != null) {
        final prevCell = cells[action.cell.idx];
        redoActions.add(Action(cell: prevCell, isParent: true));
        cells[action.cell.idx] = action.cell;
        selectedIdx = action.cell.idx;
      }
      // TODO: saveLocal()
      emit(
        state.copyWith(
          cells: cells,
          history: history,
          redoActions: redoActions,
          selectedIdx: selectedIdx,
        ),
      );
    }
  }

  void _onRedoPressed(RedoPressed event, Emitter<PuzzleState> emit) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      final cells = List<Cell>.from(state.cells);
      final history = [...state.history];
      final redoActions = [...state.redoActions];
      var action = redoActions.isNotEmpty ? redoActions.removeLast() : null;
      int? selectedIdx = state.selectedIdx;

      if (action != null) {
        final prevCell = cells[action.cell.idx];
        cells[action.cell.idx] = action.cell;
        history.add(Action(cell: prevCell, isParent: true));

        selectedIdx = action.cell.idx;
        action = redoActions.isNotEmpty ? redoActions.removeLast() : null;
      }
      while (action != null && !action.isParent) {
        final prevCell = cells[action.cell.idx];
        cells[action.cell.idx] = action.cell;
        history.add(Action(cell: prevCell, isParent: false));
        action = redoActions.isNotEmpty ? redoActions.removeLast() : null;
      }
      if (action != null) {
        redoActions.add(action);
      }
      // TODO: saveLocal()
      emit(
        state.copyWith(
          cells: cells,
          history: history,
          redoActions: redoActions,
          selectedIdx: selectedIdx,
        ),
      );
    }
  }

  void _onAutoCandidateModeToggled(
    AutoCandidateModeToggled event,
    Emitter<PuzzleState> emit,
  ) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      final autoCandidateMode = state.autoCandidateModeOn;
      var cells = state.cells;
      if (autoCandidateMode) {
        for (final cell in cells) {
          cell.candidates.clear();
        }
      } else {
        for (var i = 0; i < 81; i++) {
          if (cells[i].value != 0) {
            continue;
          }
          for (var c = 1; c <= 9; c++) {
            final cellPeers = peers[i];
            if (!cellPeers.any((idx) => cells[idx].value == c) &&
                !cells[i].candidates.contains(c)) {
              cells[i].candidates.add(c);
            }
          }
        }
      }
      // TODO: saveLocal()
      emit(
        state.copyWith(cells: cells, autoCandidateModeOn: !autoCandidateMode),
      );
    }
  }

  void _onResetBoardRequested(
    ResetBoardRequested event,
    Emitter<PuzzleState> emit,
  ) {
    final state = this.state;
    if (state is PuzzleSuccessState) {
      // TODO: clearLocal()
      emit(state.copyWith(cells: [...state.originalCells], selectedIdx: null));
    }
  }

  List<Cell> _generateEmptyCells() {
    final cells = <Cell>[];
    for (var i = 0; i < 81; i++) {
      cells.add(Cell(i, i == 0 ? 9 : 0, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
    }
    return cells;
  }
}
