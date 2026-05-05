import { Pet } from './pet/Pet';
import { createCowSVG } from './pet/CowSprite';

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
      if (currentState.includes('idle')) {
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

    // Animate react
    const observer = new MutationObserver(() => {
      if (petEl.className.includes('react')) {
        svgContainer.innerHTML = createCowSVG('react');
        setTimeout(() => {
          svgContainer.innerHTML = createCowSVG('idle1');
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
