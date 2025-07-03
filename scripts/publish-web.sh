#!/bin/bash

# Script to publish the triosigno-lib-web package

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
  echo -e "${RED}Error: Core tarball path must be specified with --core-tarball=PATH${NC}"
  exit 1
fi

# Ensure the core tarball exists
if [ ! -f "$CORE_TARBALL" ]; then
  echo -e "${RED}Error: Core tarball does not exist: $CORE_TARBALL${NC}"
  exit 1
fi

# Ensure we are in the project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"

echo -e "${YELLOW}Publishing the web package...${NC}"

# Check that the web directory exists
if [ ! -d "$WEB_DIR" ]; then
  echo -e "${RED}Error: Web directory does not exist in $ROOT_DIR${NC}"
  exit 1
fi

# Clean and prepare the web directory
echo -e "${YELLOW}Cleaning the web directory...${NC}"
rm -rf "$WEB_DIR/node_modules" "$WEB_DIR/dist" "$WEB_DIR"/*.tgz || true

# Install dependencies for web
cd "$WEB_DIR" || {
  echo -e "${RED}Error: Cannot access directory $WEB_DIR${NC}"
  exit 1
}
echo -e "${YELLOW}Installing dependencies for web...${NC}"

# Create a temporary package.json without scripts to avoid loops
cp package.json package.json.original
node -e "const pkg = require('./package.json'); delete pkg.scripts.prepare; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# Install external dependencies first
echo -e "${YELLOW}Installing external dependencies...${NC}"
npm install onnxruntime-web onnxruntime-common $NPM_FLAGS --ignore-scripts

# Install the local core tarball
echo -e "${YELLOW}Installing local core package...${NC}"
npm install "$CORE_TARBALL" $NPM_FLAGS --ignore-scripts
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to install core package in web${NC}"
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
echo -e "${YELLOW}Creating symbolic links...${NC}"
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
echo "onnxruntime-web: $(pwd)/node_modules/onnxruntime-web"
echo "onnxruntime-common: $(pwd)/node_modules/onnxruntime-common"

# Restore the original package.json
mv package.json.original package.json

# Build the web package
echo -e "${YELLOW}Building the web package...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to build the web package${NC}"
  
  # Additional diagnostics
  echo -e "${YELLOW}Diagnostics for the compilation issue...${NC}"
  echo -e "${YELLOW}Contents of tsconfig.json:${NC}"
  cat tsconfig.json
  
  echo -e "${YELLOW}TypeScript module resolution:${NC}"
  npx tsc --traceResolution | grep -E 'triosigno-lib-core|onnxruntime-web'
  
  exit 1
fi

# Create a tarball for local use
echo -e "${YELLOW}Creating local web package...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to create local web package${NC}"
  exit 1
fi

# Get the tarball path
WEB_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$WEB_TARBALL" ]; then
  echo -e "${RED}✗ No tarball file created for web${NC}"
  exit 1
fi
WEB_TARBALL_PATH="$(pwd)/$WEB_TARBALL"
echo -e "${GREEN}✓ Web package successfully created: $WEB_TARBALL_PATH${NC}"

# Publish the web package unless in dry-run mode
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry-run mode - Not publishing triosigno-lib-web${NC}"
else
  echo -e "${YELLOW}Publishing triosigno-lib-web package...${NC}"
  npm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to publish triosigno-lib-web package${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ triosigno-lib-web package published successfully${NC}"
fi

echo -e "${GREEN}✓ Web package processing completed successfully${NC}"

# Export the tarball path for other scripts
echo "$WEB_TARBALL_PATH"
