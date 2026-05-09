import { PetStateMachine, PetStateType } from './PetState';
import { Physics, Position } from './Physics';
import { PetConfig, CARE_MESSAGES, DEFAULT_CONFIG } from './Config';
import { getTimeMessages, getTimeState } from './TimeAwareness';
import { AchievementManager } from './Achievement';
import { ScreenTimeTracker } from './ScreenTime';
import { WeatherManager } from './Weather';
import { WeatherOverlay } from './WeatherOverlay';

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
  private interactionMenu: HTMLElement | null = null;
  private isVisible: boolean = true;
  private lastInteractionTime: number = Date.now();
  private isCursorOverPet: boolean = false;
  private cursorPos: { x: number; y: number } = { x: -9999, y: -9999 };
  private avoidCooldown: number = 0;
  private clickThroughCooldown: number = 0; // 菜单关闭后延迟恢复 click-through
  private focusTimer: boolean = false;
  private focusEndTime: number = 0;
  private focusTickTimer: ReturnType<typeof setInterval> | null = null;
  private achievements: AchievementManager;
  private screenTime: ScreenTimeTracker;
  private weather: WeatherManager;
  private weatherOverlay: WeatherOverlay;
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
    this.achievements = new AchievementManager();
    this.achievements.setOnUnlock((a) => {
      this.showBubble(`🏆 解锁成就: ${a.icon} ${a.name}！`);
    });
    this.screenTime = new ScreenTimeTracker();
    this.screenTime.setOnMilestone((min, msg) => {
      this.showBubble(`⏰ ${msg}`);
      if (min >= 120) {
        this.stateMachine.transition('react');
        setTimeout(() => { if (this.stateMachine.state === 'react') this.stateMachine.transition('idle'); }, 2000);
      }
    });
    this.weather = new WeatherManager();
    this.weatherOverlay = new WeatherOverlay(container);
    this.weather.setOnUpdate((data) => {
      this.weatherOverlay.setWeather(data.type);
      this.weatherOverlay.updateAccessoryPosition(this.physics.surface);
      const labels: Record<string, string> = { sunny: '☀️ 晴天', cloudy: '☁️ 阴天', rainy: '🌧️ 雨天', snowy: '❄️ 下雪' };
      this.showBubble(`${labels[data.type] || '🌍'} ${data.temp}°C`);
    });
    this.setupStateMachine();
    this.setupInteraction();
    this.setupDrag();
    this.setupContextMenu();
    this.setupCursorTracking();
    this.startCareSystem();
    this.startGameLoop();
    this.updateContainerPosition();
    setTimeout(() => this.showBubble(this.getRandomMessage('random')), 1000);
  }

  private setupStateMachine(): void {
    this.stateMachine.on('transition', ({ to }: { from: PetStateType; to: PetStateType }) => {
      this.spriteEl.className = `pet ${to}`;
    });
  }

  // ── 交互 ──────────────────────────────────────────────

  private setupInteraction(): void {
    this.container.addEventListener('click', (e) => {
      if (this.isDragging) return;
      e.stopPropagation();
      if (this.stateMachine.state === 'sleep') {
        this.stateMachine.transition('happy');
        this.showBubble(this.getRandomMessage('happy'));
        setTimeout(() => { if (this.stateMachine.state === 'happy') this.stateMachine.transition('idle'); }, 1500);
        this.lastInteractionTime = Date.now();
        this.achievements.recordInteraction();
        return;
      }
      if (Math.random() < this.config.happyChance) {
        this.stateMachine.transition('happy');
        this.showBubble(this.getRandomMessage('happy'));
        setTimeout(() => { if (this.stateMachine.state === 'happy') this.stateMachine.transition('idle'); }, 1500);
      } else {
        this.stateMachine.transition('react');
        this.showBubble(this.getRandomMessage('click'));
        setTimeout(() => { if (this.stateMachine.state === 'react') this.stateMachine.transition('idle'); }, 500);
      }
      this.lastInteractionTime = Date.now();
      this.achievements.recordInteraction();
    });

    this.container.addEventListener('dblclick', (e) => {
      if (this.isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      this.showInteractionMenu(e.clientX, e.clientY);
    });
  }

  private showInteractionMenu(x: number, y: number): void {
    this.hideInteractionMenu();
    const menu = document.createElement('div');
    menu.className = 'interaction-menu';
    menu.setAttribute('role', 'menu');
    menu.tabIndex = -1;
    // 阻止菜单区域的事件传播到窗口（防止 macOS 全屏/拖拽）
    menu.addEventListener('mousedown', (e) => e.stopPropagation());
    menu.addEventListener('dblclick', (e) => { e.preventDefault(); e.stopPropagation(); });

    const weatherIcon = this.weather.type === 'sunny' ? '☀️'
      : this.weather.type === 'rainy' ? '🌧️'
      : this.weather.type === 'snowy' ? '❄️' : '☁️';

    type Group = { label: string; items: Array<{ icon: string; label: string; meta?: string; action: () => void }> };
    const groups: Group[] = [
      {
        label: '互动',
        items: [
          { icon: '🤚', label: '摸摸头', action: () => {
            this.stateMachine.transition('happy');
            this.showBubble(this.getRandomMessage('happy'));
            setTimeout(() => { if (this.stateMachine.state === 'happy') this.stateMachine.transition('idle'); }, 1500);
          }},
          { icon: '🍽️', label: '喂食', action: () => {
            this.stateMachine.transition('eat');
            this.showBubble(this.getRandomMessage('eat'));
            this.achievements.recordFeed();
            setTimeout(() => { if (this.stateMachine.state === 'eat') this.stateMachine.transition('idle'); }, 3000);
          }},
          { icon: '😴', label: '睡觉', action: () => {
            this.stateMachine.transition('sleep');
            this.showBubble(this.getRandomMessage('sleep'));
          }},
        ],
      },
      {
        label: '外观',
        items: [
          { icon: '🎨', label: '换肤', action: () => { this.cycleSkin(); } },
        ],
      },
      {
        label: '工具',
        items: [
          { icon: '⏱️', label: this.focusTimer ? '停止专注' : '番茄钟',
            meta: this.focusTimer ? '进行中' : '25分钟',
            action: () => { if (this.focusTimer) this.stopFocus(); else this.startFocus(); } },
        ],
      },
      {
        label: '统计',
        items: [
          { icon: '🏆', label: '成就',
            meta: `${this.achievements.getUnlockedCount()}/${this.achievements.getTotalCount()}`,
            action: () => this.showAchievements() },
          { icon: '🖥️', label: '屏幕时间',
            meta: this.screenTime.getFormattedTime(),
            action: () => this.showBubble(this.screenTime.getTimeMessage()) },
          { icon: weatherIcon, label: '天气',
            meta: `${this.weather.temp}°C`,
            action: () => {
              const labels: Record<string, string> = { sunny: '☀️ 晴天', cloudy: '☁️ 阴天', rainy: '🌧️ 雨天', snowy: '❄️ 下雪' };
              const tips: Record<string, string> = { sunny: '天气不错，出去走走？', cloudy: '有点阴，带件外套～', rainy: '下雨了，记得带伞！', snowy: '下雪了，注意保暖！' };
              this.showBubble(`${labels[this.weather.type] || '🌍'} ${this.weather.temp}°C — ${tips[this.weather.type] || ''}`);
            } },
        ],
      },
    ];

    const itemEls: HTMLElement[] = [];
    groups.forEach((group, gi) => {
      if (gi > 0) {
        const divider = document.createElement('div');
        divider.className = 'context-menu-divider';
        menu.appendChild(divider);
      }
      const label = document.createElement('div');
      label.className = 'menu-group-label';
      label.textContent = group.label;
      menu.appendChild(label);

      group.items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'interaction-menu-item';
        el.setAttribute('role', 'menuitem');
        el.tabIndex = -1;
        el.innerHTML =
          `<span class="mi-icon">${item.icon}</span>` +
          `<span class="mi-label">${item.label}</span>` +
          `<span class="mi-meta">${item.meta ?? ''}</span>`;
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.hideInteractionMenu();
          item.action();
          this.lastInteractionTime = Date.now();
        });
        menu.appendChild(el);
        itemEls.push(el);
      });
    });

    document.body.appendChild(menu);
    const menuRect = menu.getBoundingClientRect();
    let mx = x, my = y - menuRect.height - 10;
    if (my < 0) my = y + 10;
    if (mx + menuRect.width > window.innerWidth) mx = window.innerWidth - menuRect.width - 5;
    menu.style.left = `${mx}px`;
    menu.style.top = `${my}px`;
    this.interactionMenu = menu;
    this.attachMenuKeyboard(menu, itemEls, () => this.hideInteractionMenu());
    // 菜单显示时立即禁用 click-through
    this.isCursorOverPet = true;
    this.toggleCursorEvents(false);
    setTimeout(() => {
      document.addEventListener('mousedown', this._hideInteractionMenuHandler);
      menu.focus();
    }, 0);
  }

  private _hideInteractionMenuHandler = (e: MouseEvent) => {
    if (this.interactionMenu && !this.interactionMenu.contains(e.target as Node)) {
      this.hideInteractionMenu();
    }
  };

  private hideInteractionMenu(): void {
    if (this.interactionMenu) {
      this.interactionMenu.remove();
      this.interactionMenu = null;
    }
    document.removeEventListener('mousedown', this._hideInteractionMenuHandler);
    this.clickThroughCooldown = 20; // 约 2 秒内不恢复 click-through
  }

  // 菜单键盘导航：↑↓ 选择 / Enter 触发 / Esc 关闭
  private attachMenuKeyboard(menu: HTMLElement, items: HTMLElement[], onClose: () => void): void {
    if (items.length === 0) return;
    let idx = -1;
    const setActive = (i: number) => {
      if (idx >= 0) items[idx]?.classList.remove('is-active');
      idx = (i + items.length) % items.length;
      const el = items[idx];
      el.classList.add('is-active');
      el.scrollIntoView({ block: 'nearest' });
    };
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); setActive(idx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); setActive(idx - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (idx >= 0) items[idx].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      } else if (e.key === 'Escape') {
        e.preventDefault(); onClose();
      }
    });
    // 鼠标移入同步高亮
    items.forEach((el, i) => {
      el.addEventListener('mouseenter', () => setActive(i));
    });
  }

  private cycleSkin(): void {
    const sm = (window as any).__skinManager;
    if (sm) { const n = sm.next(); this.showBubble(`换成了 ${n.icon} ${n.name}！`); }
    else this.showBubble('换肤功能加载中...');
  }

  private showAchievements(): void {
    const all = this.achievements.getAchievements();
    const ul = all.filter(a => a.unlocked);
    const lk = all.filter(a => !a.unlocked);
    let msg = ul.map(a => `${a.icon}${a.name}`).join(' ');
    if (lk.length > 0) msg += ` | 未解锁: ${lk.length}`;
    this.showBubble(msg || '还没有成就哦～');
  }

  private startFocus(): void {
    this.focusTimer = true;
    this.focusEndTime = Date.now() + 25 * 60 * 1000;
    this.showBubble('⏱️ 专注模式开始！25分钟后提醒你～');
    this.physics.stop();
    this.stateMachine.transition('idle');
    this.focusTickTimer = setInterval(() => {
      const r = Math.ceil((this.focusEndTime - Date.now()) / 60000);
      if (r > 0) this.showBubble(`⏱️ 还剩 ${r} 分钟，加油！`);
    }, 5 * 60 * 1000);
    setTimeout(() => {
      if (this.focusTimer) {
        this.stopFocus();
        this.showBubble('🎉 专注完成！休息一下吧～');
        this.stateMachine.transition('happy');
        setTimeout(() => { if (this.stateMachine.state === 'happy') this.stateMachine.transition('idle'); }, 3000);
      }
    }, 25 * 60 * 1000);
  }

  private stopFocus(): void {
    this.focusTimer = false;
    if (this.focusTickTimer) { clearInterval(this.focusTickTimer); this.focusTickTimer = null; }
  }

  // ── 拖拽 ──────────────────────────────────────────────

  private setupDrag(): void {
    let startX = 0, startY = 0, startPosX = 0, startPosY = 0;
    let moved = false, lastMoveTime = 0, lastMoveX = 0, lastMoveY = 0;

    this.container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = false; moved = false;
      startX = e.clientX; startY = e.clientY;
      startPosX = this.physics.pos.x; startPosY = this.physics.pos.y;
      lastMoveX = e.clientX; lastMoveY = e.clientY;
      lastMoveTime = Date.now();
      this.dragVelocity = { vx: 0, vy: 0 };

      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          if (!this.isDragging) {
            this.isDragging = true;
            this.stateMachine.transition('grabbed');
            this.showBubble(this.getRandomMessage('grabbed'));
            this.achievements.recordDrag();
          }
          const now = Date.now(), dt = now - lastMoveTime;
          if (dt > 0) {
            this.dragVelocity.vx = (e.clientX - lastMoveX) / dt * 16;
            this.dragVelocity.vy = (e.clientY - lastMoveY) / dt * 16;
          }
          lastMoveX = e.clientX; lastMoveY = e.clientY; lastMoveTime = now;
          this.physics.setPosition(startPosX + dx, startPosY + dy);
          this.updateContainerPosition();
        }
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (moved || this.isDragging) {
          this.isDragging = false;
          const throwVx = this.dragVelocity.vx * 0.5;
          const throwVy = Math.max(Math.min(this.dragVelocity.vy * 0.5, 5), -8);
          if (Math.abs(throwVx) > 0.5 || throwVy < -1) {
            this.physics.throwUp(throwVx, throwVy);
            this.stateMachine.transition('fall');
          } else {
            const gY = window.innerHeight - this.config.groundOffset - this.config.petSize;
            if (this.physics.pos.y < gY - 5) { this.physics.applyGravity(); this.stateMachine.transition('fall'); }
            else this.stateMachine.transition('idle');
          }
        }
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // ── 右键菜单 ──────────────────────────────────────────

  private setupContextMenu(): void {
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.contextMenu) { this.hideContextMenu(); return; }
      this.showContextMenu(e.clientX, e.clientY);
    });
    document.addEventListener('mousedown', (e) => {
      if (this.contextMenu && !this.contextMenu.contains(e.target as Node)) this.hideContextMenu();
    });
  }

  private showContextMenu(x: number, y: number): void {
    this.hideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.setAttribute('role', 'menu');
    menu.tabIndex = -1;
    menu.style.left = `${x}px`; menu.style.top = `${y}px`;
    menu.addEventListener('mousedown', (e) => e.stopPropagation());

    type Row =
      | { divider: true }
      | { icon: string; label: string; meta?: string; action: () => void };

    const items: Row[] = [
      { icon: this.isVisible ? '🙈' : '👀', label: this.isVisible ? '隐藏小牛' : '显示小牛', action: () => this.toggleVisibility() },
      { icon: '🔄', label: '重新召唤', action: () => this.respawn() },
      { icon: '💤', label: '让牛牛睡觉', action: () => this.forceSleep() },
      { icon: '🍽️', label: '喂牛牛吃草', action: () => this.forceEat() },
      { divider: true },
      { icon: '❌', label: '退出', action: () => this.quit() },
    ];

    const itemEls: HTMLElement[] = [];
    items.forEach(item => {
      if ('divider' in item) {
        const d = document.createElement('div'); d.className = 'context-menu-divider'; menu.appendChild(d);
      } else {
        const el = document.createElement('div');
        el.className = 'context-menu-item';
        el.setAttribute('role', 'menuitem');
        el.tabIndex = -1;
        el.innerHTML =
          `<span class="mi-icon">${item.icon}</span>` +
          `<span class="mi-label">${item.label}</span>` +
          `<span class="mi-meta">${item.meta ?? ''}</span>`;
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.hideContextMenu();
          item.action();
        });
        menu.appendChild(el);
        itemEls.push(el);
      }
    });

    document.body.appendChild(menu);
    // 防越界修正
    const mr = menu.getBoundingClientRect();
    if (mr.right > window.innerWidth) menu.style.left = `${window.innerWidth - mr.width - 5}px`;
    if (mr.bottom > window.innerHeight) menu.style.top = `${window.innerHeight - mr.height - 5}px`;

    this.contextMenu = menu;
    this.attachMenuKeyboard(menu, itemEls, () => this.hideContextMenu());
    // 菜单显示时立即禁用 click-through
    this.isCursorOverPet = true;
    this.toggleCursorEvents(false);
    setTimeout(() => menu.focus(), 0);
  }

  private hideContextMenu(): void {
    if (this.contextMenu) { this.contextMenu.remove(); this.contextMenu = null; }
    this.clickThroughCooldown = 20;
  }

  // ── 光标追踪（轮询，解决 click-through 下 mousemove 不触发的问题）──

  private setupCursorTracking(): void {
    setInterval(async () => {
      try {
        // 冷却倒计时（菜单关闭后延迟恢复 click-through）
        if (this.clickThroughCooldown > 0) {
          this.clickThroughCooldown--;
          // 冷却期间仍然更新光标位置（用于避开逻辑）
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            const [mx, my] = await invoke<[number, number]>('get_cursor_position');
            this.cursorPos = { x: mx, y: my };
          } catch (_) {}
          return;
        }

        const { invoke } = await import('@tauri-apps/api/core');
        const [mx, my] = await invoke<[number, number]>('get_cursor_position');
        this.cursorPos = { x: mx, y: my };

        // 检查光标是否在宠物或菜单上
        const r = this.container.getBoundingClientRect();
        let isOver = mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
        if (!isOver && this.interactionMenu) {
          const mr = this.interactionMenu.getBoundingClientRect();
          isOver = mx >= mr.left && mx <= mr.right && my >= mr.top && my <= mr.bottom;
        }
        if (!isOver && this.contextMenu) {
          const mr = this.contextMenu.getBoundingClientRect();
          isOver = mx >= mr.left && mx <= mr.right && my >= mr.top && my <= mr.bottom;
        }
        if (isOver !== this.isCursorOverPet) {
          this.isCursorOverPet = isOver;
          this.toggleCursorEvents(!isOver);
        }
      } catch (_) {}
    }, 100);
  }

  private async toggleCursorEvents(ignore: boolean): Promise<void> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_ignore_cursor_events', { ignore });
    } catch (_) {}
  }

  // ── 其他操作 ──────────────────────────────────────────

  private toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  // 公共接口：供全局快捷键调用
  toggle(): void {
    this.toggleVisibility();
  }

  private forceSleep(): void {
    this.physics.stop(); this.stateMachine.transition('sleep');
    this.showBubble(this.getRandomMessage('sleep'));
  }

  private forceEat(): void {
    this.physics.stop(); this.stateMachine.transition('eat');
    this.achievements.recordFeed();
    this.showBubble(this.getRandomMessage('eat'));
    setTimeout(() => { if (this.stateMachine.state === 'eat') this.stateMachine.transition('idle'); }, 3000);
  }

  respawn(): void {
    this.isVisible = true; this.container.style.display = 'block';
    this.physics.setPosition(window.innerWidth / 2, window.innerHeight - this.config.groundOffset - this.config.petSize);
    this.physics.setVelocity(0, 0);
    this.physics.adoptSurfaceFromPosition();
    this.applySurfaceRotation();
    this.stateMachine.transition('idle');
    this.updateContainerPosition(); this.showBubble("牛牛回来啦！哞～");
  }

  private quit(): void {
    this.showBubble("再见啦，下次见～");
    setTimeout(() => this.toggleVisibility(), 2000);
  }

  // ── 关怀系统 ──────────────────────────────────────────

  private startCareSystem(): void {
    const schedule = () => {
      this.careTimer = setTimeout(() => {
        this.showBubble(this.getRandomMessage('random')); schedule();
      }, (2 + Math.random() * 3) * 60 * 1000);
    };
    schedule();
    this.workReminderTimer = setInterval(() => this.showBubble(this.getRandomMessage('workReminder')), 45 * 60 * 1000);
    const h = new Date().getHours();
    if (h >= 6 && h < 10) setTimeout(() => this.showBubble(this.getRandomMessage('morning')), 3000);
    else if (h >= 22 || h < 2) setTimeout(() => this.showBubble(this.getRandomMessage('evening')), 3000);
  }

  private showBubble(message: string): void {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleEl.textContent = message;
    this.updateBubblePlacement();
    this.bubbleEl.classList.remove('hidden');
    this.bubbleTimer = setTimeout(() => this.bubbleEl.classList.add('hidden'), this.config.bubbleDuration);
  }

  // 根据小牛所在表面 + 屏幕可用空间，选择气泡方向
  private updateBubblePlacement(): void {
    const p = this.physics.pos;
    const size = this.config.petSize;
    const margin = 16;
    const estW = 240; // 估算最大气泡宽度
    const estH = 80;

    // 候选顺序依据 surface（先让气泡指向小牛的"外侧"以免挡脸）
    let order: Array<'right' | 'left' | 'top' | 'bottom'>;
    switch (this.physics.surface) {
      case 'left':   order = ['right', 'top', 'bottom', 'left']; break;
      case 'right':  order = ['left', 'top', 'bottom', 'right']; break;
      case 'top':    order = ['bottom', 'right', 'left', 'top']; break;
      default:       order = ['right', 'left', 'top', 'bottom']; break;
    }

    const fits: Record<string, boolean> = {
      right:  p.x + size + margin + estW < window.innerWidth,
      left:   p.x - margin - estW > 0,
      top:    p.y - margin - estH > 0,
      bottom: p.y + size + margin + estH < window.innerHeight,
    };

    const placement = order.find(d => fits[d]) || order[0];
    this.bubbleEl.setAttribute('data-placement', placement);
  }

  private getRandomMessage(category: keyof typeof CARE_MESSAGES): string {
    if (category === 'random') {
      const t = getTimeMessages(getTimeState().period);
      const all = [...CARE_MESSAGES.random, ...t];
      return all[Math.floor(Math.random() * all.length)];
    }
    const m = CARE_MESSAGES[category];
    return m[Math.floor(Math.random() * m.length)];
  }

  // ── 游戏循环 ──────────────────────────────────────────

  // 每个状态允许的最长停留时间（ms）；超过后强制回到 idle。
  // 用于兜底自动触发路径（如 idle→eat 漏写退出）和几何分布长尾（sleep 醒来）。
  // 用户主动交互的状态（grabbed）和由物理驱动的状态（fall）不在此列。
  private static readonly MAX_STATE_DURATION: Partial<Record<PetStateType, number>> = {
    eat: 3500,
    sleep: 45000,
    happy: 2200,
    react: 800,
    land: 500,
    'walk-left': 15000,
    'walk-right': 15000,
  };

  private startGameLoop(): void {
    const loop = () => { this.update(); this.animationFrame = requestAnimationFrame(loop); };
    this.animationFrame = requestAnimationFrame(loop);
  }

  // 强制退出超时状态：所有状态的最终兜底
  private enforceStateTimeout(): boolean {
    const s = this.stateMachine.state;
    const cap = Pet.MAX_STATE_DURATION[s];
    if (!cap) return false;
    if (this.stateMachine.stateAge <= cap) return false;
    // 清理物理速度（避免走路状态超时后仍带速度残留）
    if (s === 'walk-left' || s === 'walk-right') this.physics.stop();
    this.stateMachine.transition('idle');
    return true;
  }

  private update(): void {
    if (this.isDragging) return;

    // 所有状态的兜底：超时强制回 idle（放在状态分支前）
    this.enforceStateTimeout();

    const s = this.stateMachine.state;
    switch (s) {
      case 'idle': this.updateIdle(); this.updateAvoidCursor(); break;
      case 'walk-left': case 'walk-right': this.updateWalk(); this.updateAvoidCursor(); break;
      case 'fall': break;
      case 'land': break;
      case 'sleep': this.updateSleep(); break;
      case 'eat': this.updateEat(); break;
      case 'grabbed': return;
    }
    const { hitGround, hitEdge } = this.physics.update();

    // 落地处理
    if (s === 'fall' && hitGround && !this.physics.bouncing) {
      this.physics.adoptSurfaceFromPosition();
      this.applySurfaceRotation();
      this.stateMachine.transition('land');
      setTimeout(() => { if (this.stateMachine.state === 'land') this.stateMachine.transition('idle'); }, 300);
    }

    // 表面切换（走到角落自动转弯）
    if (this.physics.surfaceChanged) {
      this.applySurfaceRotation();
      // 转角时反转方向：底面left→左墙right(上)，底面right→右墙left(上)
      const curDir = s === 'walk-left' ? 'left' : 'right';
      const newDir = curDir === 'left' ? 'right' : 'left';
      this.physics.walk(newDir);
      this.stateMachine.transition(newDir === 'left' ? 'walk-left' : 'walk-right');
    }

    // 边缘反弹（弹跳模式下碰到墙）
    if (hitEdge && this.physics.bouncing) {
      // 弹跳中的边缘碰撞由 physics 处理
    }

    this.updateContainerPosition();
  }

  private updateIdle(): void {
    const t = this.stateMachine.stateAge;
    if (t > this.config.sleepDelay) { this.stateMachine.transition('sleep'); this.showBubble(this.getRandomMessage('sleep')); return; }
    const mx = this.randRange(this.config.idleDuration[0], this.config.idleDuration[1]) * 1000;
    if (t > mx) {
      const r = Math.random();
      if (r < this.config.eatChance) { this.stateMachine.transition('eat'); this.showBubble(this.getRandomMessage('eat')); }
      else if (r < this.config.eatChance + 0.7) { const d = Math.random() < 0.5 ? 'left' : 'right'; this.physics.walk(d); this.stateMachine.transition(d === 'left' ? 'walk-left' : 'walk-right'); }
    }
  }

  private updateWalk(): void {
    const t = this.stateMachine.stateAge;
    const mx = this.randRange(this.config.walkDuration[0], this.config.walkDuration[1]) * 1000;
    if (t > mx || Math.random() < 0.002) { this.physics.stop(); this.stateMachine.transition('idle'); }
    if (Math.random() < 0.005) { const d = this.stateMachine.state === 'walk-left' ? 'right' : 'left'; this.physics.walk(d); this.stateMachine.transition(d === 'left' ? 'walk-left' : 'walk-right'); }
  }

  // 自动触发的 eat：吃到 2.5–3.5s 随机退出（不再永久卡住）
  private updateEat(): void {
    const t = this.stateMachine.stateAge;
    if (t > 2500 && Math.random() < 0.02) {
      this.stateMachine.transition('idle');
    }
  }

  // 睡觉唤醒：提高基础概率，并在 20s+ 加权鼓励醒来（仍保留自然的随机感）
  // 叠加全局兜底 45s 强制醒
  private updateSleep(): void {
    const t = this.stateMachine.stateAge;
    const base = 0.0015;                               // ~11s 平均
    const bonus = t > 20000 ? (t - 20000) / 15_000_000 : 0; // 20s 后线性增加
    if (Math.random() < base + bonus) {
      this.stateMachine.transition('idle');
      this.showBubble("哞～牛牛睡醒了！");
    }
  }

  private updateAvoidCursor(): void {
    if (this.avoidCooldown > 0) { this.avoidCooldown--; return; }
    if (this.cursorPos.x < -9000) return;
    const p = this.physics.pos;
    const cx = p.x + this.config.petSize / 2, cy = p.y + this.config.petSize / 2;
    const dx = cx - this.cursorPos.x, dy = cy - this.cursorPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100 && dist > 0) {
      const dir = dx > 0 ? 'right' : 'left';
      this.physics.walk(dir);
      this.stateMachine.transition(dir === 'left' ? 'walk-left' : 'walk-right');
      this.avoidCooldown = 20;
    }
  }

  private applySurfaceRotation(): void {
    const surface = this.physics.surface;
    let rotation = 0;
    switch (surface) {
      case 'bottom': rotation = 0; break;
      case 'left': rotation = 90; break;
      case 'top': rotation = 180; break;
      case 'right': rotation = -90; break;
    }
    this.spriteEl.style.transform = `rotate(${rotation}deg)`;
    this.weatherOverlay.updateAccessoryPosition(surface);
  }

  private updateContainerPosition(): void {
    const p = this.physics.pos;
    this.container.style.transform = `translate(${p.x}px, ${p.y}px)`;
    this.container.style.position = 'fixed';
    this.container.style.left = '0'; this.container.style.top = '0';
  }

  private randRange(min: number, max: number): number { return min + Math.random() * (max - min); }

  getScreenTimeFatigue(): string {
    return this.screenTime.getFatigueLevel();
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrame);
    if (this.careTimer) clearTimeout(this.careTimer);
    if (this.workReminderTimer) clearInterval(this.workReminderTimer);
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.hideContextMenu();
    this.hideInteractionMenu();
    this.achievements.destroy();
    this.screenTime.destroy();
    this.weather.destroy();
    this.weatherOverlay.destroy();
  }
}
