import Phaser from "phaser";

import { createButton } from "./Button";

type ModalTone = "success" | "error" | "info" | "complete";

interface ModalOptions {
  title: string;
  message: string;
  tone?: ModalTone;
  confirmLabel?: string;
  onConfirm?: () => void;
}

const toneStyle: Record<
  ModalTone,
  { color: number; accent: number; label: string; buttonLabelColor: string }
> = {
  success: { color: 0x16a34a, accent: 0xdcfce7, label: "SUCESSO", buttonLabelColor: "#f8fafc" },
  error: { color: 0xdc2626, accent: 0xfee2e2, label: "ERRO", buttonLabelColor: "#f8fafc" },
  info: { color: 0x2563eb, accent: 0xdbeafe, label: "INFO", buttonLabelColor: "#f8fafc" },
  complete: { color: 0xea580c, accent: 0xffedd5, label: "CONCLUIDO", buttonLabelColor: "#f8fafc" }
};

export const showModal = (
  scene: Phaser.Scene,
  options: ModalOptions
): Phaser.GameObjects.Container => {
  const tone = options.tone ?? "info";
  const style = toneStyle[tone];
  const { width, height } = scene.cameras.main;
  const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.3);

  const panelWidth = Math.min(width * 0.78, 760);
  const panelHeight = Math.min(height * 0.62, 430);
  const panelX = width * 0.5;
  const panelY = height * 0.5;

  const overlay = scene.add
    .rectangle(0, 0, width, height, 0x020617, 0.72)
    .setOrigin(0)
    .setDepth(400);

  const panelShadow = scene.add
    .rectangle(panelX + 10, panelY + 12, panelWidth, panelHeight, 0x020617, 0.45)
    .setDepth(401);

  const panel = scene.add
    .rectangle(panelX, panelY, panelWidth, panelHeight, 0xf8fafc, 0.98)
    .setStrokeStyle(3, 0x111827, 1)
    .setDepth(402);

  const toneBar = scene.add
    .rectangle(panelX, panelY - panelHeight * 0.37, panelWidth - 8, 44 * uiScale, style.color, 1)
    .setDepth(403);

  const toneLabel = scene.add
    .text(toneBar.x, toneBar.y, style.label, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(22 * uiScale)}px`,
      color: "#f8fafc",
      fontStyle: "700"
    })
    .setOrigin(0.5)
    .setDepth(404);

  const badge = scene.add
    .circle(panelX, panelY - panelHeight * 0.23, 34 * uiScale, style.color, 1)
    .setDepth(404);

  const badgeHighlight = scene.add
    .circle(panelX - 10 * uiScale, panelY - panelHeight * 0.26, 8 * uiScale, 0xffffff, 0.4)
    .setDepth(405);

  const title = scene.add
    .text(panelX, panelY - panelHeight * 0.05, options.title, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(52 * uiScale)}px`,
      color: "#111827",
      fontStyle: "700",
      align: "center"
    })
    .setOrigin(0.5)
    .setDepth(404);

  const body = scene.add
    .text(panelX, panelY + panelHeight * 0.13, options.message, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(28 * uiScale)}px`,
      color: "#334155",
      align: "center",
      wordWrap: {
        width: panelWidth - 90
      }
    })
    .setOrigin(0.5)
    .setDepth(404);

  let modalContainer: Phaser.GameObjects.Container;
  let didClose = false;
  const close = (): void => {
    if (didClose) return;

    didClose = true;
    options.onConfirm?.();
    if (modalContainer.active) {
      modalContainer.destroy();
    }
  };

  const button = createButton(
    scene,
    panelX,
    panelY + panelHeight * 0.35,
    options.confirmLabel ?? "Continuar",
    close,
    {
      width: Math.floor(260 * uiScale),
      height: Math.floor(62 * uiScale),
      backgroundColor: style.color,
      hoverBackgroundColor: Phaser.Display.Color.ValueToColor(style.color).darken(12).color,
      borderColor: 0x0f172a,
      hoverBorderColor: 0x020617,
      textColor: style.buttonLabelColor,
      fontSize: `${Math.floor(28 * uiScale)}px`,
      depth: 405,
      triggerOn: "up"
    }
  ).container;

  const accentShape = scene.add
    .ellipse(panelX + panelWidth * 0.32, panelY - panelHeight * 0.23, 120 * uiScale, 90 * uiScale, style.accent, 0.65)
    .setDepth(403);

  modalContainer = scene.add.container(0, 0, [
    overlay,
    panelShadow,
    panel,
    toneBar,
    accentShape,
    toneLabel,
    badge,
    badgeHighlight,
    title,
    body,
    button
  ]);
  modalContainer.setDepth(400);
  modalContainer.setData("ui", true);

  return modalContainer;
};

