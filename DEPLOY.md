# Configuration du déploiement automatique sur npm

Ce document explique comment configurer et utiliser le processus de déploiement automatique pour les packages triosigno-lib.

## GitHub Actions

Le projet est configuré pour utiliser GitHub Actions afin d'automatiser le processus de publication des packages npm. Le workflow est défini dans le fichier `.github/workflows/deploy.yml`.

### Déclenchement du workflow

Le workflow peut être déclenché de deux manières :

- Manuellement depuis l'interface GitHub (onglet "Actions")
- Automatiquement lors de la création d'une nouvelle release GitHub

### Configuration requise

Pour que le workflow fonctionne correctement, vous devez configurer un secret GitHub nommé `NPM_TOKEN` :

1. Créez un token d'accès npm :
   - Connectez-vous à votre compte npm (https://www.npmjs.com/)
   - Allez dans les paramètres de votre compte
   - Allez dans "Access Tokens"
   - Créez un nouveau token de type "Automation" avec les permissions "Read and write"
   - Copiez le token généré

2. Ajoutez le token comme secret GitHub :
   - Allez dans les paramètres de votre dépôt GitHub
   - Allez dans "Secrets and variables" > "Actions"
   - Cliquez sur "New repository secret"
   - Nom : `NPM_TOKEN`
   - Valeur : Collez le token npm que vous avez copié précédemment
   - Cliquez sur "Add secret"

## Publication manuelle

Si vous préférez publier manuellement les packages, vous pouvez toujours utiliser le script `publish.sh` :

```bash
# Exécuter en mode simulation (sans publication réelle)
./publish.sh --dry-run

# Exécuter avec publication réelle
./publish.sh
```

## Gestion des versions

Avant de déclencher une publication, assurez-vous de mettre à jour les versions dans les fichiers `package.json` de chaque package. Le script vérifiera automatiquement que les dépendances entre packages sont correctement configurées.

## Structure des scripts

- `publish.sh` : Script principal qui orchestre tout le processus
- `publish-core.sh` : Publie le package core
- `publish-web.sh` : Publie le package web
- `publish-mobile.sh` : Publie le package mobile

Les scripts sont conçus pour être exécutés dans un environnement CI/CD et incluent diverses vérifications et validations pour s'assurer que le processus de publication se déroule correctement.
