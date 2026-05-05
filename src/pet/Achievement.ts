// Achievement system — track companion time and interactions
// Persisted in localStorage

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'time' | 'interactions' | 'feeds' | 'drags';
  unlocked: boolean;
}

interface Stats {
  totalSeconds: number;
  interactions: number;
  feeds: number;
  drags: number;
  sessionStart: number;
}

const STORAGE_KEY = 'desktop-pet-achievements';
const STATS_KEY = 'desktop-pet-stats';

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first-meet', name: '初次见面', description: '陪伴小牛 1 分钟', icon: '🤝', requirement: 60, type: 'time' },
  { id: 'good-friend', name: '好朋友', description: '陪伴小牛 10 分钟', icon: '💛', requirement: 600, type: 'time' },
  { id: 'best-pal', name: '挚友', description: '陪伴小牛 1 小时', icon: '❤️', requirement: 3600, type: 'time' },
  { id: 'soulmate', name: '灵魂伴侣', description: '陪伴小牛 5 小时', icon: '💜', requirement: 18000, type: 'time' },
  { id: 'pet-lover', name: '摸头达人', description: '互动 50 次', icon: '🤚', requirement: 50, type: 'interactions' },
  { id: 'chef', name: '美食家', description: '喂食 10 次', icon: '🍽️', requirement: 10, type: 'feeds' },
  { id: 'yeet', name: '起飞！', description: '拖拽 20 次', icon: '🚀', requirement: 20, type: 'drags' },
];

export class AchievementManager {
  private stats: Stats;
  private unlockedIds: Set<string>;
  private timeInterval: ReturnType<typeof setInterval> | null = null;
  private onUnlock: ((achievement: Achievement) => void) | null = null;

  constructor() {
    this.stats = this.loadStats();
    this.unlockedIds = new Set(this.loadUnlocked());
    this.stats.sessionStart = Date.now();

    // Tick companion time every second
    this.timeInterval = setInterval(() => {
      this.stats.totalSeconds++;
      this.checkAchievements();
      // Save every 30 seconds
      if (this.stats.totalSeconds % 30 === 0) {
        this.save();
      }
    }, 1000);
  }

  setOnUnlock(cb: (achievement: Achievement) => void): void {
    this.onUnlock = cb;
  }

  recordInteraction(): void {
    this.stats.interactions++;
    this.checkAchievements();
  }

  recordFeed(): void {
    this.stats.feeds++;
    this.checkAchievements();
  }

  recordDrag(): void {
    this.stats.drags++;
    this.checkAchievements();
  }

  getAchievements(): Achievement[] {
    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlocked: this.unlockedIds.has(def.id),
    }));
  }

  getStats(): Stats {
    return { ...this.stats };
  }

  getUnlockedCount(): number {
    return this.unlockedIds.size;
  }

  getTotalCount(): number {
    return ACHIEVEMENT_DEFS.length;
  }

  private checkAchievements(): void {
    for (const def of ACHIEVEMENT_DEFS) {
      if (this.unlockedIds.has(def.id)) continue;

      let value = 0;
      switch (def.type) {
        case 'time': value = this.stats.totalSeconds; break;
        case 'interactions': value = this.stats.interactions; break;
        case 'feeds': value = this.stats.feeds; break;
        case 'drags': value = this.stats.drags; break;
      }

      if (value >= def.requirement) {
        this.unlockedIds.add(def.id);
        const achievement: Achievement = { ...def, unlocked: true };
        this.save();
        if (this.onUnlock) {
          this.onUnlock(achievement);
        }
      }
    }
  }

  private loadStats(): Stats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return { totalSeconds: 0, interactions: 0, feeds: 0, drags: 0, sessionStart: Date.now() };
  }

  private loadUnlocked(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }

  private save(): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.unlockedIds]));
    } catch {}
  }

  destroy(): void {
    this.save();
    if (this.timeInterval) clearInterval(this.timeInterval);
  }
}
