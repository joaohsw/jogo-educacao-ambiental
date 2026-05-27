import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import { createButton, type GameButton } from "../ui/Button";

export class HomeScene extends Phaser.Scene {
  private audio!: GameAudio;
  private menuButtons: GameButton[] = [];
  private focusIndex = -1;
  private particles: { x: number; y: number; vx: number; vy: number; r: number; color: number; alpha: number }[] = [];
  private particleGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super(SCENE_KEYS.home);
  }

  create(): void {
    this.menuButtons = [];
    this.focusIndex = -1;
    this.audio = new GameAudio(this);

    const { width, height } = this.cameras.main;

    this.drawBackground(width, height);
    this.drawTitle(width, height);
    this.drawButtons(width, height);
    this.setupKeyboard();
    this.initParticles(width, height);
  }

  update(): void {
    this.updateParticles();
  }

  /* ================================================================ */
  /*  BACKGROUND                                                      */
  /* ================================================================ */
  private drawBackground(w: number, h: number): void {
    // Deep gradient
    const g = this.add.graphics();
    g.fillGradientStyle(0x0b1120, 0x0f2847, 0x0c3b2e, 0x0b1120, 1);
    g.fillRect(0, 0, w, h);

    // Large soft circles for depth
    this.add.circle(w * 0.15, h * 0.3, Math.min(w, h) * 0.35, 0x166534, 0.06);
    this.add.circle(w * 0.85, h * 0.7, Math.min(w, h) * 0.4, 0x1d4ed8, 0.05);
    this.add.circle(w * 0.5, h * 0.1, Math.min(w, h) * 0.25, 0x67e8f9, 0.04);

    // Horizontal subtle divider line
    const lineG = this.add.graphics();
    lineG.fillGradientStyle(0x22c55e, 0x3b82f6, 0x8b5cf6, 0x22c55e, 0.15, 0.4, 0.4, 0.15);
    lineG.fillRect(w * 0.1, h * 0.48, w * 0.8, 2);
  }

  /* ================================================================ */
  /*  FLOATING PARTICLES                                              */
  /* ================================================================ */
  private initParticles(w: number, h: number): void {
    this.particleGraphics = this.add.graphics().setDepth(1);
    const colors = [0x22c55e, 0x3b82f6, 0xfbbf24, 0x8b5cf6, 0x67e8f9];
    this.particles = [];

    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Phaser.Math.Between(0, w),
        y: Phaser.Math.Between(0, h),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        r: Phaser.Math.Between(2, 5),
        color: colors[i % colors.length],
        alpha: Math.random() * 0.25 + 0.08
      });
    }
  }

  private updateParticles(): void {
    const { width, height } = this.cameras.main;
    const g = this.particleGraphics;
    g.clear();

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      g.fillStyle(p.color, p.alpha);
      g.fillCircle(p.x, p.y, p.r);
    }
  }

  /* ================================================================ */
  /*  TITLE                                                           */
  /* ================================================================ */
  private drawTitle(w: number, h: number): void {
    const uiScale = Phaser.Math.Clamp(Math.min(w / 1280, h / 720), 0.6, 1.4);

    // Main title
    this.add.text(w * 0.5, h * 0.24, "Detetive na\nPropriedade", {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(68 * uiScale)}px`,
      color: "#f1f5f9",
      fontStyle: "700",
      align: "center",
      lineSpacing: 6
    }).setOrigin(0.5).setDepth(2);

    // Tagline
    this.add.text(w * 0.5, h * 0.42, "Aprendizado prático sobre segurança ambiental no campo", {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(20 * uiScale)}px`,
      color: "#94a3b8",
      align: "center",
      wordWrap: { width: w * 0.7 }
    }).setOrigin(0.5).setDepth(2);
  }

  /* ================================================================ */
  /*  BUTTONS                                                         */
  /* ================================================================ */
  private drawButtons(w: number, h: number): void {
    const uiScale = Phaser.Math.Clamp(Math.min(w / 1280, h / 720), 0.6, 1.4);
    const btnW = Math.min(w * 0.35, 420);
    const btnH = Math.max(60, Math.floor(68 * uiScale));
    const gap = Math.max(16, Math.floor(20 * uiScale));
    const startY = h * 0.58;

    // "Novo Jogo" button
    const newGameBtn = createButton(this, w * 0.5, startY, "Novo Jogo", () => {
      this.audio.play("click");
      gameStore.resetCurrentSession();
      // Clear saved position
      this.registry.remove("playerX");
      this.registry.remove("playerY");
      this.scene.start(SCENE_KEYS.map);
    }, {
      width: btnW,
      height: btnH,
      backgroundColor: 0x166534,
      hoverBackgroundColor: 0x15803d,
      borderColor: 0x22c55e,
      hoverBorderColor: 0x4ade80,
      textColor: "#f0fdf4",
      fontSize: `${Math.floor(30 * uiScale)}px`,
      depth: 10
    });
    this.menuButtons.push(newGameBtn);

    // "Continuar" button
    const hasSavedProgress = gameStore.getTotalScore() > 0;
    const continueBtn = createButton(this, w * 0.5, startY + btnH + gap, "Continuar", () => {
      this.audio.play("click");
      this.scene.start(SCENE_KEYS.map);
    }, {
      width: btnW,
      height: btnH,
      backgroundColor: hasSavedProgress ? 0x1e3a8a : 0x1e293b,
      hoverBackgroundColor: hasSavedProgress ? 0x1d4ed8 : 0x334155,
      borderColor: hasSavedProgress ? 0x3b82f6 : 0x475569,
      hoverBorderColor: hasSavedProgress ? 0x60a5fa : 0x64748b,
      textColor: hasSavedProgress ? "#dbeafe" : "#64748b",
      fontSize: `${Math.floor(30 * uiScale)}px`,
      depth: 10
    });
    this.menuButtons.push(continueBtn);

    if (!hasSavedProgress) {
      continueBtn.container.setAlpha(0.5);
      continueBtn.container.disableInteractive();
    }

    // "Ranking" button (smaller, below)
    const rankingBtn = createButton(this, w * 0.5, startY + (btnH + gap) * 2 + 8, "Ranking", () => {
      this.audio.play("click");
      this.scene.start(SCENE_KEYS.ranking);
    }, {
      width: Math.min(btnW * 0.65, 280),
      height: Math.max(50, Math.floor(54 * uiScale)),
      backgroundColor: 0x451a03,
      hoverBackgroundColor: 0x78350f,
      borderColor: 0xea580c,
      hoverBorderColor: 0xfb923c,
      textColor: "#ffedd5",
      fontSize: `${Math.floor(24 * uiScale)}px`,
      depth: 10
    });
    this.menuButtons.push(rankingBtn);

    // Version / credit
    this.add.text(w * 0.5, h - 28, "v2.0  •  Educação Ambiental", {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(14 * uiScale)}px`,
      color: "#475569"
    }).setOrigin(0.5).setDepth(2);
  }

  /* ================================================================ */
  /*  KEYBOARD NAVIGATION                                             */
  /* ================================================================ */
  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const cursors = kb.createCursorKeys();
    const keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyEnter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const moveUp = () => this.moveFocus(-1);
    const moveDown = () => this.moveFocus(1);
    const confirm = () => {
      if (this.focusIndex >= 0 && this.focusIndex < this.menuButtons.length) {
        this.menuButtons[this.focusIndex].trigger();
      }
    };

    cursors.up!.on("down", moveUp);
    cursors.down!.on("down", moveDown);
    keyW.on("down", moveUp);
    keyS.on("down", moveDown);
    keyEnter.on("down", confirm);
    keySpace.on("down", confirm);

    // Sync mouse hover
    this.menuButtons.forEach((btn, idx) => {
      btn.container.on("pointerover", () => this.setFocus(idx));
      btn.container.on("pointerout", () => {
        if (this.focusIndex === idx) this.clearFocus();
      });
    });
  }

  private moveFocus(dir: number): void {
    const count = this.menuButtons.length;
    if (count === 0) return;

    if (this.focusIndex >= 0) this.menuButtons[this.focusIndex].setFocused(false);

    if (this.focusIndex < 0) {
      this.focusIndex = dir > 0 ? 0 : count - 1;
    } else {
      this.focusIndex = (this.focusIndex + dir + count) % count;
    }

    // Skip disabled buttons
    const btn = this.menuButtons[this.focusIndex];
    if (btn.container.alpha < 0.6) {
      // try next
      this.moveFocus(dir);
      return;
    }

    btn.setFocused(true);
    this.audio.play("click");
  }

  private setFocus(index: number): void {
    if (this.focusIndex === index) return;
    if (this.focusIndex >= 0) this.menuButtons[this.focusIndex].setFocused(false);
    this.focusIndex = index;
    this.menuButtons[this.focusIndex].setFocused(true);
  }

  private clearFocus(): void {
    if (this.focusIndex >= 0) this.menuButtons[this.focusIndex].setFocused(false);
    this.focusIndex = -1;
  }
}
