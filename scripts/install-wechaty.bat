@echo off
REM Wechaty Bot 一键安装脚本 (Windows)

echo ========================================
echo 🤖 Stigmergy Wechaty Bot 安装
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 未安装 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 安装 Wechaty 依赖
echo 📦 安装 Wechaty 依赖...
echo.

call npm install wechaty wechaty-puppet-wechat qrcode-terminal file-box

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ 安装成功！
    echo.
    echo ========================================
    echo 🚀 启动命令
    echo ========================================
    echo.
    echo   node scripts\start-wechaty-bot.js
    echo.
    echo 或者指定其他 AI CLI:
    echo   node scripts\start-wechaty-bot.js gemini
    echo   node scripts\start-wechaty-bot.js qwen
    echo.
    echo ========================================
    echo 📚 详细文档
    echo ========================================
    echo.
    echo 查看: docs\WECHATY_QUICK_START.md
    echo.
) else (
    echo.
    echo ❌ 安装失败
    echo.
    echo 💡 可能的解决方案：
    echo   1. 检查网络连接
    echo   2. 尝试使用淘宝镜像:
    echo      npm install --registry=https://registry.npmmirror.com
    echo   3. 查看详细文档: docs\WECHATY_QUICK_START.md
    echo.
)

pause
