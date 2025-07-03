#!/bin/bash

# Script to update the versions of triosigno-lib packages

# Colors for messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default variables
DRY_RUN=false

# Process arguments
for arg in "$@"
do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      # If the first unrecognized argument, treat it as VERSION
      if [ -z "$VERSION" ]; then
        VERSION="$arg"
      fi
      shift
      ;;
  esac
done

# Check that a version argument was provided
if [ -z "$VERSION" ]; then
  echo -e "${RED}Error: Please provide a version number (patch, minor, major or x.y.z)${NC}"
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry-run mode enabled (--dry-run) - no files will be modified${NC}"
fi

echo -e "${YELLOW}Updating versions to $VERSION${NC}"

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Global variables to store new versions
CORE_NEW_VERSION=""
WEB_NEW_VERSION=""
MOBILE_NEW_VERSION=""

# Function to update the version in package.json
update_version_in_package_json() {
  local package_dir=$1

  # Check if the directory exists
  if [ ! -d "$ROOT_DIR/$package_dir" ]; then
    echo -e "${RED}Error: Directory $ROOT_DIR/$package_dir does not exist${NC}"
    return 1
  fi

  # Check if package.json exists
  if [ ! -f "$ROOT_DIR/$package_dir/package.json" ]; then
    echo -e "${RED}Error: $ROOT_DIR/$package_dir/package.json does not exist${NC}"
    return 1
  fi

  # Read the current version
  local current_version=$(node -e "console.log(require('$ROOT_DIR/$package_dir/package.json').version)")

  if [ -z "$current_version" ]; then
    echo -e "${RED}Error: Unable to read version in $ROOT_DIR/$package_dir/package.json${NC}"
    return 1
  fi

  local new_version=""

  # Calculate the new version
  if [ "$VERSION" == "patch" ]; then
    # Increment the patch version
    local parts=(${current_version//./ })
    new_version="${parts[0]}.${parts[1]}.$((parts[2] + 1))"
  elif [ "$VERSION" == "minor" ]; then
    # Increment the minor version and reset patch to 0
    local parts=(${current_version//./ })
    new_version="${parts[0]}.$((parts[1] + 1)).0"
  elif [ "$VERSION" == "major" ]; then
    # Increment the major version and reset minor and patch to 0
    local parts=(${current_version//./ })
    new_version="$((parts[0] + 1)).0.0"
  else
    # Use the provided version
    new_version=$VERSION
  fi

  echo -e "${YELLOW}Updating $package_dir from $current_version to $new_version${NC}"

  # Do not update files in dry-run mode
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Dry-run mode - File $ROOT_DIR/$package_dir/package.json will not be modified${NC}"
  else
    # Backup the original file
    cp "$ROOT_DIR/$package_dir/package.json" "$ROOT_DIR/$package_dir/package.json.bak"

    # Use sed to replace the version in package.json
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$ROOT_DIR/$package_dir/package.json"
    else
      # Linux
      sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$ROOT_DIR/$package_dir/package.json"
    fi

    # Check that the update worked
    if [ $? -ne 0 ]; then
      echo -e "${RED}✗ Failed to update package $package_dir${NC}"
      mv "$ROOT_DIR/$package_dir/package.json.bak" "$ROOT_DIR/$package_dir/package.json"
      return 1
    fi

    # Check that the version was updated
    local updated_version=$(node -e "console.log(require('$ROOT_DIR/$package_dir/package.json').version)")
    if [ "$updated_version" != "$new_version" ]; then
      echo -e "${RED}✗ Version was not correctly updated in $ROOT_DIR/$package_dir/package.json${NC}"
      mv "$ROOT_DIR/$package_dir/package.json.bak" "$ROOT_DIR/$package_dir/package.json"
      return 1
    fi

    # All good, remove backup
    rm "$ROOT_DIR/$package_dir/package.json.bak"
  fi

  # Store the new version in a global variable for the current package
  if [ "$package_dir" == "core" ]; then
    CORE_NEW_VERSION=$new_version
  elif [ "$package_dir" == "web" ]; then
    WEB_NEW_VERSION=$new_version
  elif [ "$package_dir" == "mobile" ]; then
    MOBILE_NEW_VERSION=$new_version
  fi

  return 0
}

# Function to update internal dependencies
update_internal_dependencies() {
  local package_dir=$1
  local dependency=$2
  local dependency_version=$3

  # Check if package.json has a dependency on the internal package
  local has_dependency=$(node -e "console.log(require('$ROOT_DIR/$package_dir/package.json').dependencies && require('$ROOT_DIR/$package_dir/package.json').dependencies['$dependency'] ? 'yes' : 'no')")

  if [ "$has_dependency" == "yes" ]; then
    echo -e "${YELLOW}Updating dependency $dependency in $package_dir to ^$dependency_version${NC}"

    # Do not update files in dry-run mode
    if [ "$DRY_RUN" = true ]; then
      echo -e "${YELLOW}Dry-run mode - File $ROOT_DIR/$package_dir/package.json will not be modified${NC}"
    else
      # Backup the original file
      cp "$ROOT_DIR/$package_dir/package.json" "$ROOT_DIR/$package_dir/package.json.bak"

      # Use sed to replace the dependency version
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"$dependency\": \".*\"/\"$dependency\": \"^$dependency_version\"/" "$ROOT_DIR/$package_dir/package.json"
      else
        # Linux
        sed -i "s/\"$dependency\": \".*\"/\"$dependency\": \"^$dependency_version\"/" "$ROOT_DIR/$package_dir/package.json"
      fi

      # Check that the update worked
      if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to update dependency $dependency in $package_dir${NC}"
        mv "$ROOT_DIR/$package_dir/package.json.bak" "$ROOT_DIR/$package_dir/package.json"
        return 1
      fi

      # All good, remove backup
      rm "$ROOT_DIR/$package_dir/package.json.bak"
    fi
  fi

  return 0
}

# Update the core package
echo -e "${YELLOW}Updating triosigno-lib-core package...${NC}"
update_version_in_package_json "core"
if [ $? -ne 0 ]; then
  exit 1
fi

# Update the web package
echo -e "${YELLOW}Updating triosigno-lib-web package...${NC}"
update_version_in_package_json "web"
if [ $? -ne 0 ]; then
  exit 1
fi

# Update the mobile package
echo -e "${YELLOW}Updating triosigno-lib-mobile package...${NC}"
update_version_in_package_json "mobile"
if [ $? -ne 0 ]; then
  exit 1
fi

# Update internal dependencies
echo -e "${YELLOW}Updating internal dependencies...${NC}"

# Update core dependencies in web and mobile
update_internal_dependencies "web" "triosigno-lib-core" "$CORE_NEW_VERSION"
if [ $? -ne 0 ]; then
  exit 1
fi

update_internal_dependencies "mobile" "triosigno-lib-core" "$CORE_NEW_VERSION"
if [ $? -ne 0 ]; then
  exit 1
fi

echo -e "${GREEN}✓ All versions have been updated successfully!${NC}"
echo -e "${GREEN}  - triosigno-lib-core: $CORE_NEW_VERSION${NC}"
echo -e "${GREEN}  - triosigno-lib-web: $WEB_NEW_VERSION${NC}"
echo -e "${GREEN}  - triosigno-lib-mobile: $MOBILE_NEW_VERSION${NC}"

