import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/game_state.dart';

/// Data for a single card in the Packaging Journey mini-game.
class _PackagingCard {
  final String id;
  final String label;
  final IconData icon;
  final bool isCorrect;
  final int correctOrder; // -1 for incorrect cards

  const _PackagingCard({
    required this.id,
    required this.label,
    required this.icon,
    required this.isCorrect,
    this.correctOrder = -1,
  });
}

class PackagingJourneyScreen extends StatefulWidget {
  const PackagingJourneyScreen({super.key});

  @override
  State<PackagingJourneyScreen> createState() => _PackagingJourneyScreenState();
}

class _PackagingJourneyScreenState extends State<PackagingJourneyScreen> {
  // Correct sequence cards.
  static const _allCards = <_PackagingCard>[
    _PackagingCard(
        id: 'uso',
        label: 'Uso do Produto',
        icon: Icons.science,
        isCorrect: true,
        correctOrder: 0),
    _PackagingCard(
        id: 'triplice',
        label: 'Tríplice Lavagem',
        icon: Icons.water_drop,
        isCorrect: true,
        correctOrder: 1),
    _PackagingCard(
        id: 'armazenamento',
        label: 'Armazenamento',
        icon: Icons.inventory_2,
        isCorrect: true,
        correctOrder: 2),
    _PackagingCard(
        id: 'devolucao',
        label: 'Devolução',
        icon: Icons.local_shipping,
        isCorrect: true,
        correctOrder: 3),
    _PackagingCard(
        id: 'recibo',
        label: 'Recibo de Devolução',
        icon: Icons.receipt_long,
        isCorrect: true,
        correctOrder: 4),
    // Distractor cards — these must NOT be placed in the sequence.
    _PackagingCard(
        id: 'queimar',
        label: 'Queimar Embalagem',
        icon: Icons.local_fire_department,
        isCorrect: false),
    _PackagingCard(
        id: 'descarte_irregular',
        label: 'Descarte Irregular',
        icon: Icons.delete_forever,
        isCorrect: false),
  ];

  /// Cards still available to drag.
  late List<_PackagingCard> _availableCards;

  /// Cards placed in the sequence slots (index = slot position).
  final List<_PackagingCard?> _placedCards = List.filled(5, null);

  bool _completed = false;

  @override
  void initState() {
    super.initState();
    _availableCards = List.of(_allCards)..shuffle();
  }

  // ─── Handlers ──────────────────────────────────────────────

  void _onCardAccepted(_PackagingCard card, int slotIndex) {
    if (!card.isCorrect) {
      _showFeedback(
        success: false,
        message:
            '"${card.label}" não faz parte da sequência correta. Tente outro card!',
      );
      return;
    }

    if (card.correctOrder != slotIndex) {
      _showFeedback(
        success: false,
        message:
            '"${card.label}" não vai nessa posição. Pense na ordem correta!',
      );
      return;
    }

    setState(() {
      _placedCards[slotIndex] = card;
      _availableCards.removeWhere((c) => c.id == card.id);
    });

    context.read<GameState>().addScoreForAction(
          miniGameId: 'jornada_embalagem',
          actionId: 'card:${card.id}',
          points: 10,
        );

    // Check completion.
    if (_placedCards.every((c) => c != null)) {
      setState(() => _completed = true);
      _showFeedback(
        success: true,
        message:
            'Parabéns! Você completou a Jornada da Embalagem na ordem correta!',
        isCompletion: true,
      );
    }
  }

