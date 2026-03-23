import 'package:go_router/go_router.dart';

import '../data/cena1_lavoura_config.dart';
import '../screens/home_screen.dart';
import '../screens/spot_the_error_screen.dart';
import '../screens/packaging_journey_screen.dart';
import '../screens/dress_up_screen.dart';
import '../screens/ranking_screen.dart';
import '../models/hotspot_config.dart';

// ─── Hotspot configs for Jogo dos Erros ─────────────────────

/// Cena 2 — Depósito hotspot configurations.
final _depositoHotspots = [
  HotspotConfig(
    id: 'porta_aberta',
    relativeX: 0.10,
    relativeY: 0.20,
    relativeWidth: 0.18,
    relativeHeight: 0.40,
    successMessage: 'Correto! O depósito deve sempre estar trancado.',
  ),
  HotspotConfig(
    id: 'alimentos_junto',
    relativeX: 0.45,
    relativeY: 0.30,
    relativeWidth: 0.15,
    relativeHeight: 0.20,
    successMessage: 'Muito bem! Alimentos jamais devem ser armazenados junto a agrotóxicos.',
  ),
  HotspotConfig(
    id: 'sem_ventilacao',
    relativeX: 0.80,
    relativeY: 0.15,
    relativeWidth: 0.12,
    relativeHeight: 0.15,
    successMessage: 'Correto! O depósito precisa de ventilação adequada.',
  ),
];

// ─── Router ─────────────────────────────────────────────────

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/jogo-erros/lavoura',
      builder: (context, state) => SpotTheErrorScreen(
        sceneTitle: 'Cena 1 — Lavoura',
        miniGameId: 'jogo_erros_lavoura',
        hotspots: cena1LavouraHotspots,
        backgroundAsset: cena1BackgroundAsset,
      ),
    ),
    GoRoute(
      path: '/jogo-erros/deposito',
      builder: (context, state) => SpotTheErrorScreen(
        sceneTitle: 'Cena 2 — Depósito',
        miniGameId: 'jogo_erros_deposito',
        hotspots: _depositoHotspots,
        backgroundAsset: null,
      ),
    ),
    GoRoute(
      path: '/jornada-embalagem',
      builder: (context, state) => const PackagingJourneyScreen(),
    ),
    GoRoute(
      path: '/vista-se',
      builder: (context, state) => const DressUpScreen(),
    ),
    GoRoute(
      path: '/ranking',
      builder: (context, state) => const RankingScreen(),
    ),
  ],
);
