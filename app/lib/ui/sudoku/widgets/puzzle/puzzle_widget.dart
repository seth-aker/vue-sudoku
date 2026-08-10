import 'package:app/domain/models/constants/puzzle_constants.dart';
import 'package:app/ui/core/spacing/app_spacing.dart';
import 'package:app/ui/sudoku/state/puzzle/puzzle_bloc.dart';
import 'package:app/ui/sudoku/widgets/puzzle/cell_widget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class PuzzleWidget extends StatefulWidget {
  const PuzzleWidget({super.key});
  @override
  State<StatefulWidget> createState() => _PuzzleWidgetState();
}

class _PuzzleWidgetState extends State<PuzzleWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsGeometry.all(AppSpacing.eighth),
      color: const Color.fromARGB(255, 177, 174, 170),
      child: Column(
        children: List.generate(
          3,
          (rowIdx) => Expanded(
            child: Row(
              children: List.generate(
                3,
                (colIdx) => Expanded(
                  child: Padding(
                    padding: const EdgeInsetsGeometry.all(AppSpacing.eighth),
                    child: _PuzzleBlock(blockIdx: rowIdx * 3 + colIdx),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PuzzleBlock extends StatefulWidget {
  const _PuzzleBlock({required this.blockIdx});
  final int blockIdx;
  @override
  State<StatefulWidget> createState() => _PuzzleBlockState();
}

class _PuzzleBlockState extends State<_PuzzleBlock> {
  @override
  Widget build(BuildContext context) {
    final bloc = context.read<PuzzleBloc>();
    final state = bloc.state;
    switch (state) {
      case PuzzleSuccessState():
        return GridView.count(
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          crossAxisCount: 3,
          crossAxisSpacing: AppSpacing.sixteenth,
          mainAxisSpacing: AppSpacing.sixteenth,
          children: blockIdxs[widget.blockIdx]
              .map(
                (cellIdx) => CellWidget(
                  idx: cellIdx,
                  onTap: () => bloc.add(CellSelected(selectedIdx: cellIdx)),
                ),
              )
              .toList(),
        );
      case PuzzleInitialState():
      case PuzzleLoadingState():
      case PuzzleErrorState():
        return SizedBox.shrink();
    }
  }
}
