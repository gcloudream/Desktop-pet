import { Pet } from './pet/Pet';
import { SkinManager } from './pet/SkinManager';
import { CowFrame } from './pet/CowSprite';
import { getTimeState, getTimeMessages } from './pet/TimeAwareness';

// Global skin manager
const skinManager = new SkinManager();
(window as any).__skinManager = skinManager;

// Time awareness
const timeState = getTimeState();
(window as any).__timeState = timeState;
console.log(`⏰ 当前时段: ${timeState.period} (${timeState.hour}:00) — ${timeState.mood}`);

// Set initial sprite and animate
function initSprite(): void {
  const petEl = document.querySelector('.pet') as HTMLElement;
  if (petEl) {
    const svgContainer = document.createElement('div');
    svgContainer.className = 'cow-sprite';
    svgContainer.style.position = 'relative';
    svgContainer.innerHTML = skinManager.render('idle1');
    petEl.appendChild(svgContainer);

    // Add time-based accessory (night cap in evening/night)
    if (timeState.accessory) {
      const accessoryEl = document.createElement('div');
      accessoryEl.innerHTML = timeState.accessory;
      accessoryEl.style.position = 'absolute';
      accessoryEl.style.top = '0';
      accessoryEl.style.left = '0';
      accessoryEl.style.pointerEvents = 'none';
      svgContainer.appendChild(accessoryEl.firstChild as Node);
    }

    // Helper to render current skin
    const render = (frame: CowFrame) => {
      svgContainer.innerHTML = skinManager.render(frame);
    };

    // Animate idle frames
    let frame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('idle') && !currentState.includes('grabbed')) {
        render(frame % 2 === 0 ? 'idle1' : 'idle2');
        frame++;
      }
    }, 800);

    // Animate walk frames
    let walkFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('walk')) {
        render(walkFrame % 2 === 0 ? 'walk1' : 'walk2');
        walkFrame++;
      }
    }, 300);

    // Animate fall
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('fall')) {
        render('fall');
      }
    }, 200);

    // Animate sleep (slow breathing)
    let sleepFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('sleep')) {
        render(sleepFrame % 2 === 0 ? 'sleep' : 'idle2');
        sleepFrame++;
      }
    }, 2000);

    // Animate eat (chomping)
    let eatFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('eat')) {
        render(eatFrame % 2 === 0 ? 'eat' : 'idle1');
        eatFrame++;
      }
    }, 400);

    // Animate happy (wagging tail)
    let happyFrame = 0;
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('happy')) {
        render(happyFrame % 2 === 0 ? 'happy' : 'react');
        happyFrame++;
      }
    }, 250);

    // Animate grabbed (surprised)
    setInterval(() => {
      const currentState = petEl.className;
      if (currentState.includes('grabbed')) {
        render('grabbed');
      }
    }, 150);

    // Animate react
    const observer = new MutationObserver(() => {
      if (petEl.className.includes('react') && !petEl.className.includes('happy')) {
        render('react');
        setTimeout(() => {
          if (!petEl.className.includes('happy')) {
            render('idle1');
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

  console.log('🐮 桌面宠物已启动！');
});
