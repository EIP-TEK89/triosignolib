@echo off
setlocal enabledelayedexpansion

REM Script to publish the triosigno-lib-mobile package

REM Default variables
set DRY_RUN=false
set NPM_FLAGS=--legacy-peer-deps
set CORE_TARBALL=

REM Process arguments
:parse_args
if "%~1"=="--dry-run" (
    set DRY_RUN=true
    shift
    goto parse_args
)
if "%~1" neq "" (
    set "arg=%~1"
    if "!arg:~0,15!"=="--core-tarball=" (
        set "CORE_TARBALL=!arg:~15!"
    )
    shift
    goto parse_args
)

REM Check that the core tarball path is specified
if "%CORE_TARBALL%"=="" (
    echo Error: The core tarball path must be specified with --core-tarball=PATH
    exit /b 1
)

REM Ensure the core tarball exists
if not exist "%CORE_TARBALL%" (
    echo Error: The core tarball does not exist: %CORE_TARBALL%
    exit /b 1
)

REM Get the root directory of the project
set "ROOT_DIR=%cd%"
set "MOBILE_DIR=%ROOT_DIR%\mobile"

echo Publishing the mobile package...

REM Check that the mobile directory exists
if not exist "%MOBILE_DIR%" (
    echo Error: The mobile directory does not exist in %ROOT_DIR%
    exit /b 1
)

REM Clean and prepare the mobile directory
echo Cleaning the mobile directory...
if exist "%MOBILE_DIR%\node_modules" rmdir /s /q "%MOBILE_DIR%\node_modules" >nul 2>&1
if exist "%MOBILE_DIR%\dist" rmdir /s /q "%MOBILE_DIR%\dist" >nul 2>&1
del "%MOBILE_DIR%\*.tgz" >nul 2>&1

REM Install dependencies for mobile
cd /d "%MOBILE_DIR%" || (
    echo Error: Cannot access directory %MOBILE_DIR%
    exit /b 1
)

echo Installing dependencies for mobile...

REM Create a temporary package.json without scripts to avoid loops
copy package.json package.json.original >nul
node -e "const pkg = require('./package.json'); delete pkg.scripts.prepare; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

REM Install external dependencies first
echo Installing external dependencies...
call npm install onnxruntime-react-native react-native-fs %NPM_FLAGS% --ignore-scripts
if errorlevel 1 (
    echo [X] Failed to install external dependencies
    move package.json.original package.json >nul
    exit /b 1
)

REM Install the local core tarball
echo Installing the local core package...
call npm install "%CORE_TARBALL%" %NPM_FLAGS% --ignore-scripts
if errorlevel 1 (
    echo [X] Failed to install the core package in mobile
    move package.json.original package.json >nul
    exit /b 1
)

REM Check core installation
if not exist "node_modules\triosigno-lib-core" (
    echo [X] triosigno-lib-core is not installed correctly
    move package.json.original package.json >nul
    exit /b 1
)

REM Create necessary symlinks (using mklink on Windows)
echo Creating symlinks...
if exist "node_modules\triosigno-lib-core\dist" (
    if exist "node_modules\triosigno-lib-core\src" rmdir "node_modules\triosigno-lib-core\src" >nul 2>&1
    mklink /D "node_modules\triosigno-lib-core\src" "node_modules\triosigno-lib-core\dist" >nul 2>&1
    if errorlevel 1 (
        echo Warning: Could not create symbolic link, copying instead...
        xcopy "node_modules\triosigno-lib-core\dist" "node_modules\triosigno-lib-core\src" /E /I /Y >nul
    )
) else (
    echo [X] The dist directory does not exist in triosigno-lib-core
    move package.json.original package.json >nul
    exit /b 1
)

REM Check important paths
echo Checking import paths...
echo triosigno-lib-core: %CD%\node_modules\triosigno-lib-core
echo onnxruntime-react-native: %CD%\node_modules\onnxruntime-react-native
echo react-native-fs: %CD%\node_modules\react-native-fs

REM Restore the original package.json
move package.json.original package.json >nul

REM Build the mobile package
echo Building the mobile package...
call npm run build
if errorlevel 1 (
    echo [X] Failed to build the mobile package

    REM Additional diagnostics
    echo Diagnostics for the compilation issue...
    echo Contents of tsconfig.json:
    type tsconfig.json

    echo TypeScript module resolution:
    call npx tsc --traceResolution | findstr /I "triosigno-lib-core onnxruntime-react-native"

    exit /b 1
)

REM Create a tarball for local use
echo Creating the local mobile package...
call npm pack
if errorlevel 1 (
    echo [X] Failed to create the local mobile package
    exit /b 1
)

REM Get the tarball path
for /f "delims=" %%f in ('dir /b /o-d "*.tgz" 2^>nul') do (
    set "MOBILE_TARBALL=%%f"
    goto found_tarball
)

echo [X] No tarball file created for mobile
exit /b 1

:found_tarball
set "MOBILE_TARBALL_PATH=%MOBILE_DIR%\%MOBILE_TARBALL%"
echo [V] Mobile package created successfully: %MOBILE_TARBALL_PATH%

REM Publish the mobile package if not in dry-run mode
if "%DRY_RUN%"=="true" (
    echo Dry-run mode - Not publishing triosigno-lib-mobile
) else (
    echo Publishing the triosigno-lib-mobile package...
    call npm publish --access public
    if errorlevel 1 (
        echo [X] Failed to publish the triosigno-lib-mobile package
        exit /b 1
    )
    echo [V] triosigno-lib-mobile package published successfully
)

echo [V] Mobile package processing completed successfully

REM Export the tarball path for other scripts
echo %MOBILE_TARBALL_PATH%

endlocal
