# 🏗️ CoinQuest - Architecture & Documentation Complète

> Documentation technique complète de l'application CoinQuest - Budget Gaming Frontend
> **Version**: 1.0.0 | **Dernière mise à jour**: 2025-02-22

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#-vue-densemble)
2. [Architecture Technique](#-architecture-technique)
3. [Structure du Projet](#-structure-du-projet)
4. [Stores Pinia](#-stores-pinia-state-management)
5. [Services API](#-services-api)
6. [Composants Vue](#-composants-vue)
7. [Fonctionnalités Clés](#-fonctionnalités-clés)
8. [Modifications Récentes](#-modifications-récentes)
9. [Déploiement](#-déploiement)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Vue d'Ensemble

### Description
**CoinQuest** est une application de gestion budgétaire gamifiée qui transforme la gestion financière en une expérience ludique et engageante. Elle combine suivi budgétaire, intégration bancaire et mécaniques de jeu (XP, niveaux, achievements).

### Stack Technique
- **Frontend**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite 7.1
- **State Management**: Pinia 3.0
- **Styling**: TailwindCSS 4.1
- **Router**: Vue Router 4.5
- **HTTP Client**: Axios 1.10
- **Charts**: Chart.js 4.5 + Vue-ChartJS 5.3
- **Animations**: VueUse Motion, Canvas Confetti, Lottie
- **Notifications**: Vue Toastification 2.0

### Statistiques
- **25 Views** (pages principales)
- **102 Components** (composants réutilisables)
- **19 Stores** (gestion d'état)
- **31 Services** (logique métier)

---

## 🏛️ Architecture Technique

### Pattern Architectural

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Views     │  │  Components  │  │  Composables     │   │
│  │  (Pages)    │  │  (UI Pieces) │  │  (Logic Hooks)   │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT LAYER                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Pinia Stores (19 stores)                │   │
│  │  authStore | gamingStore | transactionStore | ...   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Services (31 services)                  │   │
│  │  authService | apiService | gamingService | ...     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                         DATA LAYER                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Axios API  │  │  LocalStorage│  │  Bridge API      │   │
│  │  (Backend)  │  │  (Cache)     │  │  (Banking)       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Principes de Conception

1. **Composition API First** - Utilisation systématique de `<script setup>`
2. **Single Responsibility** - Chaque composant/service a une responsabilité unique
3. **DRY (Don't Repeat Yourself)** - Composables et helpers réutilisables
4. **Type Safety** - TypeScript strict pour tous les fichiers
5. **Responsive Design** - Mobile-first avec Tailwind
6. **Progressive Enhancement** - Fonctionnalités optionnelles (gaming, banking)

---

## 📁 Structure du Projet

```
budget-gaming-frontend/
├── 📂 src/
│   ├── 📂 assets/               # Ressources statiques
│   │   ├── images/             # Images, icons, logos
│   │   ├── styles/             # CSS global
│   │   └── fonts/              # Polices personnalisées
│   │
│   ├── 📂 components/          # Composants Vue (102 composants)
│   │   ├── banking/           # Intégration bancaire
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── engagement/        # Gamification UI
│   │   ├── forms/             # Formulaires réutilisables
│   │   ├── gaming/            # Gaming widgets
│   │   ├── goals/             # Objectifs financiers
│   │   ├── layout/            # Layout (Navbar, Sidebar)
│   │   ├── modals/            # Modales
│   │   ├── transactions/      # Transactions UI
│   │   ├── tutorial/          # Tutoriels interactifs
│   │   ├── ui/                # Composants UI basiques
│   │   └── validation/        # Validation messages
│   │
│   ├── 📂 composables/         # Composition API hooks
│   │   └── core/
│   │       ├── useApiHealth.ts   # Monitoring API
│   │       ├── useErrorHandler.ts # Gestion erreurs
│   │       └── useTutorial.ts    # Système tutoriel
│   │
│   ├── 📂 router/              # Vue Router
│   │   ├── index.ts           # Configuration routes
│   │   └── guards.ts          # Navigation guards
│   │
│   ├── 📂 services/            # Services métier (31 services)
│   │   ├── api.ts                    # Axios instance centrale
│   │   ├── authService.ts           # Authentification
│   │   ├── gamingService.ts         # Gamification
│   │   ├── transactionService.ts    # Transactions
│   │   ├── goalService.ts           # Objectifs
│   │   ├── achievementService.ts    # Succès
│   │   ├── BankService.ts           # Intégration bancaire
│   │   ├── secureStorage.ts         # Stockage sécurisé
│   │   ├── insightService.ts        # Insights financiers
│   │   └── ...
│   │
│   ├── 📂 stores/              # Pinia stores (19 stores)
│   │   ├── authStore.ts              # État authentification
│   │   ├── gamingStore.ts            # État gaming
│   │   ├── transactionStore.ts       # État transactions
│   │   ├── goalStore.ts              # État objectifs
│   │   ├── achievementStore.ts       # État succès
│   │   ├── dashboardStore.ts         # État dashboard
│   │   ├── insightStore.ts           # État insights
│   │   ├── banking.ts                # État banking
│   │   └── index.ts                  # Exports centralisés
│   │
│   ├── 📂 types/               # Définitions TypeScript
│   │   ├── entities/          # Types entités métier
│   │   ├── api/               # Types API
│   │   └── components/        # Types composants
│   │
│   ├── 📂 utils/               # Utilitaires
│   │   ├── formatters.ts      # Format nombres, dates
│   │   ├── validators.ts      # Validations custom
│   │   └── constants.ts       # Constantes globales
│   │
│   ├── 📂 views/               # Pages principales (25 views)
│   │   ├── Dashboard.vue             # Page d'accueil
│   │   ├── Transactions.vue          # Liste transactions
│   │   ├── Goals.vue                 # Objectifs financiers
│   │   ├── Categories.vue            # Gestion catégories
│   │   ├── Analytics.vue             # Statistiques avancées
│   │   ├── Gaming.vue                # Centre gaming
│   │   ├── Achievements.vue          # Galerie succès
│   │   ├── Banking.vue               # Intégration bancaire
│   │   ├── Profile.vue               # Profil utilisateur
│   │   ├── Login.vue                 # Connexion
│   │   ├── Register.vue              # Inscription
│   │   └── ...
│   │
│   ├── App.vue                 # Composant racine
│   ├── main.ts                 # Point d'entrée
│   └── env.d.ts                # Déclarations env
│
├── 📂 public/                  # Assets publics
├── 📂 scripts/                 # Scripts utilitaires
├── 📄 .env.example             # Template variables env
├── 📄 package.json             # Dépendances NPM
├── 📄 tsconfig.json            # Config TypeScript
├── 📄 vite.config.ts           # Config Vite
├── 📄 tailwind.config.js       # Config Tailwind
└── 📄 README.md                # Documentation principale
```

---

## 🗃️ Stores Pinia (State Management)

### 1. **authStore** (`src/stores/authStore.ts`)
**Responsabilité**: Gestion de l'authentification et session utilisateur

**État**:
```typescript
{
  user: User | null                    // Utilisateur connecté
  isAuthenticated: boolean             // État connexion
  isInitialized: boolean               // Auth initialisée
  loading: boolean                     // Requête en cours
  error: string | null                 // Erreur
  validationErrors: Record<string, string[]>
}
```

**Actions principales**:
- `login(credentials)` - Connexion utilisateur
- `register(userData)` - Inscription
- `logout()` - Déconnexion
- `initAuth()` - Initialisation au démarrage
- `loadUser()` - Recharger données utilisateur
- `updateProfile(updates)` - Mettre à jour profil

**Corrections récentes** (2025-02-22):
- ✅ Suppression du double stockage token (conflit avec authService)
- ✅ Utilisation exclusive de `secureStorage.setTokenWithExpiry()`
- ✅ Ajout flag `isInitialized` pour éviter race conditions
- ✅ Logs debug complets pour troubleshooting production

---

### 2. **gamingStore** (`src/stores/gamingStore.ts`)
**Responsabilité**: Gestion du système de gamification

**État**:
```typescript
{
  level: Level                         // Niveau utilisateur
  achievements: Achievement[]          // Succès débloqués
  streaks: Streak[]                    // Séries actives
  notifications: Notification[]        // Notifications gaming
  stats: GamingStats                   // Statistiques gaming
}
```

**Actions principales**:
- `addXP(amount, action)` - Ajouter XP
- `checkLevelUp()` - Vérifier montée de niveau
- `unlockAchievement(id)` - Débloquer succès
- `trackAction(action)` - Tracker action utilisateur
- `updateStreak(type)` - Mettre à jour série

---

### 3. **transactionStore** (`src/stores/transactionStore.ts`)
**Responsabilité**: Gestion des transactions financières

**État**:
```typescript
{
  transactions: Transaction[]          // Liste transactions
  filters: FilterOptions               // Filtres actifs
  pagination: PaginationState          // Pagination
  stats: TransactionStats              // Statistiques
  loading: boolean
}
```

**Actions principales**:
- `fetchTransactions(filters?)` - Charger transactions
- `createTransaction(data)` - Créer transaction
- `updateTransaction(id, data)` - Modifier transaction
- `deleteTransaction(id)` - Supprimer transaction
- `categorizeTransaction(id, categoryId)` - Catégoriser
- `searchTransactions(query)` - Rechercher

---

### 4. **goalStore** (`src/stores/goalStore.ts`)
**Responsabilité**: Gestion des objectifs financiers

**État**:
```typescript
{
  goals: FinancialGoal[]               // Objectifs actifs
  completedGoals: FinancialGoal[]      // Objectifs complétés
  stats: GoalStats                     // Statistiques
  loading: boolean
}
```

**Actions principales**:
- `fetchGoals()` - Charger objectifs
- `createGoal(data)` - Créer objectif
- `updateGoal(id, data)` - Modifier objectif
- `deleteGoal(id)` - Supprimer objectif
- `addContribution(goalId, amount)` - Ajouter contribution
- `completeGoal(id)` - Marquer comme complété

**Modifications récentes** (HEAD~5):
- ⚡ Refactorisation majeure (-469 lignes, +226 lignes)
- ✅ Simplification de la logique de contributions
- ✅ Amélioration calcul progression
- ✅ Meilleure gestion erreurs

---

### 5. **achievementStore** (`src/stores/achievementStore.ts`)
**Responsabilité**: Gestion des succès et récompenses

**État**:
```typescript
{
  achievements: Achievement[]          // Tous les succès
  unlockedIds: number[]                // IDs débloqués
  recentUnlocks: Achievement[]         // Récemment débloqués
  stats: {
    total: number
    unlocked: number
    percentage: number
  }
}
```

---

### 6. **dashboardStore** (`src/stores/dashboardStore.ts`)
**Responsabilité**: Données du dashboard principal

**État**:
```typescript
{
  overview: DashboardOverview          // Vue d'ensemble
  recentTransactions: Transaction[]    // Transactions récentes
  insights: Insight[]                  // Insights financiers
  projections: Projection[]            // Projections
  loading: boolean
}
```

**Modifications récentes**:
- ✅ Amélioration affichage transactions récentes
- ✅ Fix API calls pour projections

---

### 7. **insightStore** (`src/stores/insightStore.ts`)
**Responsabilité**: Insights et recommandations financières

**État**:
```typescript
{
  insights: Insight[]                  // Insights actifs
  dismissed: number[]                  // Insights ignorés
  categories: InsightCategory[]        // Catégories d'insights
}
```

**Modifications récentes** (HEAD~5):
- ⚡ Refactorisation composant InsightsPanel
- ✅ Amélioration logique de priorisation
- ✅ Meilleure gestion des insights dismissés

---

### 8. **banking** (`src/stores/banking.ts`)
**Responsabilité**: Intégration bancaire Bridge API

**État**:
```typescript
{
  connections: BankConnection[]        // Connexions bancaires
  transactions: BankTransaction[]      // Transactions importées
  accounts: BankAccount[]              // Comptes bancaires
  syncStatus: SyncStatus               // État synchronisation
}
```

**Corrections récentes** (2025-02-22):
- ✅ Fix import case-sensitive `BankService` (blocker production Linux)

---

### 9. **projectStore** (`src/stores/projectStore.ts`)
**Responsabilité**: Projets financiers complexes

**État**:
```typescript
{
  projects: Project[]                  // Projets actifs
  templates: ProjectTemplate[]         // Templates disponibles
  stats: ProjectStats
}
```

**Statut**: ✅ Réactivé après vérification backend

---

### Stores Désactivés (`.disabled.ts`)

Ces stores sont temporairement désactivés en attendant l'implémentation backend:
- `challengeStore.disabled.ts` - Défis financiers
- Services associés: `bridgeService`, `syncService`, `reconciliationService`, `challengeService`

---

## 🔌 Services API

### Architecture des Services

Les services sont organisés en couches:
1. **api.ts** - Instance Axios centrale avec intercepteurs
2. **Services métier** - Encapsulent les appels API par domaine
3. **Error handling** - Gestion centralisée des erreurs

### Service Central: `api.ts`

```typescript
// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://budget-api.test'

// Instance Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,  // Pour CORS avec credentials
})

// Intercepteur Request - Ajoute token
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getTokenIfValid()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur Response - Gère 401
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirection login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**Corrections récentes**:
- ✅ Fix API_BASE_URL pour éviter double `/api`
- ✅ Logs détaillés pour debugging
- ✅ Gestion timeout 60s

---

### Services Principaux

#### 1. **authService** (`src/services/authService.ts`)

```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>>
  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>>
  async logout(): Promise<ApiResponse>
  async getUser(): Promise<ApiResponse<User>>
  async refreshToken(): Promise<ApiResponse<RefreshResponse>>
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>>
  async changePassword(data: PasswordChangeData): Promise<ApiResponse>
  async resetPassword(email: string): Promise<ApiResponse>
  async ping(): Promise<ApiResponse>  // Health check
}
```

**Corrections récentes**:
- ✅ Suppression stockage token (délégué à authStore)
- ✅ Méthodes deprecated marquées avec warnings
- ✅ Utilisation exclusive de `secureStorage`

---

#### 2. **gamingService** (`src/services/gamingService.ts`)

```typescript
class GamingService {
  async addXP(amount: number, action: string, metadata?: Record<string, any>): Promise<ApiResponse>
  async getLevel(): Promise<ApiResponse<Level>>
  async getAchievements(): Promise<ApiResponse<Achievement[]>>
  async unlockAchievement(achievementId: number): Promise<ApiResponse>
  async getStreaks(): Promise<ApiResponse<Streak[]>>
  async trackAction(action: string, metadata?: Record<string, any>): Promise<ApiResponse>
}
```

**Correction XP endpoint**:
- ❌ Ancien: `/api/gaming/xp`
- ✅ Nouveau: `/api/gaming/level/xp`

---

#### 3. **transactionService** (`src/services/transactionService.ts`)

```typescript
class TransactionService {
  async getTransactions(filters?: TransactionFilters): Promise<ApiResponse<Transaction[]>>
  async createTransaction(data: CreateTransactionData): Promise<ApiResponse<Transaction>>
  async updateTransaction(id: number, data: UpdateTransactionData): Promise<ApiResponse<Transaction>>
  async deleteTransaction(id: number): Promise<ApiResponse>
  async searchTransactions(query: string, filters?: SearchFilters): Promise<ApiResponse<Transaction[]>>
  async categorizeTransaction(id: number, categoryId: number): Promise<ApiResponse<Transaction>>
  async bulkDelete(ids: number[]): Promise<ApiResponse>
}
```

**Correction search method**:
- ❌ Ancien: `POST /api/transactions/search` (body)
- ✅ Nouveau: `GET /api/transactions/search` (query params)

---

#### 4. **goalService** (`src/services/goalService.ts`)

```typescript
class GoalService {
  async getGoals(): Promise<ApiResponse<FinancialGoal[]>>
  async createGoal(data: CreateGoalData): Promise<ApiResponse<FinancialGoal>>
  async updateGoal(id: number, data: UpdateGoalData): Promise<ApiResponse<FinancialGoal>>
  async deleteGoal(id: number): Promise<ApiResponse>
  async addContribution(goalId: number, amount: number): Promise<ApiResponse>
  async completeGoal(id: number): Promise<ApiResponse>
}
```

**Correction endpoint**:
- ❌ Ancien: `/api/goals`
- ✅ Nouveau: `/api/financial-goals`

---

#### 5. **BankService** (`src/services/BankService.ts`)

```typescript
class BankService {
  async connectBank(provider: string): Promise<ApiResponse<BridgeUrl>>
  async getConnections(): Promise<ApiResponse<BankConnection[]>>
  async syncAccounts(connectionId: number): Promise<ApiResponse>
  async getTransactions(accountId: number): Promise<ApiResponse<BankTransaction[]>>
  async categorizeTransaction(id: number, categoryId: number): Promise<ApiResponse>
  async deleteConnection(id: number): Promise<ApiResponse>
}
```

**⚠️ CRITICAL FIX** (blocker production):
- Fichier nommé `BankService.ts` (capital B)
- Imports utilisaient `@/services/bankService` (lowercase)
- ✅ Corrigé dans 9 fichiers pour Linux/Forge

---

#### 6. **secureStorage** (`src/services/secureStorage.ts`)

Service de stockage sécurisé avec expiration:

```typescript
class SecureStorage {
  async setItem(key: string, value: string): Promise<void>
  async getItem(key: string): Promise<string | null>
  removeItem(key: string): void
  clear(): void
}

// Helpers
async function setTokenWithExpiry(token: string, expiryHours: number): Promise<void>
async function getTokenIfValid(): Promise<string | null>
function setupMultiTabLogout(onLogout: () => void): void

// Security
class RateLimiter {
  canAttempt(action: string, maxAttempts: number, windowMinutes: number): boolean
  reset(action: string): void
  getWaitTime(action: string, windowMinutes: number): number
}
```

**Version actuelle**: Simple (non chiffrée) pour debugging
**Notes**: Logs détaillés pour troubleshooting token persistence

---

## 🧩 Composants Vue

### Composants par Catégorie

#### 1. **Dashboard** (`src/components/dashboard/`)

| Composant | Description |
|-----------|-------------|
| `DashboardHeader.vue` | En-tête avec bienvenue et quick actions |
| `FinancialCard.vue` | Carte métriques financières |
| `MetricCard.vue` | Carte métrique simple |
| `SpendingChart.vue` | Graphique dépenses |
| `GoalsProgressCard.vue` | Progression objectifs |
| `RecentTransactions.vue` | Liste transactions récentes |
| `InsightCard.vue` | Carte insight/recommandation |
| `ProjectionCard.vue` | Projections financières |
| `AIProjections.vue` | Projections IA |
| `SavingsCapacityCard.vue` | Capacité d'épargne |

**Modifications récentes**:
- ✅ `RecentTransactions.vue` - Fix affichage et appels API
- ✅ `InsightCard.vue` - Amélioration layout

---

#### 2. **Gaming** (`src/components/gaming/`)

| Composant | Description |
|-----------|-------------|
| `GamingWidget.vue` | Widget gaming principal |
| `LevelUpNotification.vue` | Notification montée de niveau |
| `AchievementNotification.vue` | Notification succès débloqué |
| `AchievementModal.vue` | Détails d'un succès |
| `AchievementGallery.vue` | Galerie de tous les succès |
| `ProgressBar.vue` | Barre de progression XP |
| `StreakCard.vue` | Carte série (daily/weekly) |
| `MilestoneCard.vue` | Carte milestone |
| `EncouragementCard.vue` | Carte d'encouragement |
| `GamingPreferencesModal.vue` | Préférences gaming |
| `GamingSidebar.vue` | Sidebar gaming |

---

#### 3. **Forms** (`src/components/forms/`)

| Composant | Description |
|-----------|-------------|
| `TransactionForm.vue` | Formulaire transaction |
| `GoalForm.vue` | Formulaire objectif |
| `CategoryForm.vue` | Formulaire catégorie |
| `ProfileForm.vue` | Formulaire profil |
| `MoneyInput.vue` | Input monétaire |
| `CategorySelect.vue` | Sélecteur catégorie |
| `DateRangeInput.vue` | Sélecteur plage dates |
| `ColorPicker.vue` | Sélecteur couleur |
| `IconPicker.vue` | Sélecteur icône |
| `FileUpload.vue` | Upload fichier |
| `RecurrenceInput.vue` | Input récurrence |
| `FormProgress.vue` | Barre progression formulaire |

---

#### 4. **Banking** (`src/components/banking/`)

| Composant | Description |
|-----------|-------------|
| `BankProviderList.vue` | Liste banques disponibles |
| `BankConnectionsList.vue` | Liste connexions actives |
| `ConnectionCard.vue` | Carte connexion bancaire |
| `TransactionItem.vue` | Item transaction bancaire |
| `TransactionEditModal.vue` | Édition transaction importée |
| `BankingAlert.vue` | Alertes banking |

---

#### 5. **UI** (`src/components/ui/`)

| Composant | Description |
|-----------|-------------|
| `BaseCard.vue` | Carte de base réutilisable |
| `StatCard.vue` | Carte statistique |
| `TransactionCard.vue` | Carte transaction |
| `LoadingButton.vue` | Bouton avec loading |
| `LoadingSkeleton.vue` | Skeleton loader |
| `EmptyState.vue` | État vide |
| `ErrorBoundary.vue` | Boundary erreurs |
| `GamingNotification.vue` | Notification gaming |

---

#### 6. **Tutorial** (`src/components/tutorial/`)

| Composant | Description |
|-----------|-------------|
| `TutorialModal.vue` | Modal tutoriel interactif (6 steps) |

**Fonctionnalités**:
- ✅ Navigation par étapes avec progression
- ✅ Exemples concrets pour chaque concept
- ✅ Tips et recommandations
- ✅ Persistance localStorage (`goals_tutorial_seen`)
- ✅ Auto-display au premier chargement (1s delay)
- ✅ Design moderne avec gradients

**Composable associé**: `useTutorial.ts`
- `useGoalsProjectsTutorial()` - 6 steps (Goals + Projects)
- `useGoalsTutorial()` - 4 steps (Goals seulement)
- `useProjectsTutorial()` - 5 steps (Projects seulement)

---

## 🎮 Fonctionnalités Clés

### 1. Système d'Authentification

**Flow complet**:
```
User Input → Login.vue → authStore.login()
  → authService.login() → API /auth/login
  → Receive { user, token }
  → secureStorage.setTokenWithExpiry(token, 24*7)
  → authStore.setAuthData(user)
  → localStorage.setItem('user', JSON.stringify(user))
  → isAuthenticated = true
  → Router → /app/dashboard
```

**Initialisation au démarrage**:
```
App.vue mounted → authStore.initAuth()
  → getTokenIfValid() from secureStorage
  → Check token expiry
  → If valid: loadUser() from API
  → If success: isAuthenticated = true
  → Router guard allows navigation
```

**Corrections majeures** (2025-02-22):
- ✅ Suppression double stockage token
- ✅ Race condition fixée avec `isInitialized` flag
- ✅ Router guard attend initialisation auth
- ✅ Logs debug complets pour production

---

### 2. Système de Gamification

**Mécaniques de jeu**:
- **XP System**: Points gagnés pour chaque action (transaction, objectif, connexion)
- **Levels**: 50 niveaux avec paliers XP croissants
- **Achievements**: 40+ succès (Bronze, Argent, Or, Platine)
- **Streaks**: Bonus quotidiens/hebdomadaires
- **Leaderboard**: Classement entre utilisateurs

**Actions trackées**:
| Action | XP | Description |
|--------|-----|-------------|
| Créer transaction | 10 XP | Ajouter une transaction |
| Créer objectif | 50 XP | Créer un objectif d'épargne |
| Compléter objectif | 200 XP | Atteindre un objectif |
| Connexion bancaire | 100 XP | Connecter une banque |
| Login quotidien | 5 XP | Se connecter chaque jour |
| Catégoriser transaction | 5 XP | Ajouter une catégorie |

**Achievements examples**:
- 🥉 **First Steps** - Créer votre première transaction
- 🥈 **Goal Setter** - Créer 5 objectifs
- 🥇 **Savings Master** - Atteindre 10 objectifs
- 💎 **Banking Pro** - Connecter 3 banques
- 🔥 **Streak Legend** - 30 jours consécutifs

---

### 3. Intégration Bancaire (Bridge API)

**Flow de connexion**:
```
Banking.vue → BankService.connectBank(provider)
  → API /bridge/connect
  → Receive bridge_url
  → Redirect user to Bridge
  → User authenticates with bank
  → Redirect to /app/banking/callback?status=success
  → BankService.handleCallback()
  → Sync accounts and transactions
  → Display in Banking.vue
```

**Fonctionnalités**:
- ✅ Connexion multi-banques françaises
- ✅ Import automatique transactions
- ✅ Synchronisation périodique
- ✅ Catégorisation IA
- ✅ Gestion multi-comptes
- ✅ Mode sandbox pour tests

**Configuration**:
```env
VITE_BRIDGE_CLIENT_ID=your_client_id
VITE_BRIDGE_CLIENT_SECRET=your_secret
VITE_BRIDGE_ENVIRONMENT=sandbox
VITE_BRIDGE_REDIRECT_URI=https://your-app.com/app/banking
```

---

### 4. Goals vs Projects

**Différences clés**:

| Feature | Goals | Projects |
|---------|-------|----------|
| **Complexité** | Simple | Complexe |
| **Structure** | Montant unique | Multi-étapes |
| **Durée** | Court/moyen terme | Long terme |
| **Templates** | ❌ Non | ✅ Oui |
| **Milestones** | ❌ Non | ✅ Oui |
| **Exemple** | "Épargner 1000€" | "Acheter une maison" |

**Goals** - Objectifs simples:
- Montant cible
- Date limite (optionnel)
- Progression linéaire
- Contributions ponctuelles

**Projects** - Projets complexes:
- Multiple étapes/milestones
- Budget détaillé par étape
- Timeline avec deadlines
- Templates pré-définis (voyage, maison, voiture, mariage)
- Suivi détaillé par étape

**Tutorial intégré**:
- Modal interactive expliquant les différences
- Exemples concrets pour chaque type
- Auto-affichage à la première visite de Goals.vue

---

### 5. Insights & Projections

**Types d'Insights**:
- 💰 **Savings Capacity** - Capacité d'épargne mensuelle
- 📊 **Spending Pattern** - Habitudes de dépenses
- ⚠️ **Budget Alert** - Dépassement budget catégorie
- 💡 **Optimization Tip** - Recommandation optimisation
- 🎯 **Goal Reminder** - Rappel objectif en retard

**Projections IA**:
- Projection 3/6/12 mois
- Basée sur historique dépenses
- Ajustée avec objectifs
- Recommandations personnalisées

---

### 6. Analytics & Rapports

**Tableaux de bord**:
- Vue mensuelle/annuelle
- Graphiques dépenses par catégorie
- Évolution balance
- Top catégories dépenses
- Comparaison périodes

**Charts disponibles**:
- Line chart - Évolution dans le temps
- Bar chart - Comparaison catégories
- Pie chart - Répartition dépenses
- Stacked bar - Revenus vs Dépenses

---

## 📝 Modifications Récentes

### Commits Récents (HEAD~20)

```
a4b774f (HEAD → main) Fix:Insight
af9608e Fix:RecentTransactions
10d484d Fix:AuthRedirections
935a12c Fix:Goals8
1551ce6 Fix:Goals7
790a286 Fix:Goals6
d0957e2 Fix:Goals5
```

### Changements Majeurs (HEAD~5)

**Fichiers modifiés**:
- `src/stores/goalStore.ts` - **-469 lignes, +226 lignes**
  - Refactorisation majeure
  - Simplification logique contributions
  - Amélioration calcul progression

- `src/components/insights/InsightsPanel.vue` - **Refactorisation**
  - Amélioration layout
  - Meilleure gestion priorités

- `src/components/dashboard/RecentTransactions.vue` - **Fix affichage**
  - Correction appels API
  - Amélioration rendu

- Services API - **Corrections routes**
  - `goalApi.ts` - Fix endpoints `/financial-goals`
  - `transactionApi.ts` - Fix search method GET
  - `projectionApi.ts` - Amélioration projections

---

### Corrections Production (2025-02-22)

**Problème**: Token ne persiste pas en production, redirection login immédiate

**Corrections appliquées**:

1. **API Base URL** (`src/services/api.ts:8-15`)
   - ❌ Problème: Double `/api` dans URL finale
   - ✅ Solution: Retirer `/api` de `VITE_API_BASE_URL`

2. **Double Stockage Token** (`src/services/authService.ts:24-115`)
   - ❌ Problème: `authService` et `authStore` stockaient tous les deux
   - ✅ Solution: Suppression stockage dans `authService`
   - ✅ Source unique: `authStore` → `secureStorage.setTokenWithExpiry()`

3. **Router Guard Race Condition** (`src/router/index.ts:201-256`)
   - ❌ Problème: Router check auth avant `App.vue` init
   - ✅ Solution: Attente de `authStore.isInitialized` flag
   - ✅ Timeout 10s avec fallback `initAuth()`

4. **Case Sensitivity Linux** (`BankService.ts` imports)
   - ❌ Problème: `@/services/bankService` vs `BankService.ts`
   - ✅ Solution: Correction dans 9 fichiers
   - ✅ Impact: Déploiement Forge bloqué → résolu

5. **Documentation Debug** (`PROD_AUTH_DEBUG.md`)
   - ✅ Guide complet debugging production
   - ✅ Commandes console pour diagnostiquer
   - ✅ Checklist avant déploiement

---

## 🚀 Déploiement

### Environnements

**Development** (`npm run dev`):
- URL: http://localhost:5173
- HMR activé
- Source maps complètes
- Debug mode

**Preview** (`npm run preview`):
- URL: http://localhost:4173
- Build de production local
- Test avant déploiement

**Production** (Forge):
- URL: https://laravel-budget-api-saqbqlbw.on-forge.com
- Build optimisé
- Assets minifiés
- Service worker

---

### Checklist Déploiement

**Avant push**:
- [ ] `npm run build` passe sans erreurs
- [ ] Tests locaux OK
- [ ] Variables `.env.local` configurées
- [ ] Pas de console.error dans le code
- [ ] Types TypeScript corrects

**Configuration Forge**:
- [ ] Variables environnement Forge configurées
- [ ] `VITE_API_BASE_URL` sans `/api` à la fin
- [ ] CORS Laravel configuré avec `supports_credentials: true`
- [ ] Sanctum `stateful` domains inclut frontend URL
- [ ] Build script correct dans Forge

**Après déploiement**:
- [ ] Tester login/logout
- [ ] Vérifier persistence token (F5)
- [ ] Tester navigation protected routes
- [ ] Console browser sans erreurs CORS
- [ ] Network tab : 200 OK sur /auth/login

---

### Scripts Build

```json
{
  "scripts": {
    "dev": "vite",                      // Dev server
    "build": "vite build",              // Production build
    "preview": "vite preview",          // Preview build localement
    "type-check": "vue-tsc --build",    // Type checking
    "lint": "eslint . --fix",           // Lint & fix
    "format": "prettier --write src/",  // Format code
    "test:unit": "vitest",              // Unit tests
    "test:api": "node scripts/test-api-connection.js",  // Test API
    "diagnostic": "npm run test:all"    // Full diagnostic
  }
}
```

---

### Build Output

**Production build** (dernière version):
```
dist/
├── index.html                  1.65 KB (gzip: 0.67 KB)
├── assets/
│   ├── logo-upyyBB3Z.svg      6.25 KB
│   ├── style-CBtur-pa.css     211.05 KB (gzip: 29.61 KB)
│   ├── vue-vendor-DG-dFO2C.js 112.69 KB (gzip: 44.19 KB)
│   ├── index-BjPhpO4r.js      56.36 KB (gzip: 18.38 KB)
│   ├── AppLayout-FRyBjg9_.js  44.61 KB (gzip: 14.14 KB)
│   ├── api-vendor-SrSjw4ln.js 38.69 KB (gzip: 15.41 KB)
│   └── ... (autres chunks)
│
└── Total: ~800 KB (gzip: ~250 KB)
```

**Build time**: ~2.2s
**Chunks**: Code splitting automatique par route

---

## 🔧 Troubleshooting

### Problème 1: Token ne persiste pas en production

**Symptômes**:
- Login fonctionne
- Redirection immédiate vers `/login` après F5
- Console: "❌ Aucun token valide trouvé"

**Diagnostic**:
```javascript
// Console browser
const stored = localStorage.getItem('auth_token')
console.log('Token stored?', stored !== null)
if (stored) {
  const parsed = JSON.parse(stored)
  console.log('Token expires:', new Date(parsed.expiry))
  console.log('Now:', new Date())
  console.log('Expired?', Date.now() > parsed.expiry)
}
```

**Solutions**:
1. Vérifier CORS Laravel: `supports_credentials: true`
2. Vérifier `withCredentials: true` dans axios
3. Vérifier localStorage pas bloqué (private mode)
4. Consulter `PROD_AUTH_DEBUG.md`

---

### Problème 2: CORS Error

**Symptômes**:
- Console: "Access-Control-Allow-Origin"
- Network tab: Status `(failed)` rouge

**Solution Laravel** (`config/cors.php`):
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://your-frontend-url.com',  // PAS '*'
    ],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,  // ⚠️ CRITICAL
];
```

---

### Problème 3: Build échoue sur Forge

**Symptômes**:
- Build local OK
- Forge: "ENOENT: no such file or directory"

**Causes possibles**:
1. Case sensitivity (Linux vs macOS)
2. Variables env manquantes sur Forge
3. Dépendances manquantes

**Solutions**:
1. Vérifier tous les imports respectent la casse exacte
2. Ajouter toutes les `VITE_*` variables dans Forge
3. Vérifier `package-lock.json` committé

---

### Problème 4: Router boucle infinie

**Symptômes**:
- Navigation bloquée
- Console: "❌ BLOCAGE" en boucle

**Cause**: Race condition auth initialization

**Solution**: Déjà corrigée dans router guard (attente `isInitialized`)

---

### Problème 5: Chunks loading error

**Symptômes**:
- Console: "Loading chunk X failed"
- Page blanche après navigation

**Cause**: Cache browser obsolète après déploiement

**Solution automatique** (`router/index.ts:272`):
```typescript
router.onError((error) => {
  if (error.message.includes('Loading chunk')) {
    window.location.reload()  // Auto-reload
  }
})
```

---

## 📚 Ressources

### Documentation
- [README.md](./README.md) - Documentation principale
- [CHANGELOG.md](./CHANGELOG.md) - Historique versions
- [PROD_AUTH_DEBUG.md](./PROD_AUTH_DEBUG.md) - Debug auth production
- [PRE_COMMIT_CHECKLIST.md](./PRE_COMMIT_CHECKLIST.md) - Checklist avant commit

### API Externe
- [Bridge API Docs](https://docs.bridgeapi.io/) - Documentation Banking API
- [Bridge Dashboard](https://dashboard.bridgeapi.io/) - Gestion credentials

### Stack
- [Vue 3 Docs](https://vuejs.org/) - Framework
- [Pinia Docs](https://pinia.vuejs.org/) - State management
- [Vite Docs](https://vitejs.dev/) - Build tool
- [TailwindCSS Docs](https://tailwindcss.com/) - Styling

---

## 📊 Métriques Projet

**Statistiques code** (approximatif):
- **Total fichiers**: ~200 fichiers
- **Total lignes**: ~25,000 lignes
- **TypeScript**: 95% du code
- **Coverage tests**: À venir

**Performance**:
- **Build time**: 2.2s
- **Bundle size**: 800 KB (250 KB gzip)
- **Lighthouse score**: À mesurer
- **First paint**: < 1s (local)

---

## 🎯 Roadmap

**Features à venir**:
- [ ] Tests unitaires (Vitest)
- [ ] Tests E2E (Playwright)
- [ ] PWA complet (offline mode)
- [ ] Notifications push
- [ ] Multi-langue (i18n)
- [ ] Thème dark/light
- [ ] Export PDF rapports
- [ ] API rate limiting frontend
- [ ] Websockets pour live updates

**Refactoring**:
- [ ] Remplacer secureStorage simple par version chiffrée
- [ ] Migration vers Composition API pour anciens composants
- [ ] Optimisation bundle size (lazy loading)
- [ ] Cache strategy améliorée

---

## 👥 Contributeurs

**Développement initial**: Christopher Massamba
**Date création**: 2024
**Dernière mise à jour**: 2025-02-22

---

## 📄 License

Proprietary - Tous droits réservés

---

**Fin du document** • Version 1.0.0 • 2025-02-22
