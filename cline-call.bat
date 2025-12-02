@echo off
REM Cline CLI Cross-Platform Call Script for Windows with MCP Integration
REM This script enables calling Cline CLI from Windows with Stigmergy system integration

setlocal enabledelayedexpansion

REM Set encoding to UTF-8
chcp 65001 >nul 2>&1

REM Script information
set "SCRIPT_NAME=Cline Call Script with MCP Integration"
set "SCRIPT_VERSION=2.0.0"
set "SUPPORTED_CLI=cline"

REM Set up Stigmergy environment for MCP integration
set "STIGMERGY_PROJECT_ROOT=%~dp0"
set "STIGMERGY_COLLABORATION_MODE=enabled"
set "PYTHONPATH=%~dp0"
set "CLINE_MCP_ENABLED=true"
set "CLINE_MCP_SERVER_PATH=%~dp0src\adapters\cline\mcp_server.py"

REM Parse command line arguments
set "CLI_COMMAND="
set "CLI_ARGUMENTS="
set "TIMEOUT_VALUE=300"
set "VERBOSE_MODE=0"
set "HELP_MODE=0"

:parse_args
if "%~1"=="" goto :execute
if "%~1"=="--help" (
    set "HELP_MODE=1"
    goto :help
)
if "%~1"=="-h" (
    set "HELP_MODE=1"
    goto :help
)
if "%~1"=="--version" (
    echo %SCRIPT_NAME% v%SCRIPT_VERSION%
    echo Wrapper for Cline CLI integration with Stigmergy system
    exit /b 0
)
if "%~1"=="--timeout" (
    shift
    set "TIMEOUT_VALUE=%~1"
    shift
    goto :parse_args
)
if "%~1"=="--verbose" (
    set "VERBOSE_MODE=1"
    shift
    goto :parse_args
)

REM Collect CLI arguments
if "!CLI_ARGUMENTS!"=="" (
    set "CLI_ARGUMENTS=%~1"
) else (
    set "CLI_ARGUMENTS=!CLI_ARGUMENTS! %~1"
)
shift
goto :parse_args

:help
echo %SCRIPT_NAME% v%SCRIPT_VERSION%
echo.
echo Usage: cline-call.bat [OPTIONS] [CLINE_ARGUMENTS]
echo.
echo Options:
echo   --help, -h          Show this help message
echo   --version           Show script version
echo   --timeout SECONDS   Set execution timeout (default: 300)
echo   --verbose           Enable verbose output
echo.
echo Examples:
echo   cline-call.bat --version
echo   cline-call.bat "analyze this code"
echo   cline-call.bat --timeout 600 "refactor authentication module"
echo   cline-call.bat --verbose execute --task "optimize database queries"
echo   cline-call.bat mcp start
 echo.
echo MCP Integration Commands:
echo   cline-call.bat mcp start          Start the MCP server for Stigmergy integration
echo   cline-call.bat "use mcp to search for Python files"
echo   cline-call.bat "create a tool that analyzes code complexity"
echo.
echo This script is part of the Stigmergy multi-CLI collaboration system with MCP support.
goto :end

:execute
REM Check if Cline CLI is available
where cline >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Cline CLI is not available in PATH
    echo Please install Cline CLI first: https://github.com/cline/cline
    exit /b 1
)

REM Check for empty arguments
if "!CLI_ARGUMENTS!"=="" (
    echo Error: No arguments provided
    echo Use --help for usage information
    exit /b 1
)

REM Execute Cline CLI with timeout and MCP integration
if %VERBOSE_MODE%==1 (
    echo [INFO] Executing: cline !CLI_ARGUMENTS!
    echo [INFO] Timeout: %TIMEOUT_VALUE% seconds
    echo [INFO] Working directory: %CD%
    echo [INFO] MCP Integration: Enabled
    echo [INFO] Stigmergy Collaboration: %STIGMERGY_COLLABORATION_MODE%
)

REM Check if MCP server should be started
if "%CLI_ARGUMENTS%"=="mcp start" (
    echo Starting Cline MCP server for Stigmergy integration...
    python "%CLINE_MCP_SERVER_PATH%"
    set "EXIT_CODE=%errorlevel%"
    goto :end
)

REM Use PowerShell for timeout functionality with MCP environment
powershell -Command "
    $env:STIGMERGY_PROJECT_ROOT = '%STIGMERGY_PROJECT_ROOT%'
    $env:STIGMERGY_COLLABORATION_MODE = '%STIGMERGY_COLLABORATION_MODE%'
    $env:PYTHONPATH = '%PYTHONPATH%'
    $env:CLINE_MCP_ENABLED = '%CLINE_MCP_ENABLED%'
    
    $process = Start-Process -FilePath 'cline' -ArgumentList '!CLI_ARGUMENTS!' -PassThru -NoNewWindow -Wait -Timeout %TIMEOUT_VALUE%
    if ($process -eq $null) {
        Write-Error 'Process failed to start or timed out'
        exit 1
    }
    exit $process.ExitCode
"

set "EXIT_CODE=%errorlevel%"

if %EXIT_CODE% equ 0 (
    if %VERBOSE_MODE%==1 (
        echo [INFO] Cline CLI execution completed successfully
    )
) else (
    if %EXIT_CODE% equ 1 (
        echo Error: Cline CLI execution failed
    ) else if %EXIT_CODE% equ -1 (
        echo Error: Cline CLI execution timed out after %TIMEOUT_VALUE% seconds
    ) else (
        echo Error: Cline CLI execution failed with exit code %EXIT_CODE%
    )
)

:end
endlocal
exit /b %EXIT_CODE%