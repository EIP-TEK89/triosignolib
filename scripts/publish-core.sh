#!/bin/bash

# Script to publish the triosigno-lib-core package

# Colors for messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default variables
DRY_RUN=false
NPM_FLAGS="--legacy-peer-deps"

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

# Ensure we are in the project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORE_DIR="$ROOT_DIR/core"

echo -e "${YELLOW}Publishing core package...${NC}"

# Check that the core directory exists
if [ ! -d "$CORE_DIR" ]; then
  echo -e "${RED}Error: The core directory does not exist in $ROOT_DIR${NC}"
  exit 1
fi

# Clean and prepare the core directory
echo -e "${YELLOW}Cleaning the core directory...${NC}"
rm -rf "$CORE_DIR/node_modules" "$CORE_DIR/dist" "$CORE_DIR"/*.tgz || true

# Install dependencies for core
cd "$CORE_DIR" || {
  echo -e "${RED}Error: Cannot access directory $CORE_DIR${NC}"
  exit 1
}
echo -e "${YELLOW}Installing dependencies for core...${NC}"
npm install $NPM_FLAGS

# Build the core package
echo -e "${YELLOW}Building the core package...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to build the core package${NC}"
  exit 1
fi

# Create a tarball for local use
echo -e "${YELLOW}Creating local core package...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to create local core package${NC}"
  exit 1
fi

# Get the tarball path
CORE_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$CORE_TARBALL" ]; then
  echo -e "${RED}✗ No tarball file created for core${NC}"
  exit 1
fi
CORE_TARBALL_PATH="$(pwd)/$CORE_TARBALL"
echo -e "${GREEN}✓ Core package successfully created: $CORE_TARBALL_PATH${NC}"

# Publish the core package if not in dry-run mode
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry-run mode - Not publishing triosigno-lib-core${NC}"
else
  echo -e "${YELLOW}Publishing triosigno-lib-core package...${NC}"
  npm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to publish triosigno-lib-core package${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ triosigno-lib-core package published successfully${NC}"
fi

echo -e "${GREEN}✓ Core package processing completed successfully${NC}"

# Export the tarball path for other scripts
echo "$CORE_TARBALL_PATH"
