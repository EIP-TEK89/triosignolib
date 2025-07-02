# Configuration du déploiement automatique sur npm

Ce document explique comment configurer et utiliser le processus de déploiement automatique pour les packages triosigno-lib.

## GitHub Actions

Le projet est configuré pour utiliser GitHub Actions afin d'automatiser le processus de publication des packages npm. Le workflow est défini dans le fichier `.github/workflows/deploy.yml`.

### Déclenchement du workflow

Le workflow peut être déclenché de deux manières :

- **Manuellement depuis l'interface GitHub** :
  1. Allez dans l'onglet "Actions" du dépôt
  2. Sélectionnez le workflow "Deploy NPM Packages"
  3. Cliquez sur "Run workflow"
  4. Sélectionnez le type de mise à jour de version (patch, minor, major)
  5. Cliquez sur "Run workflow"

- **Automatiquement lors de la création d'une nouvelle release GitHub** :
  1. Allez dans l'onglet "Releases" du dépôt
  2. Cliquez sur "Draft a new release"
  3. Créez un tag de version (par exemple `v1.2.0`)
  4. Remplissez les autres informations de la release
  5. Cliquez sur "Publish release"

  Le workflow utilisera automatiquement le numéro de version du tag (sans le préfixe 'v') pour mettre à jour tous les packages.

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

Le projet utilise le script `version.sh` pour gérer les versions de tous les packages de manière cohérente. Ce script met à jour les versions dans tous les fichiers `package.json` et s'assure que les dépendances internes sont correctement configurées.

### Utilisation du script de versionnement

```bash
# Incrémenter la version de patch (0.1.0 -> 0.1.1)
./version.sh patch

# Incrémenter la version mineure (0.1.0 -> 0.2.0)
./version.sh minor

# Incrémenter la version majeure (0.1.0 -> 1.0.0)
./version.sh major

# Définir une version spécifique
./version.sh 2.0.0
```

### Versionnement dans GitHub Actions

Lors d'un déclenchement manuel du workflow de déploiement, vous pouvez spécifier le type de mise à jour de version (patch, minor, major) ou une version spécifique. Le workflow mettra à jour les versions, commitera les changements et publiera les packages.

Si le workflow est déclenché par la création d'une release GitHub, la version sera extraite du tag de la release. Par exemple, si vous créez une release avec le tag `v1.2.3`, les packages seront versionnés en `1.2.3`.

## Structure des scripts

- `publish.sh` : Script principal qui orchestre tout le processus de publication
- `publish-core.sh` : Publie le package core
- `publish-web.sh` : Publie le package web
- `publish-mobile.sh` : Publie le package mobile
- `version.sh` : Gère la mise à jour des versions dans tous les packages

Les scripts sont conçus pour être exécutés dans un environnement CI/CD et incluent diverses vérifications et validations pour s'assurer que le processus de publication se déroule correctement.
