// src/i18n/locales/fr.ts
// ✅ Fichier complet corrigé — Tutorial mergé + Landing + Insights

const fr = {
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
  // DASHBOARD
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
    monthlyIncome: 'Revenus mensuels',
    monthlyExpenses: 'Dépenses mensuelles',
    newGoal: 'Nouvel objectif',
    newBank: 'Banque',
    analyze: 'Analyse',
    welcome: 'Bienvenue !',
    welcomeMessage: 'Suivez vos finances au quotidien',
    nextSteps: 'Prochaines étapes',
    allGoalsReached: 'Tous vos objectifs sont atteints !',
    savingsRateSubtitle: '{rate} de votre revenu',
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
    income: 'Revenu',
    expense: 'Dépense',
    incomeDesc: 'Argent qui entre',
    expenseDesc: 'Argent qui sort',
    typeLabel: 'Type de transaction',
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
    noTransactions: 'Aucune transaction',
    noTransactionsDesc: 'Commencez par créer votre première transaction',
    noFilterResults: 'Aucun résultat pour ces filtres',
    createFirst: 'Créer ma première transaction',
    loadingTransactions: 'Chargement des transactions...',
    transactionCount: '{n} transaction | {n} transactions',
    deleteConfirmTitle: 'Confirmer la suppression',
    deleteConfirmText: 'Supprimer "{name}" ?',
    deleteIrreversible: 'Cette action est irréversible',
    deleting: 'Suppression...',
    created: 'Transaction créée !',
    updated: 'Transaction modifiée !',
    deleted: 'Transaction supprimée',
    errorSave: 'Erreur lors de la sauvegarde',
    errorDelete: 'Erreur lors de la suppression',
    autoCategorize: 'Catégoriser automatiquement',
    balance: 'Solde',
    chooseCat: 'Choisir une catégorie',
    filterAllCategories: 'Toutes les catégories',
    filterAllTypes: 'Tous les types',
    filterCategory: 'Catégorie',
    filterDateFrom: 'Date de début',
    filterDateTo: 'Date de fin',
    filterType: 'Type',
    filters: 'Filtres',
    incomeThisMonth: 'Revenus ce mois',
    expensesThisMonth: 'Dépenses ce mois',
    pendingTitle: 'Transactions en attente',
    recurring: 'Récurrent',
    uncategorized: 'Non catégorisé',
    negative: 'Négatif',
    neutral: 'Neutre',
    positive: 'Positif',
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
  // SIDEBAR — ✅ Clés manquantes ajoutées
  // ==========================================
  sidebar: {
    sectionFinances: 'Finances',
    sectionGaming: 'Gaming',
    sectionTools: 'Outils',
    quickActions: 'Actions Rapides',
    quickTransaction: 'Transaction rapide',
    dailyChallenge: 'Défi du jour',
    badgeNew: 'NEW',
    dailyProgress: 'Progrès du jour',
    achievements: 'Succès',
    streak: 'Série',
    rank: 'Rang',
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
  // TEMPS RELATIF — ✅ Clés manquantes ajoutées
  // ==========================================
  time: {
    justNow: "À l'instant",
    hoursAgo: 'Il y a {n}h',
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
  // CATÉGORIES
  // ==========================================
  categories: {
    title: 'Catégories',
    subtitle: 'Organisez vos dépenses',
    new: 'Nouvelle',
    activeCategories: 'Catégories actives',
    spentThisMonth: 'Dépenses ce mois',
    mostSpent: 'Plus dépensée',
    budgetUsed: 'Budget utilisé',
    none: 'Aucune',
    income: 'Revenu',
    expense: 'Dépense',
    templates: 'Templates',
    refresh: 'Actualiser',
    yourCategories: 'Vos catégories',
    category: 'catégorie',
    categories_plural: 'catégories',
    revenues: 'Revenus',
    expenses: 'Dépenses',
    budget: 'Budget',
    budgetPerMonth: 'Budget: {amount}/mois',
    spent: 'Dépensé',
    modify: 'Modifier',
    delete: 'Supprimer',
    newCategory: 'Nouvelle catégorie',
    editCategory: 'Modifier',
    confirmDelete: 'Confirmer la suppression',
    irreversible: 'Cette action est irréversible',
    deleteQuestion: 'Supprimer "{name}" ?',
    type: 'Type',
    noCategory: 'Aucune catégorie',
    startCreating: 'Commencez par créer votre première catégorie',
    createFirst: 'Créer ma première catégorie',
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
    myChallenges: 'Mes défis',
    available: 'Disponibles',
    leaderboards: 'Classements',
    activeChallenges: 'Défis actifs',
    completed: 'Complétés',
    bestRank: 'Meilleur rang',
    totalXP: 'XP gagnés',
    inProgress: 'Mes défis en cours',
    noChallenge: 'Vous ne participez à aucun défi pour le moment',
    discover: 'Découvrir les défis',
    yourRank: 'Votre rang',
    progression: 'Progression',
    toWin: 'à gagner',
    viewLeaderboard: 'Voir le classement',
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
    difficultyEasy: 'Facile',
    difficultyMedium: 'Moyen',
    difficultyHard: 'Difficile',
    endsOn: 'Se termine le {date}',
    remaining: '{n} jours restants',
    oneDay: '1 jour restant',
    finished: 'Terminé',
    noChallengeFound: 'Aucun défi disponible pour ces critères',
    globalLeaderboard: 'Classements globaux',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    allTime: 'Tous temps',
    player: 'Joueur',
    challengesCompleted: 'Défis',
    you: 'Vous',
    joined: 'Vous participez maintenant au défi "{name}" !',
    error: 'Erreur lors de la participation au défi',
    refreshed: 'Défis actualisés !',
    leaderboardComing: 'Classement du défi à venir...',
  },

  // ==========================================
  // GAMING CENTER
  // ==========================================
  gamingCenter: {
    title: 'Progression',
    subtitle: 'Suivez votre évolution et débloquez des récompenses',
    tier: 'Niveau',
    achievements: 'Succès',
    streak: 'Série',
    totalXP: 'Total',
    points: 'XP',
    days: 'jours',
    record: 'Record: {n} jours',
    completed: 'complétés',
    allAchievements: 'Tous les succès',
    unlocked: '{n}/{total} débloqués',
    activeChallenges: 'Défis actifs',
    inProgress: '{n} en cours',
    ranking: 'Classement',
    rankPosition: '#{rank} sur {total}',
    recentAchievements: 'Succès récents',
    leaderboard: 'Classement',
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
    activeGoals: 'Objectifs actifs',
    totalSaved: 'Montant épargné',
    averageProgress: 'Progression moyenne',
    goalsReached: 'Objectifs atteints',
    all: 'Tous',
    active: 'Actifs',
    completed: 'Atteints',
    paused: 'En pause',
    noDescription: 'Pas de description',
    on: 'sur',
    remaining: 'Reste: {amount}',
    perMonth: '/mois',
    add: 'Ajouter',
    modify: 'Modifier',
    statusActive: 'Actif',
    statusCompleted: 'Atteint',
    statusPaused: 'En pause',
    contribution: 'Contribution',
    pause: 'Pause',
    resume: 'Reprendre',
    delete: 'Supprimer',
    exceeded: 'Dépassé',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    daysRemaining: '{n} jours',
    monthsRemaining: '{n} mois',
    yearsRemaining: '{n} an(s)',
    newGoal: 'Nouvel objectif',
    editGoal: 'Modifier',
    chooseTemplate: 'Choisir un template',
    addContribution: 'Ajouter une contribution',
    goal: 'Objectif',
    amount: 'Montant (€)',
    cancel: 'Annuler',
    deleteTitle: 'Supprimer cet objectif ?',
    deleteText: 'Cette action est irréversible. L\'objectif "{name}" sera définitivement supprimé.',
    deleting: 'Suppression...',
    noGoals: 'Aucun objectif',
    noGoalsInCategory: 'dans cette catégorie',
    createFirstGoal: 'Créez votre premier objectif financier pour commencer à épargner !',
    createGoal: 'Créer un objectif',
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

  // ==========================================
  // INSIGHTS — ✅ Complet
  // ==========================================
  insights: {
    title: 'Insights Financiers',
    subtitle: 'Recommandations personnalisées',
    markAllRead: 'Tout marquer lu',
    analyzing: 'Analyse...',
    analyze: 'Analyser',
    savingsDetected: 'Économies potentielles détectées',
    basedOnInsights: 'Basé sur {count} insight(s) actif(s)',
    perYear: '/an',
    savingPerYear: "/an d'économie",
    monthsSaved: '{count} mois gagné(s)',
    actionDone: 'Action effectuée · +{xp} XP',
    dismiss: 'Ignorer',
    xpToast: 'Insight appliqué !',
    filters: {
      all: 'Tous',
      costs: 'Coûts',
      savings: 'Épargne',
      alerts: 'Alertes',
      goals: 'Objectifs',
      habits: 'Habitudes',
    },
    priority: {
      urgent: 'Urgent',
      important: 'Important',
      info: 'Info',
    },
    empty: {
      title: 'Aucun insight pour le moment',
      description:
        'Cliquez sur "Analyser" pour générer des recommandations basées sur vos transactions.',
      cta: "Lancer l'analyse",
    },
  },

  // ==========================================
  // LANDING PAGE — Home.vue + sous-composants
  // ==========================================
  landing: {
    // Navigation
    login: 'Connexion',
    register: 'Inscription',

    // Badge
    badge: '💰 Budget + 🎮 Motivation = 🚀 Résultats',

    // Hero
    heroTitle1: "L'app qui rend la",
    heroTitle2: "gestion d'argent",
    heroTitle3: 'fun et motivante',
    heroSubtitle: 'Tu économises pour un projet ?',
    heroDesc:
      "CoinQuest connecte ta banque, calcule automatiquement ta capacité d'épargne et te récompense à chaque étape.",
    heroDescBold: 'Simple. Automatique. Motivant.',

    // 3 Bénéfices
    bankTitle: 'Connexion bancaire sécurisée',
    bankDesc: 'Tes transactions importées automatiquement depuis 300+ banques européennes',
    goalsTitle: 'Objectifs intelligents',
    goalsDesc: "L'app calcule combien mettre de côté chaque mois pour tes projets",
    progressTitle: 'Progression motivante',
    progressDesc: 'Gagne des points et badges à chaque bonne décision financière',

    // CTA
    ctaPrimary: '🎮 Commencer gratuitement',
    ctaSecondary: '👀 Voir comment ça marche',

    // Social Proof
    storeRating: '4.8★ sur les stores',
    activeUsers: '1 247 utilisateurs actifs',
    totalSaved: '€2.4M épargnés collectivement',

    // Comment ça marche
    howTitle: 'Comment ça marche ?',
    howSubtitle: '3 étapes simples pour reprendre le contrôle de ton budget',
    step1Title: 'Connecte ta banque',
    step1Desc:
      "En 2 minutes, connexion sécurisée à ton compte. Tes transactions s'importent automatiquement.",
    step2Title: 'Définis tes objectifs',
    step2Desc: "Voyage, voiture, appart... L'app calcule combien économiser par mois.",
    step3Title: 'Progresse et gagne',
    step3Desc: 'Chaque bonne décision te rapporte des points. Suis ta progression en temps réel.',

    // Footer trust
    trustBridge: 'Connexion sécurisée Bridge',
    trustReadOnly: 'Lecture seule (aucun virement)',
    trustCompliance: 'Conforme RGPD & PSD2',
    copyright: '© {year} CoinQuest. Tous droits réservés.',
    trustDesc:
      'CoinQuest utilise Bridge, le même système que ta banque pour connecter ton compte en toute sécurité',

    // HeroSection (LandingPage)
    heroSavings: 'Économisez {amount} en moyenne par mois',
    heroTagline: 'Sans effort. Sans tableur Excel. 100% automatique.',
    calcTitle: "💰 Calculez votre potentiel d'économies",
    signupCta: 'Commencer gratuitement',
    signupSubtext: '✓ Sans carte bancaire • ✓ 30 jours gratuits',
    trustPsd2: 'Sécurisé PSD2',
    trustInstant: 'Import instantané',
    trustFrance: 'Données en France',

    // BenefitsSection
    benefitsTitle: 'Pourquoi CoinQuest fonctionne ?',
    benefitsSubtitle: 'Des résultats concrets, pas des promesses',

    // HowItWorksSection
    howCtaNote: 'Essai gratuit de 30 jours • Aucune carte requise',
    howCtaBtn: 'Commencer maintenant',

    // TestimonialsSection
    testimonialsTitle: 'Ils ont repris le contrôle',
    testimonialsSubtitle: 'Des résultats réels de vrais utilisateurs',
    saved: 'économisés',
    usage: "d'utilisation",

    // CTASection
    ctaTitle: 'Prêt à économiser {amount}/mois ?',
    ctaSubtitle: "Rejoignez les centaines d'utilisateurs qui ont repris le contrôle",
    ctaBtn: 'Commencer gratuitement',
    ctaFeatures: '✓ Sans carte bancaire ✓ 30 jours gratuits ✓ Annulation à tout moment',

    // SavingsCalculator
    calcIncome: 'Votre revenu mensuel net',
    calcExpenses: 'Vos dépenses mensuelles fixes',
    calcCapacity: "Capacité d'épargne",
    calcPerMonth: 'par mois',
    calcYearly: 'potentiel annuel',
    calcPercent: 'de votre revenu',
    calcExcellent: "Excellent ! Vous avez une très bonne capacité d'épargne.",
    calcGood: 'Bien ! Vous pouvez constituer une épargne solide.',
    calcHelp: 'CoinQuest vous aidera à optimiser vos dépenses.',
    calcError: 'Vos dépenses ne peuvent pas dépasser votre revenu',
  },

  benefits: {
    goalsTitle: 'Objectifs intelligents',
    goalsDesc: 'Créez des objectifs réalistes et suivez votre progression en temps réel.',
    goalsEx: 'Exemple : 15 000€ pour un voyage en 18 mois',
    autoTitle: 'Catégorisation automatique',
    autoDesc: "75% de vos transactions sont classées automatiquement grâce à l'IA.",
    autoEx: 'Gain de temps : 2h/mois économisées',
    insightsTitle: 'Analyse détaillée',
    insightsDesc: 'Visualisez où part votre argent avec des graphiques clairs.',
    insightsEx: "Identifiez 3-5 postes d'optimisation",
    projectionsTitle: 'Prévisions IA',
    projectionsDesc: 'Anticipez vos finances futures basées sur vos habitudes.',
    projectionsEx: 'Prédictions à 3, 6 et 12 mois',
    securityTitle: 'Sécurité bancaire',
    securityDesc: 'Connexion sécurisée PSD2 via Bridge. Vos données restent en France.',
    securityEx: 'Certifié ACPR et agrégateur officiel',
    mobileTitle: 'Application mobile',
    mobileDesc: 'Suivez vos finances partout, sur tous vos appareils.',
    mobileEx: 'iOS, Android et Web',
  },

  testimonials: {
    marieRole: 'Professeure',
    marieQuote:
      "J'ai économisé 400€ en 2 mois juste en visualisant mes dépenses. Je n'avais aucune idée que je dépensais autant en restaurants !",
    marieDuration: '2 mois',
    thomasRole: 'Développeur',
    thomasQuote:
      "L'import automatique des transactions me fait gagner un temps fou. Plus besoin de tout saisir à la main comme avec Excel.",
    thomasDuration: '6 mois',
    sophieRole: 'Entrepreneure',
    sophieQuote:
      "Grâce aux objectifs intelligents, j'ai pu mettre de côté 15 000€ pour l'apport de mon appartement en 18 mois. C'était mon rêve !",
    sophieDuration: '18 mois',
  },

  // ==========================================
  // HOME VIEW (accueil connecté)
  // ==========================================
  homeView: {
    welcomeTitle: 'Bienvenue sur',
    welcomeSubtitle:
      "Transforme ta gestion financière en aventure épique. Gagne de l'XP, débloque des achievements et atteins tes objectifs avec style !",
    pageTitle: 'CoinQuest - Bienvenue',
  },

  // ==========================================
  // TUTORIAL — ✅ Mergé directement
  // ==========================================
  tutorial: {
    welcome: {
      title: 'Bienvenue sur CoinQuest !',
      content:
        '<p>CoinQuest transforme ta gestion financière en <strong>aventure motivante</strong>. ' +
        'Connecte ta banque, définis tes objectifs et gagne des points à chaque bonne décision.</p>' +
        '<p>Ce tutoriel te guide en 5 étapes pour bien démarrer.</p>',
      tip1: "L'inscription est 100% gratuite, sans carte bancaire",
      tip2: 'Tu peux revoir ce tutoriel à tout moment depuis les paramètres',
    },
    bank: {
      title: 'Connecte ta banque',
      content:
        '<p>CoinQuest utilise <strong>Bridge</strong>, un agrégateur certifié PSD2, pour ' +
        'importer tes transactions automatiquement. Compatible avec 300+ banques européennes.</p>' +
        '<p>La connexion est <strong>en lecture seule</strong> : aucun virement possible.</p>',
      ex1Title: 'Connexion sécurisée',
      ex1Desc: 'Tes identifiants ne sont jamais stockés par CoinQuest',
      ex2Title: 'Import automatique',
      ex2Desc: 'Tes transactions sont synchronisées chaque jour',
      tip1: 'La première synchronisation peut prendre quelques minutes',
    },
    goals: {
      title: 'Définis tes objectifs',
      content:
        "<p>Crée des objectifs d'épargne et laisse CoinQuest calculer " +
        '<strong>combien mettre de côté chaque mois</strong> pour les atteindre.</p>' +
        "<p>L'app répartit intelligemment ta capacité d'épargne entre tes projets.</p>",
      examplesTitle: 'Exemples de projets',
      ex1Title: 'Voyage',
      ex1Desc: '3 000€ pour un road trip en Islande',
      ex1Detail1: 'Durée estimée : 10 mois',
      ex1Detail2: 'Épargne mensuelle : 300€',
      ex2Title: 'Apport immobilier',
      ex2Desc: '15 000€ en 18 mois pour acheter un appartement',
      ex3Title: 'Nouvelle voiture',
      ex3Desc: '8 000€ en 12 mois',
      tip1: 'Commence par un objectif réaliste pour prendre confiance',
      tip2: "L'app ajuste les montants automatiquement si tes revenus changent",
    },
    coach: {
      title: 'Ton coach financier',
      content:
        '<p>Le <strong>Coach Insights</strong> analyse automatiquement tes habitudes et te propose ' +
        'des recommandations personnalisées pour optimiser ton budget.</p>' +
        '<p>Chaque insight appliqué te rapporte <strong>+15 points</strong> !</p>',
      examplesTitle: 'Ce que le coach détecte',
      ex1Title: 'Abonnements oubliés',
      ex1Desc: 'Détection de dépenses récurrentes que tu pourrais réduire',
      ex1Detail1: 'Exemple : streaming en double à 13,99€/mois',
      ex1Detail2: 'Économie potentielle : 168€/an',
      ex2Title: 'Accélération des objectifs',
      ex2Desc: 'Des suggestions pour atteindre tes objectifs plus rapidement',
      ex3Title: 'Dépenses inhabituelles',
      ex3Desc: 'Alertes quand une catégorie dépasse la moyenne',
      tip1: 'Consulte tes insights régulièrement pour maximiser tes points',
      tip2: 'Tu peux ignorer un insight sans pénalité',
    },
    gaming: {
      title: 'Progresse et gagne',
      content:
        '<p>Chaque bonne décision financière te rapporte des <strong>points</strong>. ' +
        'Monte en palier, débloque des badges et maintiens tes séries !</p>' +
        '<p>Le gaming est là pour te <strong>motiver</strong>, pas pour te distraire.</p>',
      examplesTitle: 'Comment gagner des points',
      ex1Title: 'Badges',
      ex1Desc: 'Débloque des succès en atteignant des étapes clés',
      ex2Title: 'Séries',
      ex2Desc: 'Maintiens une série quotidienne pour des bonus croissants',
      ex3Title: 'Paliers',
      ex3Desc: 'Monte en palier pour débloquer de nouvelles fonctionnalités',
      tip1: 'Les points reflètent de vraies bonnes habitudes financières',
    },

    onboarding: {
      skipTitle: 'Passer le tutoriel',
      startBtn: '🚀 Commencer !',

      step1: {
        title: 'Bienvenue sur CoinQuest !',
        description:
          "CoinQuest est une app de budget <strong>qui te motive</strong> à économiser en transformant la gestion d'argent en aventure progressive.",
        howTitle: 'Comment ça marche ?',
        how1: '<strong>Tu connectes ta banque</strong> (sécurisé et automatique)',
        how2: '<strong>Tu définis tes objectifs</strong> (voyage, appart, voiture...)',
        how3: "<strong>L'app calcule ta capacité d'épargne</strong> automatiquement",
        how4: '<strong>Tu gagnes des points</strong> à chaque progrès 🎯',
        freeAlpha: 'Gratuit pendant la phase alpha',
      },

      step2: {
        title: 'Pourquoi des points ?',
        description:
          "Parce que <strong>voir sa progression</strong> rend plus motivant d'économiser !",
        optional: "(C'est 100% optionnel, tu peux les ignorer)",
        saving: 'Économie réalisée',
        savingDesc: 'Chaque progrès compte',
        goalReached: 'Objectif atteint',
        goalDesc: 'Célèbre tes victoires',
        streak: 'Série de 7 jours',
        streakDesc: 'La régularité paie',
        challenge: 'Défi complété',
        challengeDesc: 'Challenges hebdo',
        secretTitle: '💡 Le secret',
        secretDesc:
          "Plus tu accumules de points, plus tu débloques de badges et fonctionnalités. <strong>C'est optionnel</strong>, mais ça rend le budget moins ennuyeux !",
      },

      step3: {
        title: 'Tes données sont 100% sécurisées',
        description:
          'CoinQuest utilise <strong>Bridge</strong>, le même système que les banques européennes pour connecter tes comptes en toute sécurité.',
        certifiedTitle: 'Connexion bancaire européenne certifiée',
        certifiedDesc: 'Conforme PSD2, comme ton application bancaire officielle',
        readOnlyTitle: 'Accès lecture seule',
        readOnlyDesc: 'On ne peut pas faire de virements, juste consulter tes transactions',
        noStorageTitle: 'Tes identifiants JAMAIS stockés',
        noStorageDesc: 'Authentification directe avec ta banque, zéro stockage chez nous',
        disconnectTitle: 'Tu peux déconnecter à tout moment',
        disconnectDesc: 'Tu gardes le contrôle total de tes données, toujours',
        gdpr: '<strong>🛡️ Conforme RGPD :</strong> Tes données restent en Europe, chiffrées de bout en bout',
      },
    },
  },

  // ==========================================
  // ONBOARDING (accessible directement)
  // ==========================================
  onboarding: {
    skipTitle: 'Passer le tutoriel',
    startBtn: '🚀 Commencer !',

    step1: {
      title: 'Bienvenue sur CoinQuest !',
      description:
        "CoinQuest est une app de budget <strong>qui te motive</strong> à économiser en transformant la gestion d'argent en aventure progressive.",
      howTitle: 'Comment ça marche ?',
      how1: '<strong>Tu connectes ta banque</strong> (sécurisé et automatique)',
      how2: '<strong>Tu définis tes objectifs</strong> (voyage, appart, voiture...)',
      how3: "<strong>L'app calcule ta capacité d'épargne</strong> automatiquement",
      how4: '<strong>Tu gagnes des points</strong> à chaque progrès 🎯',
      freeAlpha: 'Gratuit pendant la phase alpha',
    },

    step2: {
      title: 'Pourquoi des points ?',
      description:
        "Parce que <strong>voir sa progression</strong> rend plus motivant d'économiser !",
      optional: "(C'est 100% optionnel, tu peux les ignorer)",
      saving: 'Économie réalisée',
      savingDesc: 'Chaque progrès compte',
      goalReached: 'Objectif atteint',
      goalDesc: 'Célèbre tes victoires',
      streak: 'Série de 7 jours',
      streakDesc: 'La régularité paie',
      challenge: 'Défi complété',
      challengeDesc: 'Challenges hebdo',
      secretTitle: '💡 Le secret',
      secretDesc:
        "Plus tu accumules de points, plus tu débloques de badges et fonctionnalités. <strong>C'est optionnel</strong>, mais ça rend le budget moins ennuyeux !",
    },

    step3: {
      title: 'Tes données sont 100% sécurisées',
      description:
        'CoinQuest utilise <strong>Bridge</strong>, le même système que les banques européennes pour connecter tes comptes en toute sécurité.',
      gdpr: '<strong>🛡️ Conforme RGPD :</strong> Tes données restent en Europe, chiffrées de bout en bout',
    },
  },

  goalsProjectsTutorial: {
    welcome: {
      title: 'Bienvenue dans la Gestion de vos Objectifs !',
      content: `
      <p>CoinQuest vous propose <strong>deux systèmes complémentaires</strong> pour gérer vos finances :</p>
      <ul>
        <li><strong>Goals (Objectifs)</strong> : Pour vos objectifs d'épargne simples</li>
        <li><strong>Projects (Projets)</strong> : Pour vos projets complexes avec plusieurs étapes</li>
      </ul>
      <p>Découvrons ensemble comment les utiliser efficacement !</p>
    `,
    },
    goals: {
      title: "Goals - Objectifs d'Épargne Simples",
      content: `
      <p>Les <strong>Goals</strong> sont parfaits pour des objectifs financiers directs :</p>
      <ul>
        <li>Un montant cible à atteindre</li>
        <li>Une date limite (optionnelle)</li>
        <li>Suivi automatique de votre progression</li>
        <li>Gain d'XP quand vous contribuez !</li>
      </ul>
      <p>Idéal pour : épargne mensuelle, vacances, nouveau téléphone, fonds d'urgence...</p>
    `,
      ex1Title: "Vacances d'été",
      ex1Desc: "Épargner 1 500€ d'ici juillet",
      ex1Detail1: 'Montant cible : 1 500€',
      ex1Detail2: 'Date limite : 31 juillet 2026',
      ex1Detail3: 'Contributions régulières : 250€/mois',
      ex2Title: 'Nouveau smartphone',
      ex2Desc: 'Mettre de côté 800€ pour un iPhone',
      ex2Detail1: 'Montant cible : 800€',
      ex2Detail2: 'Sans date limite',
      ex2Detail3: 'Versements libres selon vos moyens',
      ex3Title: "Fonds d'urgence",
      ex3Desc: 'Constituer une réserve de sécurité',
      ex3Detail1: 'Montant cible : 3 000€',
      ex3Detail2: 'Objectif long terme (12 mois)',
      ex3Detail3: 'Contributions automatiques : 250€/mois',
      tip1: 'Créez plusieurs goals simultanément pour différents objectifs',
      tip2: 'Ajoutez des contributions dès que vous économisez',
      tip3: "Gagnez de l'XP à chaque contribution !",
    },
    projects: {
      title: 'Projects - Projets Complexes Structurés',
      content: `
      <p>Les <strong>Projects</strong> sont conçus pour des projets d'envergure avec plusieurs phases :</p>
      <ul>
        <li>Templates pré-configurés (voyage, maison, voiture...)</li>
        <li>Plusieurs catégories de dépenses</li>
        <li>Milestones (jalons) pour suivre l'avancement</li>
        <li>États : en cours, en pause, terminé, annulé</li>
      </ul>
      <p>Idéal pour : grand voyage, achat immobilier, mariage, rénovations...</p>
    `,
      ex1Title: 'Voyage au Japon',
      ex1Desc: 'Projet complet avec plusieurs catégories',
      ex1Detail1: 'Budget total : 4 000€',
      ex1Detail2: "Catégories : Billets d'avion, Hébergement, Transport local, Activités",
      ex1Detail3: 'Milestones : Réserver vols, Réserver hôtels, Acheter JR Pass',
      ex1Detail4: 'Durée : 6 mois de préparation',
      ex2Title: 'Achat appartement',
      ex2Desc: 'Projet immobilier sur plusieurs années',
      ex2Detail1: 'Budget total : 50 000€ (apport)',
      ex2Detail2: 'Catégories : Épargne apport, Frais notaire, Frais agence, Travaux',
      ex2Detail3: 'Milestones : 10k€, 25k€, 40k€, 50k€',
      ex2Detail4: 'Durée : 24 mois',
      ex3Title: 'Achat voiture',
      ex3Desc: 'Financer un véhicule neuf',
      ex3Detail1: 'Budget total : 15 000€',
      ex3Detail2: 'Catégories : Apport initial, Assurance, Immatriculation',
      ex3Detail3: 'Milestones : Épargner apport, Obtenir financement',
      ex3Detail4: 'Durée : 8 mois',
      tip1: 'Utilisez les templates pour démarrer rapidement',
      tip2: 'Ajustez les catégories selon vos besoins spécifiques',
      tip3: 'Marquez les milestones comme complétés pour suivre votre progression',
    },
    when: {
      title: 'Quand utiliser quoi ?',
      content: `
      <h3>Utilisez un <strong>Goal</strong> si :</h3>
      <ul>
        <li>Vous avez un objectif d'épargne simple et direct</li>
        <li>Un seul montant cible suffit</li>
        <li>Vous voulez quelque chose de rapide à créer</li>
        <li>Pas besoin de diviser en sous-catégories</li>
      </ul>
      <h3>Utilisez un <strong>Project</strong> si :</h3>
      <ul>
        <li>Votre objectif nécessite plusieurs catégories de dépenses</li>
        <li>Vous voulez suivre des étapes/milestones</li>
        <li>C'est un projet à moyen ou long terme</li>
        <li>Vous avez besoin d'une vue d'ensemble détaillée</li>
      </ul>
      <p class="mt-4"><strong>💡 Astuce :</strong> Vous pouvez combiner les deux ! Par exemple, avoir un Project "Mariage"
      avec plusieurs catégories, et un Goal "Lune de miel" séparé pour les vacances.</p>
    `,
    },
    // NOUVEAU : Coach financier
    coach: {
      title: 'Votre Coach Financier',
      content: `
      <p>CoinQuest analyse automatiquement vos habitudes et vous donne
      des <strong>recommandations personnalisées</strong> pour optimiser votre budget.</p>
      <p>Le coach apprend de vos transactions et s'adapte à votre profil financier.</p>
    `,
      examplesTitle: 'Ce que le coach détecte',
      ex1Title: 'Abonnements oubliés',
      ex1Desc: 'Repère les dépenses récurrentes que vous pourriez réduire ou annuler',
      ex2Title: "Accélération d'objectifs",
      ex2Desc: 'Des suggestions pour atteindre vos objectifs plus rapidement',
      ex3Title: 'Alertes de dépenses',
      ex3Desc: 'Vous prévient quand une catégorie dépasse son budget habituel',
      ex4Title: "Opportunités d'épargne",
      ex4Desc: 'Identifie des montants que vous pourriez mettre de côté chaque mois',
      tip1: 'Consultez vos insights régulièrement pour gagner +15 XP par action !',
      tip2: "Plus vous utilisez l'app, plus le coach devient précis.",
    },
    gaming: {
      title: 'Gamification et Récompenses',
      content: `
      <p>Que vous utilisiez Goals ou Projects, <strong>vous gagnez toujours de l'XP</strong> :</p>
      <ul>
        <li>🎯 <strong>+50 XP</strong> : Créer un nouveau goal ou project</li>
        <li>💰 <strong>+20 XP</strong> : Ajouter une contribution</li>
        <li>✅ <strong>+100 XP</strong> : Compléter un milestone (project)</li>
        <li>🏆 <strong>+200 XP</strong> : Atteindre votre objectif final !</li>
      </ul>
      <p class="mt-4">Plus vous êtes régulier dans vos efforts, plus vous gagnez d'XP et débloquez des achievements !</p>
    `,
      tip1: 'Consultez régulièrement vos objectifs pour rester motivé',
      tip2: 'Célébrez chaque milestone atteint',
      tip3: 'Partagez vos succès avec la communauté pour gagner bonus XP',
    },
    ready: {
      title: 'Prêt à Commencer !',
      content: `
      <p>Vous avez maintenant toutes les clés pour gérer efficacement vos objectifs financiers :</p>
      <ul>
        <li>✅ Vous savez faire la différence entre Goals et Projects</li>
        <li>✅ Vous connaissez les cas d'usage de chacun</li>
        <li>✅ Votre coach financier analyse vos habitudes</li>
        <li>✅ Vous pouvez gagner de l'XP en épargnant</li>
      </ul>
      <h3>Par où commencer ?</h3>
      <p>1. <strong>Objectif simple ?</strong> Créez un Goal depuis l'onglet "Objectifs"</p>
      <p>2. <strong>Projet complexe ?</strong> Explorez les templates de Projects</p>
      <p>3. <strong>Besoin de conseils ?</strong> Consultez votre Coach financier</p>
      <p class="mt-4 text-center font-semibold text-purple-600">
        Bonne gestion et amusez-vous bien ! 🎉
      </p>
    `,
    },
  },

  // Tutoriel Goals uniquement
  goalsTutorial: {
    intro: {
      title: "Vos Objectifs d'Épargne",
      content: `
      <p>Les <strong>Goals</strong> vous permettent de définir et suivre vos objectifs d'épargne facilement.</p>
      <p>Créez un objectif en quelques secondes et suivez votre progression en temps réel !</p>
    `,
    },
    create: {
      title: 'Créer un Objectif',
      content: `
      <p>Pour créer un goal :</p>
      <ul>
        <li>Cliquez sur "Nouvel Objectif"</li>
        <li>Donnez-lui un nom clair (ex: "Vacances 2026")</li>
        <li>Définissez le montant cible</li>
        <li>Ajoutez une date limite (optionnel)</li>
        <li>Choisissez une catégorie (optionnel)</li>
      </ul>
    `,
      ex1Title: 'iPhone 16',
      ex1Desc: '1 200€ - Sans date limite',
      ex2Title: 'Vacances NYC',
      ex2Desc: '3 000€ - Avant décembre 2026',
    },
    contributions: {
      title: 'Ajouter des Contributions',
      content: `
      <p>Chaque fois que vous économisez, ajoutez une contribution :</p>
      <ul>
        <li>Cliquez sur un goal existant</li>
        <li>Appuyez sur "Ajouter une contribution"</li>
        <li>Entrez le montant</li>
        <li>Gagnez de l'XP automatiquement ! 🎮</li>
      </ul>
    `,
      tip1: 'Ajoutez même de petites contributions régulières',
      tip2: "Plus vous contribuez souvent, plus vous gagnez d'XP",
      tip3: 'Configurez des rappels pour ne pas oublier',
    },
    achieve: {
      title: 'Atteindre vos Objectifs',
      content: `
      <p>Quand vous atteignez 100% de votre goal :</p>
      <ul>
        <li>🎉 Débloquez un achievement spécial</li>
        <li>💪 Gagnez 200 XP bonus</li>
        <li>📊 Votre statistique de réussite augmente</li>
        <li>🔥 Maintenez votre streak actif</li>
      </ul>
      <p class="mt-4">Marquez ensuite votre goal comme terminé et commencez-en un nouveau !</p>
    `,
    },
  },

  // Tutoriel Projects uniquement
  projectsTutorial: {
    intro: {
      title: 'Vos Projets Structurés',
      content: `
      <p>Les <strong>Projects</strong> vous aident à gérer des projets complexes avec plusieurs phases et catégories.</p>
      <p>Parfait pour les grands objectifs nécessitant une planification détaillée !</p>
    `,
    },
    templates: {
      title: 'Templates de Projets',
      content: '<p>Démarrez rapidement avec nos templates pré-configurés :</p>',
      ex1Title: 'Voyage',
      ex1Desc: 'Transport, hébergement, activités, restauration',
      ex1Detail1: 'Budget suggéré : 2 000€ - 5 000€',
      ex1Detail2: '4 catégories pré-définies',
      ex2Title: 'Immobilier',
      ex2Desc: 'Apport, notaire, agence, travaux',
      ex2Detail1: 'Budget suggéré : 30 000€ - 100 000€',
      ex2Detail2: '5 catégories pré-définies',
      ex3Title: 'Véhicule',
      ex3Desc: 'Achat, assurance, immatriculation',
      ex3Detail1: 'Budget suggéré : 10 000€ - 30 000€',
      ex3Detail2: '3 catégories pré-définies',
      ex4Title: 'Mariage',
      ex4Desc: 'Lieu, traiteur, décoration, tenues, voyage de noces',
      ex4Detail1: 'Budget suggéré : 15 000€ - 40 000€',
      ex4Detail2: '8 catégories pré-définies',
      tip1: 'Les templates incluent des budgets recommandés',
      tip2: 'Vous pouvez personnaliser toutes les catégories',
      tip3: 'Ajoutez ou supprimez des catégories selon vos besoins',
    },
    milestones: {
      title: 'Milestones (Jalons)',
      content: `
      <p>Les milestones vous aident à découper votre projet en étapes :</p>
      <ul>
        <li>Définissez des objectifs intermédiaires</li>
        <li>Suivez votre progression étape par étape</li>
        <li>Célébrez chaque jalon atteint (+100 XP)</li>
        <li>Restez motivé tout au long du projet</li>
      </ul>
    `,
      exTitle: 'Projet Voyage Japon - Milestones',
      exDesc: 'Exemple de jalons pour un voyage',
      exDetail1: '✅ Milestone 1 : Économiser 1 000€ (25%)',
      exDetail2: '⏳ Milestone 2 : Réserver les vols (50%)',
      exDetail3: '⏳ Milestone 3 : Réserver les hôtels (75%)',
      exDetail4: '⏳ Milestone 4 : Budget activités complet (100%)',
    },
    states: {
      title: 'Gestion des États',
      content: `
      <p>Gérez facilement l'état de vos projets :</p>
      <ul>
        <li>🟢 <strong>Actif</strong> : Projet en cours</li>
        <li>⏸️ <strong>En pause</strong> : Temporairement suspendu</li>
        <li>✅ <strong>Terminé</strong> : Objectif atteint !</li>
        <li>❌ <strong>Annulé</strong> : Projet abandonné</li>
      </ul>
      <p class="mt-4">Changez d'état à tout moment selon l'évolution de vos priorités.</p>
    `,
      tip1: 'Mettez en pause les projets non prioritaires',
      tip2: "Consultez l'historique de vos projets terminés",
      tip3: 'Analysez pourquoi certains projets ont été annulés',
    },
    tracking: {
      title: 'Suivi et Analyse',
      content: `
      <p>Visualisez votre progression en détail :</p>
      <ul>
        <li>📈 Graphiques de progression par catégorie</li>
        <li>💰 Répartition du budget dépensé</li>
        <li>⏱️ Temps restant jusqu'à la date cible</li>
        <li>🎯 Pourcentage d'avancement global</li>
      </ul>
      <p class="mt-4">Prenez des décisions éclairées grâce aux statistiques détaillées.</p>
    `,
    },
  },
  // ==========================================
  // PROFILE
  // ==========================================
  profile: {
    title: 'Profil',
    subtitle: 'Gérez votre profil et consultez vos statistiques',
    edit: 'Modifier',
    save: 'Sauvegarder',
    tabs: {
      profile: 'Profil',
      gaming: 'Gaming',
      history: 'Historique',
      security: 'Sécurité',
    },
    info: {
      title: 'Informations personnelles',
      name: 'Nom',
      email: 'Email',
      memberSince: 'Membre depuis',
      lastLogin: 'Dernière connexion',
      changeAvatar: "Changer l'avatar",
      xpToNext: '{xp} XP pour le niveau {level}',
    },
    preferences: {
      title: 'Préférences',
      currency: 'Monnaie',
      language: 'Langue',
      gamingOptions: 'Options Gaming',
      achievementNotifs: 'Notifications de succès',
      leaderboardVisible: 'Visible dans les classements',
      challengeInvites: 'Invitations aux défis',
    },
    gamingStats: {
      currentLevel: 'Niveau actuel',
      totalXP: 'XP Total',
      achievementsUnlocked: 'Succès débloqués',
      currentStreak: 'Série actuelle',
      detailedProgress: 'Progression détaillée',
      xpPerMonth: 'XP gagnés par mois',
      xpSources: 'Répartition des sources XP',
      recentActivity: 'Activité récente',
      ranking: 'Votre classement',
      globalRank: 'Classement global',
      monthlyRank: 'Ce mois-ci',
      weeklyRank: 'Cette semaine',
    },
    history: {
      title: 'Historique des activités',
      filters: 'Filtres',
      activityType: "Type d'activité",
      all: 'Toutes',
      xpGains: 'Gains XP',
      achievements: 'Succès',
      challenges: 'Défis',
      levels: 'Niveaux',
      dateFrom: 'Date début',
      dateTo: 'Date fin',
      loadMore: "Charger plus d'historique",
    },
    security: {
      title: 'Sécurité',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le nouveau mot de passe',
      changeBtn: 'Changer le mot de passe',
      activeSessions: 'Sessions actives',
      revoke: 'Révoquer',
      currentSession: 'Session actuelle',
      passwordChanged: 'Mot de passe mis à jour avec succès',
      passwordError: 'Erreur lors du changement de mot de passe',
      sessionRevoked: 'Session révoquée',
      sessionRevokeError: 'Erreur lors de la révocation de la session',
    },
  },

  // ==========================================
  // ACHIEVEMENTS
  // ==========================================
  achievements: {
    title: 'Succès',
    subtitle: "Débloquez des achievements et gagnez de l'XP",
    checkBtn: 'Vérifier les succès',
    checking: 'Vérification...',
    stats: {
      unlocked: 'Débloqués',
      completed: 'Complétés',
      legendary: 'Légendaires',
      totalXP: 'XP Total',
    },
    filters: {
      title: 'Filtres',
      all: 'Tous',
      unlocked: 'Débloqués',
      locked: 'En cours',
      common: 'Commun',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire',
    },
    recentUnlocks: 'Derniers débloqués',
    loading: 'Chargement des succès...',
    progression: 'Progression',
    xpReward: '+{xp} XP',
    unlockedLabel: 'Débloqué',
    noResults: 'Aucun succès trouvé',
    noResultsHint: "Essayez de changer les filtres ou commencez à utiliser l'application !",
    emptyState: {
      title: 'Vos premiers succès vous attendent !',
      description: "Commencez à utiliser l'application pour débloquer vos premiers achievements",
      cta: 'Créer une transaction',
    },
    checkSuccess: '{count} nouveau(x) succès débloqué(s) !',
    checkNone: 'Aucun nouveau succès pour le moment',
    checkError: 'Erreur lors de la vérification',
    loadError: 'Impossible de charger les succès',
    rarity: {
      common: 'Commun',
      rare: 'Rare',
      epic: 'Épique',
      legendary: 'Légendaire',
    },
  },

  // ==========================================
  // TOASTS / MESSAGES FEEDBACK
  // ==========================================
  toasts: {
    transactionCreated: 'Transaction créée avec succès !',
    transactionUpdated: 'Transaction mise à jour',
    transactionDeleted: 'Transaction supprimée',
    goalCreated: 'Objectif créé avec succès !',
    goalUpdated: 'Objectif mis à jour',
    goalCompleted: 'Félicitations ! Objectif atteint !',
    categoryCreated: 'Catégorie créée',
    achievementUnlocked: 'Nouveau succès débloqué !',
    levelUp: 'Niveau suivant atteint !',
    challengeCompleted: 'Défi relevé avec succès !',
    streakMilestone: 'Nouveau record de régularité !',
    bankConnected: 'Compte bancaire connecté',
    syncCompleted: 'Synchronisation terminée',
    settingsSaved: 'Paramètres sauvegardés',
    passwordChanged: 'Mot de passe modifié',
    profileUpdated: 'Profil mis à jour',
    error: {
      generic: 'Une erreur est survenue',
      network: 'Erreur de connexion',
      unauthorized: 'Non autorisé',
      notFound: 'Non trouvé',
    },
  },

  // ==========================================
  // CURRENCIES (pour les selects)
  // ==========================================
  currencies: {
    EUR: 'Euro (€)',
    USD: 'Dollar ($)',
    GBP: 'Livre (£)',
    CHF: 'Franc suisse (CHF)',
    CAD: 'Dollar canadien (C$)',
  },

  // ==========================================
  // LANGUAGES (pour les selects)
  // ==========================================
  languages: {
    fr: 'Français',
    en: 'English',
    es: 'Español',
  },
}

export default fr
