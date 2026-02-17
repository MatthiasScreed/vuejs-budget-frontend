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

  // ==========================================
  // CATÉGORIES (page complète)
  // ==========================================
  categories: {
    title: 'Catégories',
    subtitle: 'Organisez vos dépenses',
    new: 'Nouvelle',

    // Stats
    activeCategories: 'Catégories actives',
    spentThisMonth: 'Dépenses ce mois',
    mostSpent: 'Plus dépensée',
    budgetUsed: 'Budget utilisé',
    none: 'Aucune',

    // Actions
    income: 'Revenu',
    expense: 'Dépense',
    templates: 'Templates',
    refresh: 'Actualiser',

    // Liste
    yourCategories: 'Vos catégories',
    category: 'catégorie',
    categories_plural: 'catégories',

    // Types
    revenues: 'Revenus',
    expenses: 'Dépenses',
    budget: 'Budget',
    budgetPerMonth: 'Budget: {amount}/mois',

    // Progress
    spent: 'Dépensé',

    // Actions
    modify: 'Modifier',
    delete: 'Supprimer',

    // Modal
    newCategory: 'Nouvelle catégorie',
    editCategory: 'Modifier',
    confirmDelete: 'Confirmer la suppression',
    irreversible: 'Cette action est irréversible',
    deleteQuestion: 'Supprimer "{name}" ?',
    type: 'Type',

    // Empty state
    noCategory: 'Aucune catégorie',
    startCreating: 'Commencez par créer votre première catégorie',
    createFirst: 'Créer ma première catégorie',

    // Templates
    templatesTitle: 'Templates de catégories',
    viewMore: 'Voir {n} templates de plus',
    viewLess: 'Voir moins',
  },

  // ==========================================
  // DÉFIS (Challenges)
  // ==========================================
  challenges: {
    title: 'Défis',
    subtitle: 'Participez aux défis et grimpez dans les classements',
    refresh: 'Actualiser',
    refreshing: 'Chargement...',

    // Tabs
    myChallenges: 'Mes défis',
    available: 'Disponibles',
    leaderboards: 'Classements',

    // Stats
    activeChallenges: 'Défis actifs',
    completed: 'Complétés',
    bestRank: 'Meilleur rang',
    totalXP: 'XP gagnés',

    // My challenges
    inProgress: 'Mes défis en cours',
    noChallenge: 'Vous ne participez à aucun défi pour le moment',
    discover: 'Découvrir les défis',
    yourRank: 'Votre rang',
    progression: 'Progression',
    toWin: 'à gagner',
    viewLeaderboard: 'Voir le classement',

    // Available
    filters: 'Filtres',
    all: 'Toutes',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    availableChallenges: 'Défis disponibles',
    participants: 'participants',
    rewards: 'Récompenses',
    participate: 'Participer',
    participating: 'Participation...',

    // Difficulty
    difficultyEasy: 'Facile',
    difficultyMedium: 'Moyen',
    difficultyHard: 'Difficile',

    // Time
    endsOn: 'Se termine le {date}',
    remaining: '{n} jours restants',
    oneDay: '1 jour restant',
    finished: 'Terminé',

    // Empty
    noChallengeFound: 'Aucun défi disponible pour ces critères',

    // Leaderboard
    globalLeaderboard: 'Classements globaux',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    allTime: 'Tous temps',
    player: 'Joueur',
    challengesCompleted: 'Défis',
    you: 'Vous',

    // Toast
    joined: 'Vous participez maintenant au défi "{name}" !',
    error: 'Erreur lors de la participation au défi',
    refreshed: 'Défis actualisés !',
  },

  // ==========================================
  // GAMING CENTER
  // ==========================================
  gamingCenter: {
    title: 'Progression',
    subtitle: 'Suivez votre évolution et débloquez des récompenses',

    // Stats
    tier: 'Niveau',
    achievements: 'Succès',
    streak: 'Série',
    totalXP: 'Total',
    points: 'XP',
    days: 'jours',
    record: 'Record: {n} jours',
    completed: 'complétés',

    // Quick links
    allAchievements: 'Tous les succès',
    unlocked: '{n}/{total} débloqués',
    activeChallenges: 'Défis actifs',
    inProgress: '{n} en cours',
    ranking: 'Classement',
    rankPosition: '#{rank} sur {total}',

    // Recent achievements
    recentAchievements: 'Succès récents',

    // Leaderboard
    leaderboard: 'Classement',

    // Loading
    loading: 'Chargement...',
  },

  // ==========================================
  // OBJECTIFS (Goals)
  // ==========================================
  goals: {
    title: 'Mes Objectifs',
    subtitle: "Gérez vos objectifs d'épargne et suivez votre progression",
    new: 'Nouvel objectif',
    refresh: 'Actualiser',
    refreshing: 'Chargement...',
    templates: 'Templates',

    // Stats
    activeGoals: 'Objectifs actifs',
    totalSaved: 'Montant épargné',
    averageProgress: 'Progression moyenne',
    goalsReached: 'Objectifs atteints',

    // Filters
    all: 'Tous',
    active: 'Actifs',
    completed: 'Atteints',
    paused: 'En pause',

    // Goal card
    noDescription: 'Pas de description',
    on: 'sur',
    remaining: 'Reste: {amount}',
    perMonth: '/mois',
    add: 'Ajouter',
    modify: 'Modifier',

    // Status
    statusActive: 'Actif',
    statusCompleted: 'Atteint',
    statusPaused: 'En pause',

    // Menu
    contribution: 'Contribution',
    pause: 'Pause',
    resume: 'Reprendre',
    delete: 'Supprimer',

    // Time
    exceeded: 'Dépassé',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    daysRemaining: '{n} jours',
    monthsRemaining: '{n} mois',
    yearsRemaining: '{n} an(s)',

    // Modal
    newGoal: 'Nouvel objectif',
    editGoal: 'Modifier',
    chooseTemplate: 'Choisir un template',
    addContribution: 'Ajouter une contribution',
    goal: 'Objectif',
    amount: 'Montant (€)',
    cancel: 'Annuler',

    // Delete
    deleteTitle: 'Supprimer cet objectif ?',
    deleteText: 'Cette action est irréversible. L\'objectif "{name}" sera définitivement supprimé.',
    deleting: 'Suppression...',

    // Empty
    noGoals: 'Aucun objectif',
    noGoalsInCategory: 'dans cette catégorie',
    createFirstGoal: 'Créez votre premier objectif financier pour commencer à épargner !',
    createGoal: 'Créer un objectif',

    // Templates
    travel: 'Voyage',
    travelDesc: 'Économisez pour votre prochaine aventure',
    emergency: "Fonds d'urgence",
    emergencyDesc: '3-6 mois de dépenses',
    house: 'Immobilier',
    houseDesc: 'Apport pour un achat immobilier',
    car: 'Voiture',
    carDesc: 'Achat ou remplacement de véhicule',
    education: 'Formation',
    educationDesc: 'Investir dans vos compétences',
    wedding: 'Mariage',
    weddingDesc: 'Préparer le grand jour',
    retirement: 'Retraite',
    retirementDesc: 'Préparer votre avenir',
    tech: 'High-Tech',
    techDesc: 'Équipement informatique',
  },
}
