import Phaser from "phaser";

import "./styles.css";
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from "./game/constants";
import { BootScene } from "./game/scenes/BootScene";
import { ControlsScene } from "./game/scenes/ControlsScene";
import { DressUpScene } from "./game/scenes/DressUpScene";
import { HomeScene } from "./game/scenes/HomeScene";
import { IntroScene } from "./game/scenes/IntroScene";
import { MapScene } from "./game/scenes/MapScene";
import { PackagingScene } from "./game/scenes/PackagingScene";
import { RankingScene } from "./game/scenes/RankingScene";
import { SpotErrorScene } from "./game/scenes/SpotErrorScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#f8fafc",
  autoRound: false,
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: window.innerWidth,
    height: window.innerHeight
  },
  scene: [
    BootScene,
    HomeScene,
    IntroScene,
    ControlsScene,
    MapScene,
    SpotErrorScene,
    PackagingScene,
    DressUpScene,
    RankingScene
  ]
};

new Phaser.Game(config);

console.info(`Cenas carregadas: ${Object.values(SCENE_KEYS).join(", ")}`);
