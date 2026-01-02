#!/bin/bash
echo "🚀 Starting StreamFlix Android TV Build..."

# Setup Java 21 (required for Gradle 8.10.2)
export JAVA_HOME=/tmp/jdk-21.0.9+10/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
echo "📍 Using Java: $(java -version 2>&1 | head -1)"

# Navigate to android-tv directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/android-tv"

# Check if gradle wrapper jar exists, download if not
WRAPPER_JAR="gradle/wrapper/gradle-wrapper.jar"
if [ ! -f "$WRAPPER_JAR" ]; then
    echo "📥 Setting up Gradle wrapper..."
    mkdir -p gradle/wrapper
    
    # First try copying from mobile project
    if [ -f "$SCRIPT_DIR/frontend/android/gradle/wrapper/gradle-wrapper.jar" ]; then
        echo "📋 Copying wrapper from mobile project..."
        cp "$SCRIPT_DIR/frontend/android/gradle/wrapper/gradle-wrapper.jar" "$WRAPPER_JAR"
    else
        echo "📥 Downloading Gradle wrapper..."
        curl -fsSL -o "$WRAPPER_JAR" "https://services.gradle.org/distributions/gradle-8.10.2-bin.zip" 2>/dev/null || \
        curl -fsSL -o "$WRAPPER_JAR" "https://raw.githubusercontent.com/nicoulaj/gradle-wrapper/master/gradle-wrapper.jar" 2>/dev/null
    fi
fi

# Make gradlew executable
chmod +x gradlew

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "📦 Building Debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    echo "✅ Build Success!"
    echo "📂 APK Location: android-tv/$APK_PATH"
    
    # Copy to root directory with descriptive name
    cp "$APK_PATH" "../StreamFlixTV-debug.apk"
    echo "📋 Copied to: StreamFlixTV-debug.apk"
    
    # Open the folder on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "app/build/outputs/apk/debug/"
    fi
else
    echo "❌ Build Failed"
    exit 1
fi
