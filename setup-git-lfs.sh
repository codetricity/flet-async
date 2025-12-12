#!/bin/bash

# Setup Git LFS for large app.zip file
# Run this script in your deployment directory

set -e

echo "Setting up Git LFS..."

# Check if Git LFS is installed
if ! command -v git-lfs &> /dev/null; then
    echo "ERROR: Git LFS is not installed."
    echo "Install it with: brew install git-lfs"
    echo "Or download from: https://git-lfs.github.com/"
    exit 1
fi

# Initialize Git LFS
echo "Initializing Git LFS..."
git lfs install

# Track the large file
echo "Tracking assets/app/app.zip with Git LFS..."
git lfs track "assets/app/app.zip"

# Add .gitattributes
echo "Adding .gitattributes..."
git add .gitattributes

# Check if app.zip exists and needs to be added
if [ -f "assets/app/app.zip" ]; then
    echo "Adding app.zip to Git LFS..."
    git add assets/app/app.zip
    echo "✓ app.zip will be tracked by Git LFS"
else
    echo "⚠ app.zip not found. It will be tracked when you add it."
fi

echo ""
echo "Setup complete! Next steps:"
echo "  1. Commit: git commit -m 'Add Git LFS tracking for app.zip'"
echo "  2. Push: git push origin main"
echo ""
echo "To verify LFS tracking: git lfs ls-files"
