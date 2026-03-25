import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/game_state.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final gameState = context.watch<GameState>();
    final isDark = gameState.isDarkMode;
    final screenHeight = MediaQuery.of(context).size.height;

    // Adaptive colors
    final bgColor = isDark ? const Color(0xFF121212) : const Color(0xFFF1F8E9); // Light green tint
    final headerColor = isDark ? const Color(0xFF2E7D32) : const Color(0xFF4CAF50); // Bright green
    final cardBg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final cardBorder = isDark ? const Color(0xFF2E2E2E) : const Color(0xFFE0E0E0);
    final textPrimary = isDark ? Colors.white : const Color(0xFF2B2B2B);
    final textSecondary = isDark ? Colors.white60 : const Color(0xFF555555);
    final accentGreen = isDark ? const Color(0xFF81C784) : const Color(0xFF4CAF50);
    final headerIconColor = isDark ? accentGreen : Colors.white;
    final sectionLabel = isDark ? Colors.white38 : const Color(0xFF6B6B6B);

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: screenHeight),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── Header ──────────────────────────────────────
              Container(
                color: headerColor,
                padding: EdgeInsets.only(
                  top: MediaQuery.of(context).padding.top + 24,
                  bottom: 24,
                  left: 24,
                  right: 16,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.search, size: 24, color: headerIconColor),
                              const SizedBox(width: 8),
                              const Text(
                                'Detetive na Propriedade',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ache os erros e aprenda boas práticas!',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star_rounded, color: Color(0xFFD4A843), size: 16),
                                const SizedBox(width: 5),
                                Text(
                                  '${gameState.totalScore} pontos',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Theme toggle button
                    IconButton(
                      onPressed: () => gameState.toggleTheme(),
                      icon: Icon(
                        isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                        color: Colors.white60,
                        size: 22,
                      ),
                      tooltip: isDark ? 'Modo claro' : 'Modo escuro',
                    ),
                  ],
                ),
              ),

              // ─── Section Label ───────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
                child: Text(
                  'MINIJOGOS',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: sectionLabel,
                    letterSpacing: 1.2,
                  ),
                ),
              ),

              // ─── Game Cards Grid ─────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final width = constraints.maxWidth;
                    // Two columns if enough space, 1 column on narrow screens
                    final crossCount = width >= 500 ? 2 : 1;
                    final spacing = 12.0;
                    final cardWidth = (width - spacing * (crossCount - 1)) / crossCount;
                    final rawHeight = cardWidth * 0.45;
                    final cardHeight = crossCount == 2 ? rawHeight.clamp(160.0, 220.0) : 100.0;

                    final cards = [
                      _GameCardData(
                        icon: Icons.agriculture,
                        title: 'Erros na Lavoura',
                        description: 'Ache os erros no campo!',
                        route: '/jogo-erros/lavoura',
                      ),
                      _GameCardData(
                        icon: Icons.warehouse,
                        title: 'Erros no Depósito',
                        description: 'Ache os problemas aqui!',
                        route: '/jogo-erros/deposito',
                      ),
                      _GameCardData(
                        icon: Icons.recycling,
                        title: 'Jornada da Embalagem',
                        description: 'Jogue o lixo no lugar certo!',
                        route: '/jornada-embalagem',
                      ),
                      _GameCardData(
                        icon: Icons.checkroom,
                        title: 'Vista o Trabalhador',
                        description: 'Coloque a roupa certa!',
                        route: '/vista-se',
                      ),
                    ];

                    if (crossCount == 1) {
                      // Single column — compact row cards
                      return Column(
                        children: cards.map((c) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _buildRowCard(
                            context, c, cardBg, cardBorder,
                            textPrimary, textSecondary, accentGreen,
                          ),
                        )).toList(),
                      );
                    }

                    // Grid layout for wider screens
                    return Wrap(
                      spacing: spacing,
                      runSpacing: spacing,
                      children: cards.map((c) => SizedBox(
                        width: cardWidth,
                        height: cardHeight,
                        child: _buildGridCard(
                          context, c, cardBg, cardBorder,
                          textPrimary, textSecondary, accentGreen,
                        ),
                      )).toList(),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16),

              // ─── Ranking Button ──────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: FilledButton.icon(
                  onPressed: () => context.go('/ranking'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFFF9800), // Vibrant Orange
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.leaderboard_rounded, size: 28),
                  label: const Text(
                    'Ver Ranking',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Row card (narrow screens) ───────────────────────────────

  Widget _buildRowCard(
    BuildContext context,
    _GameCardData data,
    Color cardBg,
    Color cardBorder,
    Color textPrimary,
    Color textSecondary,
    Color accent,
  ) {
    return Material(
      color: cardBg,
      borderRadius: BorderRadius.circular(24),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: () => context.go(data.route),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: cardBorder, width: 2),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(data.icon, size: 36, color: accent),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data.title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      data.description,
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 14, color: textSecondary.withValues(alpha: 0.5)),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Grid card (wider screens) ───────────────────────────────

  Widget _buildGridCard(
    BuildContext context,
    _GameCardData data,
    Color cardBg,
    Color cardBorder,
    Color textPrimary,
    Color textSecondary,
    Color accent,
  ) {
    return Material(
      color: cardBg,
      borderRadius: BorderRadius.circular(24),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: () => context.go(data.route),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: cardBorder, width: 2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(data.icon, size: 42, color: accent),
              ),
              const Spacer(),
              Text(
                data.title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                data.description,
                style: TextStyle(fontSize: 12, color: textSecondary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Card data model ──────────────────────────────────────────

class _GameCardData {
  final IconData icon;
  final String title;
  final String description;
  final String route;

  const _GameCardData({
    required this.icon,
    required this.title,
    required this.description,
    required this.route,
  });
}
