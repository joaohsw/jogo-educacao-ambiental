import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/game_state.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const _bgColor = Color(0xFFFAF8F5);
  static const _headerColor = Color(0xFF1B4332);
  static const _accentGreen = Color(0xFF2D6A4F);
  static const _textDark = Color(0xFF2B2B2B);
  static const _textMuted = Color(0xFF6B6B6B);
  static const _cardBorder = Color(0xFFE0DCD7);

  @override
  Widget build(BuildContext context) {
    final gameState = context.watch<GameState>();
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: _bgColor,
      body: SingleChildScrollView(
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: screenHeight),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── Header ──────────────────────────────────────
              Container(
                color: _headerColor,
                padding: EdgeInsets.only(
                  top: MediaQuery.of(context).padding.top + 32,
                  bottom: 32,
                  left: 28,
                  right: 28,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.search, size: 28, color: Colors.white70),
                        const SizedBox(width: 10),
                        Text(
                          'Detetive na Propriedade',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Encontre os erros e aprenda boas práticas',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white60,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star_rounded, color: Color(0xFFD4A843), size: 18),
                          const SizedBox(width: 6),
                          Text(
                            '${gameState.totalScore} pontos',
                            style: const TextStyle(
                              fontSize: 13,
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

              // ─── Game Cards ──────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                child: Text(
                  'MINIJOGOS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: _textMuted,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              _GameCard(
                icon: Icons.agriculture,
                title: 'Jogo dos Erros — Lavoura',
                description: 'Encontre as infrações na cena da lavoura',
                onTap: () => context.go('/jogo-erros/lavoura'),
              ),
              _GameCard(
                icon: Icons.warehouse,
                title: 'Jogo dos Erros — Depósito',
                description: 'Identifique os problemas no depósito',
                onTap: () => context.go('/jogo-erros/deposito'),
              ),
              _GameCard(
                icon: Icons.recycling,
                title: 'Jornada da Embalagem',
                description: 'Ordene os passos do descarte correto',
                onTap: () => context.go('/jornada-embalagem'),
              ),
              _GameCard(
                icon: Icons.checkroom,
                title: 'Vista-se Corretamente',
                description: 'Equipe o trabalhador com o EPI certo',
                onTap: () => context.go('/vista-se'),
              ),

              const SizedBox(height: 12),

              // ─── Ranking Button ──────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: TextButton(
                  onPressed: () => context.go('/ranking'),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: BorderSide(color: _cardBorder),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.leaderboard_outlined, size: 18, color: _accentGreen),
                      const SizedBox(width: 8),
                      Text(
                        'Ver Ranking',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _accentGreen,
                        ),
                      ),
                    ],
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
}

// ─── Clean Game Card ──────────────────────────────────────────

class _GameCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  const _GameCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE0DCD7)),
            ),
            child: Row(
              children: [
                Icon(icon, size: 24, color: const Color(0xFF2D6A4F)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2B2B2B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        description,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF6B6B6B),
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFFB0ACA7)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
