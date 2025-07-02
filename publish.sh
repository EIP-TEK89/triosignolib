#!/bin/bash

# Script pour publier les packages triosigno-lib

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables globales
DRY_RUN=false
NPM_FLAGS="--legacy-peer-deps"

# Traiter les arguments
for arg in "$@"
do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      # Ignorer les arguments inconnus
      shift
      ;;
  esac
done

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Mode simulation activé (--dry-run) - aucune publication ne sera effectuée${NC}"
fi

echo -e "${YELLOW}Début de la publication des packages TrioSigno${NC}"

# Fonction pour vérifier si un package est à jour
check_package_dependencies() {
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
  
  # Lire la version du package
  local package_version=$(node -e "console.log(require('./$package_dir/package.json').version)")
  
  echo -e "${YELLOW}Vérification des dépendances pour $package_dir v$package_version...${NC}"
  
  # Si c'est le package web ou mobile, vérifier que la dépendance core est bien configurée
  if [ "$package_dir" != "core" ]; then
    local core_version=$(node -e "console.log(require('./core/package.json').version)")
    local package_core_dep=$(node -e "console.log(require('./$package_dir/package.json').dependencies && require('./$package_dir/package.json').dependencies['triosigno-lib-core'] || 'none')")
    
    if [ "$package_core_dep" == "none" ]; then
      echo -e "${RED}Erreur: $package_dir ne dépend pas de triosigno-lib-core${NC}"
      return 1
    fi
    
    # Extraire la version sans le '^' ou '~'
    local clean_dep_version=$(echo "$package_core_dep" | sed 's/[\^~]//g')
    
    # Vérifier que la version est compatible
    if [ "$clean_dep_version" != "$core_version" ]; then
      echo -e "${YELLOW}⚠️ La dépendance triosigno-lib-core dans $package_dir ($clean_dep_version) ne correspond pas à la dernière version ($core_version)${NC}"
      echo -e "${YELLOW}Voulez-vous mettre à jour cette dépendance ? (o/n)${NC}"
      read -r answer
      if [ "$answer" == "o" ] || [ "$answer" == "O" ]; then
        echo -e "${YELLOW}Mise à jour de la dépendance triosigno-lib-core dans $package_dir...${NC}"
        sed -i '' "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$core_version\"/" "$package_dir/package.json"
      else
        echo -e "${YELLOW}Conservation de la version actuelle.${NC}"
      fi
    fi
  fi
  
  return 0
}

# Fonction pour publier un package NPM
publish_npm_package() {
  local package_dir=$1
  local package_name=$2
  
  echo -e "${YELLOW}Publication du package $package_name...${NC}"
  
  # S'assurer d'être dans le répertoire du package
  cd "$package_dir" || {
    echo -e "${RED}Erreur: Impossible d'accéder au répertoire $package_dir${NC}"
    return 1
  }
  
  # Publier le package si on n'est pas en mode dry-run
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Mode simulation - Pas de publication pour $package_name${NC}"
    local publish_status=0
  else
    echo -e "${YELLOW}Publication du package $package_name...${NC}"
    npm publish --access public
    local publish_status=$?
  fi
  
  if [ $publish_status -ne 0 ]; then
    echo -e "${RED}✗ Échec de la publication du package $package_name (erreur $publish_status)${NC}"
    cd ..
    return 1
  else
    if [ "$DRY_RUN" = true ]; then
      echo -e "${GREEN}✓ Package $package_name simulé avec succès${NC}"
    else
      echo -e "${GREEN}✓ Package $package_name publié avec succès${NC}"
    fi
    cd ..
    return 0
  fi
}

