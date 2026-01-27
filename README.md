# 🎮 CoinQuest - Budget Gaming Frontend

> Application de gestion budgétaire gamifiée avec système XP, achievements et intégration bancaire

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Fonctionnalités

### 💰 Gestion Financière
- ✅ **Transactions** - Suivi revenus/dépenses avec catégorisation automatique
- ✅ **Catégories** - Personnalisables avec budgets et limites
- ✅ **Goals** - Objectifs d'épargne simples avec suivi progression
- ✅ **Projects** - Projets complexes avec templates (voyage, maison, voiture...)
- ✅ **Dashboard** - Vue d'ensemble avec statistiques et graphiques

### 🏦 Intégration Bancaire
- ✅ **Bridge API** - Connexion sécurisée aux banques françaises
- ✅ **Synchronisation** - Import automatique des transactions
- ✅ **Catégorisation** - IA pour classer automatiquement vos dépenses
- ✅ **Multi-comptes** - Gestion de plusieurs comptes bancaires

### 🎮 Gamification
- ✅ **Système XP** - Gagnez des points à chaque action financière
- ✅ **Levels** - 50 niveaux avec récompenses progressives
- ✅ **Achievements** - 40+ succès à débloquer
- ✅ **Streaks** - Bonus pour régularité (daily, weekly)
- ✅ **Leaderboard** - Comparez-vous aux autres joueurs

### 🎯 Expérience Utilisateur
- ✅ **Tutoriel interactif** - Guide pour Goals vs Projects
- ✅ **Thème moderne** - Design purple/blue avec animations
- ✅ **Responsive** - Mobile-first, optimisé tous écrans
- ✅ **Notifications** - Alertes en temps réel
- ✅ **Diagnostic** - Outils de test API intégrés

---

## 🚀 Quick Start

### Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **npm** 9+ (inclus avec Node.js)
- **Backend Laravel** - [budget-api](../budget-api) en cours d'exécution

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-repo/budget-gaming-frontend.git
cd budget-gaming-frontend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos valeurs

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

---

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env.local` à partir de `.env.example` :

```bash
# Backend API
VITE_API_BASE_URL=http://budget-api.test/api

# Bridge API (obtenez vos credentials sur https://dashboard.bridgeapi.io/)
VITE_BRIDGE_CLIENT_ID=your_client_id
VITE_BRIDGE_CLIENT_SECRET=your_client_secret
VITE_BRIDGE_ENVIRONMENT=sandbox

# Redirect URLs
VITE_BRIDGE_REDIRECT_URI=http://localhost:5173/app/banking
```

### Bridge API Setup

1. Créez un compte sur [Bridge API](https://dashboard.bridgeapi.io/)
2. Créez une application en mode **Sandbox**
3. Copiez vos **Client ID** et **Client Secret**
4. Configurez l'URL de redirection : `http://localhost:5173/app/banking`

---

## 📦 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de dev avec hot-reload
npm run dev:host         # Dev server accessible sur réseau local

# Build
npm run build            # Build production (avec type-check)
npm run build-only       # Build sans type-check (plus rapide)
npm run preview          # Preview du build production

# Tests & Qualité
npm run type-check       # Vérification TypeScript
npm run lint             # ESLint
npm run format           # Prettier

