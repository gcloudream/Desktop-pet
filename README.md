# 🐄 DesktopPet

一只可爱的像素小牛桌面宠物，基于 Tauri 2.x + TypeScript + Vite 构建。

## 特性

- 🎮 像素风格小牛，随机游走和跳跃
- 💬 点击小牛显示气泡对话
- 🖱️ 右键菜单：重新召唤、显示/隐藏、退出
- 📌 始终置顶，透明背景
- 🔄 系统托盘常驻

## 快速开始

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

脚本会自动检测并安装所需的全部环境（Node.js、Rust、WebView2 等）。

### 手动安装

需要的环境：
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://rustup.rs/)
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 打包
npm run tauri build
```

## 项目结构

```
DesktopPet/
├── src/                  # 前端代码
│   ├── index.html        # 主页面
│   ├── main.ts           # 小牛行为逻辑
│   └── styles/main.css   # 样式
├── src-tauri/            # Rust 后端
│   ├── src/
│   │   ├── lib.rs        # Tauri 应用主逻辑
│   │   └── main.rs       # 入口
│   ├── Cargo.toml        # Rust 依赖
│   └── tauri.conf.json   # Tauri 配置
├── setup-mac.sh          # macOS 一键安装
├── setup-windows.bat     # Windows 一键安装
└── package.json          # 前端依赖
```

## 跨平台支持

| 功能 | macOS | Windows |
|------|-------|---------|
| 透明窗口 | ✅ | ✅ (WebView2) |
| 系统托盘 | ✅ | ✅ |
| 避开 Dock/任务栏 | ✅ | ✅ |
| 点击穿透 | ✅ | ✅ |
| 一键安装脚本 | ✅ | ✅ |

## License

MIT
