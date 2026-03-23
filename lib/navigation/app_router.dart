import 'package:go_router/go_router.dart';

import '../data/cena1_lavoura_config.dart';
import '../data/cena2_deposito_config.dart';
import '../screens/home_screen.dart';
import '../screens/spot_the_error_screen.dart';
import '../screens/packaging_journey_screen.dart';
import '../screens/dress_up_screen.dart';
import '../screens/ranking_screen.dart';

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
        hotspots: cena2DepositoHotspots,
        backgroundAsset: cena2BackgroundAsset,
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
