import 'package:app/ui/core/spacing/app_spacing.dart';
import 'package:app/ui/core/widgets/button.dart';
import 'package:app/ui/core/widgets/toggle_button.dart';
import 'package:app/ui/sudoku/state/puzzle/puzzle_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ControlPanel extends StatelessWidget {
  const ControlPanel({super.key});
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PuzzleBloc, PuzzleState>(
      buildWhen: (previous, current) =>
          (current is PuzzleSuccessState && previous is PuzzleSuccessState) &&
          (previous.usingPencil != current.usingPencil),
      builder: (context, state) => Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: AppSpacing.half,
          children: [
            SizedBox(
              height: AppSpacing.four,
              width: AppSpacing.four,
              child: Button.primary(
                onPressed: () =>
                    context.read<PuzzleBloc>().add(const UndoPressed()),
                child: Icon(CupertinoIcons.arrow_uturn_left),
              ),
            ),
            SizedBox(
              height: AppSpacing.four,
              width: AppSpacing.four,
              child: Button.primary(
                onPressed: () =>
                    context.read<PuzzleBloc>().add(const RedoPressed()),
                child: Icon(CupertinoIcons.arrow_uturn_right),
              ),
            ),
            SizedBox(
              height: AppSpacing.four - 2, // Adjust for the border width
              width: AppSpacing.four - 2,
              child: ToggleButton(
                onToggle: () =>
                    context.read<PuzzleBloc>().add(const PencilToggled()),
                isOn: state is PuzzleSuccessState ? state.usingPencil : false,
                child: Icon(CupertinoIcons.pencil),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
