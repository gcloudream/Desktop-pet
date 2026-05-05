export interface PetConfig {
  walkSpeed: number;
  idleDuration: [number, number];
  walkDuration: [number, number];
  gravity: number;
  bubbleDuration: number;
  petSize: number;
  groundOffset: number;
}

export interface CareMessages {
  workReminder: string[];
  morning: string[];
  evening: string[];
  random: string[];
  click: string[];
}

export const DEFAULT_CONFIG: PetConfig = {
  walkSpeed: 1,
  idleDuration: [2, 8],
  walkDuration: [3, 12],
  gravity: 0.5,
  bubbleDuration: 4000,
  petSize: 64,
  groundOffset: 32,
};

export const CARE_MESSAGES: CareMessages = {
  workReminder: [
    "小宝子该休息了，牛牛心疼～",
    "大宝贝别累着，站起来走走",
    "已经工作很久啦，喝口水吧",
    "小宝眼睛需要休息，看看远处",
  ],
  morning: [
    "大宝贝早安～想我没？哞～",
    "新的一天开始啦，牛牛陪你",
    "早安小宝，今天也要加油哦",
  ],
  evening: [
    "小宝别熬太晚，心疼",
    "该睡觉啦，明天再忙",
    "晚安大宝贝，牛牛守着你",
  ],
  random: [
    "看看牛牛～摇摇尾巴",
    "摸摸头，嘿嘿",
    "小宝想我没？",
    "哞～今天辛苦了",
    "牛牛在这里陪你",
    "要不要摸摸牛牛的角？",
  ],
  click: [
    "嘿嘿，想我啦？",
    "哞～好开心！",
    "再摸摸嘛",
    "牛牛最喜欢你了",
    "嘿嘿嘿，痒痒的",
  ],
};
