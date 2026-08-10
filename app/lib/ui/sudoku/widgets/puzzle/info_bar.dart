import 'package:app/ui/core/app_theme.dart';
import 'package:app/ui/core/spacing/app_spacing.dart';
import 'package:app/ui/sudoku/state/puzzle/puzzle_bloc.dart';
import 'package:app/ui/sudoku/state/timer/timer_bloc.dart';
import 'package:app/ui/sudoku/widgets/controls/play_pause_button.dart';
import 'package:app/utils/format_duration.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class InfoBar extends StatelessWidget {
  const InfoBar({super.key});

  @override
  Widget build(BuildContext context) {
    final puzzleBlocState = context.read<PuzzleBloc>().state;
    final difficulty = puzzleBlocState is PuzzleSuccessState
        ? puzzleBlocState.rating.toString()
        : '';
    return ColoredBox(
      color: AppTheme.accent(context),
      child: Padding(
        padding: EdgeInsetsGeometry.symmetric(vertical: AppSpacing.quarter),
        child: BlocBuilder<TimerBloc, TimerState>(
          builder: (context, timerState) {
            final formattedTime = formatDuration(timerState.elapsedSeconds);
            return Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Align(
                    alignment: AlignmentDirectional.centerEnd,
                    child: Padding(
                      padding: EdgeInsetsGeometry.directional(
                        start: AppSpacing.half,
                        end: AppSpacing.half,
                      ),
                      child: Text(difficulty),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.half,
                  ),
                  child: Text(
                    formattedTime,
                    style: TextStyle(
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
                Expanded(
                  child: Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Padding(
                      padding: EdgeInsetsGeometry.directional(
                        start: AppSpacing.half,
                        end: AppSpacing.half,
                      ),
                      child: PlayPauseButton(),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
