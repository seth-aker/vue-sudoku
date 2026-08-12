import 'package:app/routing/routes.dart';
import 'package:app/ui/core/app_theme.dart';
import 'package:app/ui/core/colors/app_colors.dart';
import 'package:app/ui/core/constants.dart';
import 'package:app/ui/core/widgets/button.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SharedPageLayout extends StatelessWidget {
  final Widget child;

  const SharedPageLayout({required this.child, super.key});

  @override
  Widget build(BuildContext context) {
    if (isApple) {
      return CupertinoLayout(child: child);
    } else {
      return MaterialLayout(child: child);
    }
  }
}

class CupertinoLayout extends StatelessWidget {
  final Widget child;
  const CupertinoLayout({super.key, required this.child});
  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.home),
          onPressed: () => context.go(Routes.home),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.gear),
          // Displays the settins modal
          onPressed: () => showCupertinoSheet(
            context: context,
            scrollableBuilder: (context, scrollController) => SingleChildScrollView(
              controller: scrollController,
              child: ColoredBox( 
                color: AppTheme.background(context),
                child: Column(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // TODO: Add settings here
              const Text('Settings'),
              Button.primary(child: const Text('Close'), onPressed: () => Navigator.pop(context)),
                ],
              ),
              ),
            ),
          ),
        ),
      ),
      backgroundColor: AppTheme.background(context),
      child: SafeArea(bottom: false, child: child),
    );
  }
}

class MaterialLayout extends StatelessWidget {
  final Widget child;

  const MaterialLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: MaterialButton(
          padding: EdgeInsets.zero,
          child: const Icon(Icons.home),
          onPressed: () {
            context.go(Routes.home);
            Navigator.pop(context);
          },
        ),
        title: const Text('Sudoku'),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: AppColors.primary),
              child: Text('Settings'),
            ),
            ListTile(title: const Text('Does something')),
          ],
        ),
      ),
      body: child,
    );
  }
}
