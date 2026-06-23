import Phaser from "phaser";

import { DRESS_UP_ASSETS, SCENE_KEYS } from "../constants";
import { epiItems, type EpiItem } from "../data/epiItems";
import { gameStore } from "../state/GameStore";
import { createButton } from "../ui/Button";
import { showModal } from "../ui/Modal";
import { MiniGameScene } from "./MiniGameScene";

interface ZoneRuntime {
  id: string;
  label: string;
  zone: Phaser.GameObjects.Rectangle;
  occupied: boolean;
}

interface ItemRuntime {
  data: EpiItem;
  container: Phaser.GameObjects.Container;
  image: Phaser.GameObjects.Image;
  home: Phaser.Math.Vector2;
  equipped: boolean;
}

interface AvatarLayout {
  x: number;
  bottomY: number;
  height: number;
  top: number;
}

interface ItemVisualConfig {
  trayWidth: number;
  equipWidth?: number;
  equipWidthFactor?: number;
  offsetXFactor: number;
  offsetYFactor: number;
  depth: number;
}

const ITEM_VISUALS: Record<string, ItemVisualConfig> = {
  bone_arabe: {
    trayWidth: 92,
    equipWidthFactor: 0.46,
    offsetXFactor: 0,
    offsetYFactor: -0.83,
    depth: 28
  },
  oculos: {
    trayWidth: 102,
    equipWidthFactor: 0.34,
    offsetXFactor: 0.01,
    offsetYFactor: -0.67,
    depth: 30
  },
  respirador: {
    trayWidth: 90,
    equipWidthFactor: 0.29,
    offsetXFactor: 0.01,
    offsetYFactor: -0.58,
    depth: 31
  },
  luvas: {
    trayWidth: 104,
    equipWidthFactor: 0.38,
    offsetXFactor: 0,
    offsetYFactor: -0.285,
    depth: 27
  },
  avental: {
    trayWidth: 100,
    equipWidthFactor: 0.37,
    offsetXFactor: 0,
    offsetYFactor: -0.34,
    depth: 29
  },
  botas: {
    trayWidth: 108,
    equipWidthFactor: 0.31,
    offsetXFactor: 0,
    offsetYFactor: -0.045,
    depth: 26
  },
  mascara_cirurgica: {
    trayWidth: 100,
    offsetXFactor: 0,
    offsetYFactor: -0.57,
    depth: 31
  },
  chinelo: {
    trayWidth: 96,
    offsetXFactor: 0,
    offsetYFactor: -0.04,
    depth: 26
  },
  camiseta: {
    trayWidth: 96,
    offsetXFactor: 0,
    offsetYFactor: -0.33,
    depth: 25
  },
  luvas_latex: {
    trayWidth: 110,
    offsetXFactor: 0,
    offsetYFactor: -0.34,
    depth: 27
  }
};

export class DressUpScene extends MiniGameScene {
  private zones: ZoneRuntime[] = [];
  private items: ItemRuntime[] = [];
  private equippedText!: Phaser.GameObjects.Text;
  private avatarLayout!: AvatarLayout;

  constructor() {
    super(SCENE_KEYS.dressUp);
  }

  create(): void {
    this.zones = [];
    this.items = [];
    this.beginMiniGame();

    this.drawBackground();
    this.drawHeader();
    this.drawInstructions();
    this.drawAvatar();
    this.createZones();
    this.createItems();
    this.updateCounter();
  }

  private drawBackground(): void {
    this.drawProjectionBackdrop({
      panelColor: 0xf8fafc,
      panelAlpha: 0.94,
      borderColor: 0xd8b4fe
    });
  }

