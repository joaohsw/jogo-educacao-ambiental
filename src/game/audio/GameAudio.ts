import Phaser from "phaser";

type Cue = "click" | "success" | "error" | "complete";

const KEY_BY_CUE: Record<Cue, string> = {
  click: "sfx-click",
  success: "sfx-success",
  error: "sfx-error",
  complete: "sfx-complete"
};

const VOLUME_BY_CUE: Record<Cue, number> = {
  click: 0.35,
  success: 0.45,
  error: 0.45,
  complete: 0.5
};

export class GameAudio {
  constructor(private readonly scene: Phaser.Scene) {}

  play(cue: Cue): void {
    const key = KEY_BY_CUE[cue];
    if (!this.scene.cache.audio.exists(key)) {
      return;
    }

    this.scene.sound.play(key, {
      volume: VOLUME_BY_CUE[cue]
    });
  }
}
