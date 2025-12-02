#!/bin/bash
# Cline CLI Cross-Platform Call Script for Unix/Linux/macOS with MCP Integration
# This script enables calling Cline CLI from Unix-like systems with Stigmergy MCP support

set -euo pipefail

# Script information
readonly SCRIPT_NAME="Cline Call Script with MCP Integration"
readonly SCRIPT_VERSION="2.0.0"
readonly SUPPORTED_CLI="cline"

# Set up Stigmergy environment for MCP integration
export STIGMERGY_PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
export STIGMERGY_COLLABORATION_MODE="enabled"
export PYTHONPATH="$STIGMERGY_PROJECT_ROOT"
export CLINE_MCP_ENABLED="true"
export CLINE_MCP_SERVER_PATH="$STIGMERGY_PROJECT_ROOT/src/adapters/cline/mcp_server.py"

# Default values
TIMEOUT_VALUE=300
VERBOSE_MODE=0
HELP_MODE=0

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color="$1"
    shift
    if [[ -t 1 ]]; then
        echo -e "${color}$*${NC}"
    else
        echo "$*"
    fi
}

# Function to print error and exit
error_exit() {
    print_color "$RED" "Error: $*"
    exit 1
}

# Function to print info
info() {
    if [[ $VERBOSE_MODE -eq 1 ]]; then
        print_color "$BLUE" "[INFO] $*"
    fi
}

# Function to print success
success() {
    print_color "$GREEN" "$*"
}

# Function to show help
show_help() {
    cat << EOF
$SCRIPT_NAME v$SCRIPT_VERSION

Usage: $(basename "$0") [OPTIONS] [CLINE_ARGUMENTS]

Options:
  --help, -h          Show this help message
  --version           Show script version
  --timeout SECONDS   Set execution timeout (default: 300)
  --verbose           Enable verbose output

echo Examples:
echo   $(basename "$0") --version
echo   $(basename "$0") "analyze this code"
echo   $(basename "$0") --timeout 600 "refactor authentication module"
echo   $(basename "$0") --verbose execute --task "optimize database queries"
echo   $(basename "$0") mcp start
echo.
echo MCP Integration Commands:
echo   $(basename "$0") mcp start          Start the MCP server for Stigmergy integration
echo   $(basename "$0") "use mcp to search for Python files"
echo   $(basename "$0") "create a tool that analyzes code complexity"
echo.
echo This script is part of the Stigmergy multi-CLI collaboration system with MCP support.
echo.
echo Platform Support:
echo   - macOS: ✅ Fully supported with MCP integration
echo   - Linux: ✅ Fully supported with MCP integration
echo   - Windows: ⚠️ Use cline-call.bat instead

EOF
}

# Function to show version
show_version() {
    echo "$SCRIPT_NAME v$SCRIPT_VERSION"
    echo "Wrapper for Cline CLI integration with Stigmergy system"
    echo "Platform: $(uname -s) $(uname -r)"
}

# Function to check if Cline CLI is available
check_cline_availability() {
    if ! command -v cline &> /dev/null; then
        error_exit "Cline CLI is not available in PATH\nPlease install Cline CLI first: https://github.com/cline/cline"
    fi
}

# Function to execute Cline CLI with timeout and MCP integration
execute_cline() {
    local cline_args=("$@")
    
    info "Executing: cline ${cline_args[*]}"
    info "Timeout: $TIMEOUT_VALUE seconds"
    info "Working directory: $(pwd)"
    info "Shell: $SHELL"
    info "MCP Integration: Enabled"
    info "Stigmergy Collaboration: $STIGMERGY_COLLABORATION_MODE"
    
    # Check if this is an MCP server start command
    if [[ "${cline_args[*]}" == "mcp start" ]]; then
        info "Starting Cline MCP server for Stigmergy integration..."
        python3 "$CLINE_MCP_SERVER_PATH"
        return $?
    fi
    
    # Use timeout command if available, otherwise use a custom timeout implementation
    if command -v timeout &> /dev/null; then
        info "Using system timeout command"
        timeout "$TIMEOUT_VALUE" cline "${cline_args[@]}"
    elif command -v gtimeout &> /dev/null; then
        info "Using GNU timeout command"
        gtimeout "$TIMEOUT_VALUE" cline "${cline_args[@]}"
    else
        info "Using custom timeout implementation"
        custom_timeout "$TIMEOUT_VALUE" cline "${cline_args[@]}"
    fi
}

# Custom timeout implementation for systems without timeout command
custom_timeout() {
    local timeout_seconds="$1"
    shift
    local command=("$@")
    
    # Execute command in background
    local cmd_pid
    "${command[@]}" &
    cmd_pid=$!
    
    # Setup timeout
    local timeout_pid
    (
        sleep "$timeout_seconds"
        if kill -0 "$cmd_pid" 2>/dev/null; then
            info "Command timed out after $timeout_seconds seconds"
            kill -TERM "$cmd_pid" 2>/dev/null
            sleep 2
            kill -KILL "$cmd_pid" 2>/dev/null
        fi
    ) &
    timeout_pid=$!
    
    # Wait for command to complete
    if wait "$cmd_pid"; then
        local exit_code=$?
        kill "$timeout_pid" 2>/dev/null
        wait "$timeout_pid" 2>/dev/null
        return $exit_code
    else
        local exit_code=$?
        kill "$timeout_pid" 2>/dev/null
        wait "$timeout_pid" 2>/dev/null
        return $exit_code
    fi
}

# Function to handle signals
signal_handler() {
    local signal=$1
    info "Received signal: $signal"
    if [[ -n "${CMD_PID:-}" ]] && kill -0 "$CMD_PID" 2>/dev/null; then
        info "Terminating Cline CLI process: $CMD_PID"
        kill -TERM "$CMD_PID" 2>/dev/null
        sleep 2
        kill -KILL "$CMD_PID" 2>/dev/null
    fi
    exit 130
}

# Setup signal handlers
trap 'signal_handler INT' INT
trap 'signal_handler TERM' TERM

# Parse command line arguments
CLI_ARGUMENTS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            HELP_MODE=1
            show_help
            exit 0
            ;;
        --version)
            show_version
            exit 0
            ;;
        --timeout)
            TIMEOUT_VALUE="$2"
            if ! [[ "$TIMEOUT_VALUE" =~ ^[0-9]+$ ]]; then
                error_exit "Invalid timeout value: $TIMEOUT_VALUE"
            fi
            shift 2
            ;;
        --verbose)
            VERBOSE_MODE=1
            shift
            ;;
        *)
            CLI_ARGUMENTS+=("$1")
            shift
            ;;
    esac
done

# Check for empty arguments
if [[ ${#CLI_ARGUMENTS[@]} -eq 0 ]]; then
    error_exit "No arguments provided\nUse --help for usage information"
fi

# Check Cline CLI availability
check_cline_availability

# Get Cline version for verbose output
if [[ $VERBOSE_MODE -eq 1 ]]; then
    CLINE_VERSION=$(cline --version 2>/dev/null || echo "unknown")
    info "Cline CLI version: $CLINE_VERSION"
fi

# Execute Cline CLI
EXIT_CODE=0
if execute_cline "${CLI_ARGUMENTS[@]}"; then
    success "Cline CLI execution completed successfully"
    EXIT_CODE=0
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 124 ]]; then
        error_exit "Cline CLI execution timed out after $TIMEOUT_VALUE seconds"
    elif [[ $EXIT_CODE -eq 127 ]]; then
        error_exit "Cline CLI command not found"
    else
        error_exit "Cline CLI execution failed with exit code $EXIT_CODE"
    fi
fi

exit $EXIT_CODE