// Pixel dog rendered as inline SVG — 32x32 grid, 4x4 real pixels
import { CowFrame } from './CowSprite';

export function createDogSVG(frame: CowFrame): string {
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  const fur = '#C4A882';
  const dark = '#8B6914';
  const belly = '#F5DEB3';
  const eye = '#333333';
  const nose = '#222222';

  let pixels: string[] = [];

  // Ears (floppy)
  pixels.push(p(1, 2, dark)); pixels.push(p(1, 3, dark)); pixels.push(p(1, 4, dark));
  pixels.push(p(10, 2, dark)); pixels.push(p(10, 3, dark)); pixels.push(p(10, 4, dark));

  // Head
  for (let x = 3; x <= 8; x++) pixels.push(p(x, 1, fur));
  for (let x = 2; x <= 9; x++) pixels.push(p(x, 2, fur));
  for (let x = 2; x <= 9; x++) pixels.push(p(x, 3, fur));
  for (let x = 2; x <= 9; x++) pixels.push(p(x, 4, fur));
  for (let x = 3; x <= 8; x++) pixels.push(p(x, 5, fur));

  // Eyes
  if (frame === 'sleep') {
    pixels.push(p(3, 3, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye)); pixels.push(p(8, 3, eye));
  } else if (frame === 'happy' || frame === 'react') {
    pixels.push(p(3, 2, eye)); pixels.push(p(5, 2, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye)); pixels.push(p(9, 2, eye)); pixels.push(p(8, 3, eye));
  } else if (frame === 'grabbed') {
    for (let dx = 0; dx <= 2; dx++) for (let dy = 0; dy <= 2; dy++) {
      if (!(dx === 1 && dy === 1)) pixels.push(p(3+dx, 2+dy, eye));
    }
    for (let dx = 0; dx <= 2; dx++) for (let dy = 0; dy <= 2; dy++) {
      if (!(dx === 1 && dy === 1)) pixels.push(p(7+dx, 2+dy, eye));
    }
  } else if (frame === 'idle2' || frame === 'walk2') {
    pixels.push(p(4, 3, eye)); pixels.push(p(7, 3, eye));
  } else {
    pixels.push(p(3, 3, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye)); pixels.push(p(8, 3, eye));
  }

  // Nose
  pixels.push(p(5, 4, nose)); pixels.push(p(6, 4, nose));
  pixels.push(p(5, 5, nose)); pixels.push(p(6, 5, nose));

  // Blush for react/happy
  if (frame === 'react' || frame === 'happy') {
    pixels.push(p(2, 4, '#FF9999')); pixels.push(p(9, 4, '#FF9999'));
  }

  // Tongue for happy/eat
  if (frame === 'happy' || frame === 'eat') {
    pixels.push(p(5, 6, '#FF6B6B')); pixels.push(p(6, 6, '#FF6B6B'));
    pixels.push(p(5, 7, '#FF6B6B'));
  }

  // Body
  for (let x = 3; x <= 8; x++) for (let y = 6; y <= 10; y++) pixels.push(p(x, y, fur));
  for (let y = 6; y <= 10; y++) { pixels.push(p(2, y, fur)); pixels.push(p(9, y, fur)); }
  pixels.push(p(5, 8, belly)); pixels.push(p(6, 8, belly));
  pixels.push(p(5, 9, belly)); pixels.push(p(6, 9, belly));

  // Legs
  if (frame === 'walk1') {
    pixels.push(p(3, 11, fur)); pixels.push(p(3, 12, dark));
    pixels.push(p(4, 11, fur)); pixels.push(p(4, 12, dark));
    pixels.push(p(7, 11, fur)); pixels.push(p(7, 12, dark));
    pixels.push(p(8, 11, fur)); pixels.push(p(8, 12, dark));
  } else if (frame === 'walk2') {
    pixels.push(p(4, 11, fur)); pixels.push(p(4, 12, dark));
    pixels.push(p(5, 11, fur)); pixels.push(p(5, 12, dark));
    pixels.push(p(6, 11, fur)); pixels.push(p(6, 12, dark));
    pixels.push(p(7, 11, fur)); pixels.push(p(7, 12, dark));
  } else if (frame === 'sleep') {
    pixels.push(p(3, 11, fur)); pixels.push(p(4, 11, fur));
    pixels.push(p(7, 11, fur)); pixels.push(p(8, 11, fur));
  } else {
    pixels.push(p(3, 11, fur)); pixels.push(p(3, 12, dark));
    pixels.push(p(4, 11, fur)); pixels.push(p(4, 12, dark));
    pixels.push(p(7, 11, fur)); pixels.push(p(7, 12, dark));
    pixels.push(p(8, 11, fur)); pixels.push(p(8, 12, dark));
  }

  // Tail
  if (frame === 'happy') {
    pixels.push(p(10, 6, fur)); pixels.push(p(11, 5, fur));
    pixels.push(p(12, 4, fur)); pixels.push(p(12, 3, fur));
  } else if (frame === 'sleep') {
    pixels.push(p(10, 9, fur)); pixels.push(p(11, 10, fur));
  } else {
    pixels.push(p(10, 6, fur)); pixels.push(p(11, 7, fur));
    pixels.push(p(12, 7, fur));
  }

  // 吃东西：草 + 碎屑
  if (frame === 'eat') {
    pixels.push(p(0, 2, '#228B22')); pixels.push(p(1, 2, '#90EE90'));
    pixels.push(p(1, 1, '#90EE90'));
    pixels.push(p(11, 3, '#90EE90')); pixels.push(p(10, 3, '#90EE90'));
  }

  // 睡觉：枕头 + Zzz
  if (frame === 'sleep') {
    pixels.push(p(0, 9, '#E6E6FA')); pixels.push(p(1, 9, '#E6E6FA'));
    pixels.push(p(2, 9, '#E6E6FA'));
    pixels.push(p(0, 10, '#E6E6FA')); pixels.push(p(1, 10, '#E6E6FA'));
    pixels.push(p(2, 10, '#E6E6FA'));
    pixels.push(p(0, 11, '#9370DB')); pixels.push(p(1, 11, '#9370DB'));
    pixels.push(p(2, 11, '#9370DB'));
    pixels.push(p(10, 0, '#87CEEB')); pixels.push(p(11, 0, '#87CEEB'));
    pixels.push(p(12, 1, '#5DADE2')); pixels.push(p(13, 1, '#5DADE2'));
    pixels.push(p(14, 2, '#3498DB'));
  }

  // 摸头：爱心 + 星星
  if (frame === 'react') {
    pixels.push(p(12, 0, '#FF69B4')); pixels.push(p(13, 0, '#FF69B4'));
    pixels.push(p(11, 1, '#FF69B4')); pixels.push(p(12, 1, '#FF69B4'));
    pixels.push(p(13, 1, '#FF69B4')); pixels.push(p(14, 1, '#FF69B4'));
    pixels.push(p(12, 2, '#FF69B4')); pixels.push(p(13, 2, '#FF69B4'));
    pixels.push(p(12, 3, '#FF69B4'));
    pixels.push(p(0, 0, '#FFD700'));
  }
  if (frame === 'happy') {
    pixels.push(p(0, 0, '#FFD700')); pixels.push(p(13, 0, '#FFD700'));
    pixels.push(p(0, 3, '#FF69B4')); pixels.push(p(1, 3, '#FF69B4'));
  }
  if (frame === 'grabbed') {
    pixels.push(p(1, 0, '#87CEEB')); pixels.push(p(10, 0, '#87CEEB'));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}
