# 🔍 Guide de Debugging Auth en Production

## 🚨 Problème Identifié
**Symptôme**: Token ne persiste pas en production, redirection immédiate vers `/login`

## ✅ Corrections Appliquées

### 1. **Configuration API URL** (`src/services/api.ts` + `.env.local`)
- **Problème**: Double `/api` dans l'URL finale
- **Fix**: Retirer `/api` de `VITE_API_BASE_URL` dans `.env.local`
```bash
# ❌ AVANT
VITE_API_BASE_URL=https://laravel-budget-api-saqbqlbw.on-forge.com/api

# ✅ APRÈS
VITE_API_BASE_URL=https://laravel-budget-api-saqbqlbw.on-forge.com
```

### 2. **Suppression du Double Stockage** (`src/services/authService.ts`)
- **Problème**: Deux systèmes de stockage en conflit
  - `authService.ts` écrivait directement dans `localStorage`
  - `authStore.ts` utilisait `secureStorage.setTokenWithExpiry()`
- **Fix**: Supprimé le stockage de `authService.ts`, seul `authStore` gère maintenant

### 3. **Méthodes Deprecated**
- `authService.getToken()` → Utilisez `getTokenIfValid()` de `secureStorage.ts`
- `authService.isAuthenticated()` → Utilisez `authStore.isAuthenticated`

---

## 🐛 Étapes de Debugging en Production

### Étape 1: Vérifier l'URL de l'API dans la Console

Ouvrez la console développeur (F12) et cherchez:
```
🔧 API Base URL: https://...
🔧 Environment: production
```

**Attendu**: `https://laravel-budget-api-saqbqlbw.on-forge.com` (sans `/api`)

---

### Étape 2: Tester la Requête Login

Dans la console, regardez:
```
🔐 === PROCESSUS DE LOGIN ===
📤 Envoi de la requête de login...
📥 POST /auth/login - 200 (XXXms)
✅ Token extrait: eyJ0eXAiOiJKV1QiLCJ...
💾 Sauvegarde du token avec setTokenWithExpiry...
✅ setTokenWithExpiry terminé
🔍 Vérification immédiate du token sauvegardé...
✅ Token RÉCUPÉRÉ avec succès: eyJ0eXAiOiJKV1QiLCJ...
```

**Si tu vois ❌ ÉCHEC**, alors le problème est dans `secureStorage.ts`

---

### Étape 3: Vérifier localStorage

Dans la console développeur, onglet **Application** → **Local Storage**:

Cherche ces clés:
- ✅ `auth_token`: Devrait contenir `{"token":"eyJ...", "expiry":1234567890, "createdAt":"..."}`
- ✅ `user`: Devrait contenir `{"id":1, "name":"...", "email":"..."}`

**Si absent ou vide** → Le problème vient du stockage

---

### Étape 4: Vérifier CORS

Dans Network tab, clique sur la requête `auth/login`:
- **Response Headers** doit contenir:
  ```
  Access-Control-Allow-Origin: https://ton-frontend-url.com
  Access-Control-Allow-Credentials: true
  ```

**Si tu vois une erreur CORS**, vérifie côté Laravel:

```php
// Laravel: config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://laravel-budget-api-saqbqlbw.on-forge.com', // Frontend URL
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // ⚠️ CRITIQUE
];
```

---

### Étape 5: Vérifier Sanctum Configuration

```php
// Laravel: config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,laravel-budget-api-saqbqlbw.on-forge.com'
)),
```

---

### Étape 6: Test API Direct (cURL)

Teste l'authentification directement:
```bash
curl -X POST https://laravel-budget-api-saqbqlbw.on-forge.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  -v
```

**Attendu**:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJ0eXAiOi..."
  }
}
```

---

## 🔧 Commandes de Debug à Exécuter dans la Console

### 1. Vérifier le token stocké
```javascript
// Dans la console du navigateur
const stored = localStorage.getItem('auth_token')
if (stored) {
  const parsed = JSON.parse(stored)
  console.log('Token:', parsed.token.substring(0, 30) + '...')
  console.log('Expiry:', new Date(parsed.expiry).toISOString())
  console.log('Expiré?', Date.now() > parsed.expiry)
} else {
  console.log('❌ Aucun token stocké')
}
```

### 2. Forcer le login
```javascript
// Importer le store
const authStore = window.__app__.config.globalProperties.$pinia._s.get('auth')

