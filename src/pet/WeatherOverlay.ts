// Weather overlay — particle system for rain/snow effects
import { WeatherType } from './Weather';
import { createUmbrellaSVG, createSunSVG } from './WeatherSprite';
import { Surface } from './Physics';

export class WeatherOverlay {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private accessoryEl: HTMLElement | null = null;
  private particles: Array<{ x: number; y: number; speed: number; size: number; opacity: number }> = [];
  private currentType: WeatherType = 'unknown';
  private animFrame: number = 0;
  private isActive: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // 创建 canvas 用于粒子渲染（全屏，不跟随小牛）
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
    this.ctx = this.canvas.getContext('2d')!;
    document.body.appendChild(this.canvas);

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setWeather(type: WeatherType): void {
    this.currentType = type;
    this.clearAccessory();

    if (type === 'rainy' || type === 'snowy') {
      this.showAccessory(type);
      this.startParticles(type);
    } else {
      this.stopParticles();
      if (type === 'sunny') {
        this.showAccessory('sunny');
      }
    }
  }

  // 根据小牛当前所在表面，更新天气配件的偏移方向
  // 天气配件放在 container 内用 absolute 定位，不跟随 spriteEl 旋转
  // 根据 surface 动态调整偏移，保证配件始终在屏幕内侧
  updateAccessoryPosition(surface: Surface): void {
    if (!this.accessoryEl) return;

    const isSunny = this.currentType === 'sunny';
    const w = isSunny ? 32 : 48;
    const h = isSunny ? 32 : 40;

    // 每个表面的配件位置策略：
    // - 太阳：始终放在小牛的"内侧"（远离屏幕边缘的一侧）
    // - 雨伞：始终放在小牛的"头顶"（远离屏幕边缘的方向）
    let css = '';

    switch (surface) {
      case 'bottom':
        if (isSunny) {
          // 太阳在右上角
          css = 'top:-20px;right:-8px;';
        } else {
          // 雨伞在头顶
          css = `top:${-h + 8}px;left:50%;transform:translateX(-50%);`;
        }
        break;
      case 'left':
        if (isSunny) {
          // 太阳在小牛右侧（屏幕内侧）
          css = 'top:50%;right:-24px;transform:translateY(-50%);';
        } else {
          // 雨伞在小牛右侧（屏幕内侧）
          css = `top:50%;right:${-w + 8}px;transform:translateY(-50%);`;
        }
        break;
      case 'top':
        if (isSunny) {
          // 太阳在左下角
          css = 'bottom:-20px;left:-8px;';
        } else {
          // 雨伞在小牛下方（屏幕内侧）
          css = `bottom:${-h + 8}px;left:50%;transform:translateX(-50%);`;
        }
        break;
      case 'right':
        if (isSunny) {
          // 太阳在小牛左侧（屏幕内侧）
          css = 'top:50%;left:-24px;transform:translateY(-50%);';
        } else {
          // 雨伞在小牛左侧（屏幕内侧）
          css = `top:50%;left:${-w + 8}px;transform:translateY(-50%);`;
        }
        break;
    }

    this.accessoryEl.style.cssText += css;
  }

  private showAccessory(type: WeatherType): void {
    this.clearAccessory();
    const el = document.createElement('div');
    el.className = 'weather-accessory';

    // 天气配件放在 container 内用 absolute 定位
    // 不放在 spriteEl 内，所以不受 sprite 旋转影响
    // 偏移方向由 updateAccessoryPosition 根据 surface 动态设置
    if (type === 'rainy') {
      el.innerHTML = createUmbrellaSVG();
      el.style.cssText = 'position:absolute;width:48px;height:40px;pointer-events:none;z-index:5;image-rendering:pixelated;';
    } else if (type === 'snowy') {
      el.innerHTML = createUmbrellaSVG();
      el.style.cssText = 'position:absolute;width:48px;height:40px;pointer-events:none;z-index:5;image-rendering:pixelated;opacity:0.8;';
    } else if (type === 'sunny') {
      el.innerHTML = createSunSVG();
      el.style.cssText = 'position:absolute;width:32px;height:32px;pointer-events:none;z-index:5;image-rendering:pixelated;opacity:0.9;animation:sunPulse 2s ease-in-out infinite;';
    }

    this.container.appendChild(el);
    this.accessoryEl = el;
  }

  private clearAccessory(): void {
    if (this.accessoryEl) {
      this.accessoryEl.remove();
      this.accessoryEl = null;
    }
  }

  private startParticles(type: WeatherType): void {
    this.stopParticles();
    this.isActive = true;
    this.particles = [];

    const count = type === 'rainy' ? 40 : 25;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: type === 'rainy' ? 8 + Math.random() * 6 : 1 + Math.random() * 2,
        size: type === 'rainy' ? 2 : 3 + Math.random() * 3,
        opacity: type === 'rainy' ? 0.4 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5,
      });
    }

    const loop = () => {
      if (!this.isActive) return;
      this.renderParticles(type);
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  private stopParticles(): void {
    this.isActive = false;
    cancelAnimationFrame(this.animFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderParticles(type: WeatherType): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.globalAlpha = p.opacity;

      if (type === 'rainy') {
        this.ctx.strokeStyle = '#6B8FB5';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - 1, p.y + p.size * 4);
        this.ctx.stroke();

        p.y += p.speed;
        p.x -= 0.5;
        if (p.y > this.canvas.height) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }
      } else {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speed;
        p.x += Math.sin(p.y * 0.02) * 0.5;
        if (p.y > this.canvas.height) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }
      }
    }
    this.ctx.globalAlpha = 1;
  }

  destroy(): void {
    this.stopParticles();
    this.clearAccessory();
    this.canvas.remove();
  }
}
