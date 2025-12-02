@echo off
REM Gemini CLI 工具调用脚本
REM 用于在Windows环境下调用其他已安装的CLI工具

setlocal enabledelayedexpansion

REM 检查参数
if "%~1"=="" (
    echo 用法: gemini-call ^<cli_name^> [arguments...]
    echo 示例: gemini-call claude --version
    echo.
    echo 已安装的CLI工具:
    echo   - claude: Anthropic Claude CLI (版本 2.0.37)
    echo   - qwen: Qwen CLI (版本 0.3.0)
    echo   - iflow: iFlow CLI (版本 0.3.9)
    echo   - codebuddy: CodeBuddy CLI (版本 2.10.0)
    echo   - codex: Codex CLI (版本 0.63.0)
    echo   - copilot: Copilot CLI (版本 0.0.350)
    exit /b 1
)

REM 获取要调用的CLI名称
set "CLI_NAME=%~1"
shift

REM 构建参数字符串
set "ARGS="
:build_args
if "%~1"=="" goto args_done
set "ARGS=%ARGS% %1"
shift
goto build_args
:args_done

REM 根据CLI名称调用相应的命令
if /i "%CLI_NAME%"=="claude" (
    echo 调用 Claude CLI: claude %ARGS%
    echo --------------------------------------------------
    claude %ARGS%
    exit /b %ERRORLEVEL%
)

if /i "%CLI_NAME%"=="qwen" (
    echo 调用 Qwen CLI: qwen %ARGS%
    echo --------------------------------------------------
    qwen %ARGS%
    exit /b %ERRORLEVEL%
)

if /i "%CLI_NAME%"=="iflow" (
    echo 调用 iFlow CLI: iflow %ARGS%
    echo --------------------------------------------------
    iflow %ARGS%
    exit /b %ERRORLEVEL%
)

if /i "%CLI_NAME%"=="codebuddy" (
    echo 调用 CodeBuddy CLI: codebuddy %ARGS%
    echo --------------------------------------------------
    codebuddy %ARGS%
    exit /b %ERRORLEVEL%
)

if /i "%CLI_NAME%"=="codex" (
    echo 调用 Codex CLI: codex %ARGS%
    echo --------------------------------------------------
    codex %ARGS%
    exit /b %ERRORLEVEL%
)

if /i "%CLI_NAME%"=="copilot" (
    echo 调用 Copilot CLI: copilot %ARGS%
    echo --------------------------------------------------
    copilot %ARGS%
    exit /b %ERRORLEVEL%
)

REM 未知的CLI工具
echo 错误: 未知的CLI工具 '%CLI_NAME%'
echo 请使用以下工具之一: claude, qwen, iflow, codebuddy, codex, copilot
exit /b 1