import Phaser from "phaser";

import { BACKGROUND_MUSIC, STORAGE_KEYS } from "../constants";

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

const DEFAULT_MUSIC_VOLUME = 0.35;

export class GameAudio {
  private static backgroundMusic?: Phaser.Sound.BaseSound;
  private static unlockListenerAttached = false;

  constructor(private readonly scene: Phaser.Scene) {
    GameAudio.ensureBackgroundMusic(scene);
  }

  play(cue: Cue): void {
    GameAudio.ensureBackgroundMusic(this.scene);

    const key = KEY_BY_CUE[cue];
    if (!this.scene.cache.audio.exists(key)) {
      return;
    }

    this.scene.sound.play(key, {
      volume: VOLUME_BY_CUE[cue]
    });
  }

  static getMusicVolume(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.musicVolume);
    const parsed = raw === null ? DEFAULT_MUSIC_VOLUME : Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_MUSIC_VOLUME;
    }

    return Phaser.Math.Clamp(parsed, 0, 1);
  }

  static setMusicVolume(volume: number): void {
    const cleanVolume = Phaser.Math.Clamp(volume, 0, 1);
    localStorage.setItem(STORAGE_KEYS.musicVolume, cleanVolume.toFixed(3));

    if (GameAudio.backgroundMusic) {
      GameAudio.setSoundVolume(GameAudio.backgroundMusic, cleanVolume);
    }
  }

  static ensureBackgroundMusic(scene: Phaser.Scene): void {
    if (!scene.cache.audio.exists(BACKGROUND_MUSIC.key)) {
      return;
    }

    const sound = scene.sound as Phaser.Sound.BaseSoundManager & { unlocked?: boolean };
    if (sound.unlocked === false) {
      if (!GameAudio.unlockListenerAttached) {
        GameAudio.unlockListenerAttached = true;
        scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
          GameAudio.unlockListenerAttached = false;
          GameAudio.ensureBackgroundMusic(scene);
        });
      }
      return;
    }

    const volume = GameAudio.getMusicVolume();
    if (!GameAudio.backgroundMusic) {
      GameAudio.backgroundMusic = scene.sound.add(BACKGROUND_MUSIC.key, {
        loop: true,
        volume
      });
    }

    GameAudio.setSoundVolume(GameAudio.backgroundMusic, volume);

    if (!GameAudio.backgroundMusic.isPlaying) {
      GameAudio.backgroundMusic.play({
        loop: true,
        volume
      });
    }
  }

  private static setSoundVolume(sound: Phaser.Sound.BaseSound, volume: number): void {
    (sound as Phaser.Sound.BaseSound & { volume: number }).volume = volume;
  }
}
