#!/bin/bash

# Script principal pour publier tous les packages triosigno-lib

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables par défaut
DRY_RUN=false

# Détecter le système d'exploitation pour la commande sed
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS uses BSD sed
  SED_INPLACE="sed -i ''"
else
  # Linux and others use GNU sed
  SED_INPLACE="sed -i"
fi

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
  DRY_RUN_FLAG="--dry-run"
else
  DRY_RUN_FLAG=""
fi

echo -e "${YELLOW}Début de la publication des packages TrioSigno${NC}"

# S'assurer d'être dans le répertoire racine du projet
ROOT_DIR=$(pwd)
echo -e "${YELLOW}Répertoire racine: $ROOT_DIR${NC}"

# Rendre tous les scripts exécutables
chmod +x "$ROOT_DIR/publish-core.sh"
chmod +x "$ROOT_DIR/publish-web.sh"
chmod +x "$ROOT_DIR/publish-mobile.sh"

# Nettoyer les répertoires temporaires
echo -e "${YELLOW}Nettoyage des répertoires temporaires...${NC}"
rm -rf temp-core-dist temp-check || true
rm -f core/*.tgz web/*.tgz mobile/*.tgz || true

# Vérifier les dépendances entre packages
echo -e "${YELLOW}Vérification des dépendances entre packages...${NC}"

# Lire les versions des packages
CORE_VERSION=$(node -e "console.log(require('./core/package.json').version)")
WEB_VERSION=$(node -e "console.log(require('./web/package.json').version)")
MOBILE_VERSION=$(node -e "console.log(require('./mobile/package.json').version)")

echo -e "${YELLOW}Versions actuelles:${NC}"
echo -e "  core:   $CORE_VERSION"
echo -e "  web:    $WEB_VERSION"
echo -e "  mobile: $MOBILE_VERSION"

# Vérifier que les dépendances core sont correctes
WEB_CORE_DEP=$(node -e "console.log(require('./web/package.json').dependencies['triosigno-lib-core'] || 'non définie')")
MOBILE_CORE_DEP=$(node -e "console.log(require('./mobile/package.json').dependencies['triosigno-lib-core'] || 'non définie')")

echo -e "${YELLOW}Dépendances core:${NC}"
echo -e "  web:    $WEB_CORE_DEP"
echo -e "  mobile: $MOBILE_CORE_DEP"

# Extraire les versions sans '^' ou '~'
WEB_CORE_DEP_CLEAN=$(echo "$WEB_CORE_DEP" | sed 's/[\^~]//g')
MOBILE_CORE_DEP_CLEAN=$(echo "$MOBILE_CORE_DEP" | sed 's/[\^~]//g')

# Vérifier la compatibilité des versions
if [ "$WEB_CORE_DEP_CLEAN" != "$CORE_VERSION" ]; then
  echo -e "${YELLOW}⚠️ La dépendance triosigno-lib-core dans web ($WEB_CORE_DEP_CLEAN) ne correspond pas à la dernière version ($CORE_VERSION)${NC}"
  
  # En mode CI, mettre à jour automatiquement
  if [ -n "$CI" ]; then
    echo -e "${YELLOW}Mode CI détecté - Mise à jour automatique de la dépendance triosigno-lib-core dans web...${NC}"
    $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "web/package.json"
  else
    echo -e "${YELLOW}Voulez-vous mettre à jour cette dépendance ? (o/n)${NC}"
    read -r answer
    if [ "$answer" == "o" ] || [ "$answer" == "O" ]; then
      echo -e "${YELLOW}Mise à jour de la dépendance triosigno-lib-core dans web...${NC}"
      $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "web/package.json"
    else
      echo -e "${YELLOW}Conservation de la version actuelle.${NC}"
    fi
  fi
fi

if [ "$MOBILE_CORE_DEP_CLEAN" != "$CORE_VERSION" ]; then
  echo -e "${YELLOW}⚠️ La dépendance triosigno-lib-core dans mobile ($MOBILE_CORE_DEP_CLEAN) ne correspond pas à la dernière version ($CORE_VERSION)${NC}"
  
  # En mode CI, mettre à jour automatiquement
  if [ -n "$CI" ]; then
    echo -e "${YELLOW}Mode CI détecté - Mise à jour automatique de la dépendance triosigno-lib-core dans mobile...${NC}"
    $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "mobile/package.json"
  else
    echo -e "${YELLOW}Voulez-vous mettre à jour cette dépendance ? (o/n)${NC}"
    read -r answer
    if [ "$answer" == "o" ] || [ "$answer" == "O" ]; then
      echo -e "${YELLOW}Mise à jour de la dépendance triosigno-lib-core dans mobile...${NC}"
      $SED_INPLACE "s/\"triosigno-lib-core\": \".*\"/\"triosigno-lib-core\": \"^$CORE_VERSION\"/" "mobile/package.json"
    else
      echo -e "${YELLOW}Conservation de la version actuelle.${NC}"
    fi
  fi
fi

# ========= PUBLICATION SÉQUENTIELLE DES PACKAGES =========

# 1. Publier le package core
echo -e "${YELLOW}===== ÉTAPE 1: Publication du package core =====${NC}"
CORE_TARBALL=$("$ROOT_DIR/publish-core.sh" $DRY_RUN_FLAG)
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la publication du package core${NC}"
  exit 1
fi

# Extraire le chemin du tarball de la dernière ligne
CORE_TARBALL=$(echo "$CORE_TARBALL" | tail -n 1)
echo -e "${YELLOW}Tarball core: $CORE_TARBALL${NC}"

# 2. Publier le package web
echo -e "${YELLOW}===== ÉTAPE 2: Publication du package web =====${NC}"
WEB_TARBALL=$("$ROOT_DIR/publish-web.sh" $DRY_RUN_FLAG --core-tarball="$CORE_TARBALL")
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la publication du package web${NC}"
  exit 1
fi

# Extraire le chemin du tarball de la dernière ligne
WEB_TARBALL=$(echo "$WEB_TARBALL" | tail -n 1)
echo -e "${YELLOW}Tarball web: $WEB_TARBALL${NC}"

# 3. Publier le package mobile
echo -e "${YELLOW}===== ÉTAPE 3: Publication du package mobile =====${NC}"
MOBILE_TARBALL=$("$ROOT_DIR/publish-mobile.sh" $DRY_RUN_FLAG --core-tarball="$CORE_TARBALL")
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Échec de la publication du package mobile${NC}"
  exit 1
fi

# Extraire le chemin du tarball de la dernière ligne
MOBILE_TARBALL=$(echo "$MOBILE_TARBALL" | tail -n 1)
echo -e "${YELLOW}Tarball mobile: $MOBILE_TARBALL${NC}"

# Nettoyer les fichiers temporaires
echo -e "${YELLOW}Nettoyage final des fichiers temporaires...${NC}"
rm -f core/*.tgz web/*.tgz mobile/*.tgz || true

echo -e "${GREEN}✓ Tous les packages ont été traités avec succès !${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Note: Exécuté en mode simulation (--dry-run) - aucune publication n'a été effectuée${NC}"
else
  echo -e "${GREEN}Les packages ont été publiés sur npm${NC}"
fi
