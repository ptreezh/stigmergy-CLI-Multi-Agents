@echo off
REM Windows 批处理启动脚本 - 跨平台编码安全安装器
REM 解决Windows中文系统GBK编码问题

echo [INFO] Stigmergy CLI - Multi-Agents跨AI CLI工具协作系统
echo [INFO] 跨平台编码安全安装器
echo ==================================================

REM 设置控制台编码为UTF-8
chcp 65001 >nul 2>&1

REM 设置Python编码环境变量
set PYTHONIOENCODING=utf-8
set PYTHONLEGACYWINDOWSSTDIO=utf-8

echo [OK] 已设置UTF-8编码环境
echo [OK] Python IO编码: %PYTHONIOENCODING%
echo.

REM 检查Python是否可用
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请确保Python已安装并添加到PATH
    echo 💡 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python环境检查通过
echo [OK] Python版本:
python --version
echo.

REM 检查必要文件是否存在
if not exist "universal_cli_installer.py" (
    echo ❌ 错误: 找不到 universal_cli_installer.py
    echo 💡 请确保在项目根目录下运行此脚本
    pause
    exit /b 1
)

if not exist "src\core\cross_platform_encoding.py" (
    echo ❌ 错误: 找不到跨平台编码库
    echo 💡 正在尝试创建...
    
    REM 尝试创建核心目录
    if not exist "src\core" mkdir src\core
    
    REM 检查是否有批处理脚本生成编码库
    if exist "generate_encoding_library.py" (
        echo [INFO] 正在生成编码库...
        python generate_encoding_library.py
    ) else (
        echo ❌ 无法自动创建编码库，请手动下载完整项目
        pause
        exit /b 1
    )
)

echo [OK] 必要文件检查通过
echo.

REM 显示安装选项
echo 🎯 请选择安装模式:
echo 1. 🚀 统一安装管理器（推荐）
echo 2. 🔧 批量修复所有安装脚本
echo 3. 📦 仅安装核心CLI工具（Claude + Gemini）
echo 4. 🌐 显示编码环境信息
echo 5. 🔍 验证现有安装
echo 0. 📋 退出
echo.

set /p choice="请输入选择 (0-5): "

if "%choice%"=="1" (
    echo [INFO] 启动统一安装管理器...
    echo.
    python universal_cli_installer.py
) else if "%choice%"=="2" (
    echo [INFO] 批量修复安装脚本...
    echo.
    python fix_all_install_scripts.py
) else if "%choice%"=="3" (
    echo [INFO] 安装核心CLI工具...
    echo.
    python src\adapters\claude\install_claude_integration.py
    python src\adapters\gemini\install_gemini_integration.py
) else if "%choice%"=="4" (
    echo [INFO] 显示编码环境信息...
    echo.
    python -c "
import sys
import os
import locale
import platform

print('🌐 系统编码信息:')
print(f'   操作系统: {platform.system()} {platform.release()}')
print(f'   Python版本: {sys.version.split()[0]}')
print(f'   默认编码: {sys.getdefaultencoding()}')
print(f'   系统编码: {locale.getpreferredencoding()}')
print(f'   文件系统编码: {sys.getfilesystemencoding()}')
print()
print('🔧 环境变量:')
print(f'   PYTHONIOENCODING: {os.environ.get(\"PYTHONIOENCODING\", \"未设置\")}')
print(f'   PYTHONLEGACYWINDOWSSTDIO: {os.environ.get(\"PYTHONLEGACYWINDOWSSTDIO\", \"未设置\")}')
print()
print('📁 当前工作目录:', os.getcwd())
"
) else if "%choice%"=="5" (
    echo [INFO] 验证现有安装...
    echo.
    if exist "src\adapters\claude\install_claude_integration.py" (
        python src\adapters\claude\install_claude_integration.py --verify
    )
    if exist "src\adapters\gemini\install_gemini_integration.py" (
        python src\adapters\gemini\install_gemini_integration.py --verify
    )
) else if "%choice%"=="0" (
    echo [INFO] 退出安装程序
    exit /b 0
) else (
    echo ❌ 无效选择，请重新运行
    pause
    exit /b 1
)

echo.
if errorlevel 1 (
    echo ❌ 操作失败，请检查错误信息
    echo 💡 建议以管理员身份运行此脚本
) else (
    echo ✅ 操作完成！
    echo.
    echo 🚀 下一步:
    echo   1. 运行: stigmergy-cli init
    echo   2. 开始使用: claude-cli '请用gemini帮我分析代码'
)

pause