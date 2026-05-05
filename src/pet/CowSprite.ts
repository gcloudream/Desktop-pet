// Pixel cow rendered as inline SVG
// Each "pixel" is 4x4 real pixels for crisp 32x32 look at 64x64 display

export function createCowSVG(frame: 'idle1' | 'idle2' | 'walk1' | 'walk2' | 'fall' | 'react'): string {
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

  // Eyes
  if (frame === 'idle2' || frame === 'walk2') {
    // Blink frame - just a line
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 3, eye));
  } else {
    // Open eyes
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

  // Mouth
  if (frame === 'react') {
    pixels.push(p(5, 5, nose));
    pixels.push(p(6, 5, nose));
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

  // Legs
  if (frame === 'walk1') {
    // Walk frame 1 - legs spread
    pixels.push(p(3, 10, body));
    pixels.push(p(3, 11, body));
    pixels.push(p(3, 12, dark));
    pixels.push(p(4, 10, body));
    pixels.push(p(4, 11, body));
    pixels.push(p(4, 12, dark));
    pixels.push(p(7, 10, body));
    pixels.push(p(7, 11, body));
    pixels.push(p(7, 12, dark));
    pixels.push(p(8, 10, body));
    pixels.push(p(8, 11, body));
    pixels.push(p(8, 12, dark));
  } else if (frame === 'walk2') {
    // Walk frame 2 - legs together
    pixels.push(p(4, 10, body));
    pixels.push(p(4, 11, body));
    pixels.push(p(4, 12, dark));
    pixels.push(p(5, 10, body));
    pixels.push(p(5, 11, body));
    pixels.push(p(5, 12, dark));
    pixels.push(p(6, 10, body));
    pixels.push(p(6, 11, body));
    pixels.push(p(6, 12, dark));
    pixels.push(p(7, 10, body));
    pixels.push(p(7, 11, body));
    pixels.push(p(7, 12, dark));
  } else {
    // Default legs
    pixels.push(p(3, 10, body));
    pixels.push(p(3, 11, body));
    pixels.push(p(3, 12, dark));
    pixels.push(p(4, 10, body));
    pixels.push(p(4, 11, body));
    pixels.push(p(4, 12, dark));
    pixels.push(p(7, 10, body));
    pixels.push(p(7, 11, body));
    pixels.push(p(7, 12, dark));
    pixels.push(p(8, 10, body));
    pixels.push(p(8, 11, body));
    pixels.push(p(8, 12, dark));
  }

  // Tail
  if (frame === 'idle1' || frame === 'walk1') {
    pixels.push(p(10, 6, dark));
    pixels.push(p(11, 5, dark));
    pixels.push(p(12, 5, dark));
    pixels.push(p(12, 4, dark));
  } else {
    pixels.push(p(10, 6, dark));
    pixels.push(p(11, 7, dark));
    pixels.push(p(12, 7, dark));
    pixels.push(p(12, 8, dark));
  }

  // Fall frame - add panic eyes
  if (frame === 'fall') {
    pixels = pixels.filter(px => !px.includes('rect x="12"') || true);
    // Override eyes with big circles
    pixels.push(p(3, 2, eye));
    pixels.push(p(4, 2, eye));
    pixels.push(p(3, 3, eye));
    pixels.push(p(4, 3, eye));
    pixels.push(p(7, 2, eye));
    pixels.push(p(8, 2, eye));
    pixels.push(p(7, 3, eye));
    pixels.push(p(8, 3, eye));
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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" shape-rendering="crispEdges">${pixels.join('')}</svg>`;
}
