@echo off
echo 🚀 Starting StreamFlix Android TV Build (Windows)...

:: Check for Java
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
        set "PATH=C:\Program Files\Android\Android Studio\jbr\bin;%PATH%"
    ) else if exist "C:\Java\jdk-21\bin\java.exe" (
        set "JAVA_HOME=C:\Java\jdk-21"
        set "PATH=C:\Java\jdk-21\bin;%PATH%"
    ) else (
        echo ❌ Java not found. Please ensure Android Studio is installed.
        exit /b 1
    )
)

:: Navigate to android-tv
cd %~dp0\android-tv

:: Run Gradle
echo 🧹 Cleaning and Building Debug APK...
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build Success!
    echo 📂 APK Location: android-tv\app\build\outputs\apk\debug\app-debug.apk
    copy app\build\outputs\apk\debug\app-debug.apk ..\StreamFlixTV-debug.apk >nul
    echo 📋 Copied to: StreamFlixTV-debug.apk
) else (
    echo ❌ Build Failed
    exit /b 1
)
