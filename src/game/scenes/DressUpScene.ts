import Phaser from "phaser";

import { epiItems, type EpiItem } from "../data/epiItems";
import { SCENE_KEYS } from "../constants";
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
  home: Phaser.Math.Vector2;
  equipped: boolean;
}

export class DressUpScene extends MiniGameScene {
  private zones: ZoneRuntime[] = [];
  private items: ItemRuntime[] = [];
  private equippedText!: Phaser.GameObjects.Text;
  private trayBounds = new Phaser.Geom.Rectangle(70, 560, 1140, 140);

  constructor() {
    super(SCENE_KEYS.dressUp);
  }

  create(): void {
    this.zones = [];
    this.items = [];
    this.trayBounds = new Phaser.Geom.Rectangle(70, 560, 1140, 140);
    this.beginMiniGame();

    this.drawBackground();
    this.drawHeader();
    this.drawInstructions();
    this.drawAvatarSilhouette();
    this.buildZonesFromMap();
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
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);
    const headerHeight = Math.max(82, Math.floor(90 * uiScale));
    const headerY = 22 + headerHeight * 0.5;
    const headerWidth = width - 64;

    this.add.rectangle(width * 0.5, headerY, headerWidth, headerHeight, 0x0f172a, 0.96).setStrokeStyle(2, 0x334155);

    this.add
      .text(width * 0.5, headerY, "Vista-se Corretamente", {
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
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    this.add
      .text(width * 0.5, height * 0.15, "Arraste os EPIs corretos para cada area do corpo.", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        color: "#111827",
        backgroundColor: "#fef9c3",
        padding: { left: 12, right: 12, top: 4, bottom: 4 },
        fontStyle: "700"
      })
      .setOrigin(0.5);
  }

  private drawAvatarSilhouette(): void {
    const map = this.make.tilemap({ key: "map-dressup" });
    const { width, height } = this.cameras.main;
    const sx = width / map.width;
    const sy = height / map.height;

    const g = this.add.graphics();
    g.fillStyle(0xdbeafe, 0.95);
    g.lineStyle(2, 0x1f2937, 1);
    g.fillCircle(640 * sx, 214 * sy, 56 * Math.min(sx, sy));
    g.strokeCircle(640 * sx, 214 * sy, 56 * Math.min(sx, sy));

    g.fillRoundedRect(560 * sx, 272 * sy, 160 * sx, 210 * sy, 20 * Math.min(sx, sy));
    g.strokeRoundedRect(560 * sx, 272 * sy, 160 * sx, 210 * sy, 20 * Math.min(sx, sy));
    g.fillRoundedRect(472 * sx, 300 * sy, 70 * sx, 150 * sy, 16 * Math.min(sx, sy));
    g.strokeRoundedRect(472 * sx, 300 * sy, 70 * sx, 150 * sy, 16 * Math.min(sx, sy));
    g.fillRoundedRect(738 * sx, 300 * sy, 70 * sx, 150 * sy, 16 * Math.min(sx, sy));
    g.strokeRoundedRect(738 * sx, 300 * sy, 70 * sx, 150 * sy, 16 * Math.min(sx, sy));
    g.fillRoundedRect(572 * sx, 490 * sy, 60 * sx, 70 * sy, 14 * Math.min(sx, sy));
    g.strokeRoundedRect(572 * sx, 490 * sy, 60 * sx, 70 * sy, 14 * Math.min(sx, sy));
    g.fillRoundedRect(648 * sx, 490 * sy, 60 * sx, 70 * sy, 14 * Math.min(sx, sy));
    g.strokeRoundedRect(648 * sx, 490 * sy, 60 * sx, 70 * sy, 14 * Math.min(sx, sy));
  }

