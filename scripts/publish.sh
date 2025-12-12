#!/bin/bash
# Release script for Stigmergy CLI v1.2.1

echo "=========================================="
echo "Stigmergy CLI v1.2.1 Release Preparation"
echo "=========================================="

echo ""
echo "Changes in v1.2.1:"
echo "- Added 'call' command implementation to modular architecture"
echo "- Moved old main.js implementation to archive directory"
echo "- Fixed missing call command functionality in new system"
echo "- Updated version from 1.2.0 to 1.2.1"
echo ""

# Verify package
echo "Verifying package..."
npm pack
echo "Package stigmergy-1.2.1.tgz created successfully"

# Show important files for verification
echo ""
echo "Important files to verify before publishing:"
echo "- package.json: version updated to 1.2.1"
echo "- CHANGELOG.md: updated with v1.2.1 changes"
echo "- src/cli/router.js: contains call command implementation"
echo "- archive/main.js.backup: old implementation preserved"

# Instructions for publishing
echo ""
echo "=========================================="
echo "Publishing Instructions (for maintainers):"
echo "=========================================="
echo ""
echo "Before publishing, ensure you have:"
echo "1. npm login credentials"
echo "2. Two-factor authentication set up (if required)"
echo "3. Permissions to publish to 'stigmergy' package"
echo ""
echo "To publish the package, run:"
echo "  npm publish"
echo ""
echo "To publish a specific tag (e.g., beta):"
echo "  npm publish --tag beta"
echo ""
echo "After publishing, verify the release:"
echo "  npm view stigmergy@1.2.1"
echo ""
echo "=========================================="
echo "Git Tagging Commands:"
echo "=========================================="
echo "After successful npm publish, tag the release:"
echo "  git add ."
echo "  git commit -m \"Release v1.2.1 - Add call command to modular architecture\""
echo "  git tag -a v1.2.1 -m \"Release v1.2.1\""
echo "  git push origin main"
echo "  git push origin v1.2.1"
echo "=========================================="