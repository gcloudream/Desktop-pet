import { PetConfig } from './Config';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export class Physics {
  private position: Position;
  private velocity: Velocity;
  private config: PetConfig;
  private screenWidth: number;
  private screenHeight: number;
  private isGrounded: boolean = false;

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

  get pos(): Position {
    return { ...this.position };
  }

  get grounded(): boolean {
    return this.isGrounded;
  }

  get atLeftEdge(): boolean {
    return this.position.x <= 0;
  }

  get atRightEdge(): boolean {
    return this.position.x >= this.screenWidth - this.config.petSize;
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.clampPosition();
  }

  setVelocity(vx: number, vy: number): void {
    this.velocity.vx = vx;
    this.velocity.vy = vy;
  }

  walk(direction: 'left' | 'right'): void {
    this.velocity.vx = direction === 'left' ? -this.config.walkSpeed : this.config.walkSpeed;
    this.isGrounded = true;
  }

  stop(): void {
    this.velocity.vx = 0;
  }

  applyGravity(): void {
    this.velocity.vy += this.config.gravity;
    this.isGrounded = false;
  }

  update(): { hitGround: boolean; hitEdge: 'left' | 'right' | null } {
    let hitGround = false;
    let hitEdge: 'left' | 'right' | null = null;

    // Apply velocity
    this.position.x += this.velocity.vx;
    this.position.y += this.velocity.vy;

    // Ground collision
    const groundY = this.screenHeight - this.config.groundOffset - this.config.petSize;
    if (this.position.y >= groundY) {
      this.position.y = groundY;
      this.velocity.vy = 0;
      if (!this.isGrounded) {
        hitGround = true;
      }
      this.isGrounded = true;
    }

    // Edge collision
    if (this.position.x <= 0) {
      this.position.x = 0;
      this.velocity.vx = 0;
      hitEdge = 'left';
    } else if (this.position.x >= this.screenWidth - this.config.petSize) {
      this.position.x = this.screenWidth - this.config.petSize;
      this.velocity.vx = 0;
      hitEdge = 'right';
    }

    return { hitGround, hitEdge };
  }

  private clampPosition(): void {
    this.position.x = Math.max(0, Math.min(this.position.x, this.screenWidth - this.config.petSize));
    const groundY = this.screenHeight - this.config.groundOffset - this.config.petSize;
    if (this.position.y > groundY) {
      this.position.y = groundY;
    }
  }

  isOffScreen(): boolean {
    return this.position.y > this.screenHeight;
  }
}
