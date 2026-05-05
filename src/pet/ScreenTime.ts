// Screen time tracking — persists daily usage in localStorage

const STORAGE_KEY = 'desktop-pet-screen-time';
const WARNING_THRESHOLDS = [30, 60, 120, 180, 240]; // 分钟

interface ScreenTimeData {
  date: string;        // YYYY-MM-DD
  totalMinutes: number;
  lastStart: number;   // timestamp
  lastActive: number;  // timestamp of last activity
}

export class ScreenTimeTracker {
  private data: ScreenTimeData;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private lastActivityCheck: number = Date.now();
  private onMilestone: ((minutes: number, message: string) => void) | null = null;
  private warnedMinutes: Set<number> = new Set();

  constructor() {
    this.data = this.load();
    this.checkDateRollover();
    this.data.lastStart = Date.now();
    this.data.lastActive = Date.now();
    this.save();

    // 每分钟更新一次
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 60 * 1000);

    // 检测用户是否真的在用电脑（鼠标/键盘活动）
    this.setupActivityDetection();
  }

  setOnMilestone(cb: (minutes: number, message: string) => void): void {
    this.onMilestone = cb;
  }

  getTodayMinutes(): number {
    return this.data.totalMinutes;
  }

  getFormattedTime(): string {
    const m = this.data.totalMinutes;
    if (m < 60) return `${m} 分钟`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h} 小时 ${r} 分钟` : `${h} 小时`;
  }

  getFatigueLevel(): 'fresh' | 'normal' | 'tired' | 'exhausted' {
    const m = this.data.totalMinutes;
    if (m < 60) return 'fresh';
    if (m < 120) return 'normal';
    if (m < 240) return 'tired';
    return 'exhausted';
  }

  getTimeMessage(): string {
    const m = this.data.totalMinutes;
    const t = this.getFormattedTime();
    if (m < 30) return `才用了 ${t}，继续加油！`;
    if (m < 60) return `已经 ${t} 啦～`;
    if (m < 120) return `用了 ${t}，该休息一下了～`;
    if (m < 180) return `已经 ${t}！眼睛需要休息！`;
    if (m < 240) return `⚠️ ${t} 了！必须休息！`;
    return `🚨 ${t}！牛牛强烈要求你休息！`;
  }

  private tick(): void {
    // 检查是否在 30 秒内有活动
    const idle = Date.now() - this.lastActivityCheck;
    if (idle < 60 * 1000) {
      // 用户在活动，累计时间
      this.data.totalMinutes++;
      this.data.lastActive = Date.now();
      this.checkMilestones();
      this.save();
    }
  }

  private checkMilestones(): void {
    const m = this.data.totalMinutes;
    for (const threshold of WARNING_THRESHOLDS) {
      if (m >= threshold && !this.warnedMinutes.has(threshold)) {
        this.warnedMinutes.add(threshold);
        if (this.onMilestone) {
          this.onMilestone(threshold, this.getTimeMessage());
        }
      }
    }
  }

  private setupActivityDetection(): void {
    const mark = () => { this.lastActivityCheck = Date.now(); };
    // 监听鼠标和键盘活动
    document.addEventListener('mousemove', mark, { passive: true });
    document.addEventListener('mousedown', mark, { passive: true });
    document.addEventListener('keydown', mark, { passive: true });
    document.addEventListener('scroll', mark, { passive: true });
  }

  private checkDateRollover(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.data.date !== today) {
      this.data.totalMinutes = 0;
      this.data.date = today;
      this.warnedMinutes.clear();
    }
  }

  private load(): ScreenTimeData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        // 检查是否跨天
        const today = new Date().toISOString().slice(0, 10);
        if (d.date === today) return d;
      }
    } catch {}
    return {
      date: new Date().toISOString().slice(0, 10),
      totalMinutes: 0,
      lastStart: Date.now(),
      lastActive: Date.now(),
    };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {}
  }

  destroy(): void {
    if (this.tickInterval) clearInterval(this.tickInterval);
  }
}
