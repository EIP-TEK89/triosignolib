#!/bin/bash

# Main script to publish all triosigno-lib packages

# Colors for messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default variables
DRY_RUN=false

# Detect OS for sed command
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS uses BSD sed
    SED_INPLACE="sed -i ''"
else
    # Linux and others use GNU sed
    SED_INPLACE="sed -i"
fi

# Process arguments
for arg in "$@"
do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            # Ignore unknown arguments
            shift
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Dry run mode enabled (--dry-run) - no publishing will be performed${NC}"
    DRY_RUN_FLAG="--dry-run"
else
    DRY_RUN_FLAG=""
fi

echo -e "${YELLOW}Starting publishing of TrioSigno packages${NC}"

# Ensure we are in the project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo -e "${YELLOW}Root directory: $ROOT_DIR${NC}"

# Make all scripts executable
chmod +x "$ROOT_DIR/scripts/publish-core.sh"
chmod +x "$ROOT_DIR/scripts/publish-web.sh"
chmod +x "$ROOT_DIR/scripts/publish-mobile.sh"

# Clean temporary directories
echo -e "${YELLOW}Cleaning temporary directories...${NC}"
rm -rf "$ROOT_DIR/temp-core-dist" "$ROOT_DIR/temp-check" || true
rm -f "$ROOT_DIR/core"/*.tgz "$ROOT_DIR/web"/*.tgz "$ROOT_DIR/mobile"/*.tgz || true

# Check dependencies between packages
echo -e "${YELLOW}Checking dependencies between packages...${NC}"

# Read package versions
CORE_VERSION=$(node -e "console.log(require('$ROOT_DIR/core/package.json').version)")
WEB_VERSION=$(node -e "console.log(require('$ROOT_DIR/web/package.json').version)")
MOBILE_VERSION=$(node -e "console.log(require('$ROOT_DIR/mobile/package.json').version)")

echo -e "${YELLOW}Current versions:${NC}"
echo -e "  core:   $CORE_VERSION"
echo -e "  web:    $WEB_VERSION"
echo -e "  mobile: $MOBILE_VERSION"

# Check that core dependencies are correct
WEB_CORE_DEP=$(node -e "console.log(require('$ROOT_DIR/web/package.json').dependencies['triosigno-lib-core'] || 'undefined')")
MOBILE_CORE_DEP=$(node -e "console.log(require('$ROOT_DIR/mobile/package.json').dependencies['triosigno-lib-core'] || 'undefined')")

echo -e "${YELLOW}Core dependencies:${NC}"
echo -e "  web:    $WEB_CORE_DEP"
echo -e "  mobile: $MOBILE_CORE_DEP"

# Remove '^' or '~' from versions
WEB_CORE_DEP_CLEAN=$(echo "$WEB_CORE_DEP" | sed 's/[\^~]//g')
MOBILE_CORE_DEP_CLEAN=$(echo "$MOBILE_CORE_DEP" | sed 's/[\^~]//g')

# Check version compatibility
if [ "$WEB_CORE_DEP_CLEAN" != "$CORE_VERSION" ]; then
    echo -e "${YELLOW}⚠️ The triosigno-lib-core dependency in web ($WEB_CORE_DEP_CLEAN) does not match the latest version ($CORE_VERSION)${NC}"
    
    # In CI mode, update automatically
    if [ -n "$CI" ]; then
        echo -e "${YELLOW}CI mode detected - Automatically updating triosigno-lib-core dependency in web...${NC}"
        $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "$ROOT_DIR/web/package.json"
    else
        echo -e "${YELLOW}Do you want to update this dependency? (y/n)${NC}"
        read -r answer
        if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
            echo -e "${YELLOW}Updating triosigno-lib-core dependency in web...${NC}"
            $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "$ROOT_DIR/web/package.json"
        else
            echo -e "${YELLOW}Keeping the current version.${NC}"
        fi
    fi
fi

if [ "$MOBILE_CORE_DEP_CLEAN" != "$CORE_VERSION" ]; then
    echo -e "${YELLOW}⚠️ The triosigno-lib-core dependency in mobile ($MOBILE_CORE_DEP_CLEAN) does not match the latest version ($CORE_VERSION)${NC}"
    
    # In CI mode, update automatically
    if [ -n "$CI" ]; then
        echo -e "${YELLOW}CI mode detected - Automatically updating triosigno-lib-core dependency in mobile...${NC}"
        $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "$ROOT_DIR/mobile/package.json"
    else
        echo -e "${YELLOW}Do you want to update this dependency? (y/n)${NC}"
        read -r answer
        if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
            echo -e "${YELLOW}Updating triosigno-lib-core dependency in mobile...${NC}"
            $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "$ROOT_DIR/mobile/package.json"
        else
            echo -e "${YELLOW}Keeping the current version.${NC}"
        fi
    fi
fi

# ========= SEQUENTIAL PACKAGE PUBLISHING =========

# 1. Publish core package
echo -e "${YELLOW}===== STEP 1: Publishing core package =====${NC}"
CORE_TARBALL=$("$ROOT_DIR/scripts/publish-core.sh" $DRY_RUN_FLAG)
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to publish core package${NC}"
    exit 1
fi

# Get tarball path from last line
CORE_TARBALL=$(echo "$CORE_TARBALL" | tail -n 1)
echo -e "${YELLOW}Core tarball: $CORE_TARBALL${NC}"

# 2. Publish web package
echo -e "${YELLOW}===== STEP 2: Publishing web package =====${NC}"
WEB_TARBALL=$("$ROOT_DIR/scripts/publish-web.sh" $DRY_RUN_FLAG --core-tarball="$CORE_TARBALL")
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to publish web package${NC}"
    exit 1
fi

# Get tarball path from last line
WEB_TARBALL=$(echo "$WEB_TARBALL" | tail -n 1)
echo -e "${YELLOW}Web tarball: $WEB_TARBALL${NC}"

# 3. Publish mobile package
echo -e "${YELLOW}===== STEP 3: Publishing mobile package =====${NC}"
MOBILE_TARBALL=$("$ROOT_DIR/scripts/publish-mobile.sh" $DRY_RUN_FLAG --core-tarball="$CORE_TARBALL")
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to publish mobile package${NC}"
    exit 1
fi

# Get tarball path from last line
MOBILE_TARBALL=$(echo "$MOBILE_TARBALL" | tail -n 1)
echo -e "${YELLOW}Mobile tarball: $MOBILE_TARBALL${NC}"

# Clean up temporary files
echo -e "${YELLOW}Final cleanup of temporary files...${NC}"
rm -f "$ROOT_DIR/core"/*.tgz "$ROOT_DIR/web"/*.tgz "$ROOT_DIR/mobile"/*.tgz || true

echo -e "${GREEN}✓ All packages have been processed successfully!${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Note: Executed in dry run mode (--dry-run) - no publishing was performed${NC}"
else
    echo -e "${GREEN}Packages have been published to npm${NC}"
fi
