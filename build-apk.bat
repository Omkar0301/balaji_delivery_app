@echo off

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=D:\Android\Sdk"
set "PATH=C:\Program Files\Java\jdk-17\bin;D:\Android\Sdk\platform-tools;D:\Android\Sdk\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0android"

:: Ensure ExpoModulesPackageList is in expo source directory for Kotlin compiler
if not exist "%~dp0node_modules\expo\android\src\main\java\expo\modules\ExpoModulesPackageList.kt" (
    copy /Y "%~dp0android\expo-backup\ExpoModulesPackageList.kt" "%~dp0node_modules\expo\android\src\main\java\expo\modules\ExpoModulesPackageList.kt" >nul
)

if /i "%~1"=="aab" goto build_aab
if /i "%~1"=="universal" goto build_universal

:build_arm64
echo ===================================================
echo   Building Balaji Fresh Optimized Release APK (arm64-v8a)
echo ===================================================
call gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
if %ERRORLEVEL% EQU 0 (
    copy /Y "%~dp0android\app\build\outputs\apk\release\app-release.apk" "%~dp0BalajiFresh-release.apk"
    echo.
    echo ===================================================
    echo   BUILD SUCCESSFUL!
    echo   Optimized APK: %~dp0BalajiFresh-release.apk
    echo ===================================================
    exit /b 0
) else (
    echo [ERROR] Optimized APK Build failed.
    exit /b %ERRORLEVEL%
)

:build_universal
echo ===================================================
echo   Building Balaji Fresh Universal Release APK (All ABIs)
echo ===================================================
call gradlew.bat assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
if %ERRORLEVEL% EQU 0 (
    copy /Y "%~dp0android\app\build\outputs\apk\release\app-release.apk" "%~dp0BalajiFresh-release-universal.apk"
    copy /Y "%~dp0android\app\build\outputs\apk\release\app-release.apk" "%~dp0BalajiFresh-release.apk"
    echo.
    echo ===================================================
    echo   BUILD SUCCESSFUL!
    echo   Universal APK: %~dp0BalajiFresh-release-universal.apk
    echo ===================================================
    exit /b 0
) else (
    echo [ERROR] Universal APK Build failed.
    exit /b %ERRORLEVEL%
)

:build_aab
echo ===================================================
echo   Building Balaji Fresh Android App Bundle (AAB)
echo ===================================================
call gradlew.bat bundleRelease
if %ERRORLEVEL% EQU 0 (
    copy /Y "%~dp0android\app\build\outputs\bundle\release\app-release.aab" "%~dp0BalajiFresh-release.aab"
    echo.
    echo ===================================================
    echo   BUILD SUCCESSFUL!
    echo   AAB Generated at: %~dp0BalajiFresh-release.aab
    echo ===================================================
    exit /b 0
) else (
    echo [ERROR] AAB Build failed.
    exit /b %ERRORLEVEL%
)
