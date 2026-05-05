// Pixel cow rendered as inline SVG
// Each "pixel" is 4x4 real pixels for crisp 32x32 look at 64x64 display

export type CowFrame = 'idle1' | 'idle2' | 'walk1' | 'walk2' | 'fall' | 'react' | 'grabbed' | 'sleep' | 'eat' | 'happy';
export type FatigueLevel = 'fresh' | 'normal' | 'tired' | 'exhausted';

export function createCowSVG(frame: CowFrame, fatigue: FatigueLevel = 'normal'): string {
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  const body = '#F5E6D0';      // cream
  const dark = '#8B7355';       // brown
  const nose = '#FFB6C1';       // pink
  const eye = '#333333';        // dark
  const horn = '#DEB887';       // burlywood
  const spot = '#A0522D';       // sienna spots
  const blush = '#FF9999';      // blush pink
  const grass = '#90EE90';      // grass green
  const grassDark = '#228B22';  // dark grass
  const pillow = '#E6E6FA';     // lavender pillow
  const pillowDark = '#9370DB'; // pillow shadow

  let pixels: string[] = [];

  // Horns (always same)
  pixels.push(p(3, 0, horn));
  pixels.push(p(4, 0, horn));
  pixels.push(p(7, 0, horn));
  pixels.push(p(8, 0, horn));

  // Head outline
  for (let x = 3; x <= 8; x++) pixels.push(p(x, 1, body));
  for (let x = 2; x <= 9; x++) pixels.push(p(x, 2, body));
  for (let x = 2; x <= 9; x++) pixels.push(p(x, 3, body));
  for (let x = 2; x <= 9; x++) pixels.push(p(x, 4, body));

  // Eyes - varies by frame
  if (frame === 'sleep') {
    // Closed eyes (gentle curves)
    pixels.push(p(3, 3, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye)); pixels.push(p(8, 3, eye));
  } else if (frame === 'idle2' || frame === 'walk2') {
    // Blink frame
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye));
  } else if (frame === 'fall') {
    // Panic big eyes
    pixels.push(p(3, 2, eye)); pixels.push(p(4, 2, eye));
    pixels.push(p(3, 3, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye)); pixels.push(p(8, 2, eye));
    pixels.push(p(7, 3, eye)); pixels.push(p(8, 3, eye));
  } else if (frame === 'happy') {
    // Happy squinty eyes (^_^)
    pixels.push(p(3, 2, eye)); pixels.push(p(5, 2, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye)); pixels.push(p(9, 2, eye)); pixels.push(p(8, 3, eye));
  } else if (frame === 'grabbed') {
    // Surprised O_O eyes
    for (let dx = 0; dx <= 2; dx++) for (let dy = 0; dy <= 2; dy++) {
      if (!(dx === 1 && dy === 1)) pixels.push(p(3+dx, 2+dy, eye));
    }
    for (let dx = 0; dx <= 2; dx++) for (let dy = 0; dy <= 2; dy++) {
      if (!(dx === 1 && dy === 1)) pixels.push(p(7+dx, 2+dy, eye));
    }
  } else if (frame === 'react') {
    // Happy squinty for react too
    pixels.push(p(3, 2, eye)); pixels.push(p(5, 2, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye)); pixels.push(p(9, 2, eye)); pixels.push(p(8, 3, eye));
  } else {
    // Normal open eyes
    pixels.push(p(3, 3, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye)); pixels.push(p(8, 3, eye));
  }

  // Nose
  pixels.push(p(4, 4, nose)); pixels.push(p(5, 4, nose));
  pixels.push(p(6, 4, nose)); pixels.push(p(7, 4, nose));

  // Mouth - varies by frame
  if (frame === 'react' || frame === 'happy') {
    // Big smile
    pixels.push(p(4, 5, nose)); pixels.push(p(5, 5, nose));
    pixels.push(p(6, 5, nose)); pixels.push(p(7, 5, nose));
  } else if (frame === 'eat') {
    // Chomping mouth (open wide)
    pixels.push(p(4, 5, dark)); pixels.push(p(7, 5, dark));
    pixels.push(p(5, 5, nose)); pixels.push(p(6, 5, nose));
    pixels.push(p(5, 6, dark)); pixels.push(p(6, 6, dark));
  } else if (frame === 'grabbed') {
    // Wavy worried mouth
    pixels.push(p(4, 5, dark)); pixels.push(p(6, 5, dark));
    pixels.push(p(5, 6, dark)); pixels.push(p(7, 5, dark));
  } else if (frame === 'sleep') {
    // Tiny peaceful mouth
    pixels.push(p(5, 5, dark)); pixels.push(p(6, 5, dark));
  }

  // Blush cheeks for react/happy (摸头效果)
  if (frame === 'react' || frame === 'happy') {
    pixels.push(p(2, 4, blush)); pixels.push(p(2, 5, blush));
    pixels.push(p(9, 4, blush)); pixels.push(p(9, 5, blush));
  }

  // Ears
  pixels.push(p(1, 2, body)); pixels.push(p(10, 2, body));

  // Body
  for (let x = 3; x <= 8; x++) for (let y = 5; y <= 9; y++) pixels.push(p(x, y, body));
  for (let y = 5; y <= 9; y++) { pixels.push(p(2, y, body)); pixels.push(p(9, y, body)); }

  // Spots on body
  pixels.push(p(4, 6, spot)); pixels.push(p(5, 6, spot));
  pixels.push(p(7, 8, spot)); pixels.push(p(8, 8, spot));

  // Udder
  pixels.push(p(5, 10, nose)); pixels.push(p(6, 10, nose));

  // Legs - varies by frame
  if (frame === 'walk1') {
    pixels.push(p(3, 10, body)); pixels.push(p(3, 11, body)); pixels.push(p(3, 12, dark));
    pixels.push(p(4, 10, body)); pixels.push(p(4, 11, body)); pixels.push(p(4, 12, dark));
    pixels.push(p(7, 10, body)); pixels.push(p(7, 11, body)); pixels.push(p(7, 12, dark));
    pixels.push(p(8, 10, body)); pixels.push(p(8, 11, body)); pixels.push(p(8, 12, dark));
  } else if (frame === 'walk2') {
    pixels.push(p(4, 10, body)); pixels.push(p(4, 11, body)); pixels.push(p(4, 12, dark));
    pixels.push(p(5, 10, body)); pixels.push(p(5, 11, body)); pixels.push(p(5, 12, dark));
    pixels.push(p(6, 10, body)); pixels.push(p(6, 11, body)); pixels.push(p(6, 12, dark));
    pixels.push(p(7, 10, body)); pixels.push(p(7, 11, body)); pixels.push(p(7, 12, dark));
  } else if (frame === 'sleep') {
    // Legs tucked (sitting)
    pixels.push(p(3, 10, body)); pixels.push(p(3, 11, body));
    pixels.push(p(4, 10, body)); pixels.push(p(4, 11, body));
    pixels.push(p(7, 10, body)); pixels.push(p(7, 11, body));
    pixels.push(p(8, 10, body)); pixels.push(p(8, 11, body));
  } else {
    pixels.push(p(3, 10, body)); pixels.push(p(3, 11, body)); pixels.push(p(3, 12, dark));
    pixels.push(p(4, 10, body)); pixels.push(p(4, 11, body)); pixels.push(p(4, 12, dark));
    pixels.push(p(7, 10, body)); pixels.push(p(7, 11, body)); pixels.push(p(7, 12, dark));
    pixels.push(p(8, 10, body)); pixels.push(p(8, 11, body)); pixels.push(p(8, 12, dark));
  }

  // Tail - varies by frame
  if (frame === 'idle1' || frame === 'walk1' || frame === 'eat') {
    pixels.push(p(10, 6, dark)); pixels.push(p(11, 5, dark));
    pixels.push(p(12, 5, dark)); pixels.push(p(12, 4, dark));
  } else if (frame === 'happy') {
    pixels.push(p(10, 5, dark)); pixels.push(p(11, 4, dark));
    pixels.push(p(12, 3, dark)); pixels.push(p(13, 3, dark));
  } else if (frame === 'sleep') {
    pixels.push(p(10, 8, dark)); pixels.push(p(11, 9, dark)); pixels.push(p(11, 10, dark));
  } else {
    pixels.push(p(10, 6, dark)); pixels.push(p(11, 7, dark));
    pixels.push(p(12, 7, dark)); pixels.push(p(12, 8, dark));
  }

  // ── 特效 ──

  // 吃东西：草 + 食物碎屑
  if (frame === 'eat') {
    // 嘴前的草
    pixels.push(p(0, 3, grassDark)); pixels.push(p(1, 3, grass));
    pixels.push(p(1, 2, grass)); pixels.push(p(1, 1, grass));
    // 食物碎屑飞溅
    pixels.push(p(0, 5, grass)); pixels.push(p(11, 5, grass));
    pixels.push(p(1, 6, grassDark)); pixels.push(p(10, 6, grassDark));
    // 满意的小汗滴
    pixels.push(p(10, 1, '#87CEEB'));
  }

  // 睡觉：枕头 + Zzz + 梦泡
  if (frame === 'sleep') {
    // 枕头（左下方）
    pixels.push(p(0, 9, pillow)); pixels.push(p(1, 9, pillow));
    pixels.push(p(2, 9, pillow)); pixels.push(p(0, 10, pillow));
    pixels.push(p(1, 10, pillow)); pixels.push(p(2, 10, pillow));
    pixels.push(p(0, 11, pillowDark)); pixels.push(p(1, 11, pillowDark));
    pixels.push(p(2, 11, pillowDark));
    // Zzz 气泡（右上方，从小到大）
    pixels.push(p(10, 0, '#87CEEB')); pixels.push(p(11, 0, '#87CEEB'));
    pixels.push(p(12, 1, '#5DADE2')); pixels.push(p(13, 1, '#5DADE2'));
    pixels.push(p(14, 1, '#5DADE2'));
    pixels.push(p(13, 2, '#3498DB')); pixels.push(p(14, 2, '#3498DB'));
    pixels.push(p(14, 3, '#3498DB'));
    // 梦泡（小星星）
    pixels.push(p(0, 0, '#FFD700')); pixels.push(p(1, 1, '#FFD700'));
  }

  // 摸头反应：爱心 + 腮红 + 小星星
  if (frame === 'react') {
    // 爱心（右上）
    pixels.push(p(11, 0, '#FF69B4')); pixels.push(p(12, 0, '#FF69B4'));
    pixels.push(p(10, 1, '#FF69B4')); pixels.push(p(11, 1, '#FF69B4'));
    pixels.push(p(12, 1, '#FF69B4')); pixels.push(p(13, 1, '#FF69B4'));
    pixels.push(p(11, 2, '#FF69B4')); pixels.push(p(12, 2, '#FF69B4'));
    pixels.push(p(11, 3, '#FF69B4'));
    // 小星星
    pixels.push(p(0, 0, '#FFD700')); pixels.push(p(1, 1, '#FFD700'));
  }

  // 开心：闪光 + 摇尾巴特效
  if (frame === 'happy') {
    // 多个闪光
    pixels.push(p(0, 0, '#FFD700')); pixels.push(p(1, 1, '#FFD700'));
    pixels.push(p(11, 0, '#FFD700')); pixels.push(p(10, 1, '#FFD700'));
    pixels.push(p(13, 4, '#FFD700'));
    // 小爱心
    pixels.push(p(0, 3, '#FF69B4')); pixels.push(p(1, 3, '#FF69B4'));
    pixels.push(p(0, 4, '#FF69B4')); pixels.push(p(1, 4, '#FF69B4'));
  }

  // 被抓：汗滴
  if (frame === 'grabbed') {
    pixels.push(p(1, 0, '#87CEEB')); pixels.push(p(0, 1, '#87CEEB'));
    pixels.push(p(10, 0, '#87CEEB')); pixels.push(p(11, 1, '#87CEEB'));
  }

  // 疲劳效果（idle 状态下根据屏幕时间显示）
  if ((frame === 'idle1' || frame === 'idle2') && fatigue === 'tired') {
    // 轻微黑眼圈
    pixels.push(p(3, 4, '#C0A0A0')); pixels.push(p(8, 4, '#C0A0A0'));
  }
  if ((frame === 'idle1' || frame === 'idle2') && fatigue === 'exhausted') {
    // 明显黑眼圈 + 下垂眼
    pixels.push(p(3, 4, '#A08080')); pixels.push(p(4, 4, '#A08080'));
    pixels.push(p(7, 4, '#A08080')); pixels.push(p(8, 4, '#A08080'));
    // 下垂眼皮
    pixels.push(p(3, 2, '#C0A0A0')); pixels.push(p(4, 2, '#C0A0A0'));
    pixels.push(p(7, 2, '#C0A0A0')); pixels.push(p(8, 2, '#C0A0A0'));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}
