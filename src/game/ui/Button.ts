import Phaser from "phaser";

interface ButtonOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  hoverBackgroundColor?: number;
  borderColor?: number;
  hoverBorderColor?: number;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  depth?: number;
}

export interface GameButton {
  container: Phaser.GameObjects.Container;
  setFocused: (focused: boolean) => void;
  trigger: () => void;
}

export const createButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: ButtonOptions = {}
): GameButton => {
  const width = options.width ?? 280;
  const height = options.height ?? 58;
  const backgroundColor = options.backgroundColor ?? 0xffffff;
  const hoverBackgroundColor = options.hoverBackgroundColor ?? 0xf8fafc;
  const borderColor = options.borderColor ?? 0x1f2937;
  const hoverBorderColor = options.hoverBorderColor ?? 0x0f172a;
  const textColor = options.textColor ?? "#111827";
  const fontSize = options.fontSize ?? "26px";
  const fontFamily = options.fontFamily ?? "'Segoe UI', 'Trebuchet MS', sans-serif";
  const depth = options.depth ?? 10;

  // Extra padding on the hit area so the mouse doesn't "miss" the button edges
  const hitPad = 6;
  const hitWidth = width + hitPad * 2;
  const hitHeight = height + hitPad * 2;

  const shadow = scene.add
    .rectangle(0, 5, width, height, 0x020617, 0.28)
    .setOrigin(0.5);

  const background = scene.add
    .rectangle(0, 0, width, height, backgroundColor, 0.98)
    .setOrigin(0.5)
    .setStrokeStyle(2, borderColor, 1);

  const topGlow = scene.add
    .rectangle(0, -height * 0.24, width - 10, Math.max(10, Math.floor(height * 0.3)), 0xffffff, 0.18)
    .setOrigin(0.5);

  // Focus indicator ring (hidden by default)
  const focusRing = scene.add
    .rectangle(0, 0, width + 8, height + 8)
    .setOrigin(0.5)
    .setStrokeStyle(3, 0xfacc15, 1)
    .setFillStyle(0xfacc15, 0.08)
    .setVisible(false);

  const text = scene.add
    .text(0, 0, label, {
      fontFamily,
      fontSize,
      color: textColor,
      fontStyle: "700",
      align: "center"
    })
    .setOrigin(0.5);

  const button = scene.add.container(x, y, [focusRing, shadow, background, topGlow, text]);
  button.setSize(hitWidth, hitHeight);
  button.setDepth(depth);

  // Use a hit area that is slightly larger than the visual button so hovering
  // at the edges still registers. Container input is normalized by displayOrigin,
  // so the rectangle starts at 0,0 to stay centered on the visual button.
  button.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, hitWidth, hitHeight),
    Phaser.Geom.Rectangle.Contains
  );
  button.input!.cursor = "pointer";

  let isFocused = false;

  const resetVisual = (): void => {
    background.setFillStyle(backgroundColor, 0.98);
    background.setStrokeStyle(2, borderColor, 1);
    text.setY(0);
    shadow.setY(5);
  };

  const setHoverVisual = (): void => {
    background.setFillStyle(hoverBackgroundColor, 1);
    background.setStrokeStyle(2, hoverBorderColor, 1);
    shadow.setAlpha(0.34);
  };

  button.on("pointerover", () => {
    setHoverVisual();
  });

  button.on("pointerout", () => {
    shadow.setAlpha(0.28);
    if (!isFocused) {
      resetVisual();
    }
  });

  button.on("pointerdown", () => {
    text.setY(1.5);
    shadow.setY(6.5);
    onClick();
  });

  button.on("pointerup", resetVisual);

  // --- Keyboard focus API ---
  const setFocused = (focused: boolean): void => {
    isFocused = focused;
    focusRing.setVisible(focused);
    if (focused) {
      setHoverVisual();
    } else {
      shadow.setAlpha(0.28);
      resetVisual();
    }
  };

  const trigger = (): void => {
    // Briefly show pressed state then fire
    text.setY(1.5);
    shadow.setY(6.5);
    onClick();
    scene.time.delayedCall(120, resetVisual);
  };

  return { container: button, setFocused, trigger };
};
