@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Stigmergy-CLI 一键安装脚本 (Windows)
REM 使用方法: 在PowerShell中运行: powershell -Command "iwr -useb https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install.bat | iex"

echo 🚀 Stigmergy-CLI 一键安装程序
echo ================================

REM 检查系统要求
echo 📋 检查系统要求...

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到Node.js
    echo 💡 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
echo ✅ Node.js版本: !node_version!

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到npm
    pause
    exit /b 1
)

echo ✅ npm已安装

REM 检查git
git --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 未检测到git，建议安装以便后续更新
) else (
    echo ✅ Git已安装
)

echo.

REM 选择安装方法
echo 🎯 选择安装方法:
echo 1. npm全局安装 (推荐)
echo 2. npx临时使用
echo 3. 克隆GitHub仓库
echo.

set /p choice="请选择 (1-3，默认1): "
if "%choice%"=="" set choice=1

if "%choice%"=="1" goto :install_npm
if "%choice%"=="2" goto :install_npx
if "%choice%"=="3" goto :install_git

echo ❌ 无效选择
pause
exit /b 1

:install_npm
echo 📦 方法1: npm全局安装
echo --------------------

echo 正在从npm安装 @stigmergy-cli/deployer...

npm install -g @stigmergy-cli/deployer

if errorlevel 1 (
    echo ❌ npm全局安装失败，尝试备用方法...
    goto :install_npx
) else (
    echo ✅ npm全局安装成功
    echo 💡 现在可以使用: stigmergy-cli
    goto :run_deploy
)

:install_npx
echo 📦 方法2: npx临时使用
echo -------------------

echo ✅ npx已内置，无需安装
echo 💡 使用方法: npx @stigmergy-cli/deployer

echo 正在测试npx...
npx @stigmergy-cli/deployer --help >nul 2>&1

if errorlevel 1 (
    echo ❌ npx测试失败，尝试Git克隆方法...
    goto :install_git
) else (
    echo ✅ npx测试成功
    goto :run_deploy
)

:install_git
echo 📦 方法3: 克隆GitHub仓库
echo ------------------------

set "install_dir=%USERPROFILE%\.stigmergy-cli-source"

echo 正在克隆到: !install_dir!

git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git "!install_dir!"

if errorlevel 1 (
    echo ❌ Git克隆失败
    pause
    exit /b 1
)

cd /d "!install_dir!\deployment"

npm install

if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
) else (
    echo ✅ 仓库克隆和依赖安装成功
    echo 💡 现在可以使用: node !install_dir!\deployment\deploy.js
    goto :run_deploy
)

:run_deploy
echo.
echo 🚀 开始部署Stigmergy-CLI...
echo ==========================

REM 尝试不同的部署方法
stigmergy-cli deploy >nul 2>&1
if not errorlevel 1 goto :success

npx @stigmergy-cli/deployer deploy >nul 2>&1
if not errorlevel 1 goto :success

echo ❌ 无法自动运行部署
echo 💡 请手动运行以下命令之一:
echo    stigmergy-cli deploy
echo    npx @stigmergy-cli/deployer deploy

goto :end

:success
echo.
echo 🎉 安装完成！
echo ================
echo.
echo 📚 使用指南:
echo   stigmergy-cli deploy    # 重新部署
echo   stigmergy-cli scan      # 扫描工具
echo   stigmergy-cli status    # 查看状态
echo   stigmergy-cli clean      # 清理配置
echo.
echo 🌐 更多信息: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents

:end
echo 按任意键退出...
pause >nul