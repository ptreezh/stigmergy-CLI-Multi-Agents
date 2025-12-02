@echo off
REM Windows GBK编码修复批处理脚本
REM 用于解决CLI工具安装时的编码问题

echo [INFO] Windows GBK编码修复脚本
echo =====================================

REM 设置控制台编码为UTF-8
chcp 65001 >nul

REM 设置Python编码环境变量
set PYTHONIOENCODING=utf-8
set PYTHONLEGACYWINDOWSSTDIO=utf-8

echo [OK] 已设置UTF-8编码环境
echo [OK] Python IO编码: %PYTHONIOENCODING%

REM 检查Python是否可用
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请确保Python已安装并添加到PATH
    pause
    exit /b 1
)

echo [OK] Python环境检查通过
echo.

REM 选择安装的工具
echo 请选择要安装的CLI工具:
echo 1. Claude CLI
echo 2. Gemini CLI  
echo 3. 所有工具（暂不支持）
echo.
set /p choice="请输入选择 (1-3): "

if "%choice%"=="1" (
    echo [INFO] 开始安装Claude CLI集成...
    python fix-gbk-encoding.py --tool claude
) else if "%choice%"=="2" (
    echo [INFO] 暂不支持Gemini CLI，请使用手动修复
) else if "%choice%"=="3" (
    echo [INFO] 暂不支持批量安装，请逐个安装
) else (
    echo ❌ 无效选择
    pause
    exit /b 1
)

echo.
if errorlevel 1 (
    echo ❌ 安装失败，请检查错误信息
) else (
    echo ✅ 安装完成！
)

pause