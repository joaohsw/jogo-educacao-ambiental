import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/game_state.dart';

/// An EPI item that can be dragged onto the avatar.
class _EpiItem {
  final String id;
  final String label;
  final IconData icon;
  final bool isCorrect;

  /// Target zone on avatar (e.g. 'head', 'torso', 'hands', 'feet', 'face').
  final String bodyZone;

  const _EpiItem({
    required this.id,
    required this.label,
    required this.icon,
    required this.isCorrect,
    required this.bodyZone,
  });
}

class DressUpScreen extends StatefulWidget {
  const DressUpScreen({super.key});

  @override
  State<DressUpScreen> createState() => _DressUpScreenState();
}

class _DressUpScreenState extends State<DressUpScreen> {
  static const _items = <_EpiItem>[
    // Correct items
    _EpiItem(
        id: 'respirador',
        label: 'Respirador',
        icon: Icons.masks,
        isCorrect: true,
        bodyZone: 'face'),
    _EpiItem(
        id: 'oculos',
        label: 'Óculos de Proteção',
        icon: Icons.visibility,
        isCorrect: true,
        bodyZone: 'face'),
    _EpiItem(
        id: 'luvas',
        label: 'Luvas de Proteção',
        icon: Icons.back_hand,
        isCorrect: true,
        bodyZone: 'hands'),
    _EpiItem(
        id: 'avental',
        label: 'Avental Impermeável',
        icon: Icons.checkroom,
        isCorrect: true,
        bodyZone: 'torso'),
    _EpiItem(
        id: 'botas',
        label: 'Botas Impermeáveis',
        icon: Icons.do_not_step,
        isCorrect: true,
        bodyZone: 'feet'),
    _EpiItem(
        id: 'bone',
        label: 'Boné Árabe',
        icon: Icons.hardware,
        isCorrect: true,
        bodyZone: 'head'),
    // Incorrect items (distractors)
    _EpiItem(
        id: 'mascara_cirurgica',
        label: 'Máscara Cirúrgica',
        icon: Icons.healing,
        isCorrect: false,
        bodyZone: 'face'),
    _EpiItem(
        id: 'chinelo',
        label: 'Chinelo',
        icon: Icons.flip,
        isCorrect: false,
        bodyZone: 'feet'),
    _EpiItem(
        id: 'camiseta',
        label: 'Camiseta Comum',
        icon: Icons.dry_cleaning,
        isCorrect: false,
        bodyZone: 'torso'),
    _EpiItem(
        id: 'luvas_latex',
        label: 'Luvas de Látex',
        icon: Icons.pan_tool,
        isCorrect: false,
        bodyZone: 'hands'),
  ];

  /// IDs of items already equipped on the avatar.
  final Set<String> _equippedIds = {};

  /// Available items (removed once equipped).
  late List<_EpiItem> _availableItems;

  bool _completed = false;

  int get _totalCorrect => _items.where((i) => i.isCorrect).length;
  int get _equippedCorrect =>
      _equippedIds.where((id) => _items.any((i) => i.id == id && i.isCorrect)).length;

  @override
  void initState() {
    super.initState();
    _availableItems = List.of(_items)..shuffle();
  }

  // ─── Handlers ──────────────────────────────────────────────

  void _onItemDropped(_EpiItem item, String targetZone) {
    if (!item.isCorrect) {
      _showFeedback(
        success: false,
        message:
            '"${item.label}" não é o EPI adequado para aplicação de agrotóxicos!',
      );
      return;
    }

    if (item.bodyZone != targetZone) {
      _showFeedback(
        success: false,
        message: '"${item.label}" não é para essa parte do corpo. Tente outra!',
      );
      return;
    }

    setState(() {
      _equippedIds.add(item.id);
      _availableItems.removeWhere((i) => i.id == item.id);
    });

    context.read<GameState>().addScore('vista_se', 10);

    if (_equippedCorrect == _totalCorrect) {
      setState(() => _completed = true);
      _showFeedback(
        success: true,
        message:
            'Excelente! O trabalhador está totalmente equipado com o EPI correto!',
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
        title: Text(success ? 'Correto!' : 'Incorreto!'),
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

  // Checks if a zone already has a correct item equipped.
  bool _isZoneEquipped(String zone) {
    return _equippedIds.any((id) {
      final item = _items.firstWhere((i) => i.id == id);
      return item.bodyZone == zone && item.isCorrect;
    });
  }

  // ─── Build ─────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vista-se Corretamente'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '$_equippedCorrect / $_totalCorrect EPIs',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instructions
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF3E5F5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Arraste os itens corretos de EPI para a parte do corpo correspondente do avatar.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF6A1B9A),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Avatar zone (the character with drop targets).
            Expanded(
              flex: 3,
              child: Center(child: _buildAvatar()),
            ),
            const SizedBox(height: 16),

            // Available items.
            Text('Itens disponíveis:', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            Expanded(
              flex: 2,
              child: _completed
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle_outline,
                              size: 64, color: Colors.green),
                          const SizedBox(height: 8),
                          Text('Equipamento completo!',
                              style: theme.textTheme.titleMedium),
                        ],
                      ),
                    )
                  : SingleChildScrollView(
                      child: Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children:
                            _availableItems.map(_buildDraggableItem).toList(),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildDropZone('head', 'Cabeça', Icons.face, width: 80, height: 60),
        const SizedBox(height: 4),
        _buildDropZone('face', 'Rosto', Icons.sentiment_neutral,
            width: 80, height: 50),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildDropZone('hands', 'Mãos', Icons.back_hand,
                width: 60, height: 60),
            const SizedBox(width: 4),
            _buildDropZone('torso', 'Tronco', Icons.accessibility_new,
                width: 90, height: 80),
            const SizedBox(width: 4),
            _buildDropZone('hands', 'Mãos', Icons.back_hand,
                width: 60, height: 60),
          ],
        ),
        const SizedBox(height: 4),
        _buildDropZone('feet', 'Pés', Icons.do_not_step,
            width: 90, height: 50),
      ],
    );
  }

  Widget _buildDropZone(String zone, String label, IconData icon,
      {required double width, required double height}) {
    final equipped = _isZoneEquipped(zone);

    return DragTarget<_EpiItem>(
      onWillAcceptWithDetails: (_) => !equipped,
      onAcceptWithDetails: (details) => _onItemDropped(details.data, zone),
      builder: (context, candidateData, rejectedData) {
        final hovering = candidateData.isNotEmpty;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: equipped
                ? Colors.green.shade50
                : hovering
                    ? Colors.purple.shade50
                    : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: equipped
                  ? Colors.green
                  : hovering
                      ? Colors.purple
                      : Colors.grey.shade300,
              width: 2,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                equipped ? Icons.check_circle : icon,
                size: 20,
                color: equipped ? Colors.green : Colors.grey.shade500,
              ),
              const SizedBox(height: 2),
              Text(label,
                  style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDraggableItem(_EpiItem item) {
    return Draggable<_EpiItem>(
      data: item,
      feedback: Material(
        elevation: 6,
        borderRadius: BorderRadius.circular(12),
        child: _itemContent(item, dragging: true),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: _itemContent(item),
      ),
      child: _itemContent(item),
    );
  }

  Widget _itemContent(_EpiItem item, {bool dragging = false}) {
    return Container(
      width: 100,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.purple.shade200),
        boxShadow: dragging
            ? [
                BoxShadow(
                    color: Colors.black26,
                    blurRadius: 10,
                    offset: const Offset(0, 4))
              ]
            : [],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(item.icon, color: Colors.purple, size: 26),
          const SizedBox(height: 4),
          Text(item.label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
