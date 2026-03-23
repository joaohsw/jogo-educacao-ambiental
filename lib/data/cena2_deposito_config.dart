import '../models/hotspot_config.dart';

/// Cena 2 — Depósito: configuração dos 4 erros.
///
/// As coordenadas são relativas (0.0 a 1.0) em relação ao tamanho da imagem.
/// Para ajustar a posição de um erro, altere os valores de [relativeX],
/// [relativeY], [relativeWidth] e [relativeHeight] do hotspot correspondente.
///
/// Imagem de referência: assets/images/cena2.png
const String cena2BackgroundAsset = 'assets/images/cena2.png';

final List<HotspotConfig> cena2DepositoHotspots = [
  // ─── Erro 1: Veneno guardado junto com alimentos ────────────
  HotspotConfig(
    id: 'veneno_junto_alimentos',
    relativeX: 0.2, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.2, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Correto! Agrotóxicos nunca devem ser armazenados junto com '
        'alimentos. O risco de contaminação é altíssimo.',
  ),

  // ─── Erro 2: Animais dentro do depósito ─────────────────────
  HotspotConfig(
    id: 'animais_no_deposito',
    relativeX: 0.6, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.2, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Muito bem! Animais não podem ter acesso ao depósito de '
        'agrotóxicos. O local deve permanecer trancado.',
  ),

  // ─── Erro 3: Embalagens jogadas e abertas no chão ───────────
  HotspotConfig(
    id: 'embalagens_no_chao',
    relativeX: 0.2, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.6, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Correto! Embalagens devem ser mantidas fechadas, organizadas '
        'em prateleiras e nunca jogadas no chão.',
  ),

  // ─── Erro 4: Equipamento de aplicação dentro do depósito ────
  HotspotConfig(
    id: 'equipamento_no_deposito',
    relativeX: 0.6, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.6, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Muito bem! Equipamentos de aplicação (pulverizadores, etc.) '
        'não devem ser guardados dentro do depósito de agrotóxicos.',
  ),
];
