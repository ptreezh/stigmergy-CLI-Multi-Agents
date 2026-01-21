#!/bin/bash
# Script to install Git hooks for Stigmergy CLI Multi-Agents
# This script copies hooks from .git/hooks/ directory and makes them executable

echo "🔧 Installing Git hooks for Stigmergy CLI Multi-Agents..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "❌ ERROR: .git directory not found"
    echo "   Please run this script from the root of a Git repository"
    exit 1
fi

# Check if .git/hooks directory exists
if [ ! -d ".git/hooks" ]; then
    echo "❌ ERROR: .git/hooks directory not found"
    exit 1
fi

# List of hooks to install
HOOKS=("pre-commit" "pre-push" "commit-msg" "post-merge")

# Install hooks
for hook in "${HOOKS[@]}"; do
    hook_file=".git/hooks/$hook"

    if [ -f "$hook_file" ]; then
        echo "📋 Hook already exists: $hook"
        read -p "   Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "   Skipping $hook"
            continue
        fi
    fi

    # Make hook executable
    chmod +x "$hook_file"
    echo "✅ Installed and made executable: $hook"
done

echo ""
echo "🎉 Git hooks installation completed!"
echo ""
echo "📌 Installed hooks:"
for hook in "${HOOKS[@]}"; do
    echo "   - $hook"
done
echo ""
echo "💡 Tips:"
echo "   - pre-commit: Validates files before committing"
echo "   - pre-push: Runs tests before pushing to remote"
echo "   - commit-msg: Validates commit message format"
echo "   - post-merge: Runs tests after merging branches"
echo ""
echo "⚠️  Note: These hooks will run automatically on Git operations."
echo "   You can bypass them with --no-verify flag (not recommended)."