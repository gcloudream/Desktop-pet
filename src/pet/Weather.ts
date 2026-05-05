// Weather API — wttr.in (free, no API key needed)
// Caches weather data in localStorage, refreshes every 30 minutes

const STORAGE_KEY = 'desktop-pet-weather';
const CACHE_DURATION = 30 * 60 * 1000; // 30 分钟

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';

export interface WeatherData {
  type: WeatherType;
  temp: number;       // 摄氏度
  desc: string;       // 描述文字
  timestamp: number;
}

// wttr.in 天气码 → 类型映射
const WEATHER_CODE_MAP: Record<number, WeatherType> = {
  113: 'sunny',
  116: 'cloudy', 119: 'cloudy', 122: 'cloudy',
  176: 'rainy', 263: 'rainy', 266: 'rainy', 293: 'rainy',
  296: 'rainy', 299: 'rainy', 302: 'rainy', 305: 'rainy',
  308: 'rainy', 311: 'rainy', 314: 'rainy', 353: 'rainy',
  356: 'rainy', 359: 'rainy',
  179: 'snowy', 182: 'snowy', 185: 'snowy', 227: 'snowy',
  230: 'snowy', 260: 'snowy', 320: 'snowy', 323: 'snowy',
  326: 'snowy', 329: 'snowy', 332: 'snowy', 335: 'snowy',
  338: 'snowy', 350: 'snowy', 362: 'snowy', 365: 'snowy',
  368: 'snowy', 371: 'snowy', 374: 'snowy', 377: 'snowy',
  386: 'rainy', 389: 'rainy', 392: 'snowy', 395: 'snowy',
};

const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: '☀️ 晴天',
  cloudy: '☁️ 阴天',
  rainy: '🌧️ 雨天',
  snowy: '❄️ 下雪',
  unknown: '🌍',
};

export class WeatherManager {
  private data: WeatherData | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private onUpdate: ((data: WeatherData) => void) | null = null;

  constructor() {
    this.data = this.loadCache();
    // 启动时如果缓存过期，立即刷新
    if (!this.data || Date.now() - this.data.timestamp > CACHE_DURATION) {
      this.refresh();
    }
    // 每 30 分钟刷新一次
    this.refreshInterval = setInterval(() => this.refresh(), CACHE_DURATION);
  }

  setOnUpdate(cb: (data: WeatherData) => void): void {
    this.onUpdate = cb;
    // 如果已有缓存数据，立即回调
    if (this.data) cb(this.data);
  }

  get current(): WeatherData | null {
    return this.data;
  }

  get type(): WeatherType {
    return this.data?.type || 'unknown';
  }

  get label(): string {
    return WEATHER_LABELS[this.type];
  }

  get temp(): number {
    return this.data?.temp || 0;
  }

  isRaining(): boolean {
    return this.type === 'rainy';
  }

  isSnowing(): boolean {
    return this.type === 'snowy';
  }

  needUmbrella(): boolean {
    return this.type === 'rainy' || this.type === 'snowy';
  }

  private async refresh(): Promise<void> {
    // 夜间不请求（22:00-6:00）
    const hour = new Date().getHours();
    if ((hour >= 22 || hour < 6) && this.data) return;

    try {
      const res = await fetch('https://wttr.in/?format=j1');
      if (!res.ok) return;
      const json = await res.json();

      const current = json.current_condition?.[0];
      if (!current) return;

      const code = parseInt(current.weatherCode, 10);
      const type = WEATHER_CODE_MAP[code] || 'unknown';
      const temp = parseInt(current.temp_C, 10);
      const desc = current.weatherDesc?.[0]?.value || '';

      this.data = { type, temp, desc, timestamp: Date.now() };
      this.saveCache();
      if (this.onUpdate) this.onUpdate(this.data);
    } catch (e) {
      console.log('Weather fetch failed:', e);
    }
  }

  private loadCache(): WeatherData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Date.now() - d.timestamp < CACHE_DURATION * 2) return d;
      }
    } catch {}
    return null;
  }

  private saveCache(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {}
  }

  destroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
}
