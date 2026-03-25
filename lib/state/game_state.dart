import 'package:flutter/foundation.dart';

/// Represents a single score entry in the leaderboard.
class ScoreEntry {
  final String playerName;
  final int totalScore;
  final Map<String, int> miniGameScores;
  final DateTime timestamp;

  ScoreEntry({
    required this.playerName,
    required this.totalScore,
    required this.miniGameScores,
    required this.timestamp,
  });
}

/// Global game state managed via ChangeNotifier (Provider).
///
/// Tracks per-minigame scores, a global total, and a leaderboard ranking.
class GameState extends ChangeNotifier {
  // Theme mode — dark by default.
  bool _isDarkMode = true;
  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  // Scores keyed by mini-game identifier.
  final Map<String, int> _scores = {
    'jogo_erros_lavoura': 0,
    'jogo_erros_deposito': 0,
    'jornada_embalagem': 0,
    'vista_se': 0,
  };

  // Leaderboard entries.
  final List<ScoreEntry> _leaderboard = [];

  /// Tracks already-scored actions for each mini-game.
  ///
  /// Example keys:
  /// - jogo_erros_lavoura -> {"hotspot:epi_incompleto", ...}
  /// - jornada_embalagem -> {"card:triplice", ...}
  final Map<String, Set<String>> _scoredActions = {};

  // Current player name (can be set from a future settings screen).
  String _playerName = 'Jogador';

  // ─── Getters ──────────────────────────────────────────────

  Map<String, int> get scores => Map.unmodifiable(_scores);
  int get totalScore => _scores.values.fold(0, (sum, v) => sum + v);
  List<ScoreEntry> get leaderboard => List.unmodifiable(_leaderboard);
  String get playerName => _playerName;

  // ─── Mutations ────────────────────────────────────────────

  /// Add [points] to the given [miniGameId].
  void addScore(String miniGameId, int points) {
    if (_scores.containsKey(miniGameId)) {
      _scores[miniGameId] = _scores[miniGameId]! + points;
      notifyListeners();
    }
  }

  /// Awards [points] only once for the pair ([miniGameId], [actionId]).
  ///
  /// Returns true when the score was applied, false when that action had
  /// already been scored before.
  bool addScoreForAction({
    required String miniGameId,
    required String actionId,
    required int points,
  }) {
    if (!_scores.containsKey(miniGameId)) return false;

    final actions = _scoredActions.putIfAbsent(miniGameId, () => <String>{});
    if (actions.contains(actionId)) return false;

    actions.add(actionId);
    _scores[miniGameId] = _scores[miniGameId]! + points;
    notifyListeners();
    return true;
  }

  /// Returns whether [actionId] was already scored in [miniGameId].
  bool wasActionScored(String miniGameId, String actionId) {
    final actions = _scoredActions[miniGameId];
    return actions != null && actions.contains(actionId);
  }

  /// Reset a single mini-game score.
  void resetMiniGameScore(String miniGameId) {
    if (_scores.containsKey(miniGameId)) {
      _scores[miniGameId] = 0;
      _scoredActions.remove(miniGameId);
      notifyListeners();
    }
  }

  /// Reset all scores.
  void resetAll() {
    for (final key in _scores.keys) {
      _scores[key] = 0;
    }
    _scoredActions.clear();
    notifyListeners();
  }

  /// Save the current session to the leaderboard and reset scores.
  void saveToLeaderboard() {
    _leaderboard.add(ScoreEntry(
      playerName: _playerName,
      totalScore: totalScore,
      miniGameScores: Map.from(_scores),
      timestamp: DateTime.now(),
    ));
    // Sort descending by totalScore.
    _leaderboard.sort((a, b) => b.totalScore.compareTo(a.totalScore));
    resetAll();
  }

  /// Update the player name.
  void setPlayerName(String name) {
    _playerName = name;
    notifyListeners();
  }
}
