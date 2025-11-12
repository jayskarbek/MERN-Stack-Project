import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'controllers/auth_controller.dart';
import 'controllers/parks_controller.dart';
import 'services/api_client.dart';
import 'services/auth_repository.dart';
import 'services/parks_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await _loadEnv();

  final apiClient = ApiClient();
  final authRepository = AuthRepository(apiClient: apiClient);
  final parksRepository = ParksRepository(apiClient: apiClient);

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: apiClient),
        Provider<AuthRepository>.value(value: authRepository),
        Provider<ParksRepository>.value(value: parksRepository),
        ChangeNotifierProvider<AuthController>(
          create: (_) => AuthController(
            repository: authRepository,
            apiClient: apiClient,
          ),
        ),
        ChangeNotifierProvider<ParksController>(
          create: (context) => ParksController(
            repository: parksRepository,
            authController: context.read<AuthController>(),
          ),
        ),
      ],
      child: const CardstackApp(),
    ),
  );
}

Future<void> _loadEnv() async {
  try {
    await dotenv.load();
    if (kDebugMode) {
      debugPrint('✅ Loaded API_BASE_URL: ${dotenv.env['API_BASE_URL']}');
    }
  } catch (err) {
    if (kDebugMode) {
      debugPrint('❌ dotenv load failed: $err');
    }
    try {
      await dotenv.load(fileName: '.env.example');
    } catch (err) {
      if (kDebugMode) {
        debugPrint('dotenv fallback load failed: $err');
      }
    }
  }
}
