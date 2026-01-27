# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - 2026-01-27

### 🎉 Version Initiale - Prêt pour Production

#### ✅ Ajouté

**Fonctionnalités Principales**
- ✅ Système d'authentification complet (login, register, profile)
- ✅ Gestion des transactions (CRUD, catégorisation, recherche)
- ✅ Gestion des catégories personnalisables
- ✅ Goals (objectifs d'épargne simples)
- ✅ Projects (projets structurés avec templates)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Intégration bancaire Bridge API

**Gamification**
- ✅ Système XP avec 50 niveaux
- ✅ 40+ achievements déblocables
- ✅ Streaks (daily/weekly) avec bonus
- ✅ Leaderboard communautaire
- ✅ Notifications de progression

**UX/UI**
- ✅ Tutoriel interactif Goals vs Projects (6 étapes)
- ✅ Design moderne purple/blue avec animations
- ✅ Responsive mobile-first
- ✅ Mode sombre (préparation)
- ✅ Composants réutilisables (LoadingButton, EmptyState, ErrorBoundary)

**Outils & Tests**
- ✅ Page Diagnostic pour tests API
- ✅ Scripts de test API (CLI)
- ✅ Scripts de validation env variables
- ✅ Health checks temps réel

**Services**
- ✅ `authService` - Authentification
- ✅ `transactionService` - Transactions
- ✅ `categoryService` - Catégories
- ✅ `goalService` - Objectifs
- ✅ `projectService` - Projets
- ✅ `achievementService` - Achievements
- ✅ `levelService` - Système XP
- ✅ `streakService` - Streaks
- ✅ `BankService` - Intégration Bridge
- ✅ `dashboardService` - Dashboard
- ✅ `notificationService` - Notifications

#### 🔧 Corrigé

**Alignement Frontend/Backend**
- ✅ Routes goals corrigées (`/api/goals` → `/api/financial-goals`)
- ✅ Routes gaming XP corrigées (`/api/gaming/xp` → `/api/gaming/level/xp`)
- ✅ Méthode auth password (POST → PUT `/api/auth/password`)
- ✅ Méthode transaction search (POST → GET `/api/transactions/search`)

**Types TypeScript**
- ✅ Ajout type `'transfer'` pour Transaction et Category
- ✅ Correction ValidationSchema (interface → type)
- ✅ Fix BankingAlert Record<string, string> types
- ✅ Fix NodeJS.Timeout → number (browser compatibility)

**Configuration**
- ✅ `.env.example` créé avec documentation
- ✅ `.gitignore` amélioré (secrets, temporaires)
- ✅ Tailwind config corrigée (remove unsupported args)
- ✅ URLs cohérentes entre local et production

#### 📝 Modifié

**Services Désactivés Temporairement**
- ❌ `reconciliationService.disabled.ts` (backend manquant)
- ❌ `syncService.disabled.ts` (backend manquant)
- ❌ `bridgeService.disabled.ts` (backend manquant)
- ❌ `challengeService.disabled.ts` (backend manquant)

**Raison**: Ces services appellent des endpoints qui n'existent pas encore dans le backend Laravel.
Ils peuvent être réactivés en les renommant `.disabled.ts` → `.ts` quand le backend sera implémenté.

#### ✅ Réactivé

**Projects Service**
- ✅ Backend `/api/projects` découvert et fonctionnel
- ✅ Service `projectService.ts` réactivé
- ✅ Store `projectStore.ts` réactivé
- ✅ Tous les chemins API corrigés

#### 📚 Documentation

- ✅ `README.md` - Documentation complète du projet
- ✅ `TUTORIAL_SYSTEM.md` - Système de tutoriel interactif
- ✅ `DISABLED_SERVICES.md` - Services désactivés
- ✅ `PROJECTS_REACTIVATED.md` - Réactivation projects
- ✅ `TEST-GUIDE.md` - Guide de tests API
- ✅ `TESTING-README.md` - Tests et diagnostics
- ✅ `CHANGELOG.md` - Ce fichier

---

## [0.9.0] - 2026-01-26

### Pre-release - Tests et Corrections

#### Ajouté
- 🎨 Redesign Login et Register forms
- 🖼️ Intégration logo CoinQuest
- 🎮 Animation loading icon personnalisée
- 🔍 Scripts de diagnostic API

#### Corrigé
- 🐛 Erreurs TypeScript build
- 🔧 Configuration Vite/Tailwind
- 🌐 URLs backend cohérentes

---

## [0.8.0] - 2026-01-21

### Alpha - Fonctionnalités de Base

#### Ajouté
- 💰 CRUD Transactions
- 📊 CRUD Categories
- 🎯 CRUD Goals
- 🎮 Système Gaming basique
- 🏦 Intégration Bridge (sandbox)

---

## Légende des Types de Changements

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements de fonctionnalités existantes
- **Déprécié** : Fonctionnalités bientôt supprimées
- **Supprimé** : Fonctionnalités supprimées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Correctifs de vulnérabilités

---

## Prochaines Versions

### [1.1.0] - À venir

**Prévu**
- [ ] Implémenter backend reconciliation
- [ ] Implémenter backend sync
- [ ] Implémenter backend challenges
- [ ] Mode sombre complet
- [ ] Analytics avancées
- [ ] Export PDF rapports
- [ ] Partage social

### [1.2.0] - Futur

**Idées**
- [ ] App mobile (React Native)
- [ ] Notifications push
- [ ] IA recommendations
- [ ] Multi-devises
- [ ] Budgets prédictifs

---

**Dernière mise à jour**: 2026-01-27
**Mainteneur**: CoinQuest Team
