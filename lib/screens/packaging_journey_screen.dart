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

    context.read<GameState>().addScore('jornada_embalagem', 10);

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
          size: 48,
        ),
        title: Text(success ? 'Muito bem!' : 'Ops!'),
        content: Text(message, textAlign: TextAlign.center),
        actions: [
          if (isCompletion)
            FilledButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/');
              },
              child: const Text('Voltar ao menu'),
            )
          else
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('OK'),
            ),
        ],
      ),
    );
  }

  // ─── Build ─────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Arraste os cards para a sequência correta. Cuidado com os cards errados!',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF1565C0),
                  fontWeight: FontWeight.w500,
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
                itemBuilder: (context, index) => _buildDropSlot(index),
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
                          _availableCards.map(_buildDraggableCard).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropSlot(int index) {
    final placed = _placedCards[index];

    return DragTarget<_PackagingCard>(
      onWillAcceptWithDetails: (_) => placed == null,
      onAcceptWithDetails: (details) => _onCardAccepted(details.data, index),
      builder: (context, candidateData, rejectedData) {
        final isHovering = candidateData.isNotEmpty;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 120,
          decoration: BoxDecoration(
            color: placed != null
                ? Colors.green.shade50
                : isHovering
                    ? Colors.blue.shade50
                    : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: placed != null
                  ? Colors.green
                  : isHovering
                      ? Colors.blue
                      : Colors.grey.shade300,
              width: 2,
            ),
          ),
          padding: const EdgeInsets.all(8),
          child: placed != null
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(placed.icon, color: Colors.green, size: 28),
                    const SizedBox(height: 4),
                    Text(placed.label,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 11)),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('${index + 1}',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade400,
                        )),
                    Text('Arraste aqui',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey.shade400,
                        )),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildDraggableCard(_PackagingCard card) {
    return Draggable<_PackagingCard>(
      data: card,
      feedback: Material(
        elevation: 6,
        borderRadius: BorderRadius.circular(12),
        child: _cardContent(card, dragging: true),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: _cardContent(card),
      ),
      child: _cardContent(card),
    );
  }

  Widget _cardContent(_PackagingCard card, {bool dragging = false}) {
    return Container(
      width: 120,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: card.isCorrect ? Colors.white : const Color(0xFFFFF3E0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: card.isCorrect ? Colors.blue.shade200 : Colors.orange.shade300,
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
              color: card.isCorrect ? Colors.blue : Colors.orange, size: 28),
          const SizedBox(height: 6),
          Text(card.label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
