@echo off
setlocal enabledelayedexpansion

REM Main script to publish all triosigno-lib packages

REM Default variables
set DRY_RUN=false
set DRY_RUN_FLAG=

REM Process arguments
:parse_args
if "%~1"=="--dry-run" (
    set DRY_RUN=true
    set DRY_RUN_FLAG=--dry-run
    shift
    goto parse_args
)
if not "%~1"=="" (
    shift
    goto parse_args
)

if "%DRY_RUN%"=="true" (
    echo "Dry run mode enabled (--dry-run) - no publishing will be performed"
) else (
    echo "Starting publishing of TrioSigno packages"
)

REM Get the root directory of the project
set "ROOT_DIR=%~dp0"
echo Root directory: %ROOT_DIR%

REM Clean temporary directories
echo Cleaning temporary directories...
if exist "%ROOT_DIR%\temp-core-dist" rmdir /s /q "%ROOT_DIR%\temp-core-dist" >nul 2>&1
if exist "%ROOT_DIR%\temp-check" rmdir /s /q "%ROOT_DIR%\temp-check" >nul 2>&1
del "%ROOT_DIR%\core\*.tgz" >nul 2>&1
del "%ROOT_DIR%\web\*.tgz" >nul 2>&1
del "%ROOT_DIR%\mobile\*.tgz" >nul 2>&1

REM Check dependencies between packages
echo Checking dependencies between packages...
REM Create a temporary variable with ROOT_DIR slashes replaced by forward slashes
set "ROOT_DIR_SLASH=%ROOT_DIR:\=/%"

REM Read package versions
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/core/package.json').version)"') do set CORE_VERSION=%%i
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/web/package.json').version)"') do set WEB_VERSION=%%i
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/mobile/package.json').version)"') do set MOBILE_VERSION=%%i

echo Current versions:
echo   core:   %CORE_VERSION%
echo   web:    %WEB_VERSION%
echo   mobile: %MOBILE_VERSION%

REM Check that core dependencies are correct
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/web/package.json').dependencies['triosigno-lib-core'] || 'undefined')"') do set WEB_CORE_DEP=%%i
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/mobile/package.json').dependencies['triosigno-lib-core'] || 'undefined')"') do set MOBILE_CORE_DEP=%%i

echo Core dependencies:
echo   web:    %WEB_CORE_DEP%
echo   mobile: %MOBILE_CORE_DEP%

@REM REM Remove '^' or '~' from versions
@REM set WEB_CORE_DEP_CLEAN=%WEB_CORE_DEP:^=%
@REM set WEB_CORE_DEP_CLEAN=%WEB_CORE_DEP_CLEAN:~=%
@REM set MOBILE_CORE_DEP_CLEAN=%MOBILE_CORE_DEP:^=%
@REM set MOBILE_CORE_DEP_CLEAN=%MOBILE_CORE_DEP_CLEAN:~=%


REM Check version compatibility for web
if not "%WEB_CORE_DEP%"=="%CORE_VERSION%" (
    echo "[W] The triosigno-lib-core dependency in web (%WEB_CORE_DEP%) does not match the latest version (%CORE_VERSION%)"

    if defined CI (
        echo CI mode detected - Automatically updating triosigno-lib-core dependency in web...
        powershell -Command "(Get-Content '%ROOT_DIR%\web\package.json') -replace '\"triosigno-lib-core\": \".*\"', '\"triosigno-lib-core\": \"^%CORE_VERSION%\"' | Set-Content '%ROOT_DIR%\web\package.json'"
    ) else (
        echo Do you want to update this dependency? (y/n)
        set /p answer=
        if /i "!answer!"=="y" (
            echo Updating triosigno-lib-core dependency in web...
            powershell -Command "(Get-Content '%ROOT_DIR%\web\package.json') -replace '\"triosigno-lib-core\": \".*\"', '\"triosigno-lib-core\": \"^%CORE_VERSION%\"' | Set-Content '%ROOT_DIR%\web\package.json'"
        ) else (
            echo Keeping the current version.
        )
    )
)

