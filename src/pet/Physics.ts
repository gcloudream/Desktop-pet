import { PetConfig } from './Config';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export type Surface = 'bottom' | 'left' | 'right' | 'top';

export class Physics {
  private position: Position;
  private velocity: Velocity;
  private config: PetConfig;
  private screenWidth: number;
  private screenHeight: number;
  private isGrounded: boolean = false;
  private bounceCount: number = 0;
  private isInBounce: boolean = false;
  private _surface: Surface = 'bottom';
  private _surfaceChanged: boolean = false;

  constructor(config: PetConfig) {
    this.config = config;
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.position = {
      x: this.screenWidth / 2,
      y: this.screenHeight - config.groundOffset - config.petSize,
    };
    this.velocity = { vx: 0, vy: 0 };

    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this.clampPosition();
    });
  }

  get pos(): Position { return { ...this.position }; }
  get grounded(): boolean { return this.isGrounded; }
  get bouncing(): boolean { return this.isInBounce; }
  get surface(): Surface { return this._surface; }
  get surfaceChanged(): boolean { return this._surfaceChanged; }

  get atLeftEdge(): boolean { return this.position.x <= 0; }
  get atRightEdge(): boolean { return this.position.x >= this.screenWidth - this.config.petSize; }
  get atTopEdge(): boolean { return this.position.y <= 0; }
  get atBottomEdge(): boolean { return this.position.y >= this.screenHeight - this.config.groundOffset - this.config.petSize; }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.clampPosition();
  }

  setVelocity(vx: number, vy: number): void {
    this.velocity.vx = vx;
    this.velocity.vy = vy;
  }

  // direction: 'left' | 'right' 相对于当前表面的前进方向
  walk(direction: 'left' | 'right'): void {
    const speed = this.config.walkSpeed;
    const forward = direction === 'right' ? 1 : -1;
    this.isGrounded = true;
    this.isInBounce = false;

    switch (this._surface) {
      case 'bottom':
        this.velocity.vx = speed * forward;
        this.velocity.vy = 0;
        break;
      case 'top':
        this.velocity.vx = -speed * forward; // 顶部方向相反
        this.velocity.vy = 0;
        break;
      case 'left':
        this.velocity.vx = 0;
        this.velocity.vy = -speed * forward; // 左墙：right=上, left=下
        break;
      case 'right':
        this.velocity.vx = 0;
        this.velocity.vy = speed * forward; // 右墙：right=下, left=上
        break;
    }
  }

  stop(): void {
    this.velocity.vx = 0;
    this.velocity.vy = 0;
    this.isInBounce = false;
  }

  applyGravity(): void {
    this.velocity.vy += this.config.gravity;
    this.isGrounded = false;
  }

  throwUp(vx: number, vy: number): void {
    this.velocity.vx = vx;
    this.velocity.vy = vy;
    this.isGrounded = false;
    this.bounceCount = 0;
    this.isInBounce = true;
  }

  update(): { hitGround: boolean; hitEdge: 'left' | 'right' | null } {
    let hitGround = false;
    let hitEdge: 'left' | 'right' | null = null;
    this._surfaceChanged = false;

    // 弹跳重力
    if (this.isInBounce) {
      this.velocity.vy += this.config.gravity;
    }

    // 应用速度
    this.position.x += this.velocity.vx;
    this.position.y += this.velocity.vy;

    const ps = this.config.petSize;
    const groundY = this.screenHeight - this.config.groundOffset - ps;

    // ── 边界碰撞 + 表面切换 ──

    // 底部
    if (this.position.y >= groundY) {
      this.position.y = groundY;
      if (!this.isGrounded) hitGround = true;
      if (this.isInBounce && this.velocity.vy > 1.5 && this.bounceCount < 2) {
        this.velocity.vy = -this.velocity.vy * 0.25;
        this.velocity.vx *= 0.5;
        this.bounceCount++;
      } else if (this.isInBounce) {
        this.velocity.vy = 0;
        this.bounceCount = 0;
        this.isInBounce = false;
      } else {
        this.velocity.vy = 0;
      }
      this.isGrounded = true;
      if (this._surface !== 'bottom' && !this.isInBounce) {
        this.switchSurface('bottom');
      }
    }

    // 顶部
    if (this.position.y <= 0) {
      this.position.y = 0;
      if (this.isInBounce) {
        this.velocity.vy = Math.abs(this.velocity.vy) * 0.3;
      } else {
        this.velocity.vy = 0;
        this.isGrounded = true;
        if (this._surface !== 'top') {
          this.switchSurface('top');
        }
      }
    }

    // 左边
    if (this.position.x <= 0) {
      this.position.x = 0;
      if (this.isInBounce) {
        this.velocity.vx = Math.abs(this.velocity.vx) * 0.3;
        hitEdge = 'left';
      } else {
        this.velocity.vx = 0;
        this.isGrounded = true;
        if (this._surface !== 'left') {
          this.switchSurface('left');
        }
        hitEdge = 'left';
      }
    }

    // 右边
    if (this.position.x >= this.screenWidth - ps) {
      this.position.x = this.screenWidth - ps;
      if (this.isInBounce) {
        this.velocity.vx = -Math.abs(this.velocity.vx) * 0.3;
        hitEdge = 'right';
      } else {
        this.velocity.vx = 0;
        this.isGrounded = true;
        if (this._surface !== 'right') {
          this.switchSurface('right');
        }
        hitEdge = 'right';
      }
    }

    return { hitGround, hitEdge };
  }

  private switchSurface(newSurface: Surface): void {
    this._surface = newSurface;
    this._surfaceChanged = true;
    this.velocity.vx = 0;
    this.velocity.vy = 0;
  }

  // 落地后根据位置自动判断表面
  adoptSurfaceFromPosition(): void {
    const ps = this.config.petSize;
    const groundY = this.screenHeight - this.config.groundOffset - ps;
    const atBottom = this.position.y >= groundY - 2;
    const atTop = this.position.y <= 2;
    const atLeft = this.position.x <= 2;
    const atRight = this.position.x >= this.screenWidth - ps - 2;

    if (atBottom) this.switchSurface('bottom');
    else if (atTop) this.switchSurface('top');
    else if (atLeft) this.switchSurface('left');
    else if (atRight) this.switchSurface('right');
  }

  private clampPosition(): void {
    const ps = this.config.petSize;
    this.position.x = Math.max(0, Math.min(this.position.x, this.screenWidth - ps));
    const groundY = this.screenHeight - this.config.groundOffset - ps;
    this.position.y = Math.max(0, Math.min(this.position.y, groundY));
  }

  isOffScreen(): boolean {
    return this.position.y > this.screenHeight;
  }
}
