// src/i18n/locales/fr.ts
export default {
  // ==========================================
  // NAVIGATION & LAYOUT
  // ==========================================
  nav: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budget: 'Budget',
    goals: 'Objectifs',
    gamingCenter: 'Gaming Center',
    achievements: 'Succès',
    challenges: 'Défis',
    analytics: 'Analytics',
    connections: 'Connexions',
    profile: 'Profil',
    settings: 'Paramètres',
  },

  // ==========================================
  // COMMUN / GLOBAL
  // ==========================================
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    close: 'Fermer',
    confirm: 'Confirmer',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    search: 'Rechercher',
    loading: 'Chargement...',
    noResults: 'Aucun résultat',
    all: 'Tous',
    yes: 'Oui',
    no: 'Non',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    duplicate: 'Dupliquer',
    export: 'Export',
    import: 'Import',
    refresh: 'Actualiser',
    add: 'Ajouter',
    remove: 'Retirer',
    optional: 'optionnel',
    required: 'obligatoire',
    perPage: '{n} par page',
    showing: 'Affichage de {from} à {to} sur {total}',
    currency: '€',
    player: 'Joueur',
    toggleSidebar: 'Ouvrir/Fermer le menu',
    settings: 'Paramètres',
  },

  // ==========================================
  // AUTHENTIFICATION
  // ==========================================
  auth: {
    login: 'Connexion',
    logout: 'Déconnexion',
    register: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    rememberMe: 'Se souvenir de moi',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
  },

  // ==========================================
  // DASHBOARD ✅ SECTION COMPLÈTE
  // ==========================================
  dashboard: {
    greeting: 'Bonjour {name}',
    greetingDefault: 'Bonjour',
    defaultUser: 'Utilisateur',
    defaultSubtitle: 'Voici votre situation financière',
    loading: 'Chargement de vos données...',
    financialOverview: "Vue d'ensemble financière",
    savingsCapacity: "Capacité d'épargne",
    savingsRate: "Taux d'épargne",
    activeGoals: 'Objectifs en cours',
    spendingByCategory: 'Dépenses par catégorie',
    aiProjections: 'Projections IA',
    recentActivity: 'Activité récente',

    // Cards
    monthlyIncome: 'Revenus mensuels',
    monthlyExpenses: 'Dépenses mensuelles',

    // Actions
    newGoal: 'Nouvel objectif',
    newBank: 'Banque',
    analyze: 'Analyse',

    // Messages
    welcome: 'Bienvenue !',
    welcomeMessage: 'Suivez vos finances au quotidien',
    nextSteps: 'Prochaines étapes',
    allGoalsReached: 'Tous vos objectifs sont atteints !',
  },

  // ==========================================
  // TRANSACTIONS
  // ==========================================
  transactions: {
    title: 'Transactions',
    subtitle: 'Gérez vos revenus et dépenses',
    new: 'Nouvelle',
    newTransaction: 'Nouvelle transaction',
    editTransaction: 'Modifier la transaction',
    sync: 'Synchroniser',
    syncing: 'Synchronisation...',
    recentTitle: 'Transactions récentes',

    // Types
    income: 'Revenu',
    expense: 'Dépense',
    incomeDesc: 'Argent qui entre',
    expenseDesc: 'Argent qui sort',
    typeLabel: 'Type de transaction',

    // Champs
    description: 'Description',
    descriptionPlaceholder: 'ex: Courses Carrefour, Salaire janvier...',
    amount: 'Montant',
    amountPlaceholder: '0.00',
    category: 'Catégorie',
    categoryPlaceholder: 'Sélectionner une catégorie',
    createCategory: 'Créer une nouvelle catégorie',
    date: 'Date',
    time: 'Heure',
    location: 'Lieu',
    locationPlaceholder: 'ex: Carrefour Villeneuve...',
    notes: 'Notes',
    notesPlaceholder: 'Informations complémentaires...',
    notesOptional: 'Notes (optionnelles)',
    tags: 'Tags',
    addTag: 'Ajouter un tag',
    suggestedTags: 'Tags suggérés',

    // États
    noTransactions: 'Aucune transaction',
    noTransactionsDesc: 'Commencez par créer votre première transaction',
    noFilterResults: 'Aucun résultat pour ces filtres',
    createFirst: 'Créer ma première transaction',
    loadingTransactions: 'Chargement des transactions...',
    transactionCount: '{n} transaction | {n} transactions',

    // Actions
    deleteConfirmTitle: 'Confirmer la suppression',
    deleteConfirmText: 'Supprimer "{name}" ?',
    deleteIrreversible: 'Cette action est irréversible',
    deleting: 'Suppression...',

    // Succès / Erreurs
    created: 'Transaction créée !',
    updated: 'Transaction modifiée !',
    deleted: 'Transaction supprimée',
    errorSave: 'Erreur lors de la sauvegarde',
    errorDelete: 'Erreur lors de la suppression',
  },

  // ==========================================
  // CATÉGORIES
  // ==========================================
  categories: {
    title: 'Catégories',
    food: 'Alimentation',
    transport: 'Transport',
    entertainment: 'Loisirs',
    housing: 'Logement',
    health: 'Santé',
    education: 'Éducation',
    shopping: 'Shopping',
    salary: 'Salaire',
    savings: 'Épargne',
    other: 'Autres',
    restaurants: 'Restaurants',
    refunds: 'Remboursements',
    otherExpenses: 'Autres dépenses',
  },

  // ==========================================
  // GAMING
  // ==========================================
  gaming: {
    level: 'Niveau',
    xp: 'XP',
    points: 'Points',
    achievements: 'Succès',
    streak: 'Série',
    rank: 'Rang',
    dailyProgress: 'Progrès du jour',
    xpEarned: 'XP gagné sur la période',
    achievementsUnlocked: 'Succès débloqués',
    currentStreak: 'Série actuelle',
    transactionsAdded: '{n} transaction(s) ajoutée(s)',
    days: 'jours',
    dailyTransactions: 'Transactions quotidiennes',
    gamingImpact: 'Impact Gaming',
  },

  // ==========================================
  // OBJECTIFS FINANCIERS
  // ==========================================
  goals: {
    title: 'Objectifs financiers',
    newGoal: 'Nouvel objectif',
    targetAmount: 'Montant cible',
    currentAmount: 'Montant actuel',
    deadline: 'Échéance',
    progress: 'Progression',
    completed: 'Atteint !',
    remaining: 'Restant',
    viewAll: 'Voir tout',
    activeGoals: 'Objectifs actifs',
  },

  // ==========================================
  // BUDGET
  // ==========================================
  budget: {
    title: 'Budget',
    monthlyBudget: 'Budget mensuel',
    spent: 'Dépensé',
    remaining: 'Restant',
    budgetUsed: '{n}% du budget utilisé',
    overBudget: 'Budget dépassé',
    budgetImpact: 'Impact sur le budget',
    spentThisMonth: 'Dépensé ce mois',
  },

  // ==========================================
  // SIDEBAR
  // ==========================================
  sidebar: {
    sectionFinances: 'Finances',
    sectionGaming: 'Gaming',
    sectionTools: 'Outils',
    quickActions: 'Actions Rapides',
    quickTransaction: 'Transaction rapide',
    dailyChallenge: 'Défi du jour',
    badgeNew: 'NEW',
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  notifications: {
    title: 'Notifications',
    viewAll: 'Voir toutes les notifications',
    achievementUnlocked: 'Nouveau succès débloqué !',
    goalReached: 'Objectif épargne atteint',
    streakDays: 'Série de {n} jours !',
    minutesAgo: 'Il y a {n} min',
    hoursAgo: 'Il y a {n}h',
    daysAgo: 'Il y a {n}j',
  },

  // ==========================================
  // FOOTER
  // ==========================================
  footer: {
    rights: 'Tous droits réservés',
    help: 'Aide',
    privacy: 'Confidentialité',
    version: 'Version',
    env: 'Env',
    clearCache: 'Vider le cache',
  },

  // ==========================================
  // STATISTIQUES
  // ==========================================
  stats: {
    title: 'Statistiques financières',
    subtitle: 'Analyse de vos transactions et progression gaming',
    period: 'Période',
    last7Days: '7 derniers jours',
    thisMonth: 'Ce mois',
    thisQuarter: 'Ce trimestre',
    thisYear: 'Cette année',
    allTime: 'Toutes',
    totalIncome: 'Revenus totaux',
    totalExpenses: 'Dépenses totales',
    netBalance: 'Bilan',
    avgTransaction: 'Moyenne/transaction',
    surplus: 'Excédent',
    deficit: 'Déficit',
    monthlyEvolution: 'Évolution mensuelle',
    categoryBreakdown: 'Répartition par catégories',
    total: 'Total',
    recentTransactions: 'Transactions récentes',
  },

  // ==========================================
  // CONNEXIONS BANCAIRES
  // ==========================================
  banking: {
    title: 'Connexions bancaires',
    connect: 'Connecter une banque',
    connected: 'Connectée',
    disconnected: 'Déconnectée',
    lastSync: 'Dernière synchro',
    syncNow: 'Synchroniser maintenant',
  },

  // ==========================================
  // ERREURS GLOBALES
  // ==========================================
  errors: {
    generic: 'Une erreur est survenue',
    network: 'Erreur de connexion',
    unauthorized: 'Non autorisé',
    notFound: 'Non trouvé',
    loadingError: 'Erreur de chargement',
    loadingErrorDesc: 'Une erreur est survenue lors du chargement de CoinQuest.',
    tryAgain: 'Réessayer',
    reload: 'Recharger la page',
    persistContact: 'Si le problème persiste, contacte le support',
  },

  // ==========================================
  // VALIDATION
  // ==========================================
  validation: {
    required: 'Ce champ est obligatoire',
    typeRequired: 'Le type de transaction est obligatoire',
    invalidType: 'Type invalide',
    amountPositive: 'Le montant doit être positif',
    amountMax: 'Montant trop élevé (max 999 999€)',
    descriptionRequired: 'La description est obligatoire',
    descriptionMin: 'Minimum {n} caractères',
    descriptionMax: 'Maximum {n} caractères',
    categoryRequired: 'La catégorie est obligatoire',
    dateRequired: 'La date est obligatoire',
    dateFuture: 'La date ne peut pas être dans le futur',
  },

  // ==========================================
  // TEMPS RELATIF
  // ==========================================
  time: {
    today: "Aujourd'hui",
    yesterday: 'Hier',
    daysAgo: 'Il y a {n} jours',
    weeksAgo: 'Il y a {n} semaines',
    monthsAgo: 'Il y a {n} mois',
  },

  // ==========================================
  // DEBUG (dev only)
  // ==========================================
  debug: {
    info: 'Debug Info',
    route: 'Route',
    apiStatusVisible: 'API Status visible',
    paddingTop: 'Padding-top',
    userLevel: 'User level',
    sidebarOpen: 'Sidebar open',
    isMobile: 'Is mobile',
  },
}
