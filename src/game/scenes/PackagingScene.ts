import Phaser from "phaser";

import { packagingCards, type PackagingCard } from "../data/packagingCards";
import { SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import { createButton } from "../ui/Button";
import { showModal } from "../ui/Modal";
import { MiniGameScene } from "./MiniGameScene";

interface SlotRuntime {
  order: number;
  label: string;
  zone: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  occupied: boolean;
}

interface CardRuntime {
  data: PackagingCard;
  container: Phaser.GameObjects.Container;
  home: Phaser.Math.Vector2;
  placed: boolean;
}

export class PackagingScene extends MiniGameScene {
  private slots: SlotRuntime[] = [];
  private cards: CardRuntime[] = [];
  private trayBounds = new Phaser.Geom.Rectangle(80, 360, 1120, 300);

  constructor() {
    super(SCENE_KEYS.packaging);
  }

  create(): void {
    this.slots = [];
    this.cards = [];
    this.trayBounds = new Phaser.Geom.Rectangle(80, 360, 1120, 300);
    this.beginMiniGame();

    this.drawBackground();
    this.drawHeader();
    this.drawInstructions();
    this.buildSlotsFromMap();
    this.createCards();
  }

  private drawBackground(): void {
    this.drawProjectionBackdrop({
      panelColor: 0xf8fafc,
      panelAlpha: 0.94,
      borderColor: 0x93c5fd
    });
  }

  private drawHeader(): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const headerHeight = Math.max(82, Math.floor(90 * uiScale));
    const headerY = 22 + headerHeight * 0.5;
    const headerWidth = width - 64;

    this.add.rectangle(width * 0.5, headerY, headerWidth, headerHeight, 0x0f172a, 0.96).setStrokeStyle(2, 0x334155);

    this.add
      .text(width * 0.5, headerY, "Jornada da Embalagem", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(52 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    createButton(this, 108 * uiScale, headerY, "Voltar", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("click");
      this.returnToMap();
    }, {
      width: 162 * uiScale,
      height: 52 * uiScale,
      backgroundColor: 0xffffff,
      hoverBackgroundColor: 0xe2e8f0,
      borderColor: 0x334155,
      hoverBorderColor: 0x1e293b,
      textColor: "#0f172a",
      fontSize: `${Math.floor(26 * uiScale)}px`
    });
  }

  private drawInstructions(): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);
    this.add
      .text(width * 0.5, height * 0.15, "Analise as cartas e monte a sequência correta.", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        color: "#111827",
        backgroundColor: "#fef9c3",
        padding: { left: 12, right: 12, top: 4, bottom: 4 },
        fontStyle: "700"
      })
      .setOrigin(0.5);
  }

  private buildSlotsFromMap(): void {
    const map = this.make.tilemap({ key: "map-packaging" });
    const slotLayer = map.getObjectLayer("slots");
    const trayLayer = map.getObjectLayer("tray");
    if (!slotLayer) {
      throw new Error("Camada slots não encontrada em map-packaging");
    }

    const { width, height } = this.cameras.main;
    const sx = width / map.width;
    const sy = height / map.height;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const trayObject = trayLayer?.objects[0];
    if (trayObject) {
      this.trayBounds = new Phaser.Geom.Rectangle(
        (trayObject.x ?? 0) * sx,
        (trayObject.y ?? 0) * sy,
        (trayObject.width ?? 1120) * sx,
        (trayObject.height ?? 300) * sy
      );
    }

    this.slots = slotLayer.objects
      .map((slotObject) => {
        const order = this.getNumericProperty(slotObject, "order", 0);
        const label = this.getStringProperty(slotObject, "label", `${order + 1}`);
        const zone = this.add
          .rectangle(
            ((slotObject.x ?? 0) + (slotObject.width ?? 120) * 0.5) * sx,
            ((slotObject.y ?? 0) + (slotObject.height ?? 90) * 0.5) * sy,
            (slotObject.width ?? 120) * sx,
            (slotObject.height ?? 90) * sy,
            0xffffff,
            0.96
          )
          .setStrokeStyle(2, 0x2563eb)
          .setDepth(10);

        const text = this.add
          .text(zone.x, zone.y, label, {
            fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
            fontSize: `${Math.floor(24 * uiScale)}px`,
            color: "#1e3a8a",
            align: "center",
            wordWrap: {
              width: Math.max(64, zone.width - 16)
            }
          })
          .setOrigin(0.5)
          .setDepth(11);

        return { order, label, zone, text, occupied: false };
      })
      .sort((a, b) => a.order - b.order);
  }

  private createCards(): void {
    const shuffled = Phaser.Utils.Array.Shuffle([...packagingCards]);
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const columns = width >= 1080 ? 5 : width >= 760 ? 4 : 2;
    const gapX = Math.max(8, Math.floor(12 * uiScale));
    const gapY = Math.max(8, Math.floor(12 * uiScale));
    const trayPadX = Math.max(14, Math.floor(18 * uiScale));
    const cardWidth = Phaser.Math.Clamp(
      Math.floor((this.trayBounds.width - trayPadX * 2 - gapX * (columns - 1)) / columns),
      132,
      Math.floor(198 * uiScale)
    );
    const cardHeight = Phaser.Math.Clamp(76 * uiScale, 56, 82);
    const spacingX = cardWidth + gapX;
    const spacingY = cardHeight + gapY;
    const startX = this.trayBounds.x + trayPadX + cardWidth * 0.5;
    const startY = this.trayBounds.y + cardHeight * 0.5 + 12 * uiScale;

    shuffled.forEach((cardData, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const card = this.createCardVisual(cardData, x, y, cardWidth, cardHeight, uiScale);
      const runtime: CardRuntime = {
        data: cardData,
        container: card,
        home: new Phaser.Math.Vector2(x, y),
        placed: false
      };

      this.cards.push(runtime);
      this.input.setDraggable(card);

      card.on("dragstart", () => {
        if (runtime.placed || this.modalOpen) {
          return;
        }
        card.setDepth(30);
      });

      card.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!runtime.placed && !this.modalOpen) {
          card.setPosition(dragX, dragY);
        }
      });

      card.on("dragend", () => {
        if (!runtime.placed && !this.modalOpen) {
          this.handleDrop(runtime);
        }
      });
    });
  }

  private createCardVisual(
    cardData: PackagingCard,
    x: number,
    y: number,
    width: number,
    height: number,
    uiScale: number
  ): Phaser.GameObjects.Container {
    const bgColor = 0xffffff;
    const borderColor = 0x1d4ed8;
    const textColor = "#1e3a8a";

    const shadow = this.add.rectangle(0, 4, width, height, 0x020617, 0.22).setOrigin(0.5);
    const bg = this.add
      .rectangle(0, 0, width, height, bgColor, 0.98)
      .setOrigin(0.5)
      .setStrokeStyle(2, borderColor);
    const label = this.add
      .text(0, 0, cardData.label, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(19 * uiScale)}px`,
        color: textColor,
        fontStyle: "700",
        align: "center",
        wordWrap: {
          width: width * 0.86
        }
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [shadow, bg, label]);
    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    container.input!.cursor = "grab";
    return container;
  }

  private handleDrop(cardRuntime: CardRuntime): void {
    const slot = this.findSlotByOverlap(cardRuntime.container.getBounds());
    if (!slot) {
      this.snapCardHome(cardRuntime);
      return;
    }

    if (slot.occupied) {
      this.audio.play("error");
      this.snapCardHome(cardRuntime);
      return;
    }

    if (!cardRuntime.data.isCorrect) {
      this.audio.play("error");
      this.snapCardHome(cardRuntime);
      return;
    }

    if (cardRuntime.data.correctOrder !== slot.order) {
      this.audio.play("error");
      this.snapCardHome(cardRuntime);
      return;
    }

    this.placeCard(cardRuntime, slot);
  }

  private placeCard(cardRuntime: CardRuntime, slot: SlotRuntime): void {
    cardRuntime.placed = true;
    slot.occupied = true;
    slot.zone.setFillStyle(0xdcfce7, 1);
    slot.zone.setStrokeStyle(2, 0x16a34a, 1);
    slot.text.setVisible(false);
    cardRuntime.container.disableInteractive();

    this.tweens.add({
      targets: cardRuntime.container,
      x: slot.zone.x,
      y: slot.zone.y,
      duration: 200,
      ease: "Quad.Out"
    });

    this.audio.play("success");
    gameStore.addScoreForAction({
      miniGameId: "jornada_embalagem",
      actionId: `card:${cardRuntime.data.id}`,
      points: 10
    });

    if (this.slots.every((item) => item.occupied)) {
      this.audio.play("complete");
      gameStore.markMiniGameCompleted("jornada_embalagem");
      this.openModal({
        title: "Sequência completa",
        message: "Você concluiu a Jornada da Embalagem com sucesso.",
        tone: "complete",
        confirmLabel: "Voltar",
        onConfirm: () => this.returnToMap()
      });
    }
  }

  private findSlotByOverlap(cardBounds: Phaser.Geom.Rectangle): SlotRuntime | undefined {
    return this.slots.find((slot) => {
      const slotBounds = slot.zone.getBounds();
      if (!Phaser.Geom.Intersects.RectangleToRectangle(cardBounds, slotBounds)) {
        return false;
      }

      const overlapX = Math.max(
        0,
        Math.min(cardBounds.right, slotBounds.right) - Math.max(cardBounds.x, slotBounds.x)
      );
      const overlapY = Math.max(
        0,
        Math.min(cardBounds.bottom, slotBounds.bottom) - Math.max(cardBounds.y, slotBounds.y)
      );
      const overlapArea = overlapX * overlapY;
      const cardArea = cardBounds.width * cardBounds.height;
      return overlapArea >= cardArea * 0.34;
    });
  }

  private snapCardHome(cardRuntime: CardRuntime): void {
    this.tweens.add({
      targets: cardRuntime.container,
      x: cardRuntime.home.x,
      y: cardRuntime.home.y,
      duration: 180,
      ease: "Quad.Out"
    });
  }

  private openModal(args: {
    title: string;
    message: string;
    tone: "success" | "error" | "info" | "complete";
    confirmLabel?: string;
    onConfirm?: () => void;
  }): void {
    if (this.modalOpen) {
      return;
    }
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

  private getNumericProperty(
    object: Phaser.Types.Tilemaps.TiledObject,
    propertyName: string,
    fallback: number
  ): number {
    const bag = object.properties as Array<{ name: string; value: unknown }> | undefined;
    const value = bag?.find((entry) => entry.name === propertyName)?.value;
    return typeof value === "number" ? value : fallback;
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