  Future<void> _showFeedback({
    required bool success,
    required String message,
    bool isCompletion = false,
  }) async {
    await showDialog<void>(
      context: context,
      barrierDismissible: !isCompletion,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        icon: Icon(
          isCompletion
              ? Icons.emoji_events
              : success
                  ? Icons.check_circle
                  : Icons.cancel,
          color: isCompletion
              ? Colors.amber
              : success
                  ? Colors.green
                  : Colors.red,
          size: 64,
        ),
        title: Text(
          success ? 'Muito bem!' : 'Ops!',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 16),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          if (isCompletion)
            FilledButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/');
              },
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                backgroundColor: const Color(0xFFFF9800), // Vibrant Orange
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              ),
              child: const Text('Voltar ao menu', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            )
          else
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              ),
              child: const Text('OK', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }

  // ─── Build ─────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jornada da Embalagem'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instructions.
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1A2733) : const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Text(
                'Arraste as cartas para a sequência certa. Cuidado com as erradas!',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: isDark ? const Color(0xFF90CAF9) : const Color(0xFF1565C0),
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Drop zone slots.
            Text('Sequência:', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            SizedBox(
              height: 90,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: 5,
                separatorBuilder: (_, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) => _buildDropSlot(index, isDark),
              ),
            ),
            const SizedBox(height: 24),

            // Available cards.
            Text('Cards disponíveis:', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            Expanded(
              child: _completed
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle_outline,
                              size: 64, color: Colors.green),
                          const SizedBox(height: 8),
                          Text('Sequência completa!',
                              style: theme.textTheme.titleMedium),
                        ],
                      ),
                    )
                  : Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children:
                          _availableCards.map((c) => _buildDraggableCard(c, isDark)).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropSlot(int index, bool isDark) {
    final placed = _placedCards[index];

    return DragTarget<_PackagingCard>(
      onWillAcceptWithDetails: (_) => placed == null,
      onAcceptWithDetails: (details) => _onCardAccepted(details.data, index),
      builder: (context, candidateData, rejectedData) {
        final isHovering = candidateData.isNotEmpty;

        final emptyBg = isDark ? const Color(0xFF1E1E1E) : Colors.grey.shade100;
        final hoverBg = isDark ? const Color(0xFF1A2733) : Colors.blue.shade50;
        final filledBg = isDark ? const Color(0xFF1B3326) : Colors.green.shade50;
        final emptyBorder = isDark ? const Color(0xFF333333) : Colors.grey.shade300;
        final hoverBorder = isDark ? const Color(0xFF5090C0) : Colors.blue;
        final textMuted = isDark ? Colors.white38 : Colors.grey.shade400;

        return Container(
          width: 100,
          decoration: BoxDecoration(
            color: placed != null
                ? filledBg
                : isHovering
                    ? hoverBg
                    : emptyBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: placed != null
                  ? Colors.green
                  : isHovering
                      ? hoverBorder
                      : emptyBorder,
              width: 3,
            ),
          ),
          padding: const EdgeInsets.all(8),
          child: placed != null
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(placed.icon, color: Colors.green, size: 22),
                    const SizedBox(height: 4),
                    Text(placed.label,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.white70 : Colors.black87,
                        )),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('${index + 1}',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: textMuted,
                        )),
                    Text('Arraste aqui',
                        style: TextStyle(
                          fontSize: 10,
                          color: textMuted,
                        )),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildDraggableCard(_PackagingCard card, bool isDark) {
    return Draggable<_PackagingCard>(
      data: card,
      feedback: Material(
        elevation: 6,
        borderRadius: BorderRadius.circular(12),
        child: _cardContent(card, isDark: isDark, dragging: true),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: _cardContent(card, isDark: isDark),
      ),
      child: _cardContent(card, isDark: isDark),
    );
  }

  Widget _cardContent(_PackagingCard card, {required bool isDark, bool dragging = false}) {
    final correctBg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final incorrectBg = isDark ? const Color(0xFF2A2010) : const Color(0xFFFFF3E0);
    final correctBorder = isDark ? const Color(0xFF3060A0) : Colors.blue.shade200;
    final incorrectBorder = isDark ? const Color(0xFF805030) : Colors.orange.shade300;
    final iconCorrect = isDark ? const Color(0xFF64B5F6) : Colors.blue;
    final iconIncorrect = isDark ? const Color(0xFFFFB74D) : Colors.orange;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Container(
      width: 100,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: card.isCorrect ? correctBg : incorrectBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: card.isCorrect ? correctBorder : incorrectBorder,
          width: 2,
        ),
        boxShadow: dragging
            ? [
                BoxShadow(
                    color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))
              ]
            : [],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(card.icon,
              color: card.isCorrect ? iconCorrect : iconIncorrect, size: 28),
          const SizedBox(height: 6),
          Text(card.label,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: textColor)),
        ],
      ),
    );
  }
}
