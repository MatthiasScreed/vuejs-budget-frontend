# Services Désactivés Temporairement

**Date**: 2026-01-27
**Raison**: Backend API non implémenté pour ces fonctionnalités

## Services Désactivés

Les services suivants ont été renommés en `.disabled.ts` car leurs endpoints backend n'existent pas encore :

### 1. reconciliationService.disabled.ts
**Endpoints manquants:**
- `POST /api/reconciliation/run-full`
- `POST /api/reconciliation/run-type/{type}`
- `POST /api/reconciliation/run-user/{userId}`
- `GET /api/reconciliation/reports`
- `GET /api/reconciliation/discrepancies/unresolved`
- Et 12+ autres endpoints

**Fonctionnalité:** Système de réconciliation des données (transactions, objectifs, gaming)

**Impact:** Aucun - Ce service n'était pas utilisé dans l'application

**Action requise:** Implémenter le backend de réconciliation ou supprimer définitivement

---

### 2. syncService.disabled.ts
**Endpoints manquants:**
- `POST /api/sync/start-full`
- `POST /api/sync/start-incremental`
- `POST /api/sync/queue/add`
- `GET /api/sync/conflicts`
- `POST /api/sync/offline/sync`
- Et 16+ autres endpoints

**Fonctionnalité:** Synchronisation complète des données (full sync, incremental, offline)

**Impact:** Aucun - Ce service n'était pas utilisé dans l'application

**Action requise:** Implémenter le backend de synchronisation ou supprimer définitivement

---

### 3. bridgeService.disabled.ts
**Endpoints manquants:**
- `POST /api/bridge/financial-action`
- `POST /api/bridge/financial-actions-batch`
- `POST /api/bridge/gaming-trigger`
- `GET /api/bridge/analytics/{timeframe}`
- `GET /api/bridge/health`

**Fonctionnalité:** Pont entre système financier et gaming (trigger achievements sur actions financières)

**Impact:** Aucun - Ce service n'était pas utilisé dans l'application

**Action requise:** Implémenter le backend bridge ou supprimer définitivement

---

### 4. challengeService.disabled.ts
**Endpoints manquants:**
- `GET /api/gaming/challenges`
- `GET /api/gaming/user-challenges`
- `POST /api/gaming/challenges/{id}/join`
- `POST /api/gaming/challenges/{id}/leave`
- `PUT /api/gaming/challenges/{id}/progress`
- `GET /api/gaming/challenges/{id}/leaderboard`
- `POST /api/gaming/challenges/sync-progress`

**Fonctionnalité:** Système de défis gaming (challenges temporels, compétitions)

**Impact:** Moyen - Le store `challengeStore.disabled.ts` l'utilisait

**Action requise:** Implémenter le backend challenges pour activer cette fonctionnalité

---

### 5. projectService.disabled.ts
**Endpoints manquants:**
- `GET /api/projects`
- `GET /api/projects/templates`
- `POST /api/projects`
- `POST /api/projects/from-template/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

**Fonctionnalité:** Gestion de projets financiers (voyage, maison, voiture, etc.)

**Impact:** Moyen - Le store `projectStore.disabled.ts` l'utilisait

**Action requise:** Implémenter le backend projects pour activer cette fonctionnalité

---

## Stores Désactivés

Les stores suivants ont également été désactivés car ils dépendent des services ci-dessus :

- `challengeStore.disabled.ts` (dépend de challengeService)
- `projectStore.disabled.ts` (dépend de projectService)

Ces stores ont été retirés des exports dans `src/stores/index.ts`.

---

## Comment Réactiver

### Option 1: Implémenter le Backend

1. Créer les endpoints manquants dans Laravel (`budget-api`)
2. Tester les endpoints avec Postman/Insomnia
3. Renommer les fichiers `.disabled.ts` en `.ts`
4. Décommenter les exports dans `src/stores/index.ts`
5. Tester l'intégration frontend-backend

### Option 2: Supprimer Définitivement

Si ces fonctionnalités ne sont pas prévues:

1. Supprimer les fichiers `.disabled.ts`
2. Supprimer les types associés dans `src/types/entities/`
3. Mettre à jour cette documentation

---

## Fonctionnalités Actuellement Actives

✅ **Services actifs avec backend:**
- authService (login, register, profile)
- transactionService (CRUD, stats, search)
- categoryService (CRUD)
- goalService (CRUD financial goals)
- achievementService (gaming achievements)
- levelService (XP, levels, rewards)
- streakService (daily/weekly streaks)
- BankService (Bridge integration)
- dashboardService (stats, insights)
- notificationService (notifications)

---

## Priorités d'Implémentation Backend

### 🔴 Haute Priorité
1. **challengeService** - Défis gaming (enrichit l'expérience utilisateur)
2. **projectService** - Projets financiers (fonctionnalité métier importante)

### 🟡 Moyenne Priorité
3. **bridgeService** - Pont gaming/finance (améliore la gamification)

### 🟢 Basse Priorité
4. **syncService** - Synchronisation avancée (nice-to-have)
5. **reconciliationService** - Réconciliation données (maintenance)

---

**Dernière mise à jour:** 2026-01-27
**Par:** Claude (Budget Gaming Frontend Cleanup)
