import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'navigation/app_router.dart';
import 'state/game_state.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => GameState(),
      child: const DetetiveNaPropriedadeApp(),
    ),
  );
}

class DetetiveNaPropriedadeApp extends StatelessWidget {
  const DetetiveNaPropriedadeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<GameState>().isDarkMode;

    return MaterialApp.router(
      title: 'Detetive na Propriedade',
      debugShowCheckedModeBanner: false,
      theme: _lightTheme(),
      darkTheme: _darkTheme(),
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      routerConfig: appRouter,
    );
  }

  ThemeData _lightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorSchemeSeed: const Color(0xFF1B4332),
      scaffoldBackgroundColor: const Color(0xFFFAF8F5),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1B4332),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
    );
  }

  ThemeData _darkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorSchemeSeed: const Color(0xFF2D6A4F),
      scaffoldBackgroundColor: const Color(0xFF121212),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1A1A1A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardColor: const Color(0xFF1E1E1E),
    );
  }
}
