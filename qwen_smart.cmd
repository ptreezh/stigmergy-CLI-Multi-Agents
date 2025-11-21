@echo off
:: qwen 智能路由器 - 简化版
:: 版本: 0.2.2

set "INPUT=%*"

if "%INPUT%"=="" (
    echo 🚀 qwen 简化路由器
    echo 💡 用法: qwen_smart "用其他工具帮我..."
    exit /b
)

:: 简单路由判断
set "ROUTE_TARGET="
set "CLEAN_INPUT=%INPUT%"

:: 检测路由目标
for %%t in (claude gemini qwen kimi codebuddy qoder iflow copilot) do (
    echo %INPUT% | findstr /i "%%t" >nul
    if %errorlevel% equ 0 (
        set "ROUTE_TARGET=%%t"
        goto route_to_target
    )
)

:route_to_target
if defined ROUTE_TARGET (
    echo 🚀 路由到: %ROUTE_TARGET%
    set "CLEAN_INPUT=%INPUT: %ROUTE_TARGET% =%"
    %ROUTE_TARGET% "%CLEAN_INPUT%"
) else (
    qwen %INPUT%
)
