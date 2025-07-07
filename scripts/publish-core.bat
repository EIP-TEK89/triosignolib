@echo off
setlocal enabledelayedexpansion

REM Script to publish the triosigno-lib-core package

REM Default variables
set DRY_RUN=false
set NPM_FLAGS=--legacy-peer-deps

REM Process arguments
:parse_args
if "%~1"=="--dry-run" (
    set DRY_RUN=true
    shift
    goto parse_args
)
if not "%~1"=="" (
    shift
    goto parse_args
)

REM Get the root directory of the project
set "ROOT_DIR=%~dp0"
set "CORE_DIR=%ROOT_DIR%\core"

echo Publishing core package...

REM Check that the core directory exists
if not exist "%CORE_DIR%" (
    echo Error: The core directory does not exist in %ROOT_DIR%
    exit /b 1
)

REM Clean and prepare the core directory
echo Cleaning the core directory...
if exist "%CORE_DIR%\node_modules" rmdir /s /q "%CORE_DIR%\node_modules" >nul 2>&1
if exist "%CORE_DIR%\dist" rmdir /s /q "%CORE_DIR%\dist" >nul 2>&1
del "%CORE_DIR%\*.tgz" >nul 2>&1

REM Install dependencies for core
cd /d "%CORE_DIR%" || (
    echo Error: Cannot access directory %CORE_DIR%
    exit /b 1
)

echo Installing dependencies for core...
call npm install %NPM_FLAGS%
if errorlevel 1 (
    echo [X] Failed to install dependencies for core
    exit /b 1
)

REM Build the core package
echo Building the core package...
call npm run build
if errorlevel 1 (
    echo [X] Failed to build the core package
    exit /b 1
)

REM Create a tarball for local use
echo Creating local core package...
call npm pack
if errorlevel 1 (
    echo [X] Failed to create local core package
    exit /b 1
)

REM Get the tarball path
for /f "delims=" %%f in ('dir /b /o-d "*.tgz" 2^>nul') do (
    set "CORE_TARBALL=%%f"
    goto found_tarball
)

echo [X] No tarball file created for core
exit /b 1

:found_tarball
set "CORE_TARBALL_PATH=%CORE_DIR%\%CORE_TARBALL%"
echo [V] Core package successfully created: %CORE_TARBALL_PATH%

REM Publish the core package if not in dry-run mode
if "%DRY_RUN%"=="true" (
    echo Dry-run mode - Not publishing triosigno-lib-core
) else (
    echo Publishing triosigno-lib-core package...
    call npm publish --access public
    if errorlevel 1 (
        echo [X] Failed to publish triosigno-lib-core package
        exit /b 1
    )
    echo [V] triosigno-lib-core package published successfully
)

echo [V] Core package processing completed successfully

REM Export the tarball path for other scripts
echo %CORE_TARBALL_PATH%

endlocal
