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
    return MaterialApp.router(
      title: 'Detetive na Propriedade',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF2E7D32), // green tone
        brightness: Brightness.light,
        fontFamily: 'Roboto',
      ),
      routerConfig: appRouter,
    );
  }
}
