# 🧪 Tests de Connexion API - CoinQuest

## ✅ Tests créés

J'ai créé **4 outils de test** pour vérifier les connexions API en local et en production :

### 1. 🖥️ Script de test des variables d'environnement
**Fichier :** `scripts/test-env-vars.js`
**Commande :** `npm run test:env`

**Vérifie :**
- ✅ Présence des variables requises (`VITE_API_BASE_URL`, `VITE_BRIDGE_*`, etc.)
- ✅ Validité des formats (URLs valides, secrets non-placeholder)
- ✅ Configuration Bridge complète

**Exemple de sortie :**
```
🔍 Validation des variables d'environnement

Variables requises:
  ✓ VITE_API_BASE_URL: https://coinquest.us-1.sharedwithexpose.com/api
  ✓ VITE_BRIDGE_CLIENT_ID: sandbox_id_...
  ✗ VITE_BRIDGE_CLIENT_SECRET: ton_secret_ici (PLACEHOLDER!)
  ✓ VITE_BRIDGE_ENVIRONMENT: sandbox
  ✓ VITE_BRIDGE_REDIRECT_URI: https://...

📊 Résumé: 9/10 variables OK
```

---

### 2. 🌐 Script de test de connexion API
**Fichier :** `scripts/test-api-connection.js`
**Commande :** `npm run test:api`

**Vérifie :**
- ✅ Connexion à l'API locale (Herd) : `http://budget-api.test/api`
- ✅ Connexion à l'API production (Expose) : `https://coinquest.us-1.sharedwithexpose.com/api`
- ✅ Temps de réponse (latence)
- ✅ Status de chaque endpoint (`/health`, `/ping`, `/csrf`)

**Exemple de sortie :**
```
🔍 Test: API Locale (Herd)
URL: http://budget-api.test/api
  ✓ HEALTH: 200 (587ms)
  ✓ PING: 200 (83ms)
  ⚠ CSRF: 404 - Endpoint non trouvé

🔍 Test: API Production (Expose)
URL: https://coinquest.us-1.sharedwithexpose.com/api
  ⚠ HEALTH: 404 - Endpoint non trouvé
  ⚠ PING: 404 - Endpoint non trouvé

📊 Résumé:
  API Locale: 2/3 endpoints OK ✅
  API Production: 0/3 endpoints OK ⚠️
  Bridge API: ✓ Configuré ✅
```

---

### 3. 🎯 Commande diagnostic complète
**Commande :** `npm run diagnostic` ou `npm run test:all`

Lance **tous les tests** en séquence :
1. Test des variables d'environnement
2. Test des connexions API

**Utilisation :**
```bash
npm run diagnostic
```

---

### 4. 🌐 Page de diagnostic web
**Route :** `/app/diagnostic`
**URL :** `http://localhost:3000/app/diagnostic`

**Interface visuelle complète avec :**
- 📋 Affichage de toutes les variables d'environnement
- 🌐 Test en temps réel des connexions API
- 🏦 Status de la configuration Bridge
- 💻 Informations système (navigateur, connexion)
- 🔄 Bouton "Relancer les tests"
- 🎨 Codes couleur (vert/jaune/rouge) pour faciliter le diagnostic

**Capture d'écran conceptuelle :**
```
┌─────────────────────────────────────────────────┐
│ 🔧 Diagnostic CoinQuest          🔄 Relancer    │
├─────────────────────────────────────────────────┤
│ 📋 Variables d'environnement                    │
│   VITE_API_BASE_URL             ✅ Défini       │
│   VITE_BRIDGE_CLIENT_ID         ✅ Défini       │
│   VITE_BRIDGE_CLIENT_SECRET     ❌ Manquant     │
├─────────────────────────────────────────────────┤
│ 🌐 Connexion API                                │
│   Backend API                   ✅ Connecté     │
│   Latence: 234ms                                │
│                                                 │
│   Endpoints testés:                             │
│   GET /health                   ✅ 200 (45ms)   │
│   GET /ping                     ✅ 200 (23ms)   │
│   GET /user                     ⚠️ 401 (non auth)│
├─────────────────────────────────────────────────┤
│ 🏦 Bridge API                                   │
│   Client ID                     ✅ Configuré    │
│   Client Secret                 ❌ Manquant     │
│   Environment                   sandbox         │
│   Redirect URI                  ✅ Configuré    │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Utilisation rapide

```bash
# Diagnostic complet
npm run diagnostic

