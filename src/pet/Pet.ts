import { PetStateMachine, PetStateType } from './PetState';
import { Physics, Position } from './Physics';
import { PetConfig, CARE_MESSAGES, DEFAULT_CONFIG } from './Config';

export class Pet {
  private container: HTMLElement;
  private spriteEl: HTMLElement;
  private bubbleEl: HTMLElement;
  private stateMachine: PetStateMachine;
  private physics: Physics;
  private config: PetConfig;
  private animationFrame: number = 0;
  private isDragging: boolean = false;
  private careTimer: ReturnType<typeof setTimeout> | null = null;
  private workReminderTimer: ReturnType<typeof setInterval> | null = null;
  private bubbleTimer: ReturnType<typeof setTimeout> | null = null;
  private contextMenu: HTMLElement | null = null;
  private isVisible: boolean = true;
  private lastInteractionTime: number = Date.now();
  private isCursorOverPet: boolean = false;

  constructor(container: HTMLElement, config: Partial<PetConfig> = {}) {
    this.container = container;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.spriteEl = container.querySelector('.pet')!;
    this.bubbleEl = container.querySelector('#bubble')!;

    this.stateMachine = new PetStateMachine();
    this.physics = new Physics(this.config);

    this.setupStateMachine();
    this.setupInteraction();
    this.setupDrag();
    this.setupContextMenu();
    this.setupCursorTracking();
    this.startCareSystem();
    this.startGameLoop();

    // Initial position
    this.updateContainerPosition();

    // Welcome message
    setTimeout(() => this.showBubble(this.getRandomMessage('random')), 1000);
  }

  private setupStateMachine(): void {
    this.stateMachine.on('transition', ({ to }: { from: PetStateType; to: PetStateType }) => {
      this.spriteEl.className = `pet ${to}`;
    });
  }

  private setupInteraction(): void {
    this.container.addEventListener('click', (e) => {
      if (this.isDragging) return;
      e.stopPropagation();
      this.stateMachine.transition('react');
      this.showBubble(this.getRandomMessage('click'));
      setTimeout(() => {
        if (this.stateMachine.state === 'react') {
          this.stateMachine.transition('idle');
        }
      }, 500);
      this.lastInteractionTime = Date.now();
    });
  }

  private setupDrag(): void {
    let startX = 0, startY = 0;
    let startPosX = 0, startPosY = 0;
    let moved = false;

    this.container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = false;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      startPosX = this.physics.pos.x;
      startPosY = this.physics.pos.y;

      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this.isDragging = true;
          moved = true;
          this.physics.setPosition(startPosX + dx, startPosY + dy);
          this.updateContainerPosition();
          this.stateMachine.transition('idle');
        }
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (moved) {
          this.isDragging = false;
          // Drop if not on ground
          const groundY = window.innerHeight - this.config.groundOffset - this.config.petSize;
          if (this.physics.pos.y < groundY - 5) {
            this.physics.applyGravity();
            this.stateMachine.transition('fall');
          }
        }
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  private setupContextMenu(): void {
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
  }

  private setupCursorTracking(): void {
    // Track mouse position to detect when cursor is over the pet
    // This allows us to dynamically toggle click-through behavior
    document.addEventListener('mousemove', (e: MouseEvent) => {
      const petRect = this.container.getBoundingClientRect();
      const isOver = (
        e.clientX >= petRect.left &&
        e.clientX <= petRect.right &&
        e.clientY >= petRect.top &&
        e.clientY <= petRect.bottom
      );

      if (isOver !== this.isCursorOverPet) {
        this.isCursorOverPet = isOver;
        // Tell Tauri to toggle click-through
        this.toggleCursorEvents(!isOver);
      }
    });
  }

  private async toggleCursorEvents(ignore: boolean): Promise<void> {
    try {
      // Use Tauri API to set ignore cursor events
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_ignore_cursor_events', { ignore });
    } catch (e) {
      // Fallback: might not be in Tauri context
      console.log('Cursor events toggle:', ignore);
    }
  }

