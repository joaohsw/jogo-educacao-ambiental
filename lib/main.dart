import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

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
    final baseTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorSchemeSeed: const Color(0xFF4CAF50), // Brighter, fun green
      scaffoldBackgroundColor: const Color(0xFFF1F8E9), // Light green tint
    );
    return baseTheme.copyWith(
      textTheme: GoogleFonts.nunitoTextTheme(baseTheme.textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF4CAF50),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        elevation: 2,
      ),
    );
  }

  ThemeData _darkTheme() {
    final baseTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorSchemeSeed: const Color(0xFF81C784), // Brighter dark green
      scaffoldBackgroundColor: const Color(0xFF121212),
    );
    return baseTheme.copyWith(
      textTheme: GoogleFonts.nunitoTextTheme(baseTheme.textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1A1A1A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardColor: const Color(0xFF1E1E1E),
      cardTheme: CardThemeData(
        color: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        elevation: 2,
      ),
    );
  }
}
