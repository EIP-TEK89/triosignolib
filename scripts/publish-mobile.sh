#!/bin/bash

# Script to publish the triosigno-lib-mobile package

# Colors for messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default variables
DRY_RUN=false
NPM_FLAGS="--legacy-peer-deps"
CORE_TARBALL=""

# Process arguments
for arg in "$@"
do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --core-tarball=*)
      CORE_TARBALL="${arg#*=}"
      shift
      ;;
    *)
      # Ignore unknown arguments
      shift
      ;;
  esac
done

# Check that the core tarball path is specified
if [ -z "$CORE_TARBALL" ]; then
  echo -e "${RED}Error: The core tarball path must be specified with --core-tarball=PATH${NC}"
  exit 1
fi

# Ensure the core tarball exists
if [ ! -f "$CORE_TARBALL" ]; then
  echo -e "${RED}Error: The core tarball does not exist: $CORE_TARBALL${NC}"
  exit 1
fi

# Ensure we are in the project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$ROOT_DIR/mobile"

echo -e "${YELLOW}Publishing the mobile package...${NC}"

# Check that the mobile directory exists
if [ ! -d "$MOBILE_DIR" ]; then
  echo -e "${RED}Error: The mobile directory does not exist in $ROOT_DIR${NC}"
  exit 1
fi

# Clean and prepare the mobile directory
echo -e "${YELLOW}Cleaning the mobile directory...${NC}"
rm -rf "$MOBILE_DIR/node_modules" "$MOBILE_DIR/dist" "$MOBILE_DIR"/*.tgz || true

# Install dependencies for mobile
cd "$MOBILE_DIR" || {
  echo -e "${RED}Error: Cannot access directory $MOBILE_DIR${NC}"
  exit 1
}
echo -e "${YELLOW}Installing dependencies for mobile...${NC}"

# Create a temporary package.json without scripts to avoid loops
cp package.json package.json.original
node -e "const pkg = require('./package.json'); delete pkg.scripts.prepare; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# Install external dependencies first
echo -e "${YELLOW}Installing external dependencies...${NC}"
npm install onnxruntime-react-native react-native-fs $NPM_FLAGS --ignore-scripts

# Install the local core tarball
echo -e "${YELLOW}Installing the local core package...${NC}"
npm install "$CORE_TARBALL" $NPM_FLAGS --ignore-scripts
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to install the core package in mobile${NC}"
  # Restore the original package.json
  mv package.json.original package.json
  exit 1
fi

# Check core installation
if [ ! -d "node_modules/triosigno-lib-core" ]; then
  echo -e "${RED}✗ triosigno-lib-core is not installed correctly${NC}"
  # Restore the original package.json
  mv package.json.original package.json
  exit 1
fi

# Create necessary symlinks
echo -e "${YELLOW}Creating symlinks...${NC}"
if [ -d "node_modules/triosigno-lib-core/dist" ]; then
  ln -sf "$(pwd)/node_modules/triosigno-lib-core/dist" "$(pwd)/node_modules/triosigno-lib-core/src"
else
  echo -e "${RED}✗ The dist directory does not exist in triosigno-lib-core${NC}"
  # Restore the original package.json
  mv package.json.original package.json
  exit 1
fi

# Check important paths
echo -e "${YELLOW}Checking import paths...${NC}"
echo "triosigno-lib-core: $(pwd)/node_modules/triosigno-lib-core"
echo "onnxruntime-react-native: $(pwd)/node_modules/onnxruntime-react-native"
echo "react-native-fs: $(pwd)/node_modules/react-native-fs"

# Restore the original package.json
mv package.json.original package.json

# Build the mobile package
echo -e "${YELLOW}Building the mobile package...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to build the mobile package${NC}"
  
  # Additional diagnostics
  echo -e "${YELLOW}Diagnostics for the compilation issue...${NC}"
  echo -e "${YELLOW}Contents of tsconfig.json:${NC}"
  cat tsconfig.json
  
  echo -e "${YELLOW}TypeScript module resolution:${NC}"
  npx tsc --traceResolution | grep -E 'triosigno-lib-core|onnxruntime-react-native'
  
  exit 1
fi

# Create a tarball for local use
echo -e "${YELLOW}Creating the local mobile package...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to create the local mobile package${NC}"
  exit 1
fi

# Get the tarball path
MOBILE_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$MOBILE_TARBALL" ]; then
  echo -e "${RED}✗ No tarball file created for mobile${NC}"
  exit 1
fi
MOBILE_TARBALL_PATH="$(pwd)/$MOBILE_TARBALL"
echo -e "${GREEN}✓ Mobile package created successfully: $MOBILE_TARBALL_PATH${NC}"

# Publish the mobile package if not in dry-run mode
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry-run mode - Not publishing triosigno-lib-mobile${NC}"
else
  echo -e "${YELLOW}Publishing the triosigno-lib-mobile package...${NC}"
  npm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to publish the triosigno-lib-mobile package${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ triosigno-lib-mobile package published successfully${NC}"
fi

echo -e "${GREEN}✓ Mobile package processing completed successfully${NC}"

# Export the tarball path for other scripts
echo "$MOBILE_TARBALL_PATH"
