@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:: ============================================
:: DesktopPet — Windows 一键环境安装脚本
:: 用法: 双击 setup-windows.bat 即可
:: ============================================

title DesktopPet Windows 环境安装器

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     🐄 DesktopPet Windows 环境安装器     ║
echo  ╚══════════════════════════════════════════╝
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: ── 1. 检查管理员权限 ──
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [WARN] 建议以管理员身份运行以自动安装缺失组件。
    echo         右键此文件 → 以管理员身份运行
    echo.
)

:: ── 2. 检查并安装 winget ──
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo  [WARN] 未检测到 winget，尝试通过 App Installer 获取...
    echo         如果安装失败，请手动安装 winget:
    echo         https://aka.ms/getwinget
    echo.
    pause
    exit /b 1
)
echo  [ OK ] winget 已可用

:: ── 3. 检查并安装 Node.js ──
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo  [ OK ] Node.js 已安装 (!NODE_VER!)
) else (
    echo  [INFO] 正在安装 Node.js...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo  [FAIL] Node.js 安装失败，请手动安装: https://nodejs.org
        pause
        exit /b 1
    )
    :: 刷新 PATH
    set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
    echo  [ OK ] Node.js 安装完成
)

:: ── 4. 检查并安装 Rust ──
where rustc >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('rustc --version') do set RUST_VER=%%i
    echo  [ OK ] Rust 已安装 (!RUST_VER!)
) else (
    echo  [INFO] 正在安装 Rust...
    echo         如果弹出安装向导，请按提示完成安装。
    echo         安装完成后需要重新打开此脚本。
    echo.

    :: 下载 rustup-init
    set "RUSTUP_INIT=%TEMP%\rustup-init.exe"
    curl -sSL -o "!RUSTUP_INIT!" https://win.rustup.rs/x86_64
    if not exist "!RUSTUP_INIT!" (
        echo  [FAIL] rustup-init 下载失败
        echo         请手动访问 https://rustup.rs 安装 Rust
        pause
        exit /b 1
    )
    :: 静默安装
    "!RUSTUP_INIT%" -y --default-toolchain stable
    if %errorlevel% neq 0 (
        echo  [FAIL] Rust 安装失败
        pause
        exit /b 1
    )
    :: 刷新 PATH
    set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
    echo  [ OK ] Rust 安装完成
)

:: ── 5. 检查 WebView2 ──
echo  [INFO] 检查 WebView2 运行时...
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BEE-13A6279B0DDF}" >nul 2>&1
if %errorlevel% equ 0 (
    echo  [ OK ] WebView2 已安装
) else (
    reg query "HKCU\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BEE-13A6279B0DDF}" >nul 2>&1
    if !errorlevel! equ 0 (
        echo  [ OK ] WebView2 已安装
    ) else (
        echo  [WARN] 未检测到 WebView2，正在安装...
        winget install Microsoft.EdgeWebView2Runtime --accept-source-agreements --accept-package-agreements
        if !errorlevel! neq 0 (
            echo  [WARN] WebView2 自动安装失败
            echo         请手动下载安装: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
            echo         大部分 Windows 10/11 已自带 WebView2，可以先跳过。
        ) else (
            echo  [ OK ] WebView2 安装完成
        )
    )
)

:: ── 6. 安装 npm 依赖 ──
echo  [INFO] 正在安装 npm 依赖...
cd /d "%SCRIPT_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo  [FAIL] npm install 失败
    pause
    exit /b 1
)
echo  [ OK ] npm 依赖安装完成

:: ── 7. 编译 Rust 后端 ──
echo  [INFO] 正在编译 Rust 后端（首次编译较慢，请耐心等待）...
cd /d "%SCRIPT_DIR%\src-tauri"
cargo build
if %errorlevel% neq 0 (
    echo  [FAIL] Rust 编译失败
    pause
    exit /b 1
)
echo  [ OK ] Rust 后端编译完成

:: ── 完成 ──
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║           ✅ 安装全部完成！               ║
echo  ╠══════════════════════════════════════════╣
echo  ║  启动开发模式:                            ║
echo  ║    cd DesktopPet ^&^& npm run tauri dev   ║
echo  ║                                          ║
echo  ║  打包正式版:                              ║
echo  ║    npm run tauri build                   ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ── 询问是否启动 ──
set /p "LAUNCH=是否现在启动开发模式？(y/n): "
if /i "%LAUNCH%"=="y" (
    cd /d "%SCRIPT_DIR%"
    call npm run tauri dev
) else (
    echo.
    echo  安装完成！你可以随时运行以下命令启动:
    echo    npm run tauri dev
    echo.
    pause
)

endlocal
