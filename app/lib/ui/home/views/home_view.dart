import 'package:app/domain/models/difficulty.dart';
import 'package:app/ui/core/app_theme.dart';
import 'package:app/ui/sudoku/state/puzzle/puzzle_bloc.dart';
import 'package:app/ui/sudoku/state/timer/timer_bloc.dart';
import 'package:app/ui/sudoku/widgets/controls/numpad.dart';
import 'package:app/ui/sudoku/widgets/puzzle/info_bar.dart';
import 'package:app/ui/sudoku/widgets/puzzle/puzzle_widget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});
  @override
  State<StatefulWidget> createState() {
    return _HomeViewState();
  }
}

class _HomeViewState extends State<HomeView> {
  @override
  void initState() {
    super.initState();
    context.read<PuzzleBloc>().add(
      const NewPuzzleFetched(difficultyRating: DifficultyRating.medium),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PuzzleBloc, PuzzleState>(
      listener: (context, state) {
        final timerBloc = context.read<TimerBloc>();
        if (timerBloc.state is TimerInitialState &&
            state is PuzzleSuccessState) {
          timerBloc.add(const TimerStarted());
        }
      },
      child: ColoredBox(
        color: AppTheme.background(context),
        child: Column(
          children: [
            InfoBar(),
            Flexible(
              child: Align(
                alignment: AlignmentGeometry.topCenter,
                child: AspectRatio(aspectRatio: 1, child: const PuzzleWidget()),
              ),
            ),
            SizedBox(
              width: 200, // TODO: scale this appropriately
              child: Numpad(
                onTap: (value) =>
                    context.read<PuzzleBloc>().add(ValuePlaced(value: value)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
