#!/bin/bash

# Migrate existing app.zip to Git LFS
# This removes the large file from git history and replaces it with LFS pointers

set -e

echo "Migrating app.zip to Git LFS..."

# Make sure we're on main branch
git checkout main

# Migrate the file
echo "Migrating assets/app/app.zip to LFS..."
git lfs migrate import --include="assets/app/app.zip" --everything

echo ""
echo "Migration complete! The file is now tracked by LFS."
echo ""
echo "Next steps:"
echo "  1. Force push (if you've already pushed): git push --force origin main"
echo "  2. Or if first time: git push origin main"
echo ""
echo "⚠️  WARNING: Force push rewrites history. Only do this if you're the only one working on this repo!"
