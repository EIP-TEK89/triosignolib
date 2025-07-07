@echo off
setlocal enabledelayedexpansion

REM Script to update the versions of triosigno-lib packages

REM Default variables
set DRY_RUN=false
set VERSION=

REM Process arguments
:parse_args
if "%~1"=="--dry-run" (
    set DRY_RUN=true
    shift
    goto parse_args
)
if "%~1" neq "" (
    if "%VERSION%"=="" (
        set "VERSION=%~1"
    )
    shift
    goto parse_args
)

@REM REM Check that a version argument was provided
@REM if "%VERSION%" == "" (
@REM     echo Error: Please provide a version number (patch, minor, major or x.y.z)
@REM     exit /b 1
@REM )

if "%DRY_RUN%"=="true" (
    echo "Dry-run mode enabled (--dry-run) - no files will be modified"
)

echo Updating versions to %VERSION%

REM Get the root directory of the project
set "ROOT_DIR=%~dp0"
set "ROOT_DIR_SLASH=%ROOT_DIR:\=/%"

REM Global variables to store new versions
set CORE_NEW_VERSION=
set WEB_NEW_VERSION=
set MOBILE_NEW_VERSION=

REM Function to update the version in package.json
goto skip_functions

:update_version_in_package_json
set "package_dir=%~1"

REM Check if the directory exists
if not exist "%ROOT_DIR%\%package_dir%" (
    echo Error: Directory %ROOT_DIR%\%package_dir% does not exist
    exit /b 1
)

REM Check if package.json exists
if not exist "%ROOT_DIR%\%package_dir%\package.json" (
    echo Error: %ROOT_DIR%\%package_dir%\package.json does not exist
    exit /b 1
)


REM Read the current version
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/%package_dir%/package.json').version)"') do set current_version=%%i

if "%current_version%"=="" (
    echo Error: Unable to read version in %ROOT_DIR%\%package_dir%\package.json
    exit /b 1
)

set new_version=

REM Calculate the new version
if "%VERSION%"=="patch" (
    REM Increment the patch version
    for /f "tokens=1,2,3 delims=." %%a in ("%current_version%") do (
        set /a patch=%%c+1
        set "new_version=%%a.%%b.!patch!"
    )
) else if "%VERSION%"=="minor" (
    REM Increment the minor version and reset patch to 0
    for /f "tokens=1,2,3 delims=." %%a in ("%current_version%") do (
        set /a minor=%%b+1
        set "new_version=%%a.!minor!.0"
    )
) else if "%VERSION%"=="major" (
    REM Increment the major version and reset minor and patch to 0
    for /f "tokens=1,2,3 delims=." %%a in ("%current_version%") do (
        set /a major=%%a+1
        set "new_version=!major!.0.0"
    )
) else (
    REM Use the provided version
    set "new_version=%VERSION%"
)

echo Updating %package_dir% from %current_version% to %new_version%

REM Do not update files in dry-run mode
if "%DRY_RUN%"=="true" (
    echo Dry-run mode - File %ROOT_DIR%\%package_dir%\package.json will not be modified
) else (
    REM Backup the original file
    copy "%ROOT_DIR%\%package_dir%\package.json" "%ROOT_DIR%\%package_dir%\package.json.bak" >nul

    REM Use PowerShell to replace the version in package.json
    powershell -Command "(Get-Content '%ROOT_DIR%\%package_dir%\package.json') -replace '\"version\": \"%current_version%\"', '\"version\": \"%new_version%\"' | Set-Content '%ROOT_DIR%\%package_dir%\package.json'"

    REM Check that the update worked
    if errorlevel 1 (
        echo [X] Failed to update package %package_dir%
        move "%ROOT_DIR%\%package_dir%\package.json.bak" "%ROOT_DIR%\%package_dir%\package.json" >nul
        exit /b 1
    )

    REM Check that the version was updated
    for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/%package_dir%/package.json').version)"') do set updated_version=%%i
    if not "%updated_version%"=="%new_version%" (
        echo [X] Version was not correctly updated in %ROOT_DIR%\%package_dir%\package.json
        move "%ROOT_DIR%\%package_dir%\package.json.bak" "%ROOT_DIR%\%package_dir%\package.json" >nul
        exit /b 1
    )

    REM All good, remove backup
    del "%ROOT_DIR%\%package_dir%\package.json.bak" >nul 2>&1
)

REM Store the new version in a global variable for the current package
if "%package_dir%"=="core" (
    set "CORE_NEW_VERSION=%new_version%"
) else if "%package_dir%"=="web" (
    set "WEB_NEW_VERSION=%new_version%"
) else if "%package_dir%"=="mobile" (
    set "MOBILE_NEW_VERSION=%new_version%"
)

exit /b 0

:update_internal_dependencies
set "package_dir=%~1"
set "dependency=%~2"
set "dependency_version=%~3"

REM Check if package.json has a dependency on the internal package
for /f "delims=" %%i in ('node -e "console.log(require('%ROOT_DIR_SLASH%/%package_dir%/package.json').dependencies && require('%ROOT_DIR%/%package_dir%/package.json').dependencies['%dependency%'] ? 'yes' : 'no')"') do set has_dependency=%%i

if "%has_dependency%"=="yes" (
    echo Updating dependency %dependency% in %package_dir% to ^%dependency_version%

    REM Do not update files in dry-run mode
    if "%DRY_RUN%"=="true" (
        echo Dry-run mode - File %ROOT_DIR%\%package_dir%\package.json will not be modified
    ) else (
        REM Backup the original file
        copy "%ROOT_DIR%\%package_dir%\package.json" "%ROOT_DIR%\%package_dir%\package.json.bak" >nul

        REM Use PowerShell to replace the dependency version
        powershell -Command "(Get-Content '%ROOT_DIR%\%package_dir%\package.json') -replace '\""%dependency%\": \".*\"', '\""%dependency%\": \"^%dependency_version%\"' | Set-Content '%ROOT_DIR%\%package_dir%\package.json'"

        REM Check that the update worked
        if errorlevel 1 (
            echo [X] Failed to update dependency %dependency% in %package_dir%
            move "%ROOT_DIR%\%package_dir%\package.json.bak" "%ROOT_DIR%\%package_dir%\package.json" >nul
            exit /b 1
        )

        REM All good, remove backup
        del "%ROOT_DIR%\%package_dir%\package.json.bak" >nul 2>&1
    )
)

exit /b 0

:skip_functions

REM Update the core package
echo Updating triosigno-lib-core package...
call :update_version_in_package_json "core"
if errorlevel 1 exit /b 1

REM Update the web package
echo Updating triosigno-lib-web package...
call :update_version_in_package_json "web"
if errorlevel 1 exit /b 1

REM Update the mobile package
echo Updating triosigno-lib-mobile package...
call :update_version_in_package_json "mobile"
if errorlevel 1 exit /b 1

REM Update internal dependencies
echo Updating internal dependencies...

REM Update core dependencies in web and mobile
call :update_internal_dependencies "web" "triosigno-lib-core" "%CORE_NEW_VERSION%"
if errorlevel 1 exit /b 1

call :update_internal_dependencies "mobile" "triosigno-lib-core" "%CORE_NEW_VERSION%"
if errorlevel 1 exit /b 1

echo [V] All versions have been updated successfully!
echo   - triosigno-lib-core: %CORE_NEW_VERSION%
echo   - triosigno-lib-web: %WEB_NEW_VERSION%
echo   - triosigno-lib-mobile: %MOBILE_NEW_VERSION%

endlocal
