#!/bin/bash
# StreamFlix APK Deployment Script
# Uploads Mobile and TV APKs to GitHub Releases for easy distribution

APK_MOBILE_SOURCE="frontend/android/app/build/outputs/apk/debug/app-debug.apk"
APK_TV_SOURCE="frontend/android/app/build/outputs/apk/debug/app-debug.apk"  # Same APK for now, update when separate TV build is ready
REPO="vndangkhoa/Streamflow"

# Get version from build.gradle
VERSION=$(grep -o 'versionName "[^"]*"' frontend/android/app/build.gradle | sed 's/versionName "//;s/"//')
TAG="v${VERSION}"

echo "🚀 Deploying StreamFlix APKs ${TAG}..."

# 1. Check if APK exists
if [ ! -f "$APK_MOBILE_SOURCE" ]; then
    echo "❌ Mobile APK build not found at $APK_MOBILE_SOURCE"
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

# 3. Prepare APKs with standard names
APK_MOBILE_NAME="StreamFlix.apk"
APK_TV_NAME="StreamFlix-TV.apk"

cp "$APK_MOBILE_SOURCE" "$APK_MOBILE_NAME"
echo "📱 Prepared Mobile APK: $APK_MOBILE_NAME"

cp "$APK_TV_SOURCE" "$APK_TV_NAME"
echo "📺 Prepared TV APK: $APK_TV_NAME"

# 4. Create GitHub Release and upload APKs
echo "📤 Creating GitHub Release ${TAG}..."

# Check if release already exists
if gh release view "$TAG" --repo "$REPO" &> /dev/null; then
    echo "⚠️  Release $TAG already exists. Updating..."
    gh release upload "$TAG" "$APK_MOBILE_NAME" "$APK_TV_NAME" --repo "$REPO" --clobber
else
    echo "✨ Creating new release $TAG..."
    gh release create "$TAG" "$APK_MOBILE_NAME" "$APK_TV_NAME" \
        --repo "$REPO" \
        --title "StreamFlix ${TAG}" \
        --notes "### What's New in ${TAG}

## Downloads

| Platform | APK |
|----------|-----|
| 📱 Android Mobile | StreamFlix.apk |
| 📺 Android TV | StreamFlix-TV.apk |

### Features
- 🎬 Cinema-quality streaming
- 📱 Optimized for mobile touch navigation
- 📺 D-pad navigation for Android TV remotes
- 🚀 Ad-free, high performance

### Installation
1. Download the appropriate APK for your device
2. Enable \"Install from Unknown Sources\" if prompted
3. Open and install the APK"
fi

# 5. Cleanup
rm "$APK_MOBILE_NAME" "$APK_TV_NAME"

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "------------------------------------------------"
echo "📱 Mobile Download URL:"
echo "   https://github.com/${REPO}/releases/latest/download/StreamFlix.apk"
echo ""
echo "📺 TV Download URL:"
echo "   https://github.com/${REPO}/releases/latest/download/StreamFlix-TV.apk"
echo ""
echo "🌐 The download page will automatically link to these APKs."
echo "   No Docker rebuild required!"
echo "------------------------------------------------"
