import { Pet } from './pet/Pet';
import { SkinManager } from './pet/SkinManager';
import { CowFrame } from './pet/CowSprite';
import { getTimeState } from './pet/TimeAwareness';

// Global skin manager
const skinManager = new SkinManager();
(window as any).__skinManager = skinManager;

// Time awareness
const timeState = getTimeState();
(window as any).__timeState = timeState;
console.log(`⏰ 当前时段: ${timeState.period} (${timeState.hour}:00) — ${timeState.mood}`);

// 每个状态对应的帧序列 + 播放速率（fps）
// 帧调度统一由 requestAnimationFrame 驱动，避免多个 setInterval 竞态
type FrameSet = { frames: CowFrame[]; fps: number };

const FRAME_MAP: Record<string, FrameSet> = {
  idle:        { frames: ['idle1', 'idle2'],        fps: 1.25 }, // ~800ms 切
  'walk-left': { frames: ['walk1', 'walk2'],        fps: 3.3  }, // ~300ms
  'walk-right':{ frames: ['walk1', 'walk2'],        fps: 3.3  },
  fall:        { frames: ['fall'],                   fps: 5    },
  grabbed:     { frames: ['grabbed'],                fps: 6    },
  land:        { frames: ['idle1'],                  fps: 1    },
  sleep:       { frames: ['sleep', 'idle2', 'sleep'],fps: 0.4  }, // ~2.5s
  eat:         { frames: ['eat', 'idle1'],           fps: 4    },
  happy:       { frames: ['happy', 'react'],         fps: 5    },
  react:       { frames: ['react'],                  fps: 2    },
};

function getFrameSetFromClassName(className: string): { state: string; set: FrameSet } {
  // 优先级：grabbed > fall > happy > eat > sleep > react > land > walk-* > idle
  const priorities: Array<keyof typeof FRAME_MAP> = [
    'grabbed', 'fall', 'happy', 'eat', 'sleep', 'react', 'land',
    'walk-left', 'walk-right', 'idle',
  ];
  for (const s of priorities) {
    if (className.includes(s)) return { state: s, set: FRAME_MAP[s] };
  }
  return { state: 'idle', set: FRAME_MAP.idle };
}

function initSprite(): void {
  const petEl = document.querySelector('.pet') as HTMLElement;
  if (!petEl) return;

  const svgContainer = document.createElement('div');
  svgContainer.className = 'cow-sprite';
  svgContainer.style.position = 'relative';
  svgContainer.innerHTML = skinManager.render('idle1');
  petEl.appendChild(svgContainer);

  // 时段配件（夜间睡帽等）
  if (timeState.accessory) {
    const accessoryEl = document.createElement('div');
    accessoryEl.innerHTML = timeState.accessory;
    accessoryEl.style.position = 'absolute';
    accessoryEl.style.top = '0';
    accessoryEl.style.left = '0';
    accessoryEl.style.pointerEvents = 'none';
    svgContainer.appendChild(accessoryEl.firstChild as Node);
  }

  // 渲染缓存：相同 (skinId, frame, fatigue) 只生成一次字符串
  let cacheKey = '';
  let cachedSVG = '';
  const renderFrame = (frame: CowFrame) => {
    const pet = (window as any).__pet;
    const fatigue = pet?.getScreenTimeFatigue?.() || 'normal';
    const skinId = skinManager.currentId;
    const key = `${skinId}:${frame}:${fatigue}`;
    if (key !== cacheKey) {
      cacheKey = key;
      cachedSVG = skinManager.render(frame, fatigue);
      svgContainer.innerHTML = cachedSVG;
    }
  };

  // 跟帧驱动：每帧计算当前状态应显示哪个帧，只在变化时写 DOM
  let lastFrame: CowFrame | null = null;
  let stateStartTime = performance.now();
  let prevState = '';

  const tick = (now: number) => {
    const className = petEl.className;
    const { state, set } = getFrameSetFromClassName(className);

    if (state !== prevState) {
      prevState = state;
      stateStartTime = now;
      lastFrame = null; // 强制重渲
    }

    const age = now - stateStartTime;
    const i = Math.floor((age / 1000) * set.fps) % set.frames.length;
    const frame = set.frames[i];
    if (frame !== lastFrame) {
      lastFrame = frame;
      renderFrame(frame);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initSprite();

  const container = document.getElementById('pet-container')!;
  const pet = new Pet(container);

  // Make pet accessible for debugging
  (window as any).__pet = pet;

  // 全局快捷键：Esc 关闭菜单（交给 Pet 内部），Cmd/Ctrl+H 隐藏/显示
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      pet.toggle();
    }
  });

  console.log('🐮 桌面宠物已启动！');
});
