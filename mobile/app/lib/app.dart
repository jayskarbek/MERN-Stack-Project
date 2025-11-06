import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'controllers/auth_controller.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/parks/screens/park_details_screen.dart';
import 'features/parks/screens/parks_list_screen.dart';

class CardstackApp extends StatelessWidget {
  const CardstackApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
      useMaterial3: true,
    );

    return Consumer<AuthController>(
      builder: (context, authController, _) {
        return MaterialApp(
          title: 'State Parks',
          theme: theme,
          routes: <String, WidgetBuilder>{
            LoginScreen.routeName: (_) => const LoginScreen(),
            RegisterScreen.routeName: (_) => const RegisterScreen(),
            ParksListScreen.routeName: (_) => const ParksListScreen(),
          },
          onGenerateRoute: (settings) {
            if (settings.name == ParkDetailsScreen.routeName) {
              final args = settings.arguments as ParkDetailsArguments;
              return MaterialPageRoute<void>(
                builder: (_) => ParkDetailsScreen(arguments: args),
              );
            }
            return null;
          },
          home: authController.isAuthenticated
              ? const ParksListScreen()
              : const LoginScreen(),
        );
      },
    );
  }
}
