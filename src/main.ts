import { Pet } from './pet/Pet';
import { createCowSVG, CowFrame } from './pet/CowSprite';

// Set initial cow sprite
function initSprite(): void {
  const petEl = document.querySelector('.pet') as HTMLElement;
  if (petEl) {
    // Create SVG container
    const svgContainer = document.createElement('div');
    svgContainer.className = 'cow-sprite';
    svgContainer.innerHTML = createCowSVG('idle1');
    petEl.appendChild(svgContainer);

    // Animate idle frames
    let frame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('idle') && !currentState.includes('grabbed')) {
        svgContainer.innerHTML = createCowSVG(frame % 2 === 0 ? 'idle1' : 'idle2');
        frame++;
      }
    }, 800);

    // Animate walk frames
    let walkFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('walk')) {
        svgContainer.innerHTML = createCowSVG(walkFrame % 2 === 0 ? 'walk1' : 'walk2');
        walkFrame++;
      }
    }, 300);

    // Animate fall
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('fall')) {
        svgContainer.innerHTML = createCowSVG('fall');
      }
    }, 200);

    // Animate sleep (slow breathing)
    let sleepFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('sleep')) {
        svgContainer.innerHTML = createCowSVG(sleepFrame % 2 === 0 ? 'sleep' : 'idle2');
        sleepFrame++;
      }
    }, 2000);

    // Animate eat (chomping)
    let eatFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('eat')) {
        svgContainer.innerHTML = createCowSVG(eatFrame % 2 === 0 ? 'eat' : 'idle1');
        eatFrame++;
      }
    }, 400);

    // Animate happy (wagging tail)
    let happyFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('happy')) {
        svgContainer.innerHTML = createCowSVG(happyFrame % 2 === 0 ? 'happy' : 'react');
        happyFrame++;
      }
    }, 250);

    // Animate grabbed (surprised)
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('grabbed')) {
        svgContainer.innerHTML = createCowSVG('grabbed');
      }
    }, 150);

    // Animate react
    const observer = new MutationObserver(() => {
      if (petEl.className.includes('react') && !petEl.className.includes('happy')) {
        svgContainer.innerHTML = createCowSVG('react');
        setTimeout(() => {
          if (!petEl.className.includes('happy')) {
            svgContainer.innerHTML = createCowSVG('idle1');
          }
        }, 500);
      }
    });
    observer.observe(petEl, { attributes: true, attributeFilter: ['class'] });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initSprite();

  const container = document.getElementById('pet-container')!;
  const pet = new Pet(container);

  // Make pet accessible for debugging
  (window as any).__pet = pet;

  console.log('🐮 桌面小牛已启动！');
});