# Nettoyer les répertoires temporaires
echo -e "${YELLOW}Nettoyage des répertoires temporaires...${NC}"
rm -rf temp-core-dist temp-check || true
rm -f core/*.tgz web/*.tgz mobile/*.tgz || true

# S'assurer d'être dans le répertoire racine du projet
ROOT_DIR=$(pwd)
echo -e "${YELLOW}Répertoire racine: $ROOT_DIR${NC}"

# Afficher le contenu du répertoire racine pour diagnostic
echo -e "${YELLOW}Contenu du répertoire racine:${NC}"
ls -la

# Vérifier les dépendances des packages
check_package_dependencies "core"
if [ $? -ne 0 ]; then
  exit 1
fi

check_package_dependencies "web"
if [ $? -ne 0 ]; then
  exit 1
fi

check_package_dependencies "mobile"
if [ $? -ne 0 ]; then
  exit 1
fi

# ========= PACKAGE CORE =========
echo -e "${YELLOW}Préparation du package core...${NC}"

# S'assurer d'être dans le répertoire racine du projet
cd "$ROOT_DIR" || exit 1

# Nettoyer et préparer le répertoire core
echo -e "${YELLOW}Nettoyage du répertoire core...${NC}"
if [ -d "$ROOT_DIR/core" ]; then
  rm -rf "$ROOT_DIR/core/node_modules" "$ROOT_DIR/core/dist" "$ROOT_DIR/core/*.tgz" || true
else
  echo -e "${RED}Erreur: Le répertoire core n'existe pas dans $ROOT_DIR${NC}"
  echo -e "${YELLOW}Contenu du répertoire racine:${NC}"
  ls -la "$ROOT_DIR"
  exit 1
fi

# Installer les dépendances pour core
cd "$ROOT_DIR/core" || {
  echo -e "${RED}Erreur: Impossible d'accéder au répertoire $ROOT_DIR/core${NC}"
  exit 1
}
echo -e "${YELLOW}Installation des dépendances pour core...${NC}"
npm install $NPM_FLAGS

# Construire le package core
echo -e "${YELLOW}Construction du package core...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la construction du package core${NC}"
  cd ..
  exit 1
fi

# Créer un tarball pour une utilisation locale
echo -e "${YELLOW}Création du package local core...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la création du package local core${NC}"
  cd ..
  exit 1
fi

# Obtenir le chemin du tarball
CORE_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$CORE_TARBALL" ]; then
  echo -e "${RED}✗ Aucun fichier tarball créé pour core${NC}"
  cd ..
  exit 1
fi
CORE_TARBALL_PATH="$(pwd)/$CORE_TARBALL"
echo -e "${GREEN}✓ Package core créé avec succès: $CORE_TARBALL_PATH${NC}"

# Publier le package core
publish_npm_package "." "triosigno-lib-core"
if [ $? -ne 0 ]; then
  cd ..
  exit 1
fi

# Retourner au répertoire racine
cd ..

# ========= PACKAGE WEB =========
echo -e "${YELLOW}Préparation du package web...${NC}"

# S'assurer d'être dans le répertoire racine du projet
cd "$ROOT_DIR" || exit 1

# Nettoyer et préparer le répertoire web
echo -e "${YELLOW}Nettoyage du répertoire web...${NC}"
if [ -d "$ROOT_DIR/web" ]; then
  rm -rf "$ROOT_DIR/web/node_modules" "$ROOT_DIR/web/dist" "$ROOT_DIR/web/*.tgz" || true
else
  echo -e "${RED}Erreur: Le répertoire web n'existe pas dans $ROOT_DIR${NC}"
  echo -e "${YELLOW}Contenu du répertoire racine:${NC}"
  ls -la "$ROOT_DIR"
  exit 1
fi

# Installer les dépendances pour web dans un environnement propre
cd "$ROOT_DIR/web" || {
  echo -e "${RED}Erreur: Impossible d'accéder au répertoire $ROOT_DIR/web${NC}"
  exit 1
}
echo -e "${YELLOW}Installation des dépendances pour web...${NC}"

# Créer un package.json temporaire sans les scripts pour éviter les boucles
cp package.json package.json.original
node -e "const pkg = require('./package.json'); delete pkg.scripts.prepare; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# Installer les dépendances externes d'abord
echo -e "${YELLOW}Installation des dépendances externes...${NC}"
npm install onnxruntime-web onnxruntime-common $NPM_FLAGS --ignore-scripts

# Installer le core tarball localement
echo -e "${YELLOW}Installation du package core local...${NC}"
npm install "$CORE_TARBALL_PATH" $NPM_FLAGS --ignore-scripts
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de l'installation du package core dans web${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  cd ..
  exit 1
fi

# Vérifier l'installation du core
if [ ! -d "node_modules/triosigno-lib-core" ]; then
  echo -e "${RED}✗ triosigno-lib-core n'est pas installé correctement${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  cd ..
  exit 1
fi

# Créer les liens symboliques nécessaires
echo -e "${YELLOW}Création des liens symboliques...${NC}"
if [ -d "node_modules/triosigno-lib-core/dist" ]; then
  ln -sf "$(pwd)/node_modules/triosigno-lib-core/dist" "$(pwd)/node_modules/triosigno-lib-core/src"
else
  echo -e "${RED}✗ Le répertoire dist n'existe pas dans triosigno-lib-core${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  cd ..
  exit 1
fi

# Vérifier les chemins importants
echo -e "${YELLOW}Vérification des chemins d'importation...${NC}"
echo "triosigno-lib-core: $(pwd)/node_modules/triosigno-lib-core"
echo "onnxruntime-web: $(pwd)/node_modules/onnxruntime-web"
echo "onnxruntime-common: $(pwd)/node_modules/onnxruntime-common"

# Restaurer le package.json original
mv package.json.original package.json

# Construire le package web
echo -e "${YELLOW}Construction du package web...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la construction du package web${NC}"
  
  # Diagnostics supplémentaires
  echo -e "${YELLOW}Diagnostics pour le problème de compilation...${NC}"
  echo -e "${YELLOW}Contenu de tsconfig.json:${NC}"
  cat tsconfig.json
  
  echo -e "${YELLOW}Résolution des modules TypeScript...${NC}"
  npx tsc --traceResolution | grep -E 'triosigno-lib-core|onnxruntime-web'
  
  cd ..
  exit 1
fi

# Créer un tarball pour une utilisation locale
echo -e "${YELLOW}Création du package local web...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la création du package local web${NC}"
  cd ..
  exit 1
fi

# Obtenir le chemin du tarball
WEB_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$WEB_TARBALL" ]; then
  echo -e "${RED}✗ Aucun fichier tarball créé pour web${NC}"
  cd ..
  exit 1
fi
WEB_TARBALL_PATH="$(pwd)/$WEB_TARBALL"
echo -e "${GREEN}✓ Package web créé avec succès: $WEB_TARBALL_PATH${NC}"

# Publier le package web
publish_npm_package "." "triosigno-lib-web"
if [ $? -ne 0 ]; then
  cd ..
  exit 1
fi

# Retourner au répertoire racine
cd ..

# ========= PACKAGE MOBILE =========
echo -e "${YELLOW}Préparation du package mobile...${NC}"

# S'assurer d'être dans le répertoire racine du projet
cd "$ROOT_DIR" || exit 1

# Nettoyer et préparer le répertoire mobile
echo -e "${YELLOW}Nettoyage du répertoire mobile...${NC}"
if [ -d "$ROOT_DIR/mobile" ]; then
  rm -rf "$ROOT_DIR/mobile/node_modules" "$ROOT_DIR/mobile/dist" "$ROOT_DIR/mobile/*.tgz" || true
else
  echo -e "${RED}Erreur: Le répertoire mobile n'existe pas dans $ROOT_DIR${NC}"
  echo -e "${YELLOW}Contenu du répertoire racine:${NC}"
  ls -la "$ROOT_DIR"
  exit 1
fi

# Installer les dépendances pour mobile dans un environnement propre
cd "$ROOT_DIR/mobile" || {
  echo -e "${RED}Erreur: Impossible d'accéder au répertoire $ROOT_DIR/mobile${NC}"
  exit 1
}
echo -e "${YELLOW}Installation des dépendances pour mobile...${NC}"

# Créer un package.json temporaire sans les scripts pour éviter les boucles
cp package.json package.json.original
node -e "const pkg = require('./package.json'); delete pkg.scripts.prepare; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# Installer les dépendances externes d'abord
echo -e "${YELLOW}Installation des dépendances externes...${NC}"
npm install onnxruntime-react-native react-native-fs $NPM_FLAGS --ignore-scripts

# Installer le core tarball localement
echo -e "${YELLOW}Installation du package core local...${NC}"
npm install "$CORE_TARBALL_PATH" $NPM_FLAGS --ignore-scripts
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de l'installation du package core dans mobile${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  cd ..
  exit 1
fi

# Vérifier l'installation du core
if [ ! -d "node_modules/triosigno-lib-core" ]; then
  echo -e "${RED}✗ triosigno-lib-core n'est pas installé correctement${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  cd ..
  exit 1
fi

# Créer les liens symboliques nécessaires
echo -e "${YELLOW}Création des liens symboliques...${NC}"
if [ -d "node_modules/triosigno-lib-core/dist" ]; then
  ln -sf "$(pwd)/node_modules/triosigno-lib-core/dist" "$(pwd)/node_modules/triosigno-lib-core/src"
else
  echo -e "${RED}✗ Le répertoire dist n'existe pas dans triosigno-lib-core${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  cd ..
  exit 1
fi

# Vérifier les chemins importants
echo -e "${YELLOW}Vérification des chemins d'importation...${NC}"
echo "triosigno-lib-core: $(pwd)/node_modules/triosigno-lib-core"
echo "onnxruntime-react-native: $(pwd)/node_modules/onnxruntime-react-native"
echo "react-native-fs: $(pwd)/node_modules/react-native-fs"

# Restaurer le package.json original
mv package.json.original package.json

# Construire le package mobile
echo -e "${YELLOW}Construction du package mobile...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la construction du package mobile${NC}"
  
  # Diagnostics supplémentaires
  echo -e "${YELLOW}Diagnostics pour le problème de compilation...${NC}"
  echo -e "${YELLOW}Contenu de tsconfig.json:${NC}"
  cat tsconfig.json
  
  echo -e "${YELLOW}Résolution des modules TypeScript...${NC}"
  npx tsc --traceResolution | grep -E 'triosigno-lib-core|onnxruntime-react-native'
  
  cd ..
  exit 1
fi

# Créer un tarball pour une utilisation locale
echo -e "${YELLOW}Création du package local mobile...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la création du package local mobile${NC}"
  cd ..
  exit 1
fi

# Publier le package mobile
publish_npm_package "." "triosigno-lib-mobile"
if [ $? -ne 0 ]; then
  cd ..
  exit 1
fi

# Retourner au répertoire racine
cd ..

# Nettoyer les fichiers temporaires
echo -e "${YELLOW}Nettoyage final des fichiers temporaires...${NC}"
rm -f core/*.tgz web/*.tgz mobile/*.tgz || true

echo -e "${GREEN}✓ Tous les packages ont été traités avec succès !${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Note: Exécuté en mode simulation (--dry-run) - aucune publication n'a été effectuée${NC}"
else
  echo -e "${GREEN}Les packages ont été publiés sur npm${NC}"
fi
