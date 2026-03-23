import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/hotspot_config.dart';
import '../state/game_state.dart';

/// A reusable "Spot-the-Error" screen.
///
/// Accepts a list of [HotspotConfig] and an optional background asset path.
/// Tapping a correct hotspot shows a success dialog; tapping elsewhere shows
/// an error dialog.
class SpotTheErrorScreen extends StatefulWidget {
  final String sceneTitle;
  final String miniGameId;
  final List<HotspotConfig> hotspots;
  final String? backgroundAsset;

  const SpotTheErrorScreen({
    super.key,
    required this.sceneTitle,
    required this.miniGameId,
    required this.hotspots,
    this.backgroundAsset,
  });

  @override
  State<SpotTheErrorScreen> createState() => _SpotTheErrorScreenState();
}

class _SpotTheErrorScreenState extends State<SpotTheErrorScreen> {
  /// IDs of hotspots that have already been found.
  final Set<String> _foundIds = {};

  int get _totalErrors => widget.hotspots.length;
  int get _foundErrors => _foundIds.length;
  bool get _allFound => _foundErrors == _totalErrors;

  // ─── Handlers ──────────────────────────────────────────────

  void _onHotspotTapped(HotspotConfig hotspot) {
    if (_foundIds.contains(hotspot.id)) return; // already found

    setState(() => _foundIds.add(hotspot.id));

    // Award points.
    context.read<GameState>().addScore(widget.miniGameId, 10);

    _showResultDialog(
      success: true,
      message: hotspot.successMessage,
    );
  }

  void _onBackgroundTapped() {
    _showResultDialog(
      success: false,
      message: 'Opa! Não foi desta vez, tente de novo!',
    );
  }

  Future<void> _showResultDialog({
    required bool success,
    required String message,
  }) async {
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon: Icon(
          success ? Icons.check_circle : Icons.cancel,
          color: success ? Colors.green : Colors.red,
          size: 48,
        ),
        title: Text(success ? 'Parabéns!' : 'Errou!'),
        content: Text(message, textAlign: TextAlign.center),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );

    // Check if the player found everything.
    if (_allFound) {
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          icon: const Icon(Icons.emoji_events, color: Colors.amber, size: 56),
          title: const Text('Fase completa!'),
          content: Text(
            'Você encontrou todos os $_totalErrors erros nesta cena!',
            textAlign: TextAlign.center,
          ),
          actions: [
            FilledButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/');
              },
              child: const Text('Voltar ao menu'),
            ),
          ],
        ),
      );
    }
  }

  // ─── Build ─────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.sceneTitle),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                '$_foundErrors / $_totalErrors erros',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return GestureDetector(
            onTapUp: (_) => _onBackgroundTapped(),
            child: Stack(
              children: [
                // Background — real image or placeholder gradient.
                if (widget.backgroundAsset != null)
                  SizedBox(
                    width: constraints.maxWidth,
                    height: constraints.maxHeight,
                    child: Image.asset(
                      widget.backgroundAsset!,
                      fit: BoxFit.cover,
                      width: constraints.maxWidth,
                      height: constraints.maxHeight,
                    ),
                  )
                else
                  Container(
                    width: constraints.maxWidth,
                    height: constraints.maxHeight,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: widget.miniGameId.contains('lavoura')
                            ? [
                                const Color(0xFFA5D6A7),
                                const Color(0xFF66BB6A),
                                const Color(0xFF388E3C),
                              ]
                            : [
                                const Color(0xFFBCAAA4),
                                const Color(0xFF8D6E63),
                                const Color(0xFF5D4037),
                              ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.miniGameId.contains('lavoura')
                                ? Icons.agriculture
                                : Icons.warehouse,
                            size: 56,
                            color: Colors.white24,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Toque nos erros na imagem!',
                            style: theme.textTheme.titleMedium?.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Hotspot overlays.
                ...widget.hotspots.map((hs) {
                  final found = _foundIds.contains(hs.id);
                  return Positioned(
                    left: hs.relativeX * constraints.maxWidth,
                    top: hs.relativeY * constraints.maxHeight,
                    width: hs.relativeWidth * constraints.maxWidth,
                    height: hs.relativeHeight * constraints.maxHeight,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => _onHotspotTapped(hs),
                      child: Container(
                        decoration: BoxDecoration(
                          color: found
                              ? Colors.green.withValues(alpha: 0.3)
                              : Colors.transparent,
                          border: found
                              ? Border.all(color: Colors.green, width: 2)
                              : null,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: found
                            ? const Center(
                                child: Icon(Icons.check_circle,
                                    color: Colors.white, size: 24),
                              )
                            : null,
                      ),
                    ),
                  );
                }),
              ],
            ),
          );
        },
      ),
    );
  }
}
