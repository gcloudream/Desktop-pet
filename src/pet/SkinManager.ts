// Skin manager — register and switch between pet skins
import { CowFrame, FatigueLevel, createCowSVG } from './CowSprite';
import { createCatSVG } from './CatSprite';
import { createDogSVG } from './DogSprite';

export interface Skin {
  id: string;
  name: string;
  icon: string;
  render: (frame: CowFrame, fatigue?: FatigueLevel) => string;
}

const BUILTIN_SKINS: Skin[] = [
  { id: 'cow', name: '小牛', icon: '🐄', render: createCowSVG },
  { id: 'cat', name: '小猫', icon: '🐱', render: createCatSVG },
  { id: 'dog', name: '小狗', icon: '🐶', render: createDogSVG },
];

export class SkinManager {
  private skins: Skin[] = [...BUILTIN_SKINS];
  private currentIndex: number = 0;

  get current(): Skin {
    return this.skins[this.currentIndex];
  }

  get all(): Skin[] {
    return [...this.skins];
  }

  get currentId(): string {
    return this.current.id;
  }

  setById(id: string): boolean {
    const idx = this.skins.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.currentIndex = idx;
      return true;
    }
    return false;
  }

  next(): Skin {
    this.currentIndex = (this.currentIndex + 1) % this.skins.length;
    return this.current;
  }

  render(frame: CowFrame, fatigue?: FatigueLevel): string {
    return this.current.render(frame, fatigue);
  }
}
