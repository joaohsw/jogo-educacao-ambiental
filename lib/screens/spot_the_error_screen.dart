import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  Size? _backgroundImageSize;

  int get _totalErrors => widget.hotspots.length;
  int get _foundErrors => _foundIds.length;
  bool get _allFound => _foundErrors == _totalErrors;

  @override
  void initState() {
    super.initState();
    _restoreFoundHotspots();
    _loadBackgroundImageSize();
  }

  @override
  void didUpdateWidget(covariant SpotTheErrorScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.miniGameId != widget.miniGameId ||
        oldWidget.hotspots != widget.hotspots) {
      _restoreFoundHotspots();
    }
    if (oldWidget.backgroundAsset != widget.backgroundAsset) {
      _loadBackgroundImageSize();
    }
  }

  void _restoreFoundHotspots() {
    final gameState = context.read<GameState>();
    _foundIds
      ..clear()
      ..addAll(
        widget.hotspots
            .where(
              (hs) => gameState.wasActionScored(
                widget.miniGameId,
                'hotspot:${hs.id}',
              ),
            )
            .map((hs) => hs.id),
      );
  }

  Future<void> _loadBackgroundImageSize() async {
    final backgroundAsset = widget.backgroundAsset;
    if (backgroundAsset == null) {
      if (mounted) {
        setState(() => _backgroundImageSize = null);
      }
      return;
    }

    final bytes = await rootBundle.load(backgroundAsset);
    final codec = await ui.instantiateImageCodec(bytes.buffer.asUint8List());
    final frameInfo = await codec.getNextFrame();
    final image = frameInfo.image;

    if (!mounted) return;
    setState(
      () => _backgroundImageSize =
          Size(image.width.toDouble(), image.height.toDouble()),
    );
  }

  Rect _computeImageRect(Size viewport) {
    final imageSize = _backgroundImageSize;
    if (imageSize == null) {
      return Offset.zero & viewport;
    }

    final fitted = applyBoxFit(BoxFit.cover, imageSize, viewport);
    return Alignment.center.inscribe(fitted.destination, Offset.zero & viewport);
  }

  void _onHotspotTapped(HotspotConfig hotspot) {
    if (_foundIds.contains(hotspot.id)) return;

    setState(() => _foundIds.add(hotspot.id));

    context.read<GameState>().addScoreForAction(
          miniGameId: widget.miniGameId,
          actionId: 'hotspot:${hotspot.id}',
          points: 10,
        );

    _showResultDialog(
      success: true,
      message: hotspot.successMessage,
    );
  }

  void _onBackgroundTapped() {
    _showResultDialog(
      success: false,
      message: 'Opa! Nao foi desta vez, tente de novo!',
    );
  }

  Future<void> _showResultDialog({
    required bool success,
    required String message,
  }) async {
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        icon: Icon(
          success ? Icons.check_circle : Icons.cancel,
          color: success ? Colors.green : Colors.red,
          size: 64,
        ),
        title: Text(
          success ? 'Parabens!' : 'Errou!',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 16),
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            child: const Text(
              'OK',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ],
        actionsAlignment: MainAxisAlignment.center,
      ),
    );

    if (_allFound) {
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          icon: const Icon(Icons.emoji_events, color: Colors.amber, size: 72),
          title: const Text(
            'Fase completa!',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          content: Text(
            'Voce encontrou todos os $_totalErrors erros nesta cena!',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16),
          ),
          actions: [
            FilledButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/');
              },
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                backgroundColor: const Color(0xFFFF9800),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: const Text(
                'Voltar ao menu',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
          actionsAlignment: MainAxisAlignment.center,
        ),
      );
    }
  }

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
          final viewportSize = Size(constraints.maxWidth, constraints.maxHeight);
          final imageRect = _computeImageRect(viewportSize);

          return GestureDetector(
            onTapUp: (_) => _onBackgroundTapped(),
            child: Stack(
              children: [
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

                ...widget.hotspots.map((hs) {
                  final found = _foundIds.contains(hs.id);
                  return Positioned(
                    left: imageRect.left + hs.relativeX * imageRect.width,
                    top: imageRect.top + hs.relativeY * imageRect.height,
                    width: hs.relativeWidth * imageRect.width,
                    height: hs.relativeHeight * imageRect.height,
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
                                child: Icon(
                                  Icons.check_circle,
                                  color: Colors.white,
                                  size: 24,
                                ),
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
