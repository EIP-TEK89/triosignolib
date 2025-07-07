@echo off
setlocal enabledelayedexpansion

REM Script to publish the triosigno-lib-web package

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
    echo Error: Core tarball path must be specified with --core-tarball=PATH
    exit /b 1
)

REM Ensure the core tarball exists
if not exist "%CORE_TARBALL%" (
    echo Error: Core tarball does not exist: %CORE_TARBALL%
    exit /b 1
)

REM Get the root directory of the project
set "ROOT_DIR=%cd%"
set "WEB_DIR=%ROOT_DIR%\web"
@REM echo Root directory: %ROOT_DIR%
@REM echo WEB directory: %WEB_DIR%

echo Publishing the web package...

REM Check that the web directory exists
if not exist "%WEB_DIR%" (
    echo Error: Web directory does not exist in %ROOT_DIR%
    exit /b 1
)

REM Clean and prepare the web directory
echo Cleaning the web directory...
if exist "%WEB_DIR%\node_modules" rmdir /s /q "%WEB_DIR%\node_modules" >nul 2>&1
if exist "%WEB_DIR%\dist" rmdir /s /q "%WEB_DIR%\dist" >nul 2>&1
del "%WEB_DIR%\*.tgz" >nul 2>&1

REM Install dependencies for web
cd /d "%WEB_DIR%" || (
    echo Error: Cannot access directory %WEB_DIR%
    exit /b 1
)

echo Installing dependencies for web...

REM Create a temporary package.json without scripts to avoid loops
copy package.json package.json.original >nul
node -e "const pkg = require('./package.json'); delete pkg.scripts.prepare; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

REM Install external dependencies first
echo Installing external dependencies...
call npm install onnxruntime-web onnxruntime-common %NPM_FLAGS% --ignore-scripts
if errorlevel 1 (
    echo [X] Failed to install external dependencies
    move package.json.original package.json >nul
    exit /b 1
)

REM Install the local core tarball
echo Installing local core package...
call npm install "%CORE_TARBALL%" %NPM_FLAGS% --ignore-scripts
if errorlevel 1 (
    echo [X] Failed to install core package in web
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
echo Creating symbolic links...
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
echo onnxruntime-web: %CD%\node_modules\onnxruntime-web
echo onnxruntime-common: %CD%\node_modules\onnxruntime-common

REM Restore the original package.json
move package.json.original package.json >nul

REM Build the web package
echo Building the web package...
call npm run build
if errorlevel 1 (
    echo [X] Failed to build the web package

    REM Additional diagnostics
    echo Diagnostics for the compilation issue...
    echo Contents of tsconfig.json:
    type tsconfig.json

    echo TypeScript module resolution:
    call npx tsc --traceResolution | findstr /I "triosigno-lib-core onnxruntime-web"

    exit /b 1
)

REM Create a tarball for local use
echo Creating local web package...
call npm pack
if errorlevel 1 (
    echo [X] Failed to create local web package
    exit /b 1
)

REM Get the tarball path
for /f "delims=" %%f in ('dir /b /o-d "*.tgz" 2^>nul') do (
    set "WEB_TARBALL=%%f"
    goto found_tarball
)

echo [X] No tarball file created for web
exit /b 1

:found_tarball
set "WEB_TARBALL_PATH=%WEB_DIR%\%WEB_TARBALL%"
echo [V] Web package successfully created: %WEB_TARBALL_PATH%

REM Publish the web package unless in dry-run mode
if "%DRY_RUN%"=="true" (
    echo Dry-run mode - Not publishing triosigno-lib-web
) else (
    echo Publishing triosigno-lib-web package...
    call npm publish --access public
    if errorlevel 1 (
        echo [X] Failed to publish triosigno-lib-web package
        exit /b 1
    )
    echo [V] triosigno-lib-web package published successfully
)

echo [V] Web package processing completed successfully

REM Export the tarball path for other scripts
echo %WEB_TARBALL_PATH%

endlocal
