import Phaser from "phaser";

import "./styles.css";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/constants";
import { BootScene } from "./game/scenes/BootScene";
import { ControlsScene } from "./game/scenes/ControlsScene";
import { DressUpScene } from "./game/scenes/DressUpScene";
import { EndingScene } from "./game/scenes/EndingScene";
import { HomeScene } from "./game/scenes/HomeScene";
import { IntroScene } from "./game/scenes/IntroScene";
import { MapScene } from "./game/scenes/MapScene";
import { PauseScene } from "./game/scenes/PauseScene";
import { PackagingScene } from "./game/scenes/PackagingScene";
import { SettingsScene } from "./game/scenes/SettingsScene";
import { SpotErrorScene } from "./game/scenes/SpotErrorScene";

const scenes = [
  BootScene,
  HomeScene,
  IntroScene,
  ControlsScene,
  MapScene,
  PauseScene,
  EndingScene,
  SpotErrorScene,
  PackagingScene,
  DressUpScene,
  SettingsScene
];

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
  scene: scenes
};

new Phaser.Game(config);

console.info(`Cenas carregadas: ${scenes.map((scene) => scene.name).join(", ")}`);
