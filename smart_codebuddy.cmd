@echo off
setlocal enabledelayedexpansion

:: 智能codebuddy路由器 - 增强版
:: 系统: windows
:: 可用工具: ['claude', 'gemini', 'kimi', 'qwen', 'ollama', 'codebuddy', 'qodercli', 'iflow']

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🎯 智能codebuddy路由器 - 增强版
    echo 💡 原始功能: codebuddy [参数]
    echo 🤖 智能路由示例:
    echo     智能codebuddy.bat 用claude|anthropic
    echo     智能codebuddy.bat 用gemini|google|谷歌
    echo     智能codebuddy.bat 用kimi|月之暗面|moonshot
    echo     智能codebuddy.bat 用qwen|通义|阿里
    echo     智能codebuddy.bat 用ollama|本地|离线
    echo     智能codebuddy.bat 用codebuddy|代码助手|编程
    echo     智能codebuddy.bat 用qodercli|代码生成|编程
    echo     智能codebuddy.bat 用iflow|智能|助手|心流

    exit /b
)

:: 智能路由检测
echo %USER_INPUT% | findstr /i "用 帮我 请 智能 ai 写 生成 解释 分析 翻译 代码 文章" >nul
if %errorlevel% neq 0 (
    :: 不需要路由，执行原始命令
    codebuddy %USER_INPUT%
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
echo %USER_INPUT% | findstr /i "kimi 月之暗面 moonshot" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: 月之暗面Kimi
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:kimi=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:月之暗面=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:moonshot=!"
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

    python kimi_wrapper.py "!CLEAN_INPUT!"
    exit /b
)
echo %USER_INPUT% | findstr /i "qwen 通义 阿里" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: 阿里通义千问
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:qwen=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:通义=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:阿里=!"
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

    qwen.cmd "!CLEAN_INPUT!"
    exit /b
)
echo %USER_INPUT% | findstr /i "ollama 本地 离线" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: Ollama本地模型
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:ollama=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:本地=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:离线=!"
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

    ollama "!CLEAN_INPUT!"
    exit /b
)
echo %USER_INPUT% | findstr /i "codebuddy 代码助手 编程" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: CodeBuddy代码助手
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:codebuddy=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:代码助手=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:编程=!"
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

    codebuddy "!CLEAN_INPUT!"
    exit /b
)
echo %USER_INPUT% | findstr /i "qodercli 代码生成 编程" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: QoderCLI代码生成
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:qodercli=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:代码生成=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:编程=!"
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

    qodercli "!CLEAN_INPUT!"
    exit /b
)
echo %USER_INPUT% | findstr /i "iflow 智能 助手 心流" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: iFlow智能助手
    set "CLEAN_INPUT=!USER_INPUT!"
    set "CLEAN_INPUT=!CLEAN_INPUT:iflow=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:智能=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:助手=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:心流=!"
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

    iflow.cmd "!CLEAN_INPUT!"
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
