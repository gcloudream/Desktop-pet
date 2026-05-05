// Weather accessories — pixel art SVG overlays

export function createUmbrellaSVG(): string {
  // 像素雨伞 — 32x16 区域，4x4 像素块
  // 显示在小牛头顶偏上
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  const umbrella = '#FF4444';   // 红色伞面
  const umbrellaDark = '#CC0000';
  const handle = '#8B4513';     // 棕色伞柄
  const handleDark = '#654321';

  let pixels: string[] = [];

  // 伞面（弧形顶部）
  pixels.push(p(4, 0, umbrella));
  pixels.push(p(5, 0, umbrella));
  pixels.push(p(6, 0, umbrella));
  pixels.push(p(7, 0, umbrella));
  pixels.push(p(3, 1, umbrella)); pixels.push(p(4, 1, umbrella));
  pixels.push(p(5, 1, umbrellaDark)); pixels.push(p(6, 1, umbrellaDark));
  pixels.push(p(7, 1, umbrella)); pixels.push(p(8, 1, umbrella));
  pixels.push(p(2, 2, umbrella)); pixels.push(p(3, 2, umbrella));
  pixels.push(p(4, 2, umbrellaDark)); pixels.push(p(5, 2, umbrella));
  pixels.push(p(6, 2, umbrella)); pixels.push(p(7, 2, umbrellaDark));
  pixels.push(p(8, 2, umbrella)); pixels.push(p(9, 2, umbrella));
  pixels.push(p(1, 3, umbrella)); pixels.push(p(2, 3, umbrellaDark));
  pixels.push(p(3, 3, umbrella)); pixels.push(p(4, 3, umbrella));
  pixels.push(p(5, 3, umbrellaDark)); pixels.push(p(6, 3, umbrella));
  pixels.push(p(7, 3, umbrella)); pixels.push(p(8, 3, umbrellaDark));
  pixels.push(p(9, 3, umbrella)); pixels.push(p(10, 3, umbrella));

  // 伞柄
  pixels.push(p(5, 4, handle)); pixels.push(p(6, 4, handle));
  pixels.push(p(5, 5, handle)); pixels.push(p(6, 5, handle));
  pixels.push(p(5, 6, handle)); pixels.push(p(6, 6, handle));
  pixels.push(p(5, 7, handle)); pixels.push(p(6, 7, handle));
  pixels.push(p(5, 8, handle)); pixels.push(p(6, 8, handle));

  // 伞柄弯钩
  pixels.push(p(6, 9, handleDark));
  pixels.push(p(7, 9, handleDark));
  pixels.push(p(7, 8, handleDark));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}

export function createSnowflakeSVG(): string {
  // 单个雪花 — 4x4 像素
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  let pixels: string[] = [];
  const snow = '#FFFFFF';
  const snowLight = '#E8E8FF';

  pixels.push(p(1, 0, snowLight));
  pixels.push(p(0, 1, snowLight)); pixels.push(p(2, 1, snow));
  pixels.push(p(1, 2, snow));
  pixels.push(p(0, 3, snow)); pixels.push(p(2, 3, snowLight));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}

export function createSunSVG(): string {
  // 太阳 — 8x8 像素
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  let pixels: string[] = [];
  const sun = '#FFD700';
  const ray = '#FFF8DC';

  // 太阳核心
  pixels.push(p(3, 2, sun)); pixels.push(p(4, 2, sun));
  pixels.push(p(2, 3, sun)); pixels.push(p(3, 3, sun));
  pixels.push(p(4, 3, sun)); pixels.push(p(5, 3, sun));
  pixels.push(p(2, 4, sun)); pixels.push(p(3, 4, sun));
  pixels.push(p(4, 4, sun)); pixels.push(p(5, 4, sun));
  pixels.push(p(3, 5, sun)); pixels.push(p(4, 5, sun));

  // 光线
  pixels.push(p(3, 0, ray)); pixels.push(p(4, 0, ray));
  pixels.push(p(0, 3, ray)); pixels.push(p(7, 3, ray));
  pixels.push(p(0, 4, ray)); pixels.push(p(7, 4, ray));
  pixels.push(p(3, 7, ray)); pixels.push(p(4, 7, ray));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}
