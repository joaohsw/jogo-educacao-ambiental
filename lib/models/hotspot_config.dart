/// Configuration for a single invisible hotspot in the Spot-the-Error game.
///
/// Positions and sizes are relative (0.0 – 1.0) so the layout adapts to any
/// screen size.
class HotspotConfig {
  final String id;

  /// Relative X position (0 = left edge, 1 = right edge).
  final double relativeX;

  /// Relative Y position (0 = top edge, 1 = bottom edge).
  final double relativeY;

  /// Relative width of the hotspot area.
  final double relativeWidth;

  /// Relative height of the hotspot area.
  final double relativeHeight;

  /// Message displayed when the player correctly taps this hotspot.
  final String successMessage;

  const HotspotConfig({
    required this.id,
    required this.relativeX,
    required this.relativeY,
    required this.relativeWidth,
    required this.relativeHeight,
    required this.successMessage,
  });
}
