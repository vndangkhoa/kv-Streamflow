#!/bin/bash
echo "🚀 Starting StreamFlix Android Build..."

# 1. Setup Java 17 (using the one we downloaded)
export JAVA_HOME=/tmp/jdk-21.0.9+10/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 2. Setup Gradle (using the one we downloaded)
export PATH=/tmp/gradle-8.10.2/bin:$PATH

echo "📍 Java Home: $JAVA_HOME"
echo "📍 Java Version: $(java -version 2>&1 | head -1)"
echo "📍 Gradle Version: $(gradle -version | grep Gradle | head -1)"

# 3. Clean and Build
cd frontend/android
echo "🧹 Cleaning..."
# gradle clean

echo "📦 Building APK..."
gradle assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Build Success!"
    echo "📂 APK Location: frontend/android/app/build/outputs/apk/debug/app-debug.apk"
    open frontend/android/app/build/outputs/apk/debug/
else
    echo "❌ Build Failed"
    exit 1
fi