  private buildZonesFromMap(): void {
    const map = this.make.tilemap({ key: "map-dressup" });
    const zoneLayer = map.getObjectLayer("zones");
    const trayLayer = map.getObjectLayer("tray");
    if (!zoneLayer) {
      throw new Error("Camada zones nao encontrada em map-dressup");
    }

    const { width, height } = this.cameras.main;
    const sx = width / map.width;
    const sy = height / map.height;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const tray = trayLayer?.objects[0];
    if (tray) {
      this.trayBounds = new Phaser.Geom.Rectangle(
        (tray.x ?? 0) * sx,
        (tray.y ?? 0) * sy,
        (tray.width ?? 1140) * sx,
        (tray.height ?? 140) * sy
      );
    }

    this.zones = zoneLayer.objects.map((zoneObject) => {
      const id = this.getStringProperty(zoneObject, "zoneId", zoneObject.name ?? "zone");
      const label = this.getStringProperty(zoneObject, "label", id);
      const zone = this.add
        .rectangle(
          ((zoneObject.x ?? 0) + (zoneObject.width ?? 90) * 0.5) * sx,
          ((zoneObject.y ?? 0) + (zoneObject.height ?? 70) * 0.5) * sy,
          (zoneObject.width ?? 90) * sx,
          (zoneObject.height ?? 70) * sy,
          0xffffff,
          0.66
        )
        .setStrokeStyle(2, 0x7e22ce)
        .setDepth(10);

      this.add
        .text(zone.x, zone.y, label, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${Math.floor(24 * uiScale)}px`,
          color: "#6b21a8",
          fontStyle: "700"
        })
        .setOrigin(0.5)
        .setDepth(11);

      return { id, label, zone, occupied: false };
    });
  }

  private createItems(): void {
    const shuffled = Phaser.Utils.Array.Shuffle([...epiItems]);
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const columns = width >= 1024 ? 5 : 4;
    const cardWidth = Math.max(170, Math.floor(212 * uiScale));
    const cardHeight = Math.max(58, Math.floor(66 * uiScale));
    const spacingX = cardWidth + Math.max(8, Math.floor(10 * uiScale));
    const spacingY = cardHeight + Math.max(8, Math.floor(10 * uiScale));
    const startX = this.trayBounds.x + cardWidth * 0.5 + 12 * uiScale;
    const startY = this.trayBounds.y + cardHeight * 0.5 + 8 * uiScale;

    shuffled.forEach((itemData, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const card = this.createItemCard(itemData, x, y, cardWidth, cardHeight, uiScale);
      const runtime: ItemRuntime = {
        data: itemData,
        container: card,
        home: new Phaser.Math.Vector2(x, y),
        equipped: false
      };

      this.items.push(runtime);
      this.input.setDraggable(card);

      card.on("dragstart", () => {
        if (!runtime.equipped && !this.modalOpen) {
          card.setDepth(30);
        }
      });

      card.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!runtime.equipped && !this.modalOpen) {
          card.setPosition(dragX, dragY);
        }
      });

      card.on("dragend", () => {
        if (!runtime.equipped && !this.modalOpen) {
          this.handleDrop(runtime);
        }
      });
    });
  }

  private createItemCard(
    itemData: EpiItem,
    x: number,
    y: number,
    width: number,
    height: number,
    uiScale: number
  ): Phaser.GameObjects.Container {
    const bgColor = itemData.isCorrect ? 0xffffff : 0xfff7ed;
    const borderColor = itemData.isCorrect ? 0x7e22ce : 0xea580c;
    const textColor = itemData.isCorrect ? "#581c87" : "#9a3412";

    const shadow = this.add.rectangle(0, 4, width, height, 0x020617, 0.22).setOrigin(0.5);
    const bg = this.add
      .rectangle(0, 0, width, height, bgColor, 0.98)
      .setOrigin(0.5)
      .setStrokeStyle(2, borderColor);
    const label = this.add
      .text(0, 0, itemData.label, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(22 * uiScale)}px`,
        color: textColor,
        fontStyle: "700",
        align: "center",
        wordWrap: {
          width: width * 0.86
        }
      })
      .setOrigin(0.5);

    const card = this.add.container(x, y, [shadow, bg, label]);
    card.setSize(width, height);
    card.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    card.input!.cursor = "grab";
    return card;
  }

  private handleDrop(itemRuntime: ItemRuntime): void {
    const zone = this.findZoneByOverlap(itemRuntime.container.getBounds());
    if (!zone) {
      this.snapHome(itemRuntime);
      return;
    }

    if (zone.occupied) {
      this.audio.play("error");
      this.openModal({
        title: "Zona ocupada",
        message: `A zona "${zone.label}" ja recebeu um item.`,
        tone: "error"
      });
      this.snapHome(itemRuntime);
      return;
    }

    if (!itemRuntime.data.isCorrect) {
      this.audio.play("error");
      this.openModal({
        title: "Item incorreto",
        message: `"${itemRuntime.data.label}" nao e um EPI adequado.`,
        tone: "error"
      });
      this.snapHome(itemRuntime);
      return;
    }

    if (itemRuntime.data.zone !== zone.id) {
      this.audio.play("error");
      this.openModal({
        title: "Zona errada",
        message: `"${itemRuntime.data.label}" nao pertence a zona ${zone.label}.`,
        tone: "error"
      });
      this.snapHome(itemRuntime);
      return;
    }

    this.equipItem(itemRuntime, zone);
  }

  private equipItem(itemRuntime: ItemRuntime, zone: ZoneRuntime): void {
    itemRuntime.equipped = true;
    zone.occupied = true;
    zone.zone.setFillStyle(0xdcfce7, 0.95);
    zone.zone.setStrokeStyle(2, 0x16a34a, 1);
    itemRuntime.container.disableInteractive();

    this.tweens.add({
      targets: itemRuntime.container,
      x: zone.zone.x,
      y: zone.zone.y,
      duration: 180,
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
      this.openModal({
        title: "Trabalhador pronto",
        message: "Todos os EPIs corretos foram equipados.",
        tone: "complete",
        confirmLabel: "Voltar",
        onConfirm: () => this.returnToMap()
      });
    }
  }

  private findZoneByOverlap(itemBounds: Phaser.Geom.Rectangle): ZoneRuntime | undefined {
    return this.zones.find((zone) => {
      const zoneBounds = zone.zone.getBounds();
      if (!Phaser.Geom.Intersects.RectangleToRectangle(itemBounds, zoneBounds)) {
        return false;
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
      const itemArea = itemBounds.width * itemBounds.height;
      return overlapArea >= itemArea * 0.3;
    });
  }

  private snapHome(itemRuntime: ItemRuntime): void {
    this.tweens.add({
      targets: itemRuntime.container,
      x: itemRuntime.home.x,
      y: itemRuntime.home.y,
      duration: 180,
      ease: "Quad.Out"
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

