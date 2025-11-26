@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Stigmergy-CLI 本地安装脚本 (Windows)
REM 不依赖npm，直接从GitHub下载并部署

echo 🚀 Stigmergy-CLI 本地安装程序
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

REM 检查git
git --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 未检测到git，将使用curl下载
) else (
    echo ✅ Git已安装
)

echo.

REM 选择安装方法
echo 🎯 选择安装方式:
echo 1. Git克隆 (推荐，获取完整项目)
echo 2. curl下载 (仅下载部署脚本)
echo.

set /p choice="请选择 (1-2，默认1): "
if "%choice%"=="" set choice=1

if "%choice%"=="1" goto :install_git
if "%choice%"=="2" goto :install_curl

echo ❌ 无效选择
pause
exit /b 1

:install_git
echo 📦 下载项目源码...
echo =====================

set "install_dir=%USERPROFILE%\.stigmergy-cli-install"

if exist "%install_dir%" (
    echo 更新现有安装...
    cd /d "%install_dir%"
    git pull origin main
) else (
    echo 克隆项目到: !install_dir!
    git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git "%install_dir%"
    cd /d "%install_dir%"
)

if errorlevel 1 (
    echo ❌ Git克隆失败，尝试curl下载...
    goto :install_curl
)

echo ✅ 项目下载完成

REM 部署扩展
echo 🚀 部署原生扩展...
node deployment/real-deploy.js

if not errorlevel 1 (
    echo ✅ 扩展部署成功
    goto :success
) else (
    echo ❌ 扩展部署失败
    goto :end
)

:install_curl
echo 📦 下载部署脚本...
echo ====================

set "deploy_script=%USERPROFILE%\.stigmergy-cli-deploy.js"

echo 正在下载部署脚本...
curl -fsSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/deployment/real-deploy.js -o "%deploy_script%"

if errorlevel 1 (
    echo ❌ 下载失败，请检查网络连接
    goto :end
)

echo ✅ 部署脚本下载完成

echo 🚀 部署原生扩展...
node "%deploy_script%"

if not errorlevel 1 (
    echo ✅ 扩展部署成功
    goto :success
) else (
    echo ❌ 扩展部署失败
    goto :end
)

:success
echo.
echo 🎉 安装完成！
echo ==============
echo.
echo 📚 使用指南:
echo   # 重新扫描状态
echo   node "%USERPROFILE%\.stigmergy-cli-install\deployment\real-deploy.js" scan
echo.
echo   # 重新部署
echo   node "%USERPROFILE%\.stigmergy-cli-install\deployment\real-deploy.js" deploy
echo.
echo   # 或者使用下载的脚本
echo   node "%USERPROFILE%\.stigmergy-cli-deploy.js"
echo.
echo 🌐 项目地址: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
echo 📁 配置目录: %USERPROFILE%\.stigmergy-cli\

:end
echo 按任意键退出...
pause >nul