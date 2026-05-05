# 🐄 DesktopPet

一只可爱的像素桌面宠物，基于 Tauri 2.x + TypeScript + Vite 构建。

支持 3 套皮肤切换：🐄 小牛 · 🐱 小猫 · 🐶 小狗

## ✨ 特性

### 🎮 像素角色
- 32×32 像素风格 SVG 渲染，10 种帧动画
- 全屏边缘散步：沿底部、左侧、顶部、右侧自由行走
- 走到角落自动转弯，精灵跟随旋转
- 拖拽抛出，真实物理弹跳

### 🍽️ 动作特效
- **吃东西**：嘴前草叶 + 食物碎屑飞溅 + 大张嘴动画
- **睡觉**：紫色枕头 + Zzz 气泡 + 梦中星星
- **摸头**：腮红 + 爱心浮出 + 闪光星星
- 每种状态都有独特的表情、嘴巴、尾巴变化

### 🌦️ 天气系统
- wttr.in 免费天气 API，无需 API key
- 每 30 分钟自动刷新，localStorage 缓存
- 🌧️ 雨天：雨滴粒子 + 像素雨伞
- ❄️ 下雪：雪花飘落 + 雨伞
- ☀️ 晴天：像素太阳 + 脉冲动画
- 天气配件跟随小牛，表面切换时自动调整方向

### 💬 互动系统
- **单击**：小牛开心反应 + 气泡对话
- **双击**：弹出互动菜单（摸头/喂食/睡觉/换肤/成就/番茄钟/屏幕时间/天气）
- **右键**：系统菜单（隐藏/重召/退出）
- 丰富的中文台词（早安/晚安/工作提醒/各状态）

### 🧠 智能陪伴
- **时间感知**：晚上自动戴睡帽，按时段切换问候语
- **屏幕时间统计**：追踪每日使用时长，里程碑提醒（30分/1小时/2/3/4小时）
- **疲劳系统**：使用 2 小时后小牛出现黑眼圈，4 小时+ 下垂眼皮
- **番茄钟**：25 分钟专注模式，每 5 分钟提醒，完成后庆祝
- **成就系统**：7 个成就（陪伴时长/互动/喂食/拖拽），localStorage 持久化
- 小牛自动避开鼠标光标（100px 范围）

### 🎨 多套皮肤
- 🐄 小牛（默认）
- 🐱 小猫（橘色虎斑 + 胡须）
- 🐶 小狗（金毛 + 耷拉耳朵 + 舌头）
- 双击菜单 → 换肤，一键切换

## 🚀 快速开始

### 一键安装（推荐）

**macOS:**
```bash
chmod +x setup-mac.sh
./setup-mac.sh
```

**Windows:**
```
双击 setup-windows.bat
```

### 手动安装

需要的环境：
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://rustup.rs/)
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

```bash
npm install
npm run tauri dev    # 开发模式
npm run tauri build  # 打包
```

## 📁 项目结构

```
DesktopPet/
├── src/
│   ├── main.ts              入口 + 动画循环
│   ├── styles/main.css      像素风样式
│   └── pet/
│       ├── Pet.ts           主逻辑
│       ├── PetState.ts      状态机
│       ├── Physics.ts       物理引擎（支持表面系统）
│       ├── Config.ts        配置 + 台词
│       ├── CowSprite.ts     小牛 SVG + 疲劳效果
│       ├── CatSprite.ts     小猫 SVG
│       ├── DogSprite.ts     小狗 SVG
│       ├── SkinManager.ts   皮肤管理
│       ├── TimeAwareness.ts 时间感知
│       ├── Achievement.ts   成就系统
│       ├── ScreenTime.ts    屏幕时间统计
│       ├── Weather.ts       天气 API + 缓存
│       ├── WeatherSprite.ts 像素雨伞/太阳 SVG
│       └── WeatherOverlay.ts 天气粒子 + 配件
├── src-tauri/
│   ├── src/lib.rs           Tauri 主逻辑 + 光标位置 API
│   ├── Cargo.toml
│   └── tauri.conf.json
├── setup-mac.sh             macOS 一键安装
└── setup-windows.bat        Windows 一键安装
```

## 🖥️ 跨平台支持

| 功能 | macOS | Windows |
|------|-------|---------|
| 透明窗口 | ✅ | ✅ (WebView2) |
| 系统托盘 | ✅ | ✅ |
| 避开 Dock/任务栏 | ✅ | ✅ |
| 点击穿透 | ✅ | ✅ |
| 光标位置获取 | ✅ | ✅ |
| 一键安装脚本 | ✅ | ✅ |

## 📦 安装包

从 [Releases](https://github.com/gcloudream/Desktop-pet/releases) 下载最新版 DMG（macOS）或安装包（Windows）。

## License

MIT