  private showContextMenu(x: number, y: number): void {
    this.hideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    const items = [
      { icon: this.isVisible ? '🙈' : '👀', text: this.isVisible ? '隐藏小牛' : '显示小牛', action: () => this.toggleVisibility() },
      { icon: '🔄', text: '重新召唤', action: () => this.respawn() },
      { divider: true },
      { icon: '❌', text: '退出', action: () => this.quit() },
    ];

    items.forEach(item => {
      if ('divider' in item && item.divider) {
        const div = document.createElement('div');
        div.className = 'context-menu-divider';
        menu.appendChild(div);
      } else {
        const el = document.createElement('div');
        el.className = 'context-menu-item';
        el.innerHTML = `<span>${item.icon}</span><span>${item.text}</span>`;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hideContextMenu();
          item.action();
        });
        menu.appendChild(el);
      }
    });

    document.body.appendChild(menu);
    this.contextMenu = menu;
  }

  private hideContextMenu(): void {
    if (this.contextMenu) {
      this.contextMenu.remove();
      this.contextMenu = null;
    }
  }

  private toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  respawn(): void {
    this.isVisible = true;
    this.container.style.display = 'block';
    this.physics.setPosition(window.innerWidth / 2, window.innerHeight - this.config.groundOffset - this.config.petSize);
    this.physics.setVelocity(0, 0);
    this.stateMachine.transition('idle');
    this.updateContainerPosition();
    this.showBubble("牛牛回来啦！哞～");
  }

  private quit(): void {
    this.showBubble("再见啦，下次见～");
    setTimeout(() => this.toggleVisibility(), 2000);
  }

  private startCareSystem(): void {
    // Random care messages every 2-5 minutes
    const scheduleRandomCare = () => {
      const delay = (2 + Math.random() * 3) * 60 * 1000;
      this.careTimer = setTimeout(() => {
        this.showBubble(this.getRandomMessage('random'));
        scheduleRandomCare();
      }, delay);
    };
    scheduleRandomCare();

    // Work reminder every 45 minutes
    this.workReminderTimer = setInterval(() => {
      this.showBubble(this.getRandomMessage('workReminder'));
    }, 45 * 60 * 1000);

    // Time-based messages
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) {
      setTimeout(() => this.showBubble(this.getRandomMessage('morning')), 3000);
    } else if (hour >= 22 || hour < 2) {
      setTimeout(() => this.showBubble(this.getRandomMessage('evening')), 3000);
    }
  }

  private showBubble(message: string): void {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleEl.textContent = message;
    this.bubbleEl.classList.remove('hidden');
    this.bubbleTimer = setTimeout(() => {
      this.bubbleEl.classList.add('hidden');
    }, this.config.bubbleDuration);
  }

  private getRandomMessage(category: keyof typeof CARE_MESSAGES): string {
    const messages = CARE_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private startGameLoop(): void {
    const loop = () => {
      this.update();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  private update(): void {
    if (this.isDragging) return;

    const state = this.stateMachine.state;

    switch (state) {
      case 'idle':
        this.updateIdle();
        break;
      case 'walk-left':
      case 'walk-right':
        this.updateWalk();
        break;
      case 'fall':
        this.updateFall();
        break;
      case 'land':
        this.updateLand();
        break;
    }

    const { hitGround, hitEdge } = this.physics.update();

    if (state === 'fall' && hitGround) {
      this.stateMachine.transition('land');
      setTimeout(() => {
        if (this.stateMachine.state === 'land') {
          this.stateMachine.transition('idle');
        }
      }, 300);
    }

    if (hitEdge && (state === 'walk-left' || state === 'walk-right')) {
      this.physics.stop();
      this.stateMachine.transition('idle');
    }

    this.updateContainerPosition();
  }

  private updateIdle(): void {
    const idleTime = this.stateMachine.stateAge;
    const maxIdle = this.randRange(this.config.idleDuration[0], this.config.idleDuration[1]) * 1000;

    if (idleTime > maxIdle) {
      if (Math.random() < 0.8) {
        const direction = Math.random() < 0.5 ? 'left' : 'right';
        this.physics.walk(direction);
        this.stateMachine.transition(direction === 'left' ? 'walk-left' : 'walk-right');
      }
    }
  }

  private updateWalk(): void {
    const walkTime = this.stateMachine.stateAge;
    const maxWalk = this.randRange(this.config.walkDuration[0], this.config.walkDuration[1]) * 1000;

    if (walkTime > maxWalk || Math.random() < 0.002) {
      this.physics.stop();
      this.stateMachine.transition('idle');
    }

    if (Math.random() < 0.005) {
      const newDir = this.stateMachine.state === 'walk-left' ? 'walk-right' : 'walk-left';
      this.physics.walk(newDir === 'walk-left' ? 'left' : 'right');
      this.stateMachine.transition(newDir);
    }
  }

  private updateFall(): void {
    this.physics.applyGravity();
  }

  private updateLand(): void {
    // Landing state is handled by setTimeout in update()
  }

  private updateContainerPosition(): void {
    const pos = this.physics.pos;
    this.container.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    this.container.style.position = 'fixed';
    this.container.style.left = '0';
    this.container.style.top = '0';
  }

  private randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrame);
    if (this.careTimer) clearTimeout(this.careTimer);
    if (this.workReminderTimer) clearInterval(this.workReminderTimer);
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.hideContextMenu();
  }
}