REM Check version compatibility for mobile
if not "%MOBILE_CORE_DEP%"=="%CORE_VERSION%" (
    echo "[W] The triosigno-lib-core dependency in mobile (%MOBILE_CORE_DEP%) does not match the latest version (%CORE_VERSION%)"

    if defined CI (
        echo CI mode detected - Automatically updating triosigno-lib-core dependency in mobile...
        powershell -Command "(Get-Content '%ROOT_DIR%\mobile\package.json') -replace '\"triosigno-lib-core\": \".*\"', '\"triosigno-lib-core\": \"^%CORE_VERSION%\"' | Set-Content '%ROOT_DIR%\mobile\package.json'"
    ) else (
        echo Do you want to update this dependency? (y/n)
        set /p answer=
        if /i "!answer!"=="y" (
            echo Updating triosigno-lib-core dependency in mobile...
            powershell -Command "(Get-Content '%ROOT_DIR%\mobile\package.json') -replace '\"triosigno-lib-core\": \".*\"', '\"triosigno-lib-core\": \"^%CORE_VERSION%\"' | Set-Content '%ROOT_DIR%\mobile\package.json'"
        ) else (
            echo Keeping the current version.
        )
    )
)

REM ========= SEQUENTIAL PACKAGE PUBLISHING =========

REM 1. Publish core package
echo ===== STEP 1: Publishing core package =====
echo "%ROOT_DIR%
call "%ROOT_DIR%\scripts\publish-core.bat" %DRY_RUN_FLAG%
if errorlevel 1 (
    echo [X] Failed to publish core package
    exit /b 1
)

REM Get the core tarball path (assume it's stored in a temp file or environment variable)
REM For simplicity, we'll find the most recent .tgz file in the core directory
for /f "delims=" %%f in ('dir /b /o-d "%ROOT_DIR%\core\*.tgz" 2^>nul ^| findstr /n "^" ^| findstr "^1:"') do (
    set "temp=%%f"
    set "CORE_TARBALL=%ROOT_DIR%\core\!temp:~2!"
)
echo Core tarball: %CORE_TARBALL%

REM 2. Publish web package
echo ===== STEP 2: Publishing web package =====
call "%ROOT_DIR%\scripts\publish-web.bat" %DRY_RUN_FLAG% "--core-tarball=%CORE_TARBALL%"
if errorlevel 1 (
    echo [X] Failed to publish web package
    exit /b 1
)

REM Get the web tarball path
for /f "delims=" %%f in ('dir /b /o-d "%ROOT_DIR%\web\*.tgz" 2^>nul ^| findstr /n "^" ^| findstr "^1:"') do (
    set "temp=%%f"
    set "WEB_TARBALL=%ROOT_DIR%\web\!temp:~2!"
)
echo Web tarball: %WEB_TARBALL%

REM 3. Publish mobile package
echo ===== STEP 3: Publishing mobile package =====
call "%ROOT_DIR%\scripts\publish-mobile.bat" %DRY_RUN_FLAG% "--core-tarball=%CORE_TARBALL%"
if errorlevel 1 (
    echo [X] Failed to publish mobile package
    exit /b 1
)

REM Get the mobile tarball path
for /f "delims=" %%f in ('dir /b /o-d "%ROOT_DIR%\mobile\*.tgz" 2^>nul ^| findstr /n "^" ^| findstr "^1:"') do (
    set "temp=%%f"
    set "MOBILE_TARBALL=%ROOT_DIR%\mobile\!temp:~2!"
)
echo Mobile tarball: %MOBILE_TARBALL%

REM Clean up temporary files
echo Final cleanup of temporary files...
del "%ROOT_DIR%\core\*.tgz" >nul 2>&1
del "%ROOT_DIR%\web\*.tgz" >nul 2>&1
del "%ROOT_DIR%\mobile\*.tgz" >nul 2>&1

echo [V] All packages have been processed successfully!
if "%DRY_RUN%"=="true" (
    echo "Note: Executed in dry run mode (--dry-run) - no publishing was performed"
) else (
    echo Packages have been published to npm
)

endlocal