  private drawHeader(): void {
    const { width, height } = this.cameras.main;
    const uiScale = this.getUiScale();
    const headerHeight = Math.max(78, Math.floor(88 * uiScale));
    const headerY = 20 + headerHeight * 0.5;
    const headerWidth = width - 64;

    this.add.rectangle(width * 0.5, headerY, headerWidth, headerHeight, 0x0f172a, 0.96).setStrokeStyle(2, 0x334155);

    this.add
      .text(width * 0.5, headerY, "Vista-se Corretamente", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(50 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    createButton(this, 108 * uiScale, headerY, "Voltar", () => {
      if (this.modalOpen) return;
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

    this.equippedText = this.add
      .text(width - 132 * uiScale, headerY, "", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(30 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);
  }

  private drawInstructions(): void {
    const { width, height } = this.cameras.main;
    const uiScale = this.getUiScale();

    this.add
      .text(width * 0.5, height * 0.15, "Arraste os EPIs corretos para vestir o personagem.", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(27 * uiScale)}px`,
        color: "#111827",
        backgroundColor: "#fef9c3",
        padding: { left: 12, right: 12, top: 4, bottom: 4 },
        fontStyle: "700"
      })
      .setOrigin(0.5);
  }

  private drawAvatar(): void {
    const { width, height } = this.cameras.main;
    const uiScale = this.getUiScale();
    const avatarHeight = Phaser.Math.Clamp(Math.min(height * 0.66, width * 0.46), 350, 520);
    const avatarX = width < 900 ? width * 0.34 : width * 0.31;
    const avatarBottomY = height * 0.84;

    this.avatarLayout = {
      x: avatarX,
      bottomY: avatarBottomY,
      height: avatarHeight,
      top: avatarBottomY - avatarHeight
    };

    this.add.ellipse(avatarX, avatarBottomY + 10 * uiScale, avatarHeight * 0.46, avatarHeight * 0.12, 0x0f172a, 0.18);

    this.add
      .image(avatarX, avatarBottomY, DRESS_UP_ASSETS.personagemBase.key)
      .setOrigin(0.5, 1)
      .setDisplaySize(avatarHeight * (191 / 359), avatarHeight)
      .setDepth(20);
  }

  private createZones(): void {
    const layout = this.avatarLayout;
    const h = layout.height;
    const definitions = [
      { id: "head", label: "Cabeca", x: layout.x, y: layout.bottomY - h * 0.83, w: h * 0.42, hh: h * 0.23 },
      { id: "eyes", label: "Olhos", x: layout.x, y: layout.bottomY - h * 0.67, w: h * 0.38, hh: h * 0.13 },
      { id: "face", label: "Rosto", x: layout.x, y: layout.bottomY - h * 0.58, w: h * 0.38, hh: h * 0.17 },
      { id: "hands", label: "Maos", x: layout.x, y: layout.bottomY - h * 0.35, w: h * 0.68, hh: h * 0.26 },
      { id: "torso", label: "Tronco", x: layout.x, y: layout.bottomY - h * 0.36, w: h * 0.48, hh: h * 0.36 },
      { id: "feet", label: "Pes", x: layout.x, y: layout.bottomY - h * 0.07, w: h * 0.52, hh: h * 0.18 }
    ];

    this.zones = definitions.map((definition) => {
      const zone = this.add
        .rectangle(definition.x, definition.y, definition.w, definition.hh, 0xffffff, 0.001)
        .setDepth(21);

      return {
        id: definition.id,
        label: definition.label,
        zone,
        occupied: false
      };
    });
  }

  private createItems(): void {
    const shuffled = Phaser.Utils.Array.Shuffle([...epiItems]);
    const { width, height } = this.cameras.main;
    const uiScale = this.getUiScale();
    const columns = width >= 980 ? 2 : 5;
    const cellW = width >= 980 ? Math.max(150, width * 0.135) : Math.max(112, width * 0.17);
    const cellH = width >= 980 ? Math.max(98, height * 0.125) : Math.max(82, height * 0.11);
    const startX = width >= 980 ? width * 0.61 : width * 0.12;
    const startY = width >= 980 ? height * 0.24 : height * 0.62;

    shuffled.forEach((itemData, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const item = this.createItemVisual(itemData, x, y, uiScale);
      const runtime: ItemRuntime = {
        data: itemData,
        container: item.container,
        image: item.image,
        home: new Phaser.Math.Vector2(x, y),
        equipped: false
      };

      this.items.push(runtime);
      this.input.setDraggable(item.container);

      item.container.on("dragstart", () => {
        if (!runtime.equipped && !this.modalOpen) {
          item.container.setDepth(80);
        }
      });

      item.container.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!runtime.equipped && !this.modalOpen) {
          item.container.setPosition(dragX, dragY);
        }
      });

      item.container.on("dragend", () => {
        if (!runtime.equipped && !this.modalOpen) {
          this.handleDrop(runtime);
        }
      });
    });
  }

  private createItemVisual(
    itemData: EpiItem,
    x: number,
    y: number,
    uiScale: number
  ): { container: Phaser.GameObjects.Container; image: Phaser.GameObjects.Image } {
    const visual = ITEM_VISUALS[itemData.id];
    const trayWidth = (visual?.trayWidth ?? 96) * uiScale;
    const image = this.add.image(0, 0, itemData.assetKey).setOrigin(0.5);
    image.setDisplaySize(trayWidth, trayWidth * (image.height / image.width));

    const hitW = Math.max(image.displayWidth + 16 * uiScale, 74 * uiScale);
    const hitH = Math.max(image.displayHeight + 16 * uiScale, 64 * uiScale);
    const container = this.add.container(x, y, [image]);
    container.setSize(hitW, hitH);
    container.setDepth(35);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, hitW, hitH),
      Phaser.Geom.Rectangle.Contains
    );
    container.input!.cursor = "grab";

    return { container, image };
  }

  private handleDrop(itemRuntime: ItemRuntime): void {
    const itemBounds = itemRuntime.container.getBounds();
    const preferredZoneId = itemRuntime.data.isCorrect ? itemRuntime.data.zone : undefined;
    const zone = this.findZoneByOverlap(itemBounds, preferredZoneId);
    if (!zone) {
      this.snapHome(itemRuntime);
      return;
    }

    if (zone.occupied) {
      this.audio.play("error");
      this.snapHome(itemRuntime);
      return;
    }

    if (!itemRuntime.data.isCorrect) {
      this.audio.play("error");
      this.snapHome(itemRuntime);
      return;
    }

    if (itemRuntime.data.zone !== zone.id) {
      this.audio.play("error");
      this.snapHome(itemRuntime);
      return;
    }

    this.equipItem(itemRuntime, zone);
  }

  private equipItem(itemRuntime: ItemRuntime, zone: ZoneRuntime): void {
    const visual = ITEM_VISUALS[itemRuntime.data.id];
    const layout = this.avatarLayout;
    const targetX = layout.x + layout.height * (visual?.offsetXFactor ?? 0);
    const targetY = layout.bottomY + layout.height * (visual?.offsetYFactor ?? 0);
    const targetWidth = visual?.equipWidth ?? layout.height * (visual?.equipWidthFactor ?? 0.4);
    const targetHeight = targetWidth * (itemRuntime.image.height / itemRuntime.image.width);

    itemRuntime.equipped = true;
    zone.occupied = true;
    itemRuntime.container.disableInteractive();
    itemRuntime.container.setVisible(false);

    const equippedImage = this.add
      .image(itemRuntime.container.x, itemRuntime.container.y, itemRuntime.data.assetKey)
      .setOrigin(0.5)
      .setDisplaySize(itemRuntime.image.displayWidth, itemRuntime.image.displayHeight)
      .setDepth(visual?.depth ?? 26);

    this.tweens.add({
      targets: equippedImage,
      x: targetX,
      y: targetY,
      displayWidth: targetWidth,
      displayHeight: targetHeight,
      duration: 220,
      ease: "Quad.Out"
    });

    this.audio.play("success");
    gameStore.addScoreForAction({
      miniGameId: "vista_se",
      actionId: `epi:${itemRuntime.data.id}`,
      points: 10
    });

    this.updateCounter();

    const totalCorrect = epiItems.filter((item) => item.isCorrect).length;
    const equippedCorrect = this.items.filter((item) => item.equipped && item.data.isCorrect).length;
    if (equippedCorrect >= totalCorrect) {
      this.audio.play("complete");
      gameStore.markMiniGameCompleted("vista_se");
      this.openModal({
        title: "Trabalhador pronto",
        message: "Todos os EPIs corretos foram equipados.",
        tone: "complete",
        confirmLabel: "Voltar",
        onConfirm: () => this.returnToMap()
      });
    }
  }

  private findZoneByOverlap(
    itemBounds: Phaser.Geom.Rectangle,
    preferredZoneId?: string
  ): ZoneRuntime | undefined {
    let bestMatch: { zone: ZoneRuntime; overlapArea: number } | undefined;
    let preferredMatch: { zone: ZoneRuntime; overlapArea: number } | undefined;
    const itemArea = itemBounds.width * itemBounds.height;

    this.zones.forEach((zone) => {
      const zoneBounds = zone.zone.getBounds();
      if (!Phaser.Geom.Intersects.RectangleToRectangle(itemBounds, zoneBounds)) {
        return;
      }

      const overlapX = Math.max(
        0,
        Math.min(itemBounds.right, zoneBounds.right) - Math.max(itemBounds.x, zoneBounds.x)
      );
      const overlapY = Math.max(
        0,
        Math.min(itemBounds.bottom, zoneBounds.bottom) - Math.max(itemBounds.y, zoneBounds.y)
      );
      const overlapArea = overlapX * overlapY;
      if (overlapArea < itemArea * 0.12) {
        return;
      }

      if (!bestMatch || overlapArea > bestMatch.overlapArea) {
        bestMatch = { zone, overlapArea };
      }

      if (preferredZoneId === zone.id && (!preferredMatch || overlapArea > preferredMatch.overlapArea)) {
        preferredMatch = { zone, overlapArea };
      }
    });

    return preferredMatch?.zone ?? bestMatch?.zone;
  }

  private snapHome(itemRuntime: ItemRuntime): void {
    this.tweens.add({
      targets: itemRuntime.container,
      x: itemRuntime.home.x,
      y: itemRuntime.home.y,
      duration: 180,
      ease: "Quad.Out",
      onComplete: () => itemRuntime.container.setDepth(35)
    });
  }

  private updateCounter(): void {
    const totalCorrect = epiItems.filter((item) => item.isCorrect).length;
    const equippedCorrect = this.items.filter((item) => item.equipped && item.data.isCorrect).length;
    this.equippedText.setText(`${equippedCorrect} / ${totalCorrect} EPIs`);
  }

  private openModal(args: {
    title: string;
    message: string;
    tone: "success" | "error" | "info" | "complete";
    confirmLabel?: string;
    onConfirm?: () => void;
  }): void {
    if (this.modalOpen) return;

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

  private getUiScale(): number {
    const { width, height } = this.cameras.main;
    return Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.68, 1.24);
  }
}
