# 🧪 Guide de Tests - CoinQuest Frontend

Ce guide explique comment tester les connexions API en local et en production.

## 📋 Table des matières

1. [Tests automatiques en ligne de commande](#tests-cli)
2. [Page de diagnostic web](#page-diagnostic)
3. [Tests manuels](#tests-manuels)
4. [Résolution des problèmes](#troubleshooting)

---

## 🖥️ Tests automatiques en ligne de commande {#tests-cli}

### Test complet (recommandé)

```bash
npm run diagnostic
```

Cette commande lance tous les tests :
- Validation des variables d'environnement
- Test de connexion à l'API locale
- Test de connexion à l'API de production
- Vérification de la configuration Bridge

### Tests individuels

#### 1. Tester les variables d'environnement

```bash
npm run test:env
```

**Vérifie :**
- Présence de toutes les variables requises
- Validité des formats (URLs, etc.)
- Configuration Bridge API

**Exemple de sortie :**
```
🔍 Validation des variables d'environnement

Variables requises:
  ✓ VITE_API_BASE_URL: https://coinquest.us-1.sharedwithexpose.com/api
  ✓ VITE_BRIDGE_CLIENT_ID: sandbox_id_...
  ✗ VITE_BRIDGE_CLIENT_SECRET: Non défini
  ✓ VITE_BRIDGE_ENVIRONMENT: sandbox
  ✓ VITE_BRIDGE_REDIRECT_URI: https://...

📊 Rapport de validation
✓ Variables valides: 4/5
⚠ Avertissements: 0
✗ Erreurs: 1
```

#### 2. Tester les connexions API

```bash
npm run test:api
```

**Vérifie :**
- Connexion à l'API locale (Herd)
- Connexion à l'API de production (Expose)
- Temps de réponse des endpoints
- Configuration Bridge

**Exemple de sortie :**
```
🔍 Test: API Locale (Herd)
URL: http://budget-api.test/api
  ✓ HEALTH: 200 (45ms)
  ✓ PING: 200 (23ms)
  ⚠ CSRF: 419 - CSRF Token manquant (normal) (12ms)

🔍 Test: API Production (Expose)
URL: https://coinquest.us-1.sharedwithexpose.com/api
  ✓ HEALTH: 200 (234ms)
  ✓ PING: 200 (189ms)
  ⚠ CSRF: 419 - CSRF Token manquant (normal) (201ms)

📊 Résumé
✓ API Locale: 3/3 endpoints OK
✓ API Production: 3/3 endpoints OK
✗ Bridge API: Non configuré
```

---

## 🌐 Page de diagnostic web {#page-diagnostic}

### Accès

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Naviguez vers :
   ```
   http://localhost:3000/app/diagnostic
   ```

### Fonctionnalités

La page de diagnostic affiche en temps réel :

- **Variables d'environnement** : Toutes les variables VITE_* configurées
- **Connexion API** : Status, latence, erreurs
- **Endpoints testés** : `/health`, `/ping`, `/user`
- **Configuration Bridge** : Client ID, Secret, Environment, Redirect URI
- **Informations système** : Navigateur, connexion internet, heure

### Utilisation

1. **Bouton "Relancer les tests"** : Lance tous les tests de connexion
2. **Status en temps réel** : Les indicateurs se mettent à jour automatiquement
3. **Codes couleur** :
   - 🟢 Vert = OK
   - 🟡 Jaune = Avertissement
   - 🔴 Rouge = Erreur

---

## 🛠️ Tests manuels {#tests-manuels}

### Test 1 : API Locale (Herd)

```bash
# Vérifier que Herd est démarré
herd status

# Tester l'API manuellement
curl http://budget-api.test/api/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2024-01-26T10:30:00Z",
  "environment": "local"
}
```

### Test 2 : API Production (Expose)

```bash
# Remplacer par votre URL Expose
curl https://coinquest.us-1.sharedwithexpose.com/api/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2024-01-26T10:30:00Z",
  "environment": "production"
}
```

### Test 3 : Variables d'environnement

```bash
# Afficher les variables chargées
npm run debug-env
```

### Test 4 : Build de production

```bash
# Build complet
npm run build

# Si succès, tester en local
npm run preview
```

---

## 🔧 Résolution des problèmes {#troubleshooting}

### Problème : API Locale inaccessible

**Erreur :** `✗ API Locale: Connexion impossible (ECONNREFUSED)`

**Solutions :**
1. Vérifier que Herd est démarré :
   ```bash
   herd status
   herd start
   ```

2. Vérifier l'URL dans `.env.local` :
   ```bash
   VITE_API_BASE_URL=http://budget-api.test/api
   ```

3. Tester manuellement :
   ```bash
   curl http://budget-api.test/api/health
   ```

### Problème : API Production inaccessible

**Erreur :** `✗ API Production: TIMEOUT après 10000ms`

**Solutions :**
1. Vérifier que le tunnel Expose est actif :
   ```bash
   # Dans le dossier du backend
   expose share budget-api.test --subdomain=coinquest
   ```

2. Vérifier l'URL dans `.env.local` :
   ```bash
   VITE_API_BASE_URL=https://coinquest.us-1.sharedwithexpose.com/api
   ```

3. Tester dans le navigateur :
   ```
   https://coinquest.us-1.sharedwithexpose.com/api/health
   ```

### Problème : Bridge API non configuré

**Erreur :** `✗ Bridge API: Non configuré`

**Solutions :**
1. Obtenir vos credentials sur : https://dashboard.bridgeapi.io/

2. Ajouter dans `.env.local` :
   ```bash
   VITE_BRIDGE_CLIENT_ID=sandbox_id_your_id_here
   VITE_BRIDGE_CLIENT_SECRET=your_actual_secret_here
   VITE_BRIDGE_ENVIRONMENT=sandbox
   VITE_BRIDGE_REDIRECT_URI=https://coinquest.us-1.sharedwithexpose.com/app/banking
   ```

3. Relancer les tests :
   ```bash
   npm run test:env
   ```

### Problème : CORS Errors

**Erreur :** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions :**
1. Vérifier la configuration backend (Laravel) :
   ```php
   // config/cors.php
   'allowed_origins' => ['*'],
   'supports_credentials' => true,
   ```

2. Vérifier les headers dans `vite.config.ts` :
   ```js
   server: {
     cors: true,
   }
   ```

### Problème : Variables non chargées

**Erreur :** Variables `undefined` dans l'application

**Solutions :**
1. Redémarrer le serveur de dev :
   ```bash
   # Ctrl+C puis
   npm run dev
   ```

2. Vérifier que les variables commencent par `VITE_` :
   ```bash
   VITE_API_BASE_URL=...  # ✓ OK
   API_BASE_URL=...       # ✗ Ne sera pas chargé
   ```

3. Vérifier le fichier `.env.local` existe et est dans la racine du projet

---

## 📝 Checklist avant déploiement

- [ ] `npm run test:env` passe sans erreur
- [ ] `npm run test:api` détecte les deux APIs
- [ ] Bridge API configuré avec de vrais credentials
- [ ] `npm run build` réussit sans erreur
- [ ] `npm run preview` affiche l'application correctement
- [ ] Page `/app/diagnostic` affiche tout en vert
- [ ] Fichier `.env.production` créé avec les bonnes URLs
- [ ] Secrets dans `.env.production.local` (NON commité)

---

## 🚀 Commandes rapides

```bash
# Diagnostic complet
npm run diagnostic

# Dev local
npm run dev

# Dev avec Expose
npm run dev:expose

# Build production
npm run build

# Test build
npm run preview

# Page diagnostic
http://localhost:3000/app/diagnostic
```

---

## 📞 Support

Si les problèmes persistent :
1. Consulter les logs : Console navigateur (F12)
2. Vérifier les logs backend : `herd log budget-api`
3. Tester les endpoints manuellement avec `curl`
4. Vérifier la documentation Bridge : https://docs.bridgeapi.io/
