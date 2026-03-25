import '../models/hotspot_config.dart';

/// Cena 2 - Deposito: configuracao dos 4 erros.
///
/// As coordenadas sao relativas (0.0 a 1.0) em relacao ao tamanho da imagem.
/// Para ajustar a posicao de um erro, altere os valores de [relativeX],
/// [relativeY], [relativeWidth] e [relativeHeight] do hotspot correspondente.
///
/// Imagem de referencia: assets/images/cena2.png
const String cena2BackgroundAsset = 'assets/images/cena2.png';

final List<HotspotConfig> cena2DepositoHotspots = [
  // Erro 1: Veneno guardado junto com alimentos (mesma prateleira).
  HotspotConfig(
    id: 'veneno_junto_alimentos',
    relativeX: 0.24,
    relativeY: 0.33,
    relativeWidth: 0.38,
    relativeHeight: 0.24,
    successMessage:
        'Correto! Agrotoxicos nunca devem ser armazenados junto com '
        'alimentos. O risco de contaminacao e altissimo.',
  ),

  // Erro 2: Animais dentro do deposito.
  HotspotConfig(
    id: 'animais_no_deposito',
    relativeX: 0.75,
    relativeY: 0.73,
    relativeWidth: 0.23,
    relativeHeight: 0.25,
    successMessage:
        'Muito bem! Animais nao podem ter acesso ao deposito de '
        'agrotoxicos. O local deve permanecer trancado.',
  ),

  // Erro 3: Embalagens jogadas e abertas no chao.
  HotspotConfig(
    id: 'embalagens_no_chao',
    relativeX: 0.46,
    relativeY: 0.69,
    relativeWidth: 0.28,
    relativeHeight: 0.27,
    successMessage:
        'Correto! Embalagens devem ser mantidas fechadas, organizadas '
        'em prateleiras e nunca jogadas no chao.',
  ),

  // Erro 4: Equipamento de aplicacao dentro do deposito (trator guardado).
  HotspotConfig(
    id: 'equipamento_no_deposito',
    relativeX: 0.65,
    relativeY: 0.34,
    relativeWidth: 0.23,
    relativeHeight: 0.36,
    successMessage:
        'Muito bem! Equipamentos de aplicacao (pulverizadores, etc.) '
        'nao devem ser guardados dentro do deposito de agrotoxicos.',
  ),
];
