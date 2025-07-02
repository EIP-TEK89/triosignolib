#!/bin/bash

# Script pour mettre à jour les versions des packages triosigno-lib

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables par défaut
DRY_RUN=false

# Traiter les arguments
for arg in "$@"
do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      # Si le premier argument non reconnu, on le traite comme VERSION
      if [ -z "$VERSION" ]; then
        VERSION="$arg"
      fi
      shift
      ;;
  esac
done

# Vérifier qu'un argument de version a été fourni
if [ -z "$VERSION" ]; then
  echo -e "${RED}Erreur: Veuillez fournir un numéro de version (patch, minor, major ou x.y.z)${NC}"
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Mode simulation activé (--dry-run) - aucun fichier ne sera modifié${NC}"
fi

echo -e "${YELLOW}Mise à jour des versions vers $VERSION${NC}"

# Variables globales pour stocker les nouvelles versions
CORE_NEW_VERSION=""
WEB_NEW_VERSION=""
MOBILE_NEW_VERSION=""

# Fonction pour mettre à jour la version dans package.json
update_version_in_package_json() {
  local package_dir=$1
  
  # Vérifier si le répertoire existe
  if [ ! -d "$package_dir" ]; then
    echo -e "${RED}Erreur: Le répertoire $package_dir n'existe pas${NC}"
    return 1
  fi
  
  # Vérifier si package.json existe
  if [ ! -f "$package_dir/package.json" ]; then
    echo -e "${RED}Erreur: $package_dir/package.json n'existe pas${NC}"
    return 1
  fi
  
  # Lire la version actuelle
  local current_version=$(node -e "console.log(require('./$package_dir/package.json').version)")
  
  if [ -z "$current_version" ]; then
    echo -e "${RED}Erreur: Impossible de lire la version dans $package_dir/package.json${NC}"
    return 1
  fi
  
  local new_version=""
  
  # Calculer la nouvelle version
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
  
  echo -e "${YELLOW}Mise à jour de $package_dir de $current_version à $new_version${NC}"
  
  # Ne pas mettre à jour les fichiers en mode dry-run
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Mode simulation - Le fichier $package_dir/package.json ne sera pas modifié${NC}"
  else
    # Sauvegarder le fichier original
    cp "$package_dir/package.json" "$package_dir/package.json.bak"
    
    # Utilisation de sed pour remplacer la version dans le fichier package.json
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$package_dir/package.json"
    else
      # Linux
      sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$package_dir/package.json"
    fi
    
    # Vérifier que la mise à jour a fonctionné
    if [ $? -ne 0 ]; then
      echo -e "${RED}✗ Échec de mise à jour du package $package_dir${NC}"
      mv "$package_dir/package.json.bak" "$package_dir/package.json"
      return 1
    fi
    
    # Vérifier que la version a bien été mise à jour
    local updated_version=$(node -e "console.log(require('./$package_dir/package.json').version)")
    if [ "$updated_version" != "$new_version" ]; then
      echo -e "${RED}✗ La version n'a pas été correctement mise à jour dans $package_dir/package.json${NC}"
      mv "$package_dir/package.json.bak" "$package_dir/package.json"
      return 1
    fi
    
    # Tout s'est bien passé, suppression du backup
    rm "$package_dir/package.json.bak"
  fi
  
  # Stocker la nouvelle version dans une variable globale pour le package courant
  if [ "$package_dir" == "core" ]; then
    CORE_NEW_VERSION=$new_version
  elif [ "$package_dir" == "web" ]; then
    WEB_NEW_VERSION=$new_version
  elif [ "$package_dir" == "mobile" ]; then
    MOBILE_NEW_VERSION=$new_version
  fi
  
  return 0
}

# Fonction pour mettre à jour les dépendances internes
update_internal_dependencies() {
  local package_dir=$1
  local dependency=$2
  local dependency_version=$3
  
  # Vérifier si package.json a une dépendance sur le package interne
  local has_dependency=$(node -e "console.log(require('./$package_dir/package.json').dependencies && require('./$package_dir/package.json').dependencies['$dependency'] ? 'yes' : 'no')")
  
  if [ "$has_dependency" == "yes" ]; then
    echo -e "${YELLOW}Mise à jour de la dépendance $dependency dans $package_dir vers ^$dependency_version${NC}"
    
    # Ne pas mettre à jour les fichiers en mode dry-run
    if [ "$DRY_RUN" = true ]; then
      echo -e "${YELLOW}Mode simulation - Le fichier $package_dir/package.json ne sera pas modifié${NC}"
    else
      # Sauvegarder le fichier original
      cp "$package_dir/package.json" "$package_dir/package.json.bak"
      
      # Utilisation de sed pour remplacer la version de la dépendance
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"$dependency\": \".*\"/\"$dependency\": \"^$dependency_version\"/" "$package_dir/package.json"
      else
        # Linux
        sed -i "s/\"$dependency\": \".*\"/\"$dependency\": \"^$dependency_version\"/" "$package_dir/package.json"
      fi
      
      # Vérifier que la mise à jour a fonctionné
      if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Échec de mise à jour de la dépendance $dependency dans $package_dir${NC}"
        mv "$package_dir/package.json.bak" "$package_dir/package.json"
        return 1
      fi
      
      # Tout s'est bien passé, suppression du backup
      rm "$package_dir/package.json.bak"
    fi
  fi
  
  return 0
}

# Mettre à jour le package core
echo -e "${YELLOW}Mise à jour du package triosigno-lib-core...${NC}"
update_version_in_package_json "core"
if [ $? -ne 0 ]; then
  exit 1
fi

# Mettre à jour le package web
echo -e "${YELLOW}Mise à jour du package triosigno-lib-web...${NC}"
update_version_in_package_json "web" 
if [ $? -ne 0 ]; then
  exit 1
fi

# Mettre à jour le package mobile
echo -e "${YELLOW}Mise à jour du package triosigno-lib-mobile...${NC}"
update_version_in_package_json "mobile"
if [ $? -ne 0 ]; then
  exit 1
fi

# Mettre à jour les dépendances internes
echo -e "${YELLOW}Mise à jour des dépendances internes...${NC}"

# Mettre à jour les dépendances core dans web et mobile
update_internal_dependencies "web" "triosigno-lib-core" "$CORE_NEW_VERSION"
if [ $? -ne 0 ]; then
  exit 1
fi

update_internal_dependencies "mobile" "triosigno-lib-core" "$CORE_NEW_VERSION"
if [ $? -ne 0 ]; then
  exit 1
fi

echo -e "${GREEN}✓ Toutes les versions ont été mises à jour avec succès !${NC}"
echo -e "${GREEN}  - triosigno-lib-core: $CORE_NEW_VERSION${NC}"
echo -e "${GREEN}  - triosigno-lib-web: $WEB_NEW_VERSION${NC}"
echo -e "${GREEN}  - triosigno-lib-mobile: $MOBILE_NEW_VERSION${NC}"
