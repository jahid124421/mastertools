@echo off
setlocal enabledelayedexpansion

echo Preparing deployment...

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Create temp deploy directory outside project tree
set "TMP_DEPLOY=%TEMP%\mastertools_deploy_%RANDOM%"
mkdir "%TMP_DEPLOY%"

echo Copying files (excluding vendor/ffmpeg and .git)...

REM Use robocopy to copy, excluding ffmpeg and phonehub
robocopy "%SCRIPT_DIR%" "%TMP_DEPLOY%" /E /XD vendor\ffmpeg .git phonehub >nul 2>&1

if errorlevel 8 (
    echo Error during copy
    rmdir /s /q "%TMP_DEPLOY%"
    pause
    exit /b 1
)

echo Deploying to Cloudflare Pages...
cd /d "%TMP_DEPLOY%"
npx wrangler pages deploy . --project-name=mastertools --branch=main

set "DEPLOY_EXIT=%ERRORLEVEL%"

REM Cleanup
cd /d "%cd%"
rmdir /s /q "%TMP_DEPLOY%"

if %DEPLOY_EXIT% equ 0 (
    echo.
    echo Deployment successful!
) else (
    echo.
    echo Deployment failed with exit code %DEPLOY_EXIT%
)

pause
exit /b %DEPLOY_EXIT%