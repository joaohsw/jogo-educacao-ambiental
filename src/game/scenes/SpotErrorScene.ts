import Phaser from "phaser";

import { SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import type { MiniGameId } from "../types/gameTypes";
import { createButton } from "../ui/Button";
import { showModal } from "../ui/Modal";
import { MiniGameScene } from "./MiniGameScene";

interface SpotSceneData {
  sceneTitle: string;
  miniGameId: MiniGameId;
  mapKey: string;
  backgroundKey: string;
}

interface HotspotRuntime {
  id: string;
  message: string;
  rect: Phaser.GameObjects.Rectangle;
  marker?: Phaser.GameObjects.Text;
  found: boolean;
}

export class SpotErrorScene extends MiniGameScene {
  private configData!: SpotSceneData;
  private hotspots: HotspotRuntime[] = [];
  private counterText!: Phaser.GameObjects.Text;
  private completionShown = false;
  private frameRect!: Phaser.Geom.Rectangle;

  constructor() {
    super(SCENE_KEYS.spotError);
  }

  create(rawData: SpotSceneData): void {
    this.hotspots = [];
    this.completionShown = false;
    this.beginMiniGame();

    this.configData = rawData;

    this.drawBackground();
    this.drawTopHeader();
    this.drawSceneAndHotspots();
  }

  private drawBackground(): void {
    this.drawProjectionBackdrop({
      panelColor: 0xf8fafc,
      panelAlpha: 0.92,
      borderColor: 0x99f6e4
    });
  }

  private drawTopHeader(): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const headerHeight = Math.max(70, Math.floor(78 * uiScale));
    const headerTop = Math.max(12, Math.floor(14 * uiScale));
    const headerY = headerTop + headerHeight * 0.5;
    const headerWidth = width - Math.max(34, Math.floor(40 * uiScale));

    this.add.rectangle(width * 0.5 + 4, headerY + 6, headerWidth, headerHeight, 0x020617, 0.32);
    this.add.rectangle(width * 0.5, headerY, headerWidth, headerHeight, 0xf8fafc, 0.96).setStrokeStyle(2, 0x0f172a);

    this.add
      .text(width * 0.5, headerY, this.configData.sceneTitle, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(44 * uiScale)}px`,
        color: "#0f172a",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    createButton(this, 112 * uiScale, headerY, "Voltar", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("click");
      this.returnToMap();
    }, {
      width: 168 * uiScale,
      height: 54 * uiScale,
      backgroundColor: 0xffffff,
      hoverBackgroundColor: 0xe2e8f0,
      borderColor: 0x334155,
      hoverBorderColor: 0x1e293b,
      textColor: "#0f172a",
      fontSize: `${Math.floor(26 * uiScale)}px`
    });

    this.counterText = this.add
      .text(width - 118 * uiScale, headerY, "", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        color: "#0f172a",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    const frameMargin = Math.max(10, Math.floor(12 * uiScale));
    const headerBottom = headerY + headerHeight * 0.5;
    this.frameRect = new Phaser.Geom.Rectangle(
      frameMargin,
      headerBottom + frameMargin,
      width - frameMargin * 2,
      height - (headerBottom + frameMargin * 2)
    );
  }

  private drawSceneAndHotspots(): void {
    const map = this.make.tilemap({ key: this.configData.mapKey });
    const objectLayer = map.getObjectLayer("hotspots");
    if (!objectLayer) {
      throw new Error(`Camada hotspots não encontrada em ${this.configData.mapKey}`);
    }

    const image = this.add
      .image(this.frameRect.centerX, this.frameRect.centerY, this.configData.backgroundKey)
      .setDepth(5);
    const scale = Math.min(this.frameRect.width / image.width, this.frameRect.height / image.height);
    image.setScale(scale);

    const imageBounds = image.getBounds();

    this.add
      .rectangle(imageBounds.centerX, imageBounds.centerY, imageBounds.width + 6, imageBounds.height + 6, 0xffffff, 0.98)
      .setStrokeStyle(3, 0x0f172a)
      .setDepth(4);
    image.setDepth(6);

    const missZone = this.add
      .zone(imageBounds.x, imageBounds.y, imageBounds.width, imageBounds.height)
      .setOrigin(0)
      .setDepth(8)
      .setInteractive();

    missZone.on("pointerdown", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("error");
      this.openModal({
        title: "Ops!",
        message: "Esse ponto não representa um erro. Continue investigando.",
        tone: "error"
      });
    });

    this.hotspots = objectLayer.objects.map((object) => {
      const id = object.name ?? `hotspot_${object.id}`;
      const message = this.getStringProperty(object, "successMessage", "Muito bem, você encontrou um erro.");
      const mapped = this.mapToImageBounds(
        imageBounds,
        map.width,
        map.height,
        object.x ?? 0,
        object.y ?? 0,
        object.width ?? 40,
        object.height ?? 40
      );

      const rect = this.add
        .rectangle(mapped.centerX, mapped.centerY, mapped.width, mapped.height, 0x22c55e, 0)
        .setDepth(9)
        .setInteractive({ useHandCursor: true });

      rect.on("pointerdown", () => this.handleHotspot(id, message));

      const hotspot: HotspotRuntime = { id, message, rect, found: false };
      const actionId = `hotspot:${id}`;
      if (gameStore.wasActionScored(this.configData.miniGameId, actionId)) {
        hotspot.found = true;
        this.applyFoundStyle(hotspot);
      }

      return hotspot;
    });

    this.updateCounter();
  }

  private mapToImageBounds(
    imageBounds: Phaser.Geom.Rectangle,
    mapWidth: number,
    mapHeight: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.Geom.Rectangle {
    const px = imageBounds.x + (x / mapWidth) * imageBounds.width;
    const py = imageBounds.y + (y / mapHeight) * imageBounds.height;
    const pw = (width / mapWidth) * imageBounds.width;
    const ph = (height / mapHeight) * imageBounds.height;
    return new Phaser.Geom.Rectangle(px, py, pw, ph);
  }

  private handleHotspot(id: string, message: string): void {
    if (this.modalOpen) {
      return;
    }

    const hotspot = this.hotspots.find((item) => item.id === id);
    if (!hotspot || hotspot.found) {
      return;
    }

    hotspot.found = true;
    this.applyFoundStyle(hotspot);

    gameStore.addScoreForAction({
      miniGameId: this.configData.miniGameId,
      actionId: `hotspot:${id}`,
      points: 10
    });

    this.audio.play("success");
    this.updateCounter();

    this.openModal({
      title: "Acerto!",
      message,
      tone: "success",
      onConfirm: () => {
        if (this.hotspots.every((entry) => entry.found) && !this.completionShown) {
          this.showCompletion();
        }
      }
    });
  }

  private applyFoundStyle(hotspot: HotspotRuntime): void {
    hotspot.rect.setFillStyle(0x16a34a, 0.32);
    hotspot.rect.setStrokeStyle(2, 0x166534, 1);
    hotspot.marker = this.add
      .text(hotspot.rect.x, hotspot.rect.y, "OK", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(12);
  }

  private showCompletion(): void {
    this.completionShown = true;
    this.audio.play("complete");
    gameStore.markMiniGameCompleted(this.configData.miniGameId);
    this.openModal({
      title: "Cena concluída",
      message: `Você encontrou todos os ${this.hotspots.length} erros.`,
      tone: "complete",
      confirmLabel: "Voltar",
      onConfirm: () => this.returnToMap()
    });
  }

  private updateCounter(): void {
    const found = this.hotspots.filter((item) => item.found).length;
    this.counterText.setText(`${found} / ${this.hotspots.length} erros`);
  }

  private openModal(args: {
    title: string;
    message: string;
    tone: "success" | "error" | "info" | "complete";
    confirmLabel?: string;
    onConfirm?: () => void;
  }): void {
    this.modalOpen = true;
    showModal(this, {
      title: args.title,
      message: args.message,
      tone: args.tone,
      confirmLabel: args.confirmLabel,
      onConfirm: () => {
        this.modalOpen = false;
        args.onConfirm?.();
      }
    });
  }

  private getStringProperty(
    object: Phaser.Types.Tilemaps.TiledObject,
    propertyName: string,
    fallback: string
  ): string {
    const bag = object.properties as Array<{ name: string; value: unknown }> | undefined;
    const value = bag?.find((entry) => entry.name === propertyName)?.value;
    return typeof value === "string" ? value : fallback;
  }
}

