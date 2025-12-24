#!/bin/bash
# StreamFlix APK Deployment Script
# Uploads APK to GitHub Releases for easy distribution

APK_SOURCE="frontend/android/app/build/outputs/apk/debug/app-debug.apk"
REPO="vndangkhoa/Streamflow"

# Get version from build.gradle
VERSION=$(grep -o 'versionName "[^"]*"' frontend/android/app/build.gradle | sed 's/versionName "//;s/"//')
TAG="v${VERSION}"

echo "🚀 Deploying StreamFlix APK ${TAG}..."

# 1. Check if APK exists
if [ ! -f "$APK_SOURCE" ]; then
    echo "❌ APK build not found at $APK_SOURCE"
    echo "   Run ./build_apk.sh first to build the APK."
    exit 1
fi

# 2. Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "   Install it with: brew install gh"
    echo "   Then authenticate with: gh auth login"
    exit 1
fi

# 3. Copy APK with standard name
APK_NAME="StreamFlix.apk"
cp "$APK_SOURCE" "$APK_NAME"
echo "📦 Prepared APK: $APK_NAME"

# 4. Create GitHub Release and upload APK
echo "📤 Creating GitHub Release ${TAG}..."

# Check if release already exists
if gh release view "$TAG" --repo "$REPO" &> /dev/null; then
    echo "⚠️  Release $TAG already exists. Updating..."
    gh release upload "$TAG" "$APK_NAME" --repo "$REPO" --clobber
else
    echo "✨ Creating new release $TAG..."
    gh release create "$TAG" "$APK_NAME" \
        --repo "$REPO" \
        --title "StreamFlix ${TAG}" \
        --notes "### What's New in ${TAG}
- 🤖 Android APK Release
- 📱 Universal APK for all Android devices

### Download
Click **StreamFlix.apk** below to download."
fi

# 5. Cleanup
rm "$APK_NAME"

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "------------------------------------------------"
echo "📱 Download URL:"
echo "   https://github.com/${REPO}/releases/latest/download/StreamFlix.apk"
echo ""
echo "🌐 The download page will automatically link to this APK."
echo "   No Docker rebuild required!"
echo "------------------------------------------------"
