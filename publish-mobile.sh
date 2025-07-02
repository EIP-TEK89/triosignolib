#!/bin/bash

# Script pour publier le package triosigno-lib-mobile

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables par défaut
DRY_RUN=false
NPM_FLAGS="--legacy-peer-deps"
CORE_TARBALL=""

# Traiter les arguments
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
      # Ignorer les arguments inconnus
      shift
      ;;
  esac
done

# Vérifier que le tarball du core est spécifié
if [ -z "$CORE_TARBALL" ]; then
  echo -e "${RED}Erreur: Le chemin du tarball core doit être spécifié avec --core-tarball=PATH${NC}"
  exit 1
fi

# S'assurer que le tarball du core existe
if [ ! -f "$CORE_TARBALL" ]; then
  echo -e "${RED}Erreur: Le tarball core n'existe pas: $CORE_TARBALL${NC}"
  exit 1
fi

# S'assurer d'être dans le répertoire racine du projet
ROOT_DIR=$(pwd)
MOBILE_DIR="$ROOT_DIR/mobile"

echo -e "${YELLOW}Publication du package mobile...${NC}"

# Vérifier que le répertoire mobile existe
if [ ! -d "$MOBILE_DIR" ]; then
  echo -e "${RED}Erreur: Le répertoire mobile n'existe pas dans $ROOT_DIR${NC}"
  exit 1
fi

# Nettoyer et préparer le répertoire mobile
echo -e "${YELLOW}Nettoyage du répertoire mobile...${NC}"
rm -rf "$MOBILE_DIR/node_modules" "$MOBILE_DIR/dist" "$MOBILE_DIR"/*.tgz || true

# Installer les dépendances pour mobile
cd "$MOBILE_DIR" || {
  echo -e "${RED}Erreur: Impossible d'accéder au répertoire $MOBILE_DIR${NC}"
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
npm install "$CORE_TARBALL" $NPM_FLAGS --ignore-scripts
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de l'installation du package core dans mobile${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
  exit 1
fi

# Vérifier l'installation du core
if [ ! -d "node_modules/triosigno-lib-core" ]; then
  echo -e "${RED}✗ triosigno-lib-core n'est pas installé correctement${NC}"
  # Restaurer le package.json original
  mv package.json.original package.json
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
  
  exit 1
fi

# Créer un tarball pour une utilisation locale
echo -e "${YELLOW}Création du package local mobile...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la création du package local mobile${NC}"
  exit 1
fi

# Obtenir le chemin du tarball
MOBILE_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$MOBILE_TARBALL" ]; then
  echo -e "${RED}✗ Aucun fichier tarball créé pour mobile${NC}"
  exit 1
fi
MOBILE_TARBALL_PATH="$(pwd)/$MOBILE_TARBALL"
echo -e "${GREEN}✓ Package mobile créé avec succès: $MOBILE_TARBALL_PATH${NC}"

# Publier le package mobile si on n'est pas en mode dry-run
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Mode simulation - Pas de publication pour triosigno-lib-mobile${NC}"
else
  echo -e "${YELLOW}Publication du package triosigno-lib-mobile...${NC}"
  npm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Échec de la publication du package triosigno-lib-mobile${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Package triosigno-lib-mobile publié avec succès${NC}"
fi

echo -e "${GREEN}✓ Traitement du package mobile terminé avec succès${NC}"

# Exporter le chemin du tarball pour les autres scripts
echo "$MOBILE_TARBALL_PATH"
