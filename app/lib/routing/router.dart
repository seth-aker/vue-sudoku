import 'package:app/routing/routes.dart';
import 'package:app/ui/core/widgets/shared_page_layout.dart';
import 'package:app/ui/home/views/home_view.dart';
import 'package:go_router/go_router.dart';

GoRouter router() => GoRouter(
  initialLocation: Routes.home,
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return SharedPageLayout(child: child);
      },
      routes: [
        GoRoute(
          path: Routes.home,
          builder: (context, state) => const HomeView(),
        ),
      ],
    ),
    // GoRoute(
    //   path: Routes.login,
    //   builder:(context, state) => LoginView(),
    // ),
    // GoRoute(
    //   path: Routes.sudoku,
    //   builder: (context, state) => SudokuView(),
    // ),
    // GoRoute(
    //   name: 'About',
    //   path: Routes.about,
    //   builder:(context, state) => AboutView(),
    // )
  ],
);

// Future<String?> _redirect(BuildContext context, GoRouterState state) async {
//   // if the user is not logged in, they need to login
//   final loggedIn = await context.read<AuthRepository>().isAuthenticated;
//   final loggingIn = state.matchedLocation == Routes.login;
//   if (!loggedIn) {
//     return Routes.login;
//   }

//   // if the user is logged in but still on the login page, send them to
//   // the home page
//   if (loggingIn) {
//     return Routes.home;
//   }

//   // no need to redirect at all
//   return null;
// }
