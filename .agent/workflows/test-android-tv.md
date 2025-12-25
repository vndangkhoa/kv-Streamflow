---
description: How to test Android TV D-pad navigation on emulator
---

# Android TV Emulator Testing Workflow

This workflow guides you through testing the StreamFlix app on an Android TV emulator to verify D-pad (remote control) navigation works correctly.

## Prerequisites

- Android Studio installed
- Android SDK with emulator tools
- Node.js and npm

## Step 1: Setup Android TV Emulator (One-Time)

// turbo
```bash
# Check if you have an Android TV system image
sdkmanager --list 2>/dev/null | grep -i "tv\|Television" | head -5
```

If no TV images are installed:
```bash
# Install Android TV system image (API 31)
sdkmanager "system-images;android-31;google_apis;x86_64"
```

Create the Android TV AVD:
```bash
# Create TV emulator (one-time setup)
avdmanager create avd -n "AndroidTV_API31" -k "system-images;android-31;google_apis;x86_64" -d "tv_1080p" --force
```

## Step 2: Start the Emulator

```bash
# Start Android TV Emulator
emulator -avd AndroidTV_API31 &
```

Wait for the emulator to fully boot (shows Android TV home screen).

## Step 3: Build and Deploy the App

// turbo
```bash
cd /Users/khoa.vo/Downloads/Streamflow-main/frontend

# Build the web app
npm run build

# Sync to Android project
npx cap sync android
```

// turbo
```bash
cd /Users/khoa.vo/Downloads/Streamflow-main/frontend/android

# Build debug APK
./gradlew assembleDebug
```

// turbo
```bash
# Install on emulator
adb install -r /Users/khoa.vo/Downloads/Streamflow-main/frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 4: Launch and Test

```bash
# Launch the app
adb shell am start -n com.streamflix.app/.MainActivity
```

## Step 5: D-Pad Navigation Test Checklist

Use the emulator's D-pad controls (arrow keys on keyboard) to test:

| Test | How to Test | Expected |
|------|-------------|----------|
| Initial Focus | Launch app, wait for content | First video card has red glow border |
| Right Arrow | Press → key | Focus moves to next card in row |
| Left Arrow | Press ← key | Focus moves to previous card |
| Down Arrow | Press ↓ key | Focus moves to row below |
| Up Arrow | Press ↑ key | Focus moves to row above |
| Enter/OK | Press Enter on focused card | Video starts playing or info opens |
| Back Button | Press Backspace or Escape | Returns to previous screen |
| Watch Page | Navigate to a movie, play it | Episode list is navigable with D-pad |

## Keyboard Shortcuts in Emulator

- **Arrow Keys**: D-pad navigation
- **Enter**: OK/Select button
- **Backspace**: Back button
- **Escape**: Also acts as Back

## Troubleshooting

**Emulator not starting?**
```bash
# Check if emulator is installed
emulator -list-avds
```

**App not installing?**
```bash
# Check device connection
adb devices
```

**D-pad not working?**
- Make sure Capacitor config points to local build, not remote URL
- Check browser console in Chrome DevTools (chrome://inspect)