# Tests API
npm run test:api         # Test connexion API
npm run test:env         # Vérifier variables d'env
npm run test:all         # Tous les tests
npm run diagnostic       # Diagnostic complet
```

---

## 🏗️ Architecture

### Structure du Projet

```
budget-gaming-frontend/
├── src/
│   ├── assets/           # Images, logos, icons
│   ├── components/       # Composants Vue réutilisables
│   │   ├── banking/      # Composants connexion bancaire
│   │   ├── forms/        # Formulaires
│   │   ├── tutorial/     # Système de tutoriel
│   │   └── ui/           # Composants UI génériques
│   ├── composables/      # Composition API hooks
│   │   ├── core/         # useApi, useCache
│   │   ├── gaming/       # useGaming, useAchievements
│   │   └── sync/         # useAutoRefresh
│   ├── router/           # Vue Router configuration
│   ├── services/         # Services API
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── goalService.ts
│   │   └── projectService.ts
│   ├── stores/           # Pinia stores (état global)
│   ├── types/            # Définitions TypeScript
│   ├── utils/            # Utilitaires
│   └── views/            # Pages de l'application
├── public/               # Assets statiques
├── scripts/              # Scripts de test
└── docs/                 # Documentation
```

### Technologies

| Catégorie | Technologie | Version |
|-----------|------------|---------|
| **Framework** | Vue.js | 3.5.13 |
| **Language** | TypeScript | 5.7.2 |
| **Build** | Vite | 7.1.5 |
| **Router** | Vue Router | 4.5.0 |
| **State** | Pinia | 2.3.0 |
| **HTTP** | Axios | 1.7.9 |
| **Styling** | TailwindCSS | 3.4.17 |
| **Icons** | Heroicons | 2.2.0 |

---

## 🎯 Fonctionnalités Détaillées

### Goals vs Projects

#### Goals (Objectifs Simples)
- Montant cible unique
- Date limite optionnelle
- Contributions libres
- **Cas d'usage** : Vacances, téléphone, fonds d'urgence

#### Projects (Projets Structurés)
- Multiple catégories de dépenses
- Milestones (jalons) pour suivre progression
- Templates pré-configurés
- États : actif, pause, terminé, annulé
- **Cas d'usage** : Voyage complexe, achat immobilier, mariage

### Système de Gamification

#### Gains XP
- 🎯 Créer goal/project : **+50 XP**
- 💰 Ajouter transaction : **+10 XP**
- 💵 Ajouter contribution : **+20 XP**
- ✅ Compléter milestone : **+100 XP**
- 🏆 Atteindre objectif : **+200 XP**

#### Levels
- 50 niveaux disponibles
- Formule XP : `level * 100` (exponentielle)
- Récompenses tous les 5 niveaux
- Badges spéciaux (Bronze, Silver, Gold, Diamond)

#### Achievements
- 40+ succès déblocables
- Catégories : Débutant, Expert, Maître
- Récompenses XP bonus
- Système de tiers (Bronze → Diamond)

---

## 🧪 Tests & Debugging

### Outils de Diagnostic

L'application inclut une page **Diagnostic** (`/app/diagnostic`) pour :
- ✅ Vérifier connexion API (local & production)
- ✅ Tester configuration Bridge
- ✅ Valider variables d'environnement
- ✅ Afficher latence API en temps réel

### Scripts de Test

```bash
# Test connexion API
npm run test:api

# Exemple output :
# ✅ API Local (Herd) : OK - 45ms
# ✅ API Production (Expose) : OK - 120ms
# ⚠️  Bridge Secret : Placeholder (à configurer)
```

---

## 📱 Services Désactivés

Certains services sont désactivés (backend non implémenté) :

- ❌ `reconciliationService` - Réconciliation données
- ❌ `syncService` - Synchronisation avancée
- ❌ `bridgeService` - Pont gaming/finance
- ❌ `challengeService` - Défis temporels

Ces services sont renommés en `.disabled.ts` et peuvent être réactivés quand le backend sera prêt.

Voir [`DISABLED_SERVICES.md`](./DISABLED_SERVICES.md) pour plus de détails.

---

## 🚢 Déploiement

### Build Production

```bash
# Build optimisé
npm run build

# Preview local
npm run preview
```

### Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Déploiement sur Netlify

```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Déployer
netlify deploy --prod
```

### Variables d'Environnement Production

Configurez ces variables sur votre plateforme :

```
VITE_API_BASE_URL=https://votre-api.com/api
VITE_BRIDGE_CLIENT_ID=prod_client_id
VITE_BRIDGE_CLIENT_SECRET=prod_secret
VITE_BRIDGE_ENVIRONMENT=production
VITE_BRIDGE_REDIRECT_URI=https://votre-app.com/app/banking
```

---

## 📚 Documentation

- [TUTORIAL_SYSTEM.md](./TUTORIAL_SYSTEM.md) - Système de tutoriel interactif
- [DISABLED_SERVICES.md](./DISABLED_SERVICES.md) - Services désactivés
- [PROJECTS_REACTIVATED.md](./PROJECTS_REACTIVATED.md) - Réactivation Projects
- [TEST-GUIDE.md](./TEST-GUIDE.md) - Guide de tests API

---

## 🤝 Contribution

Les contributions sont bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add: Amazing Feature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Suivez les conventions TypeScript
- Ajoutez des tests si nécessaire
- Mettez à jour la documentation
- Utilisez des commits conventionnels

---

## 📄 License

Ce projet est sous licence MIT.

---

## 🙏 Remerciements

- [Vue.js](https://vuejs.org/) - Framework progressif
- [Bridge API](https://bridgeapi.io/) - Agrégateur bancaire
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Heroicons](https://heroicons.com/) - Icônes SVG
- [Vite](https://vitejs.dev/) - Build tool ultra-rapide

---

<div align="center">

**Fait avec ❤️ par l'équipe CoinQuest**

[⬆ Retour en haut](#-coinquest---budget-gaming-frontend)

</div>
