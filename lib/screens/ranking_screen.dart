import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/game_state.dart';

class RankingScreen extends StatelessWidget {
  const RankingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final gameState = context.watch<GameState>();
    final theme = Theme.of(context);

    final miniGameLabels = {
      'jogo_erros_lavoura': 'Jogo dos Erros — Lavoura',
      'jogo_erros_deposito': 'Jogo dos Erros — Depósito',
      'jornada_embalagem': 'Jornada da Embalagem',
      'vista_se': 'Vista-se Corretamente',
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ranking'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
        actions: [
          if (gameState.totalScore > 0)
            TextButton.icon(
              onPressed: () {
                gameState.saveToLeaderboard();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sessão salva no ranking!')),
                );
              },
              icon: const Icon(Icons.save),
              label: const Text('Salvar Sessão'),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ─── Current session ────────────────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B5E20), Color(0xFF388E3C)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text('Sessão Atual',
                      style: theme.textTheme.titleMedium
                          ?.copyWith(color: Colors.white70)),
                  const SizedBox(height: 8),
                  Text(
                    '${gameState.totalScore} pts',
                    style: theme.textTheme.displaySmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...gameState.scores.entries.map((e) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              miniGameLabels[e.key] ?? e.key,
                              style: const TextStyle(color: Colors.white70),
                            ),
                            Text(
                              '${e.value} pts',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // ─── Leaderboard ────────────────────────────────
            Text('Leaderboard', style: theme.textTheme.titleLarge),
            const SizedBox(height: 12),
            if (gameState.leaderboard.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Icon(Icons.leaderboard,
                        size: 48, color: Colors.grey.shade400),
                    const SizedBox(height: 12),
                    Text(
                      'Nenhuma sessão salva ainda.\nJogue os minijogos e salve sua pontuação!',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
              )
            else
              ...gameState.leaderboard.asMap().entries.map((entry) {
                final rank = entry.key + 1;
                final score = entry.value;
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: rank == 1
                          ? Colors.amber
                          : rank == 2
                              ? Colors.grey.shade400
                              : rank == 3
                                  ? const Color(0xFFCD7F32)
                                  : Colors.green.shade100,
                      child: Text('$rank',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    title: Text(score.playerName),
                    subtitle: Text(
                      '${score.timestamp.day}/${score.timestamp.month}/${score.timestamp.year}',
                    ),
                    trailing: Text(
                      '${score.totalScore} pts',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
