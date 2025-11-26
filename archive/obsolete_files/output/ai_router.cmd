@echo off
setlocal enabledelayedexpansion

:: 智能ai路由器 - 自动生成
:: 系统: windows
:: 可用工具: ['claude', 'gemini', 'testai']

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🎯 智能ai路由器
    echo 💡 原始功能: ai [参数]
    echo 🤖 智能路由示例:
    echo     智能ai.bat 用claude|anthropic 
    echo     智能ai.bat 用gemini|google|谷歌 

    exit /b
)

:: 智能路由检测
echo %USER_INPUT% | findstr /i "用 帮我 请 智能 ai 写 生成 解释 分析 翻译 代码 文章" >nul
if %errorlevel% neq 0 (
    :: 不需要路由，执行原始命令
    ai %USER_INPUT%
    exit /b
)

echo %USER_INPUT% | findstr /i "claude anthropic" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: Anthropic Claude
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:claude=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:anthropic=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:请=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:写=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:生成=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:解释=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:分析=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:翻译=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:代码=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:文章=!"
    
    claude.cmd "!CLEAN_INPUT!"
    exit /b
)
echo %USER_INPUT% | findstr /i "gemini google 谷歌" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: Google Gemini AI
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:gemini=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:google=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:谷歌=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:请=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:写=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:生成=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:解释=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:分析=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:翻译=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:代码=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:文章=!"
    
    gemini.cmd "!CLEAN_INPUT!"
    exit /b
)

:: 默认路由到Anthropic Claude
set "CLEAN_INPUT=!USER_INPUT!"
set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
set "CLEAN_INPUT=!CLEAN_INPUT:请=!"
set "CLEAN_INPUT=!CLEAN_INPUT:写=!"
set "CLEAN_INPUT=!CLEAN_INPUT:生成=!"
set "CLEAN_INPUT=!CLEAN_INPUT:解释=!"
set "CLEAN_INPUT=!CLEAN_INPUT:分析=!"
set "CLEAN_INPUT=!CLEAN_INPUT:翻译=!"
set "CLEAN_INPUT=!CLEAN_INPUT:代码=!"
set "CLEAN_INPUT=!CLEAN_INPUT:文章=!"
claude.cmd "!CLEAN_INPUT!"
