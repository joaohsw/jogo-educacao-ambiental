import '../models/hotspot_config.dart';

/// Cena 1 - Lavoura: configuracao dos 5 erros.
///
/// As coordenadas sao relativas (0.0 a 1.0) em relacao ao tamanho da imagem.
/// Para ajustar a posicao de um erro, altere os valores de [relativeX],
/// [relativeY], [relativeWidth] e [relativeHeight] do hotspot correspondente.
///
/// Imagem de referencia: assets/images/cena1.png
const String cena1BackgroundAsset = 'assets/images/cena1.png';

final List<HotspotConfig> cena1LavouraHotspots = [
  // Erro 1: Armazenamento incorreto e vazamento no campo (tambores vazando).
  HotspotConfig(
    id: 'armazenamento_incorreto',
    relativeX: 0.18,
    relativeY: 0.34,
    relativeWidth: 0.23,
    relativeHeight: 0.30,
    successMessage:
        'Correto! Os agrotoxicos devem ser armazenados em local adequado, '
        'longe do campo, evitando vazamentos.',
  ),

  // Erro 2: Proximidade de animais de producao (gado ao lado da aplicacao).
  HotspotConfig(
    id: 'animais_proximos',
    relativeX: 0.71,
    relativeY: 0.29,
    relativeWidth: 0.29,
    relativeHeight: 0.41,
    successMessage:
        'Muito bem! Animais de producao devem ser mantidos longe da area '
        'de aplicacao de agrotoxicos.',
  ),

  // Erro 3: Alimentacao na area de aplicacao (pessoa comendo no campo).
  HotspotConfig(
    id: 'alimentacao_area',
    relativeX: 0.08,
    relativeY: 0.38,
    relativeWidth: 0.15,
    relativeHeight: 0.36,
    successMessage:
        'Correto! Nunca se deve comer ou beber na area de aplicacao '
        'de agrotoxicos.',
  ),

  // Erro 4: Descarte incorreto de embalagens vazias.
  HotspotConfig(
    id: 'descarte_incorreto',
    relativeX: 0.21,
    relativeY: 0.71,
    relativeWidth: 0.35,
    relativeHeight: 0.26,
    successMessage:
        'Muito bem! Embalagens vazias devem ser triplice lavadas e '
        'devolvidas nos postos de recebimento.',
  ),

  // Erro 5: EPI incompleto do aplicador.
  HotspotConfig(
    id: 'epi_incompleto',
    relativeX: 0.47,
    relativeY: 0.25,
    relativeWidth: 0.20,
    relativeHeight: 0.57,
    successMessage:
        'Correto! O aplicador deve usar o EPI completo durante toda '
        'a aplicacao: luvas, botas, avental, viseira e respirador.',
  ),
];
