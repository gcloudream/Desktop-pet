// Pixel dog rendered as inline SVG — 32x32 grid, 4x4 real pixels
import { CowFrame } from './CowSprite';

export function createDogSVG(frame: CowFrame): string {
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  const fur = '#C4A882';      // golden retriever
  const dark = '#8B6914';     // dark brown
  const belly = '#F5DEB3';    // wheat belly
  const eye = '#333333';
  const nose = '#222222';
  const tongue = '#FF6B6B';

  let pixels: string[] = [];

  // Ears (floppy, hanging down)
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
  } else if (frame === 'happy') {
    // ^_^ squinty
    pixels.push(p(3, 2, eye)); pixels.push(p(5, 2, eye)); pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye)); pixels.push(p(9, 2, eye)); pixels.push(p(8, 3, eye));
  } else if (frame === 'grabbed') {
    // O_O big eyes
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

  // Mouth / tongue
  if (frame === 'happy' || frame === 'eat') {
    pixels.push(p(5, 6, tongue)); pixels.push(p(6, 6, tongue));
    pixels.push(p(5, 7, tongue));
  }

  // Body
  for (let x = 3; x <= 8; x++) for (let y = 6; y <= 10; y++) pixels.push(p(x, y, fur));
  for (let y = 6; y <= 10; y++) { pixels.push(p(2, y, fur)); pixels.push(p(9, y, fur)); }
  // Belly
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

  // Tail (wagging)
  if (frame === 'happy') {
    pixels.push(p(10, 6, fur)); pixels.push(p(11, 5, fur));
    pixels.push(p(12, 4, fur)); pixels.push(p(12, 3, fur));
  } else if (frame === 'sleep') {
    pixels.push(p(10, 9, fur)); pixels.push(p(11, 10, fur));
  } else {
    pixels.push(p(10, 6, fur)); pixels.push(p(11, 7, fur));
    pixels.push(p(12, 7, fur));
  }

  // Effects
  if (frame === 'react') {
    pixels.push(p(12, 1, '#FF69B4')); pixels.push(p(13, 1, '#FF69B4'));
    pixels.push(p(11, 2, '#FF69B4')); pixels.push(p(12, 2, '#FF69B4'));
    pixels.push(p(13, 2, '#FF69B4')); pixels.push(p(14, 2, '#FF69B4'));
    pixels.push(p(12, 3, '#FF69B4')); pixels.push(p(13, 3, '#FF69B4'));
    pixels.push(p(12, 4, '#FF69B4'));
  }
  if (frame === 'happy') {
    pixels.push(p(0, 0, '#FFD700')); pixels.push(p(13, 0, '#FFD700'));
  }
  if (frame === 'sleep') {
    pixels.push(p(11, 0, '#87CEEB')); pixels.push(p(12, 0, '#87CEEB'));
    pixels.push(p(12, 1, '#87CEEB')); pixels.push(p(13, 1, '#87CEEB'));
    pixels.push(p(13, 2, '#87CEEB'));
  }
  if (frame === 'eat') {
    pixels.push(p(0, 3, '#90EE90')); pixels.push(p(11, 3, '#90EE90'));
  }
  if (frame === 'grabbed') {
    pixels.push(p(1, 0, '#87CEEB')); pixels.push(p(10, 0, '#87CEEB'));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}
