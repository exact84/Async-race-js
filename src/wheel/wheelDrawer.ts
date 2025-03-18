export interface WheelOption {
  id: number;
  text: string;
  weight: number;
  color: string;
}

export function drawWheel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WheelOption[],
  rotationAngle: number,
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) * 0.9;
  const innerRadius = radius * 0.16;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((rotationAngle * Math.PI) / 180);

  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let startAngle = -Math.PI / 2;

  for (const option of options) {
    const angle = (option.weight / totalWeight) * (2 * Math.PI);
    const endAngle = startAngle + angle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.lineTo(0, 0);
    ctx.fillStyle = option.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (angle > 0.1) {
      const textAngle = startAngle + angle / 2;
      ctx.save();
      ctx.rotate(textAngle);
      ctx.translate(radius / 1.8, 0);

      const text = option.text;
      const maxTextLength = radius * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textWidth = ctx.measureText(text).width;
      const displayText =
        textWidth > maxTextLength
          ? text.slice(
              0,
              Math.floor(text.length * (maxTextLength / textWidth) - 3),
            ) + '...'
          : text;

      ctx.fillText(displayText, 0, 0);
      ctx.restore();
    }
    startAngle = endAngle;
  }

  ctx.beginPath();
  ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawStar(ctx, 0, 0, 5, innerRadius * 0.5, innerRadius * 0.7);
  ctx.restore();
  drawPointer(ctx, centerX, centerY - radius, radius);
}

export function drawPointer(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  const pointerSize = radius * 0.1;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.beginPath();
  ctx.moveTo(-pointerSize, 0);
  ctx.lineTo(pointerSize, 0);
  ctx.lineTo(0, pointerSize * 2);
  ctx.closePath();
  ctx.fillStyle = '#ff0000';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  innerRadius: number,
  outerRadius: number,
): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius,
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius,
    );
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  ctx.fillStyle = '#ffcc00';
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function getSectorIndexFromAngle(
  angle: number,
  options: WheelOption[],
  totalWeight: number,
): number {
  const adjustedAngle = (360 - (angle % 360) + 360) % 360;
  let currentAngle = 0;

  for (const [i, option] of options.entries()) {
    const sectorAngle = (option.weight / totalWeight) * 360;
    if (
      adjustedAngle >= currentAngle &&
      adjustedAngle < currentAngle + sectorAngle
    ) {
      return i;
    }
    currentAngle += sectorAngle;
  }
  return 0;
}

export function getRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 40) + 60;
  const lightness = Math.floor(Math.random() * 30) + 40;
  return `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}

export function shuffleArray(array: unknown[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
