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

  // 拖拽相关
  private dragStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private dragLastPos: { x: number; y: number } = { x: 0, y: 0 };
  private dragVelocity: { vx: number; vy: number } = { vx: 0, vy: 0 };

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

      // 从睡觉状态唤醒
      if (this.stateMachine.state === 'sleep') {
        this.stateMachine.transition('happy');
        this.showBubble(this.getRandomMessage('happy'));
        setTimeout(() => {
          if (this.stateMachine.state === 'happy') {
            this.stateMachine.transition('idle');
          }
        }, 1500);
        this.lastInteractionTime = Date.now();
        return;
      }

      // 被点击 → 开心或反应
      if (Math.random() < this.config.happyChance) {
        this.stateMachine.transition('happy');
        this.showBubble(this.getRandomMessage('happy'));
        setTimeout(() => {
          if (this.stateMachine.state === 'happy') {
            this.stateMachine.transition('idle');
          }
        }, 1500);
      } else {
        this.stateMachine.transition('react');
        this.showBubble(this.getRandomMessage('click'));
        setTimeout(() => {
          if (this.stateMachine.state === 'react') {
            this.stateMachine.transition('idle');
          }
        }, 500);
      }
      this.lastInteractionTime = Date.now();
    });
  }

  private setupDrag(): void {
    let startX = 0, startY = 0;
    let startPosX = 0, startPosY = 0;
    let moved = false;
    let lastMoveTime = 0;
    let lastMoveX = 0, lastMoveY = 0;

    this.container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = false;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      startPosX = this.physics.pos.x;
      startPosY = this.physics.pos.y;
      lastMoveX = e.clientX;
      lastMoveY = e.clientY;
      lastMoveTime = Date.now();
      this.dragVelocity = { vx: 0, vy: 0 };

      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          if (!this.isDragging) {
            // 刚开始拖拽
            this.isDragging = true;
            this.stateMachine.transition('grabbed');
            this.showBubble(this.getRandomMessage('grabbed'));
          }

          // 计算拖拽速度（用于抛出）
          const now = Date.now();
          const dt = now - lastMoveTime;
          if (dt > 0) {
            this.dragVelocity.vx = (e.clientX - lastMoveX) / dt * 16; // 归一化到帧
            this.dragVelocity.vy = (e.clientY - lastMoveY) / dt * 16;
          }
          lastMoveX = e.clientX;
          lastMoveY = e.clientY;
          lastMoveTime = now;

          this.physics.setPosition(startPosX + dx, startPosY + dy);
          this.updateContainerPosition();
        }
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (moved || this.isDragging) {
          this.isDragging = false;

          // 根据拖拽速度抛出小牛
          const throwVx = this.dragVelocity.vx * 0.5;
          const throwVy = Math.min(this.dragVelocity.vy * 0.5, 5); // 限制向上速度

          if (Math.abs(throwVx) > 0.5 || throwVy < -1) {
            // 有速度 → 抛出
            this.physics.throwUp(throwVx, throwVy);
            this.stateMachine.transition('fall');
          } else {
            // 无速度 → 检查是否需要掉落
            const groundY = window.innerHeight - this.config.groundOffset - this.config.petSize;
            if (this.physics.pos.y < groundY - 5) {
              this.physics.applyGravity();
              this.stateMachine.transition('fall');
            } else {
              this.stateMachine.transition('idle');
            }
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
        this.toggleCursorEvents(!isOver);
      }
    });
  }

  private async toggleCursorEvents(ignore: boolean): Promise<void> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_ignore_cursor_events', { ignore });
    } catch (e) {
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
      { icon: '💤', text: '让牛牛睡觉', action: () => this.forceSleep() },
      { icon: '🍽️', text: '喂牛牛吃草', action: () => this.forceEat() },
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

  private forceSleep(): void {
    this.physics.stop();
    this.stateMachine.transition('sleep');
    this.showBubble(this.getRandomMessage('sleep'));
  }

  private forceEat(): void {
    this.physics.stop();
    this.stateMachine.transition('eat');
    this.showBubble(this.getRandomMessage('eat'));
    setTimeout(() => {
      if (this.stateMachine.state === 'eat') {
        this.stateMachine.transition('idle');
      }
    }, 3000);
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
      case 'sleep':
        this.updateSleep();
        break;
      case 'eat':
        this.updateEat();
        break;
      case 'grabbed':
        // 被抓时不更新物理
        return;
    }

    const { hitGround, hitEdge } = this.physics.update();

    // 落地处理（带弹跳）
    if (state === 'fall' && hitGround) {
      if (Math.abs(this.physics.pos.y - (window.innerHeight - this.config.groundOffset - this.config.petSize)) < 2) {
        // 真正着地了
        this.stateMachine.transition('land');
        setTimeout(() => {
          if (this.stateMachine.state === 'land') {
            this.stateMachine.transition('idle');
          }
        }, 300);
      }
      // 否则还在弹跳中，保持 fall 状态
    }

    // 边缘处理 — 转向而不是停住
    if (hitEdge && (state === 'walk-left' || state === 'walk-right')) {
      const newDir = hitEdge === 'left' ? 'right' : 'left';
      this.physics.walk(newDir);
      this.stateMachine.transition(newDir === 'left' ? 'walk-left' : 'walk-right');
    }

    this.updateContainerPosition();
  }

  private updateIdle(): void {
    const idleTime = this.stateMachine.stateAge;

    // 闲置太久 → 睡觉
    if (idleTime > this.config.sleepDelay) {
      this.stateMachine.transition('sleep');
      this.showBubble(this.getRandomMessage('sleep'));
      return;
    }

    const maxIdle = this.randRange(this.config.idleDuration[0], this.config.idleDuration[1]) * 1000;

    if (idleTime > maxIdle) {
      const rand = Math.random();
      if (rand < this.config.eatChance) {
        // 吃东西
        this.stateMachine.transition('eat');
        this.showBubble(this.getRandomMessage('eat'));
      } else if (rand < this.config.eatChance + 0.7) {
        // 走路
        const direction = Math.random() < 0.5 ? 'left' : 'right';
        this.physics.walk(direction);
        this.stateMachine.transition(direction === 'left' ? 'walk-left' : 'walk-right');
      }
      // 否则继续 idle
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

  private updateSleep(): void {
    // 睡觉中被打扰（随机醒来）
    if (Math.random() < 0.0005) {
      this.stateMachine.transition('idle');
      this.showBubble("哞～牛牛睡醒了！");
    }
  }

  private updateEat(): void {
    // 吃东西状态由 setTimeout 控制，这里不做额外处理
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
