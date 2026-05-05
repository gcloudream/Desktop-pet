#!/usr/bin/env bash
#
# DesktopPet — macOS 一键环境安装脚本
# 用法: chmod +x setup-mac.sh && ./setup-mac.sh
#

set -e

# ── 颜色 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # 无色

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail()  { echo -e "${RED}[FAIL]${NC} $*"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     🐄 DesktopPet macOS 环境安装器       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. 检查并安装 Xcode Command Line Tools ──
if xcode-select -p &>/dev/null; then
    ok "Xcode Command Line Tools 已安装"
else
    info "正在安装 Xcode Command Line Tools..."
    xcode-select --install
    echo "请在弹出的窗口中点击「安装」，安装完成后重新运行此脚本。"
    exit 0
fi

# ── 2. 检查并安装 Homebrew ──
if command -v brew &>/dev/null; then
    ok "Homebrew 已安装 ($(brew --version | head -1))"
else
    info "正在安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # 添加 brew 到 PATH (Apple Silicon)
    if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    fi
    ok "Homebrew 安装完成"
fi

# ── 3. 检查并安装 Node.js ──
if command -v node &>/dev/null; then
    NODE_VER="$(node --version)"
    ok "Node.js 已安装 ($NODE_VER)"
else
    info "正在通过 Homebrew 安装 Node.js..."
    brew install node
    ok "Node.js 安装完成 ($(node --version))"
fi

# ── 4. 检查并安装 Rust ──
if command -v rustc &>/dev/null; then
    RUST_VER="$(rustc --version)"
    ok "Rust 已安装 ($RUST_VER)"
else
    info "正在安装 Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    ok "Rust 安装完成 ($(rustc --version))"
fi

# 确保 cargo 在 PATH 中
export PATH="$HOME/.cargo/bin:$PATH"

# ── 5. 安装项目 npm 依赖 ──
info "正在安装 npm 依赖..."
cd "$SCRIPT_DIR"
npm install
ok "npm 依赖安装完成"

# ── 6. 编译 Rust 后端 ──
info "正在编译 Rust 后端（首次编译较慢，请耐心等待）..."
cd "$SCRIPT_DIR/src-tauri"
cargo build
ok "Rust 后端编译完成"

# ── 完成 ──
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║           ✅ 安装全部完成！               ║"
echo "╠══════════════════════════════════════════╣"
echo "║  启动开发模式:                            ║"
echo "║    cd $(basename "$SCRIPT_DIR") && npm run tauri dev      ║"
echo "║                                          ║"
echo "║  打包正式版:                              ║"
echo "║    npm run tauri build                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

read -p "是否现在启动开发模式？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$SCRIPT_DIR"
    npm run tauri dev
fi
