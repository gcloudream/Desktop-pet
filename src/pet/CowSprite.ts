// Pixel cow rendered as inline SVG
// Each "pixel" is 4x4 real pixels for crisp 32x32 look at 64x64 display

export type CowFrame = 'idle1' | 'idle2' | 'walk1' | 'walk2' | 'fall' | 'react' | 'grabbed' | 'sleep' | 'eat' | 'happy';

export function createCowSVG(frame: CowFrame): string {
  const p = (x: number, y: number, color: string) =>
    `<rect x="${x*4}" y="${y*4}" width="4" height="4" fill="${color}"/>`;

  const body = '#F5E6D0';      // cream
  const dark = '#8B7355';       // brown
  const nose = '#FFB6C1';       // pink
  const eye = '#333333';        // dark
  const horn = '#DEB887';       // burlywood
  const spot = '#A0522D';       // sienna spots

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
    // Closed eyes (horizontal lines)
    pixels.push(p(3, 3, eye));
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye));
    pixels.push(p(8, 3, eye));
  } else if (frame === 'idle2' || frame === 'walk2') {
    // Blink frame
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye));
  } else if (frame === 'fall') {
    // Panic big eyes
    pixels.push(p(3, 2, eye));
    pixels.push(p(4, 2, eye));
    pixels.push(p(3, 3, eye));
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye));
    pixels.push(p(8, 2, eye));
    pixels.push(p(7, 3, eye));
    pixels.push(p(8, 3, eye));
  } else if (frame === 'happy') {
    // Happy squinty eyes (^_^)
    pixels.push(p(3, 2, eye));
    pixels.push(p(5, 2, eye));
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye));
    pixels.push(p(9, 2, eye));
    pixels.push(p(8, 3, eye));
  } else if (frame === 'grabbed') {
    // Surprised O_O eyes
    pixels.push(p(3, 2, eye));
    pixels.push(p(4, 2, eye));
    pixels.push(p(5, 2, eye));
    pixels.push(p(3, 3, eye));
    pixels.push(p(5, 3, eye));
    pixels.push(p(3, 4, eye));
    pixels.push(p(4, 4, eye));
    pixels.push(p(5, 4, eye));
    pixels.push(p(7, 2, eye));
    pixels.push(p(8, 2, eye));
    pixels.push(p(9, 2, eye));
    pixels.push(p(7, 3, eye));
    pixels.push(p(9, 3, eye));
    pixels.push(p(7, 4, eye));
    pixels.push(p(8, 4, eye));
    pixels.push(p(9, 4, eye));
  } else {
    // Normal open eyes
    pixels.push(p(3, 3, eye));
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye));
    pixels.push(p(8, 3, eye));
  }

  // Nose
  pixels.push(p(4, 4, nose));
  pixels.push(p(5, 4, nose));
  pixels.push(p(6, 4, nose));
  pixels.push(p(7, 4, nose));

  // Mouth - varies by frame
  if (frame === 'react' || frame === 'happy') {
    // Big smile
    pixels.push(p(4, 5, nose));
    pixels.push(p(5, 5, nose));
    pixels.push(p(6, 5, nose));
    pixels.push(p(7, 5, nose));
  } else if (frame === 'eat') {
    // Chomping mouth (open)
    pixels.push(p(5, 5, dark));
    pixels.push(p(6, 5, dark));
    pixels.push(p(5, 6, nose));
    pixels.push(p(6, 6, nose));
  } else if (frame === 'grabbed') {
    // Wavy worried mouth
    pixels.push(p(4, 5, dark));
    pixels.push(p(6, 5, dark));
    pixels.push(p(5, 6, dark));
    pixels.push(p(7, 5, dark));
  } else if (frame === 'sleep') {
    // Tiny closed mouth
    pixels.push(p(5, 5, dark));
    pixels.push(p(6, 5, dark));
  }

  // Ears
  pixels.push(p(1, 2, body));
  pixels.push(p(10, 2, body));

  // Body
  for (let x = 3; x <= 8; x++) {
    for (let y = 5; y <= 9; y++) {
      pixels.push(p(x, y, body));
    }
  }
  // Body sides
  for (let y = 5; y <= 9; y++) {
    pixels.push(p(2, y, body));
    pixels.push(p(9, y, body));
  }

  // Spots on body
  pixels.push(p(4, 6, spot));
  pixels.push(p(5, 6, spot));
  pixels.push(p(7, 8, spot));
  pixels.push(p(8, 8, spot));

  // Udder
  pixels.push(p(5, 10, nose));
  pixels.push(p(6, 10, nose));

  // Legs - varies by frame
  if (frame === 'walk1') {
    // Walk frame 1 - legs spread
    pixels.push(p(3, 10, body)); pixels.push(p(3, 11, body)); pixels.push(p(3, 12, dark));
    pixels.push(p(4, 10, body)); pixels.push(p(4, 11, body)); pixels.push(p(4, 12, dark));
    pixels.push(p(7, 10, body)); pixels.push(p(7, 11, body)); pixels.push(p(7, 12, dark));
    pixels.push(p(8, 10, body)); pixels.push(p(8, 11, body)); pixels.push(p(8, 12, dark));
  } else if (frame === 'walk2') {
    // Walk frame 2 - legs together
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
    // No feet visible (sitting)
  } else {
    // Default legs (idle, fall, react, grabbed, eat, happy)
    pixels.push(p(3, 10, body)); pixels.push(p(3, 11, body)); pixels.push(p(3, 12, dark));
    pixels.push(p(4, 10, body)); pixels.push(p(4, 11, body)); pixels.push(p(4, 12, dark));
    pixels.push(p(7, 10, body)); pixels.push(p(7, 11, body)); pixels.push(p(7, 12, dark));
    pixels.push(p(8, 10, body)); pixels.push(p(8, 11, body)); pixels.push(p(8, 12, dark));
  }

  // Tail - varies by frame
  if (frame === 'idle1' || frame === 'walk1' || frame === 'eat') {
    pixels.push(p(10, 6, dark));
    pixels.push(p(11, 5, dark));
    pixels.push(p(12, 5, dark));
    pixels.push(p(12, 4, dark));
  } else if (frame === 'happy') {
    // Wagging tail (high)
    pixels.push(p(10, 5, dark));
    pixels.push(p(11, 4, dark));
    pixels.push(p(12, 3, dark));
    pixels.push(p(13, 3, dark));
  } else if (frame === 'sleep') {
    // Tail curled around body
    pixels.push(p(10, 8, dark));
    pixels.push(p(11, 9, dark));
    pixels.push(p(11, 10, dark));
  } else {
    pixels.push(p(10, 6, dark));
    pixels.push(p(11, 7, dark));
    pixels.push(p(12, 7, dark));
    pixels.push(p(12, 8, dark));
  }

  // React frame - add hearts
  if (frame === 'react') {
    pixels.push(p(11, 1, '#FF69B4'));
    pixels.push(p(12, 1, '#FF69B4'));
    pixels.push(p(10, 2, '#FF69B4'));
    pixels.push(p(11, 2, '#FF69B4'));
    pixels.push(p(12, 2, '#FF69B4'));
    pixels.push(p(13, 2, '#FF69B4'));
    pixels.push(p(11, 3, '#FF69B4'));
    pixels.push(p(12, 3, '#FF69B4'));
    pixels.push(p(11, 4, '#FF69B4'));
  }

  // Happy frame - add sparkles
  if (frame === 'happy') {
    pixels.push(p(0, 0, '#FFD700'));
    pixels.push(p(11, 0, '#FFD700'));
    pixels.push(p(1, 1, '#FFD700'));
    pixels.push(p(10, 1, '#FFD700'));
  }

  // Sleep frame - add Zzz
  if (frame === 'sleep') {
    pixels.push(p(10, 0, '#87CEEB'));
    pixels.push(p(11, 0, '#87CEEB'));
    pixels.push(p(12, 0, '#87CEEB'));
    pixels.push(p(11, 1, '#87CEEB'));
    pixels.push(p(12, 1, '#87CEEB'));
    pixels.push(p(13, 1, '#87CEEB'));
    pixels.push(p(12, 2, '#87CEEB'));
    pixels.push(p(13, 2, '#87CEEB'));
  }

  // Eat frame - add food particles
  if (frame === 'eat') {
    pixels.push(p(0, 4, '#90EE90'));
    pixels.push(p(1, 3, '#90EE90'));
    pixels.push(p(11, 4, '#90EE90'));
    pixels.push(p(12, 3, '#90EE90'));
  }

  // Grabbed frame - add sweat drops
  if (frame === 'grabbed') {
    pixels.push(p(1, 0, '#87CEEB'));
    pixels.push(p(0, 1, '#87CEEB'));
    pixels.push(p(10, 0, '#87CEEB'));
    pixels.push(p(11, 1, '#87CEEB'));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}
