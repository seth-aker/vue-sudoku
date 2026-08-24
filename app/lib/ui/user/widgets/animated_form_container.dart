import 'package:flutter/cupertino.dart';

class AnimatedFormContainer extends StatelessWidget {
  final Widget? child;
  const AnimatedFormContainer({required this.child, super.key});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: ((context, constraints) {
        return Container(
          width: constraints.maxWidth,
          height: 400,
          child: child,
        );
      }),
    );
  }
}
