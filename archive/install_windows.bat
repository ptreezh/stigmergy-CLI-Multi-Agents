@echo off
setlocal enabledelayedexpansion

:: 智能体协作系统 - Windows一键安装脚本
:: 为普通用户提供简单安装方式

echo.
echo 🚀 智能体协作系统 - 一键安装向导 (Windows)
echo ==================================================
echo.

:: 检查Python是否已安装
echo 🔍 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未在PATH中
    echo 💡 请先安装Python 3.7+，或下载预编译版本
    echo.
    goto :END
) else (
    echo ✅ Python环境正常
)

:: 检查Git是否已安装
echo.
echo 🔍 检查Git环境...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git未安装或未在PATH中
    echo 💡 请先安装Git，或下载预编译版本
    echo.
    goto :END
) else (
    echo ✅ Git环境正常
)

:: 克隆项目
echo.
echo 📦 下载智能体协作系统...
if exist "smart-cli-router-install" (
    echo ⚠️  检测到旧的安装文件，正在清理...
    rmdir /s /q "smart-cli-router-install" 2>nul
)

git clone https://github.com/socienceai/smart-cli-router.git smart-cli-router-install 2>nul
if %errorlevel% neq 0 (
    echo ❌ 下载失败，请检查网络连接
    echo.
    goto :END
)

echo ✅ 项目下载完成

:: 进入项目目录
cd smart-cli-router-install

:: 安装Python依赖
echo.
echo 📚 安装依赖包...
if exist "requirements.txt" (
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ⚠️  依赖安装失败，尝试继续安装...
    ) else (
        echo ✅ 依赖安装完成
    )
) else (
    echo ⚠️  未找到requirements.txt文件
)

:: 执行安装
echo.
echo 🔧 执行系统安装...
python QUICK_INSTALL.py

echo.
echo 🎉 安装完成！
echo.
echo 💡 使用方法：
echo    直接使用您已安装的CLI工具，现在它们支持协作功能
echo    例如: claude "让gemini帮我翻译这份文档"
echo.
echo 📄 协作文件将自动在项目目录中创建：
echo    - PROJECT_SPEC.json (任务和状态)
echo    - PROJECT_CONSTITUTION.md (协作规则)
echo.
echo 🌐 项目网站: http://www.socienceAI.com
echo.

:END
pause