# Test variables uniquement
npm run test:env

# Test connexions uniquement
npm run test:api

# Démarrer le serveur et accéder à la page web
npm run dev
# Puis naviguer vers: http://localhost:3000/app/diagnostic
```

---

## 📊 Résultats des tests actuels

### ✅ Ce qui fonctionne

1. **API Locale (Herd)** ✅
   - Endpoint `/health` : `200 OK` (587ms)
   - Endpoint `/ping` : `200 OK` (83ms)

2. **Configuration Bridge** ✅
   - Client ID configuré
   - Environment: sandbox
   - Redirect URI configuré

3. **Variables d'environnement** ✅ (9/10)
   - Toutes les variables présentes
   - Formats valides

### ⚠️ À corriger

1. **Bridge Client Secret** ❌
   - Actuellement : `ton_secret_ici` (placeholder)
   - Action : Remplacer par le vrai secret depuis https://dashboard.bridgeapi.io/

2. **API Production (Expose)** ⚠️
   - Tous les endpoints retournent `404`
   - Action : Vérifier que le backend est déployé et accessible
   - URL testée : `https://coinquest.us-1.sharedwithexpose.com/api`

3. **Endpoint `/csrf`** ⚠️
   - Retourne `404` en local
   - Possible que l'endpoint n'existe pas ou soit à une autre URL

---

## 🔧 Corrections nécessaires

### 1. Configurer le Bridge Client Secret

Éditez `.env.local` :
```bash
VITE_BRIDGE_CLIENT_SECRET=votre_vrai_secret_bridge_ici
```

### 2. Vérifier l'API de production

Option A : Vérifier que Expose est actif
```bash
# Dans le dossier du backend Laravel
expose share budget-api.test --subdomain=coinquest
```

Option B : Vérifier l'URL dans le navigateur
```
https://coinquest.us-1.sharedwithexpose.com/api/health
```

Si l'URL ne fonctionne pas, mettre à jour `.env.local` avec la bonne URL Expose.

### 3. Relancer les tests

```bash
npm run diagnostic
```

---

## 📂 Fichiers créés

```
budget-gaming-frontend/
├── scripts/
│   ├── test-api-connection.js   # Test connexion API (CLI)
│   └── test-env-vars.js         # Test variables env (CLI)
├── src/
│   └── views/
│       └── Diagnostic.vue       # Page diagnostic web
├── package.json                 # Nouvelles commandes npm ajoutées
├── TEST-GUIDE.md               # Guide détaillé des tests
└── TESTING-README.md           # Ce fichier
```

---

## 📝 Nouvelles commandes npm

```json
{
  "test:api": "node scripts/test-api-connection.js",
  "test:env": "node scripts/test-env-vars.js",
  "test:all": "npm run test:env && npm run test:api",
  "diagnostic": "npm run test:all"
}
```

---

## 🎯 Checklist avant démo

- [ ] `npm run test:env` passe sans erreur
- [ ] `npm run test:api` détecte l'API locale
- [ ] Bridge Client Secret configuré (pas de placeholder)
- [ ] Page `/app/diagnostic` accessible et fonctionnelle
- [ ] API Production accessible (ou URL corrigée)
- [ ] Build de production réussit : `npm run build`

---

## 📞 Support

**Pour plus de détails :** Consulter `TEST-GUIDE.md`

**En cas de problème :**
1. Vérifier les logs : `herd log budget-api`
2. Tester manuellement : `curl http://budget-api.test/api/health`
3. Consulter la console du navigateur (F12)

---

## ✨ Résumé

**4 outils de diagnostic créés :**
1. ✅ Script CLI de test variables env
2. ✅ Script CLI de test connexion API
3. ✅ Commande `npm run diagnostic`
4. ✅ Page web interactive `/app/diagnostic`

**Status actuel :**
- ✅ API Locale fonctionne
- ✅ Variables configurées (sauf secret Bridge)
- ⚠️ API Production à vérifier
- ⚠️ Secret Bridge à remplacer

**Prêt pour les tests !** 🚀
