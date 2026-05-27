import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { packagingCards, type PackagingCard } from "../data/packagingCards";
import { REGISTRY_KEYS, SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import { createButton } from "../ui/Button";
import { showModal } from "../ui/Modal";

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

export class PackagingScene extends Phaser.Scene {
  private audio!: GameAudio;
  private slots: SlotRuntime[] = [];
  private cards: CardRuntime[] = [];
  private modalOpen = false;
  private returningToMap = false;
  private trayBounds = new Phaser.Geom.Rectangle(80, 360, 1120, 300);

  constructor() {
    super(SCENE_KEYS.packaging);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.drawBackground();
    this.drawHeader();
    this.drawInstructions();
    this.buildSlotsFromMap();
    this.createCards();
  }

  private drawBackground(): void {
    const { width, height } = this.cameras.main;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x1d4ed8, 0x0f766e, 0x14532d, 1);
    bg.fillRect(0, 0, width, height);
    this.add.circle(width * 0.87, height * 0.16, Math.min(width, height) * 0.18, 0xfacc15, 0.07);
    this.add.circle(width * 0.14, height * 0.75, Math.min(width, height) * 0.2, 0x67e8f9, 0.06);

    const shellW = width - 44;
    const shellH = height - 34;
    this.add.rectangle(width * 0.5 + 4, height * 0.5 + 6, shellW, shellH, 0x020617, 0.3);
    this.add.rectangle(width * 0.5, height * 0.5, shellW, shellH, 0xf8fafc, 0.92).setStrokeStyle(2, 0xffffff, 0.75);
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
      .text(width * 0.5, height * 0.15, "Arraste cada carta para a posicao correta da sequencia.", {
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
      throw new Error("Camada slots nao encontrada em map-packaging");
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

    const columns = width >= 1024 ? 4 : 3;
    const cardWidth = Math.max(180, Math.floor(235 * uiScale));
    const cardHeight = Math.max(68, Math.floor(92 * uiScale));
    const spacingX = cardWidth + Math.max(10, Math.floor(14 * uiScale));
    const spacingY = cardHeight + Math.max(10, Math.floor(14 * uiScale));
    const startX = this.trayBounds.x + cardWidth * 0.5 + 20 * uiScale;
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
    const bgColor = cardData.isCorrect ? 0xffffff : 0xfff7ed;
    const borderColor = cardData.isCorrect ? 0x1d4ed8 : 0xea580c;
    const textColor = cardData.isCorrect ? "#1e3a8a" : "#9a3412";

    const shadow = this.add.rectangle(0, 4, width, height, 0x020617, 0.22).setOrigin(0.5);
    const bg = this.add
      .rectangle(0, 0, width, height, bgColor, 0.98)
      .setOrigin(0.5)
      .setStrokeStyle(2, borderColor);
    const label = this.add
      .text(0, 0, cardData.label, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(23 * uiScale)}px`,
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
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
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
      this.openModal({
        title: "Posicao ocupada",
        message: "Esse espaco ja esta preenchido.",
        tone: "error"
      });
      this.snapCardHome(cardRuntime);
      return;
    }

    if (!cardRuntime.data.isCorrect) {
      this.audio.play("error");
      this.openModal({
        title: "Carta incorreta",
        message: `"${cardRuntime.data.label}" nao faz parte da sequencia correta.`,
        tone: "error"
      });
      this.snapCardHome(cardRuntime);
      return;
    }

    if (cardRuntime.data.correctOrder !== slot.order) {
      this.audio.play("error");
      this.openModal({
        title: "Ordem incorreta",
        message: `"${cardRuntime.data.label}" nao entra nessa posicao.`,
        tone: "error"
      });
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
    slot.text.setColor("#166534");
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
      this.openModal({
        title: "Sequencia completa",
        message: "Voce concluiu a Jornada da Embalagem com sucesso.",
        tone: "complete",
        confirmLabel: "Concluir",
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

  private returnToMap(): void {
    if (this.returningToMap) return;

    this.returningToMap = true;
    this.modalOpen = false;
    this.input.enabled = false;
    this.tweens.killAll();

    this.registry.set(REGISTRY_KEYS.returnToMap, true);
    this.game.scene.stop(SCENE_KEYS.home);
    this.game.scene.start(SCENE_KEYS.home);
    this.game.scene.stop(SCENE_KEYS.packaging);
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

