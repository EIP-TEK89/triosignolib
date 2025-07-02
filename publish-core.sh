#!/bin/bash

# Script pour publier le package triosigno-lib-core

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables par défaut
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

# S'assurer d'être dans le répertoire racine du projet
ROOT_DIR=$(pwd)
CORE_DIR="$ROOT_DIR/core"

echo -e "${YELLOW}Publication du package core...${NC}"

# Vérifier que le répertoire core existe
if [ ! -d "$CORE_DIR" ]; then
  echo -e "${RED}Erreur: Le répertoire core n'existe pas dans $ROOT_DIR${NC}"
  exit 1
fi

# Nettoyer et préparer le répertoire core
echo -e "${YELLOW}Nettoyage du répertoire core...${NC}"
rm -rf "$CORE_DIR/node_modules" "$CORE_DIR/dist" "$CORE_DIR"/*.tgz || true

# Installer les dépendances pour core
cd "$CORE_DIR" || {
  echo -e "${RED}Erreur: Impossible d'accéder au répertoire $CORE_DIR${NC}"
  exit 1
}
echo -e "${YELLOW}Installation des dépendances pour core...${NC}"
npm install $NPM_FLAGS

# Construire le package core
echo -e "${YELLOW}Construction du package core...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la construction du package core${NC}"
  exit 1
fi

# Créer un tarball pour une utilisation locale
echo -e "${YELLOW}Création du package local core...${NC}"
npm pack
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la création du package local core${NC}"
  exit 1
fi

# Obtenir le chemin du tarball
CORE_TARBALL=$(ls -t *.tgz | head -1)
if [ -z "$CORE_TARBALL" ]; then
  echo -e "${RED}✗ Aucun fichier tarball créé pour core${NC}"
  exit 1
fi
CORE_TARBALL_PATH="$(pwd)/$CORE_TARBALL"
echo -e "${GREEN}✓ Package core créé avec succès: $CORE_TARBALL_PATH${NC}"

# Publier le package core si on n'est pas en mode dry-run
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Mode simulation - Pas de publication pour triosigno-lib-core${NC}"
else
  echo -e "${YELLOW}Publication du package triosigno-lib-core...${NC}"
  npm publish --access public
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Échec de la publication du package triosigno-lib-core${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Package triosigno-lib-core publié avec succès${NC}"
fi

echo -e "${GREEN}✓ Traitement du package core terminé avec succès${NC}"

# Exporter le chemin du tarball pour les autres scripts
echo "$CORE_TARBALL_PATH"
