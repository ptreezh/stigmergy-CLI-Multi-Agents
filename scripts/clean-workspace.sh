#!/bin/bash
# Bash script to clean AI-generated temporary files from workspace
# This script removes .tmp., .draft., and .review. files according to DNASPEC rules

DRY_RUN=false
FORCE=false
INCLUDE_DRAFT=false
INCLUDE_REVIEW=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --include-draft)
            INCLUDE_DRAFT=true
            shift
            ;;
        --include-review)
            INCLUDE_REVIEW=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🧹 Cleaning AI-generated temporary files from workspace"

# Define file patterns
patterns=("*.tmp.*")

if [ "$INCLUDE_DRAFT" = true ]; then
    patterns+=("*.draft.*")
fi

if [ "$INCLUDE_REVIEW" = true ]; then
    patterns+=("*.review.*")
fi

# Directories to exclude
exclude_dirs=("node_modules" ".git" "dist" "build" "coverage" ".next" "out")

echo ""
echo "📋 Search patterns:"
for pattern in "${patterns[@]}"; do
    echo "   - $pattern"
done

echo ""
echo "🚫 Excluding directories:"
for dir in "${exclude_dirs[@]}"; do
    echo "   - $dir"
done

echo ""

# Find files
files_to_remove=()
for pattern in "${patterns[@]}"; do
    while IFS= read -r -d '' file; do
        # Check if file is in excluded directory
        excluded=false
        for exclude_dir in "${exclude_dirs[@]}"; do
            if [[ "$file" == *"/$exclude_dir/"* ]]; then
                excluded=true
                break
            fi
        done

        if [ "$excluded" = false ]; then
            files_to_remove+=("$file")
        fi
    done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
done

if [ ${#files_to_remove[@]} -eq 0 ]; then
    echo "✅ No temporary files found!"
    exit 0
fi

echo "📊 Found ${#files_to_remove[@]} temporary file(s):"
echo ""

# Group by file type
tmp_files=()
draft_files=()
review_files=()

for file in "${files_to_remove[@]}"; do
    if [[ "$file" =~ \.tmp\. ]]; then
        tmp_files+=("$file")
    elif [[ "$file" =~ \.draft\. ]]; then
        draft_files+=("$file")
    elif [[ "$file" =~ \.review\. ]]; then
        review_files+=("$file")
    fi
done

if [ ${#tmp_files[@]} -gt 0 ]; then
    echo "📝 Temporary files (${#tmp_files[@]}):"
    for file in "${tmp_files[@]}"; do
        size=$(du -h "$file" | cut -f1)
        echo "   - $file ($size)"
    done
fi

if [ ${#draft_files[@]} -gt 0 ] && [ "$INCLUDE_DRAFT" = true ]; then
    echo ""
    echo "📄 Draft files (${#draft_files[@]}):"
    for file in "${draft_files[@]}"; do
        size=$(du -h "$file" | cut -f1)
        echo "   - $file ($size)"
    done
fi

if [ ${#review_files[@]} -gt 0 ] && [ "$INCLUDE_REVIEW" = true ]; then
    echo ""
    echo "📑 Review files (${#review_files[@]}):"
    for file in "${review_files[@]}"; do
        size=$(du -h "$file" | cut -f1)
        echo "   - $file ($size)"
    done
fi

echo ""

# Calculate total size
total_size=0
for file in "${files_to_remove[@]}"; do
    size=$(du -b "$file" | cut -f1)
    total_size=$((total_size + size))
done

total_size_kb=$((total_size / 1024))
total_size_mb=$((total_size / 1024 / 1024))

echo "💾 Total size: ${total_size_kb} KB (${total_size_mb} MB)"
echo ""

# Dry run mode
if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN MODE - No files will be deleted"
    echo "   Use --force flag to actually delete files"
    exit 0
fi

# Confirm deletion
if [ "$FORCE" = false ]; then
    read -p "Delete these files? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled"
        exit 0
    fi
fi

# Delete files
echo "🗑️  Deleting files..."
deleted_count=0
error_count=0

for file in "${files_to_remove[@]}"; do
    if rm -f "$file" 2>/dev/null; then
        echo "   ✅ Deleted: $(basename "$file")"
        deleted_count=$((deleted_count + 1))
    else
        echo "   ❌ Error deleting: $(basename "$file")"
        error_count=$((error_count + 1))
    fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ Deleted: $deleted_count file(s)"
if [ $error_count -gt 0 ]; then
    echo "   ❌ Errors: $error_count"
fi

if [ $deleted_count -gt 0 ]; then
    echo ""
    echo "💡 Tip: Consider committing these deletions with:"
    echo "   git add -A"
    echo "   git commit -m 'chore: Clean AI temporary files'"
fi

exit 0