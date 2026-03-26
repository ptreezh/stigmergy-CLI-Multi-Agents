#!/bin/bash

# Final comprehensive cleanup - remove all temporary files
echo "Starting final comprehensive cleanup..."

# Create archive for anything we might need later
mkdir -p .archive/temp-analysis
mkdir -p .archive/competition-results
mkdir -p .archive/evolution-results

# Move analysis files to archive
echo "Moving analysis files to archive..."
find . -maxdepth 1 -type f -name "analysis-*.md" -exec mv {} .archive/temp-analysis/ \;

# Move competition files to archive
echo "Moving competition files to archive..."
find . -maxdepth 1 -type f -name "competition-*.md" -exec mv {} .archive/competition-results/ \;

# Move evolution files to archive
echo "Moving evolution files to archive..."
find . -maxdepth 1 -type f -name "evolution-*.md" -exec mv {} .archive/evolution-results/ \;

# Remove all temporary markdown files except essential ones
echo "Removing temporary markdown files..."
find . -maxdepth 1 -type f -name "*.md" ! -name "CLAUDE.md" ! -name "README.md" ! -name "CHANGELOG.md" ! -name "LICENSE" ! -name "AGENTS.md" ! -name "SOUL.md" -delete

# Remove any remaining temporary files
echo "Removing remaining temporary files..."
find . -maxdepth 1 -type f \( \
  -name "*.json" ! -name "package.json" ! -name "PROJECT_SPEC.json" ! -name ".resumesession" -o \
  -name "*.txt" ! -name "LICENSE.txt" -o \
  -name "*.tmp" -o \
  -name "*.bak" -o \
  -name "*.old" -o \
  -name "*.backup" -o \
  -name "*~" \
\) -delete

# Count final files
echo ""
echo "Final cleanup completed!"
echo "Files remaining in root:"
find . -maxdepth 1 -type f | wc -l

echo ""
echo "Essential files preserved:"
ls -1 *.md LICENSE 2>/dev/null | grep -v "^\."

echo ""
echo "Archived directories created:"
echo "- .archive/temp-analysis/"
echo "- .archive/competition-results/"
echo "- .archive/evolution-results/"
echo ""
echo "You can delete .archive/ directory if you don't need these files"