// Vérifier l'état
console.log('Authenticated?', authStore.isAuthenticated)
console.log('User:', authStore.user)

// Tester getTokenIfValid
import('@/services/secureStorage').then(({ getTokenIfValid }) => {
  getTokenIfValid().then(token => {
    console.log('Token valide?', token ? 'OUI' : 'NON')
  })
})
```

---

## 🚀 Checklist Avant Déploiement

- [ ] `.env.production` sur Forge contient `VITE_API_BASE_URL` sans `/api`
- [ ] Laravel CORS configuré avec `supports_credentials: true`
- [ ] Sanctum `stateful` domains inclut le domaine frontend
- [ ] Tester login en local avec les mêmes configs
- [ ] Vérifier que `npm run build` passe sans erreurs
- [ ] Tester l'API en cURL avant déploiement

---

## 📊 Logs à Chercher

### Logs Réussis (✅)
```
🔐 === PROCESSUS DE LOGIN ===
📤 Envoi de la requête de login...
📥 Réponse reçue: {success: true, data: {...}}
✅ Token extrait: eyJ0eXAiOi...
💾 Sauvegarde du token avec setTokenWithExpiry...
✅ [SIMPLE] Valeur bien écrite
✅ VÉRIFICATION OK: Token bien sauvegardé
🎉 Login réussi!

🔍 === INIT AUTH ===
🔑 Vérification du token...
✅ Token valide retourné
👤 Chargement des données utilisateur...
✅ Utilisateur chargé: John Doe
✅ Session valide!
```

### Logs Problématiques (❌)
```
❌ ÉCHEC : getTokenIfValid() retourne NULL juste après sauvegarde!
❌ Aucun token valide trouvé
❌ Aucun cache utilisateur
🔒 Session expirée - Redirection login
```

---

## 💡 Solutions Rapides

### Problème: Token null après sauvegarde
**Cause**: localStorage bloqué ou quota dépassé
**Solution**:
```javascript
// Vérifier disponibilité localStorage
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
  console.log('✅ localStorage disponible')
} catch (e) {
  console.error('❌ localStorage bloqué:', e)
}
```

### Problème: CORS error
**Cause**: Backend ne retourne pas les bons headers
**Solution**: Ajouter middleware CORS dans Laravel:
```php
// Laravel: app/Http/Kernel.php
protected $middleware = [
    \App\Http\Middleware\TrustProxies::class,
    \Fruitcake\Cors\HandleCors::class, // ⚠️ AJOUTER ICI
    // ...
];
```

### Problème: Token expiré immédiatement
**Cause**: Différence de timezone serveur/client
**Solution**: Vérifier `secureStorage.ts:60` calcul expiry
```typescript
const expiry = now.getTime() + expiryHours * 60 * 60 * 1000
console.log('Expiry timestamp:', expiry)
console.log('Expiry date:', new Date(expiry).toISOString())
```

---

## 🎯 Plan d'Action Immédiat

1. **Build local**
   ```bash
   npm run build
   npm run preview
   ```

2. **Tester l'auth en preview** (simule production)
   - Ouvrir http://localhost:4173
   - Essayer de se connecter
   - Regarder la console

3. **Si ça marche en preview mais pas en prod**:
   - Problème de configuration `.env.production` sur Forge
   - Vérifier CORS Laravel

4. **Si ça ne marche pas en preview**:
   - Problème dans le code
   - Debug avec les logs ci-dessus

---

## 📞 Contact

Si le problème persiste, fournis ces informations:
- Logs console complets (🔐 === PROCESSUS DE LOGIN ===)
- Network tab screenshot (requête /auth/login)
- localStorage screenshot (clé auth_token)
- Erreur CORS dans console (si applicable)
