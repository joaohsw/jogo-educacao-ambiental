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

export const createButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: ButtonOptions = {}
): Phaser.GameObjects.Container => {
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

  const text = scene.add
    .text(0, 0, label, {
      fontFamily,
      fontSize,
      color: textColor,
      fontStyle: "700",
      align: "center"
    })
    .setOrigin(0.5);

  const button = scene.add.container(x, y, [shadow, background, topGlow, text]);
  button.setSize(width, height);
  button.setDepth(depth);
  button.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
    Phaser.Geom.Rectangle.Contains
  );
  button.input!.cursor = "pointer";

  const resetVisual = (): void => {
    background.setFillStyle(backgroundColor, 0.98);
    background.setStrokeStyle(2, borderColor, 1);
    text.setY(0);
    shadow.setY(5);
  };

  button.on("pointerover", () => {
    background.setFillStyle(hoverBackgroundColor, 1);
    background.setStrokeStyle(2, hoverBorderColor, 1);
    shadow.setAlpha(0.34);
  });

  button.on("pointerout", () => {
    shadow.setAlpha(0.28);
    resetVisual();
  });

  button.on("pointerdown", () => {
    text.setY(1.5);
    shadow.setY(6.5);
    onClick();
  });

  button.on("pointerup", resetVisual);

  return button;
};

