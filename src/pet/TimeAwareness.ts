// Time-based awareness — adds visual decorations and behavior based on time of day

export type TimePeriod = 'morning' | 'daytime' | 'evening' | 'night';

export interface TimeState {
  period: TimePeriod;
  hour: number;
  accessory: string | null;  // SVG overlay accessory
  mood: string;
}

export function getTimeState(): TimeState {
  const hour = new Date().getHours();

  let period: TimePeriod;
  if (hour >= 6 && hour < 10) period = 'morning';
  else if (hour >= 10 && hour < 18) period = 'daytime';
  else if (hour >= 18 && hour < 22) period = 'evening';
  else period = 'night';

  let accessory: string | null = null;
  let mood = '';

  switch (period) {
    case 'morning':
      mood = '精力充沛';
      break;
    case 'daytime':
      mood = '开心陪伴';
      break;
    case 'evening':
      mood = '有点困了';
      accessory = createNightCapSVG();
      break;
    case 'night':
      mood = '想睡觉了';
      accessory = createNightCapSVG();
      break;
  }

  return { period, hour, accessory, mood };
}

function createNightCapSVG(): string {
  // Pixel night cap — small triangle on top of head
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 20" shape-rendering="crispEdges" style="position:absolute;top:-16px;left:8px;width:40px;height:20px;">
    <rect x="16" y="0" width="4" height="4" fill="#4169E1"/>
    <rect x="12" y="4" width="4" height="4" fill="#4169E1"/>
    <rect x="16" y="4" width="4" height="4" fill="#4169E1"/>
    <rect x="20" y="4" width="4" height="4" fill="#4169E1"/>
    <rect x="8" y="8" width="4" height="4" fill="#4169E1"/>
    <rect x="12" y="8" width="4" height="4" fill="#4169E1"/>
    <rect x="16" y="8" width="4" height="4" fill="#4169E1"/>
    <rect x="20" y="8" width="4" height="4" fill="#4169E1"/>
    <rect x="24" y="8" width="4" height="4" fill="#4169E1"/>
    <rect x="8" y="12" width="24" height="4" fill="#4169E1"/>
    <rect x="8" y="16" width="24" height="4" fill="#FFD700"/>
    <rect x="16" y="0" width="4" height="4" fill="#FFFACD"/>
  </svg>`;
}

export function getTimeMessages(period: TimePeriod): string[] {
  switch (period) {
    case 'morning':
      return [
        '早安！新的一天开始啦～',
        '哞～早上好！',
        '今天也要加油哦！',
      ];
    case 'daytime':
      return [
        '今天辛苦啦～',
        '要不要休息一下？',
        '牛牛陪着你呢～',
      ];
    case 'evening':
      return [
        '天黑了，该休息了～',
        '晚上好～别太累',
        '牛牛有点困了...',
      ];
    case 'night':
      return [
        '哞...好困...zZZ',
        '该睡觉啦～',
        '晚安，明天见～',
      ];
  }
}
