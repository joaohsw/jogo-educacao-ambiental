import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/game_state.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final gameState = context.watch<GameState>();
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1B5E20), Color(0xFF388E3C), Color(0xFF66BB6A)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              children: [
                // ─── Title ──────────────────────────────────────
                const Icon(Icons.search, size: 64, color: Colors.white70),
                const SizedBox(height: 12),
                Text(
                  'Detetive na Propriedade',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Encontre os erros e aprenda boas práticas!',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 8),
                // Score chip
                Chip(
                  avatar: const Icon(Icons.star, color: Colors.amber, size: 20),
                  label: Text('Pontuação: ${gameState.totalScore}'),
                  backgroundColor: Colors.white.withValues(alpha: 0.85),
                ),
                const SizedBox(height: 32),

                // ─── Game cards ─────────────────────────────────
                _GameCard(
                  icon: Icons.agriculture,
                  title: 'Jogo dos Erros — Lavoura',
                  subtitle: 'Encontre as infrações na cena da lavoura',
                  color: const Color(0xFF4CAF50),
                  onTap: () => context.go('/jogo-erros/lavoura'),
                ),
                const SizedBox(height: 16),
                _GameCard(
                  icon: Icons.warehouse,
                  title: 'Jogo dos Erros — Depósito',
                  subtitle: 'Identifique os problemas no depósito',
                  color: const Color(0xFFFF9800),
                  onTap: () => context.go('/jogo-erros/deposito'),
                ),
                const SizedBox(height: 16),
                _GameCard(
                  icon: Icons.recycling,
                  title: 'Jornada da Embalagem',
                  subtitle: 'Ordene os passos do descarte correto',
                  color: const Color(0xFF2196F3),
                  onTap: () => context.go('/jornada-embalagem'),
                ),
                const SizedBox(height: 16),
                _GameCard(
                  icon: Icons.checkroom,
                  title: 'Vista-se Corretamente',
                  subtitle: 'Equipe o trabalhador com o EPI certo',
                  color: const Color(0xFF9C27B0),
                  onTap: () => context.go('/vista-se'),
                ),
                const SizedBox(height: 24),

                // ─── Ranking button ─────────────────────────────
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => context.go('/ranking'),
                    icon: const Icon(Icons.leaderboard, color: Colors.white),
                    label: const Text('Ver Ranking',
                        style: TextStyle(color: Colors.white)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white54),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Reusable game card widget ────────────────────────────────

class _GameCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _GameCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(12),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.grey.shade800,
                        )),
                    const SizedBox(height: 4),
                    Text(subtitle,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                        )),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }
}
