import '../models/hotspot_config.dart';

/// Cena 1 — Lavoura: configuração dos 5 erros.
///
/// As coordenadas são relativas (0.0 a 1.0) em relação ao tamanho da imagem.
/// Para ajustar a posição de um erro, altere os valores de [relativeX],
/// [relativeY], [relativeWidth] e [relativeHeight] do hotspot correspondente.
///
/// Imagem de referência: assets/images/cena1.png
const String cena1BackgroundAsset = 'assets/images/cena1.png';

final List<HotspotConfig> cena1LavouraHotspots = [
  // ─── Erro 1: Armazenamento Incorreto e Vazamento no Campo ───
  HotspotConfig(
    id: 'armazenamento_incorreto',
    relativeX: 0.1, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.1, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Correto! Os agrotóxicos devem ser armazenados em local adequado, '
        'longe do campo, evitando vazamentos.',
  ),

  // ─── Erro 2: Proximidade de Animais de Produção ─────────────
  HotspotConfig(
    id: 'animais_proximos',
    relativeX: 0.7, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.1, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Muito bem! Animais de produção devem ser mantidos longe da área '
        'de aplicação de agrotóxicos.',
  ),

  // ─── Erro 3: Alimentação na Área de Aplicação ───────────────
  HotspotConfig(
    id: 'alimentacao_area',
    relativeX: 0.4, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.4, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Correto! Nunca se deve comer ou beber na área de aplicação '
        'de agrotóxicos.',
  ),

  // ─── Erro 4: Descarte Incorreto de Embalagens Vazias ────────
  HotspotConfig(
    id: 'descarte_incorreto',
    relativeX: 0.1, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.7, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Muito bem! Embalagens vazias devem ser tríplice lavadas e '
        'devolvidas nos postos de recebimento.',
  ),

  // ─── Erro 5: EPI Incompleto do Aplicador ────────────────────
  HotspotConfig(
    id: 'epi_incompleto',
    relativeX: 0.7, // TODO: ajustar coordenada X (atualmente um placeholder)
    relativeY: 0.7, // TODO: ajustar coordenada Y
    relativeWidth: 0.15, // TODO: ajustar largura
    relativeHeight: 0.15, // TODO: ajustar altura
    successMessage:
        'Correto! O aplicador deve usar o EPI completo durante toda '
        'a aplicação: luvas, botas, avental, viseira e respirador.',
  ),
];
