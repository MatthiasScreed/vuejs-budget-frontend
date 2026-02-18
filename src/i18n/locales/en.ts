// src/i18n/locales/en.ts
// ✅ Fichier complet corrigé — Tutorial mergé + Landing + Toutes sections

const en = {
  // ==========================================
  // NAVIGATION & LAYOUT
  // ==========================================
  nav: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budget: 'Budget',
    goals: 'Goals',
    gamingCenter: 'Gaming Center',
    achievements: 'Achievements',
    challenges: 'Challenges',
    analytics: 'Analytics',
    connections: 'Connections',
    profile: 'Profile',
    settings: 'Settings',
  },

  // ==========================================
  // COMMON / GLOBAL
  // ==========================================
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    close: 'Close',
    confirm: 'Confirm',
    apply: 'Apply',
    reset: 'Reset',
    search: 'Search',
    loading: 'Loading...',
    noResults: 'No results',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    duplicate: 'Duplicate',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    add: 'Add',
    remove: 'Remove',
    optional: 'optional',
    required: 'required',
    perPage: '{n} per page',
    showing: 'Showing {from} to {to} of {total}',
    currency: '€',
    player: 'Player',
    toggleSidebar: 'Toggle sidebar',
    settings: 'Settings',
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Sign up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
  },

  // ==========================================
  // DASHBOARD
  // ==========================================
  dashboard: {
    greeting: 'Hello {name}',
    greetingDefault: 'Hello',
    defaultUser: 'User',
    defaultSubtitle: 'Here is your financial overview',
    loading: 'Loading your data...',
    financialOverview: 'Financial Overview',
    savingsCapacity: 'Savings Capacity',
    savingsRate: 'Savings Rate',
    activeGoals: 'Active Goals',
    spendingByCategory: 'Spending by Category',
    aiProjections: 'AI Projections',
    recentActivity: 'Recent Activity',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    newGoal: 'New Goal',
    newBank: 'Bank',
    analyze: 'Analyze',
    welcome: 'Welcome!',
    welcomeMessage: 'Track your finances daily',
    nextSteps: 'Next Steps',
    allGoalsReached: 'All your goals are reached!',
    savingsRateSubtitle: '{rate} of your income',
  },

  // ==========================================
  // TRANSACTIONS — ✅ Section ajoutée
  // ==========================================
  transactions: {
    title: 'Transactions',
    subtitle: 'Manage your income and expenses',
    new: 'New',
    newTransaction: 'New transaction',
    editTransaction: 'Edit transaction',
    sync: 'Sync',
    syncing: 'Syncing...',
    recentTitle: 'Recent transactions',
    income: 'Income',
    expense: 'Expense',
    incomeDesc: 'Money coming in',
    expenseDesc: 'Money going out',
    typeLabel: 'Transaction type',
    description: 'Description',
    descriptionPlaceholder: 'e.g.: Grocery shopping, January salary...',
    amount: 'Amount',
    amountPlaceholder: '0.00',
    category: 'Category',
    categoryPlaceholder: 'Select a category',
    createCategory: 'Create a new category',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    locationPlaceholder: 'e.g.: Tesco High Street...',
    notes: 'Notes',
    notesPlaceholder: 'Additional information...',
    notesOptional: 'Notes (optional)',
    tags: 'Tags',
    addTag: 'Add a tag',
    suggestedTags: 'Suggested tags',
    noTransactions: 'No transactions',
    noTransactionsDesc: 'Start by creating your first transaction',
    noFilterResults: 'No results for these filters',
    createFirst: 'Create my first transaction',
    loadingTransactions: 'Loading transactions...',
    transactionCount: '{n} transaction | {n} transactions',
    deleteConfirmTitle: 'Confirm deletion',
    deleteConfirmText: 'Delete "{name}"?',
    deleteIrreversible: 'This action is irreversible',
    deleting: 'Deleting...',
    created: 'Transaction created!',
    updated: 'Transaction updated!',
    deleted: 'Transaction deleted',
    errorSave: 'Error saving',
    errorDelete: 'Error deleting',
  },

  // ==========================================
  // GAMING
  // ==========================================
  gaming: {
    level: 'Level',
    xp: 'XP',
    points: 'Points',
    achievements: 'Achievements',
    streak: 'Streak',
    rank: 'Rank',
    dailyProgress: 'Daily Progress',
    xpEarned: 'XP earned during period',
    achievementsUnlocked: 'Achievements unlocked',
    currentStreak: 'Current streak',
    transactionsAdded: '{n} transaction(s) added',
    days: 'days',
    dailyTransactions: 'Daily transactions',
    gamingImpact: 'Gaming Impact',
  },

  // ==========================================
  // BUDGET — ✅ Section ajoutée
  // ==========================================
  budget: {
    title: 'Budget',
    monthlyBudget: 'Monthly budget',
    spent: 'Spent',
    remaining: 'Remaining',
    budgetUsed: '{n}% of budget used',
    overBudget: 'Over budget',
    budgetImpact: 'Budget impact',
    spentThisMonth: 'Spent this month',
  },

  // ==========================================
  // SIDEBAR
  // ==========================================
  sidebar: {
    sectionFinances: 'Finances',
    sectionGaming: 'Gaming',
    sectionTools: 'Tools',
    quickActions: 'Quick Actions',
    quickTransaction: 'Quick transaction',
    dailyChallenge: 'Daily challenge',
    badgeNew: 'NEW',
    dailyProgress: 'Daily Progress',
    achievements: 'Achievements',
    streak: 'Streak',
    rank: 'Rank',
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  notifications: {
    title: 'Notifications',
    viewAll: 'View all notifications',
    achievementUnlocked: 'New achievement unlocked!',
    goalReached: 'Savings goal reached',
    streakDays: '{n}-day streak!',
    minutesAgo: '{n} min ago',
    hoursAgo: '{n}h ago',
    daysAgo: '{n}d ago',
  },

  // ==========================================
  // FOOTER
  // ==========================================
  footer: {
    rights: 'All rights reserved',
    help: 'Help',
    privacy: 'Privacy',
    version: 'Version',
    env: 'Env',
    clearCache: 'Clear Cache',
  },

  // ==========================================
  // STATS — ✅ Section ajoutée
  // ==========================================
  stats: {
    title: 'Financial statistics',
    subtitle: 'Transaction analysis and gaming progression',
    period: 'Period',
    last7Days: 'Last 7 days',
    thisMonth: 'This month',
    thisQuarter: 'This quarter',
    thisYear: 'This year',
    allTime: 'All time',
    totalIncome: 'Total income',
    totalExpenses: 'Total expenses',
    netBalance: 'Net balance',
    avgTransaction: 'Avg/transaction',
    surplus: 'Surplus',
    deficit: 'Deficit',
    monthlyEvolution: 'Monthly evolution',
    categoryBreakdown: 'Category breakdown',
    total: 'Total',
    recentTransactions: 'Recent transactions',
  },

  // ==========================================
  // BANKING — ✅ Section ajoutée
  // ==========================================
  banking: {
    title: 'Bank connections',
    connect: 'Connect a bank',
    connected: 'Connected',
    disconnected: 'Disconnected',
    lastSync: 'Last sync',
    syncNow: 'Sync now',
  },

  // ==========================================
  // ERRORS
  // ==========================================
  errors: {
    generic: 'An error occurred',
    network: 'Connection error',
    unauthorized: 'Unauthorized',
    notFound: 'Not found',
    loadingError: 'Loading error',
    loadingErrorDesc: 'An error occurred while loading CoinQuest.',
    tryAgain: 'Try again',
    reload: 'Reload page',
    persistContact: 'If the problem persists, contact support',
  },

  // ==========================================
  // VALIDATION — ✅ Section ajoutée
  // ==========================================
  validation: {
    required: 'This field is required',
    typeRequired: 'Transaction type is required',
    invalidType: 'Invalid type',
    amountPositive: 'Amount must be positive',
    amountMax: 'Amount too high (max €999,999)',
    descriptionRequired: 'Description is required',
    descriptionMin: 'Minimum {n} characters',
    descriptionMax: 'Maximum {n} characters',
    categoryRequired: 'Category is required',
    dateRequired: 'Date is required',
    dateFuture: 'Date cannot be in the future',
  },

  // ==========================================
  // TIME — ✅ Clés manquantes ajoutées
  // ==========================================
  time: {
    justNow: 'Just now',
    hoursAgo: '{n}h ago',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{n}d ago',
    weeksAgo: '{n} weeks ago',
    monthsAgo: '{n} months ago',
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
  // CATEGORIES
  // ==========================================
  categories: {
    title: 'Categories',
    subtitle: 'Organize your expenses',
    new: 'New',
    activeCategories: 'Active categories',
    spentThisMonth: 'Spent this month',
    mostSpent: 'Most spent',
    budgetUsed: 'Budget used',
    none: 'None',
    income: 'Income',
    expense: 'Expense',
    templates: 'Templates',
    refresh: 'Refresh',
    yourCategories: 'Your categories',
    category: 'category',
    categories_plural: 'categories',
    revenues: 'Revenues',
    expenses: 'Expenses',
    budget: 'Budget',
    budgetPerMonth: 'Budget: {amount}/month',
    spent: 'Spent',
    modify: 'Edit',
    delete: 'Delete',
    newCategory: 'New category',
    editCategory: 'Edit',
    confirmDelete: 'Confirm deletion',
    irreversible: 'This action is irreversible',
    deleteQuestion: 'Delete "{name}"?',
    type: 'Type',
    noCategory: 'No category',
    startCreating: 'Start by creating your first category',
    createFirst: 'Create my first category',
    templatesTitle: 'Category templates',
    viewMore: 'View {n} more templates',
    viewLess: 'View less',
  },

  // ==========================================
  // CHALLENGES
  // ==========================================
  challenges: {
    title: 'Challenges',
    subtitle: 'Participate in challenges and climb the leaderboards',
    refresh: 'Refresh',
    refreshing: 'Loading...',
    myChallenges: 'My challenges',
    available: 'Available',
    leaderboards: 'Leaderboards',
    activeChallenges: 'Active challenges',
    completed: 'Completed',
    bestRank: 'Best rank',
    totalXP: 'XP earned',
    inProgress: 'My ongoing challenges',
    noChallenge: 'You are not participating in any challenge at the moment',
    discover: 'Discover challenges',
    yourRank: 'Your rank',
    progression: 'Progress',
    toWin: 'to win',
    viewLeaderboard: 'View leaderboard',
    filters: 'Filters',
    all: 'All',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    availableChallenges: 'Available challenges',
    participants: 'participants',
    rewards: 'Rewards',
    participate: 'Join',
    participating: 'Joining...',
    difficultyEasy: 'Easy',
    difficultyMedium: 'Medium',
    difficultyHard: 'Hard',
    endsOn: 'Ends on {date}',
    remaining: '{n} days remaining',
    oneDay: '1 day remaining',
    finished: 'Finished',
    noChallengeFound: 'No challenge available for these criteria',
    globalLeaderboard: 'Global leaderboards',
    thisWeek: 'This week',
    thisMonth: 'This month',
    allTime: 'All time',
    player: 'Player',
    challengesCompleted: 'Challenges',
    you: 'You',
    joined: 'You are now participating in "{name}"!',
    error: 'Error joining challenge',
    refreshed: 'Challenges refreshed!',
  },

  // ==========================================
  // GAMING CENTER
  // ==========================================
  gamingCenter: {
    title: 'Progress',
    subtitle: 'Track your evolution and unlock rewards',
    tier: 'Level',
    achievements: 'Achievements',
    streak: 'Streak',
    totalXP: 'Total',
    points: 'XP',
    days: 'days',
    record: 'Record: {n} days',
    completed: 'completed',
    allAchievements: 'All achievements',
    unlocked: '{n}/{total} unlocked',
    activeChallenges: 'Active challenges',
    inProgress: '{n} in progress',
    ranking: 'Ranking',
    rankPosition: '#{rank} of {total}',
    recentAchievements: 'Recent achievements',
    leaderboard: 'Leaderboard',
    loading: 'Loading...',
  },

  // ==========================================
  // GOALS
  // ==========================================
  goals: {
    title: 'My Goals',
    subtitle: 'Manage your savings goals and track your progress',
    new: 'New goal',
    refresh: 'Refresh',
    refreshing: 'Loading...',
    templates: 'Templates',
    activeGoals: 'Active goals',
    totalSaved: 'Total saved',
    averageProgress: 'Average progress',
    goalsReached: 'Goals reached',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    paused: 'Paused',
    noDescription: 'No description',
    on: 'of',
    remaining: 'Remaining: {amount}',
    perMonth: '/month',
    add: 'Add',
    modify: 'Edit',
    statusActive: 'Active',
    statusCompleted: 'Completed',
    statusPaused: 'Paused',
    contribution: 'Contribution',
    pause: 'Pause',
    resume: 'Resume',
    delete: 'Delete',
    exceeded: 'Exceeded',
    today: 'Today',
    tomorrow: 'Tomorrow',
    daysRemaining: '{n} days',
    monthsRemaining: '{n} months',
    yearsRemaining: '{n} year(s)',
    newGoal: 'New goal',
    editGoal: 'Edit',
    chooseTemplate: 'Choose a template',
    addContribution: 'Add a contribution',
    goal: 'Goal',
    amount: 'Amount (€)',
    cancel: 'Cancel',
    deleteTitle: 'Delete this goal?',
    deleteText: 'This action is irreversible. The goal "{name}" will be permanently deleted.',
    deleting: 'Deleting...',
    noGoals: 'No goals',
    noGoalsInCategory: 'in this category',
    createFirstGoal: 'Create your first financial goal to start saving!',
    createGoal: 'Create a goal',
    travel: 'Travel',
    travelDesc: 'Save for your next adventure',
    emergency: 'Emergency fund',
    emergencyDesc: '3-6 months of expenses',
    house: 'Real estate',
    houseDesc: 'Down payment for property',
    car: 'Car',
    carDesc: 'Purchase or replacement',
    education: 'Education',
    educationDesc: 'Invest in your skills',
    wedding: 'Wedding',
    weddingDesc: 'Prepare the big day',
    retirement: 'Retirement',
    retirementDesc: 'Prepare your future',
    tech: 'High-Tech',
    techDesc: 'Computer equipment',
  },

  // ==========================================
  // INSIGHTS
  // ==========================================
  insights: {
    title: 'Financial Insights',
    subtitle: 'Personalized recommendations',
    markAllRead: 'Mark all as read',
    analyzing: 'Analyzing...',
    analyze: 'Analyze',
    savingsDetected: 'Potential savings detected',
    basedOnInsights: 'Based on {count} active insight(s)',
    perYear: '/yr',
    savingPerYear: '/yr savings',
    monthsSaved: '{count} month(s) saved',
    actionDone: 'Action done · +{xp} XP',
    dismiss: 'Dismiss',
    xpToast: 'Insight applied!',
    filters: {
      all: 'All',
      costs: 'Costs',
      savings: 'Savings',
      alerts: 'Alerts',
      goals: 'Goals',
      habits: 'Habits',
    },
    priority: {
      urgent: 'Urgent',
      important: 'Important',
      info: 'Info',
    },
    empty: {
      title: 'No insights yet',
      description: 'Click "Analyze" to generate recommendations based on your transactions.',
      cta: 'Run analysis',
    },
  },

  // ==========================================
  // LANDING PAGE
  // ==========================================
  landing: {
    login: 'Login',
    register: 'Sign up',
    badge: '💰 Budget + 🎮 Motivation = 🚀 Results',
    heroTitle1: 'The app that makes',
    heroTitle2: 'money management',
    heroTitle3: 'fun and motivating',
    heroSubtitle: 'Saving for a goal?',
    heroDesc:
      'CoinQuest connects your bank, automatically calculates your savings capacity and rewards you at every step.',
    heroDescBold: 'Simple. Automatic. Motivating.',
    bankTitle: 'Secure bank connection',
    bankDesc: 'Your transactions imported automatically from 300+ European banks',
    goalsTitle: 'Smart goals',
    goalsDesc: 'The app calculates how much to save each month for your projects',
    progressTitle: 'Motivating progress',
    progressDesc: 'Earn points and badges with every smart financial decision',
    ctaPrimary: '🎮 Start for free',
    ctaSecondary: '👀 See how it works',
    storeRating: '4.8★ on app stores',
    activeUsers: '1,247 active users',
    totalSaved: '€2.4M saved collectively',
    howTitle: 'How does it work?',
    howSubtitle: '3 simple steps to take control of your budget',
    step1Title: 'Connect your bank',
    step1Desc:
      'In 2 minutes, securely connect your account. Your transactions are imported automatically.',
    step2Title: 'Set your goals',
    step2Desc: 'Travel, car, apartment... The app calculates how much to save per month.',
    step3Title: 'Progress and earn',
    step3Desc: 'Every smart decision earns you points. Track your progress in real time.',
    trustBridge: 'Secure Bridge connection',
    trustReadOnly: 'Read-only (no transfers)',
    trustCompliance: 'GDPR & PSD2 compliant',
    copyright: '© {year} CoinQuest. All rights reserved.',
    trustDesc:
      'CoinQuest uses Bridge, the same system your bank uses to securely connect your account',
    heroSavings: 'Save {amount} per month on average',
    heroTagline: 'Effortless. No spreadsheets. 100% automatic.',
    calcTitle: '💰 Calculate your savings potential',
    signupCta: 'Start for free',
    signupSubtext: '✓ No credit card • ✓ 30 days free',
    trustPsd2: 'PSD2 Secure',
    trustInstant: 'Instant import',
    trustFrance: 'Data in France',
    benefitsTitle: 'Why does CoinQuest work?',
    benefitsSubtitle: 'Real results, not promises',
    howCtaNote: '30-day free trial • No card required',
    howCtaBtn: 'Start now',
    testimonialsTitle: 'They took back control',
    testimonialsSubtitle: 'Real results from real users',
    saved: 'saved',
    usage: 'of usage',
    ctaTitle: 'Ready to save {amount}/month?',
    ctaSubtitle: 'Join the hundreds of users who took back control',
    ctaBtn: 'Start for free',
    ctaFeatures: '✓ No credit card ✓ 30 days free ✓ Cancel anytime',
    calcIncome: 'Your net monthly income',
    calcExpenses: 'Your fixed monthly expenses',
    calcCapacity: 'Savings capacity',
    calcPerMonth: 'per month',
    calcYearly: 'yearly potential',
    calcPercent: 'of your income',
    calcExcellent: 'Excellent! You have a very good savings capacity.',
    calcGood: 'Good! You can build solid savings.',
    calcHelp: 'CoinQuest will help you optimize your spending.',
    calcError: 'Your expenses cannot exceed your income',
  },

  benefits: {
    goalsTitle: 'Smart goals',
    goalsDesc: 'Create realistic goals and track your progress in real time.',
    goalsEx: 'Example: €15,000 for a trip in 18 months',
    autoTitle: 'Auto categorization',
    autoDesc: '75% of your transactions are automatically classified using AI.',
    autoEx: 'Time saved: 2h/month',
    insightsTitle: 'Detailed analysis',
    insightsDesc: 'See where your money goes with clear charts.',
    insightsEx: 'Identify 3-5 areas for optimization',
    projectionsTitle: 'AI Forecasts',
    projectionsDesc: 'Anticipate your future finances based on your habits.',
    projectionsEx: 'Predictions at 3, 6 and 12 months',
    securityTitle: 'Bank-grade security',
    securityDesc: 'PSD2-secure connection via Bridge. Your data stays in France.',
    securityEx: 'ACPR certified official aggregator',
    mobileTitle: 'Mobile app',
    mobileDesc: 'Track your finances anywhere, on all your devices.',
    mobileEx: 'iOS, Android and Web',
  },

  testimonials: {
    marieRole: 'Teacher',
    marieQuote:
      'I saved €400 in 2 months just by visualizing my spending. I had no idea I was spending that much on restaurants!',
    marieDuration: '2 months',
    thomasRole: 'Developer',
    thomasQuote:
      'The automatic transaction import saves me so much time. No more manual entry like with Excel.',
    thomasDuration: '6 months',
    sophieRole: 'Entrepreneur',
    sophieQuote:
      'Thanks to smart goals, I saved €15,000 for my apartment down payment in 18 months. It was my dream!',
    sophieDuration: '18 months',
  },

  // ==========================================
  // HOME VIEW
  // ==========================================
  homeView: {
    welcomeTitle: 'Welcome to',
    welcomeSubtitle:
      'Turn your financial management into an epic adventure. Earn XP, unlock achievements and reach your goals with style!',
    pageTitle: 'CoinQuest - Welcome',
  },

  // ==========================================
  // TUTORIAL — ✅ Mergé directement
  // ==========================================
  tutorial: {
    welcome: {
      title: 'Welcome to CoinQuest!',
      content:
        '<p>CoinQuest turns your financial management into a <strong>motivating adventure</strong>. ' +
        'Connect your bank, set your goals and earn points with every smart decision.</p>' +
        '<p>This tutorial guides you through 5 steps to get started.</p>',
      tip1: 'Sign-up is 100% free, no credit card required',
      tip2: 'You can revisit this tutorial anytime from settings',
    },
    bank: {
      title: 'Connect your bank',
      content:
        '<p>CoinQuest uses <strong>Bridge</strong>, a PSD2-certified aggregator, to ' +
        'import your transactions automatically. Compatible with 300+ European banks.</p>' +
        '<p>The connection is <strong>read-only</strong>: no transfers possible.</p>',
      ex1Title: 'Secure connection',
      ex1Desc: 'Your credentials are never stored by CoinQuest',
      ex2Title: 'Auto import',
      ex2Desc: 'Your transactions sync daily',
      tip1: 'First sync may take a few minutes',
    },
    goals: {
      title: 'Set your goals',
      content:
        '<p>Create savings goals and let CoinQuest calculate ' +
        '<strong>how much to save each month</strong> to reach them.</p>' +
        '<p>The app smartly distributes your savings capacity across your projects.</p>',
      examplesTitle: 'Project examples',
      ex1Title: 'Travel',
      ex1Desc: '€3,000 for an Iceland road trip',
      ex1Detail1: 'Estimated duration: 10 months',
      ex1Detail2: 'Monthly savings: €300',
      ex2Title: 'Property deposit',
      ex2Desc: '€15,000 in 18 months for an apartment',
      ex3Title: 'New car',
      ex3Desc: '€8,000 in 12 months',
      tip1: 'Start with a realistic goal to build confidence',
      tip2: 'The app adjusts amounts automatically if your income changes',
    },
    coach: {
      title: 'Your financial coach',
      content:
        '<p>The <strong>Coach Insights</strong> automatically analyzes your spending habits and offers ' +
        'personalized recommendations to optimize your budget.</p>' +
        '<p>Each applied insight earns you <strong>+15 points</strong>!</p>',
      examplesTitle: 'What the coach detects',
      ex1Title: 'Forgotten subscriptions',
      ex1Desc: 'Detects recurring expenses you could reduce',
      ex1Detail1: 'Example: duplicate streaming at €13.99/mo',
      ex1Detail2: 'Potential savings: €168/yr',
      ex2Title: 'Goal acceleration',
      ex2Desc: 'Suggestions to reach your goals faster',
      ex3Title: 'Unusual spending',
      ex3Desc: 'Alerts when a category exceeds your average',
      tip1: 'Check your insights regularly to maximize your points',
      tip2: 'You can dismiss an insight with no penalty',
    },
    gaming: {
      title: 'Progress and earn',
      content:
        '<p>Every smart financial decision earns you <strong>points</strong>. ' +
        'Level up, unlock badges and maintain your streaks!</p>' +
        '<p>Gaming is here to <strong>motivate</strong> you, not to distract.</p>',
      examplesTitle: 'How to earn points',
      ex1Title: 'Badges',
      ex1Desc: 'Unlock achievements by reaching key milestones',
      ex2Title: 'Streaks',
      ex2Desc: 'Maintain daily streaks for growing bonuses',
      ex3Title: 'Levels',
      ex3Desc: 'Level up to unlock new features',
      tip1: 'Points reflect real positive financial habits',
    },
    onboarding: {
      skipTitle: 'Skip tutorial',
      startBtn: '🚀 Get started!',

      step1: {
        title: 'Welcome to CoinQuest!',
        description:
          'CoinQuest is a budget app <strong>that motivates you</strong> to save by turning money management into a progressive adventure.',
        howTitle: 'How does it work?',
        how1: '<strong>Connect your bank</strong> (secure and automatic)',
        how2: '<strong>Set your goals</strong> (travel, apartment, car...)',
        how3: '<strong>The app calculates your savings capacity</strong> automatically',
        how4: '<strong>You earn points</strong> with every progress 🎯',
        freeAlpha: 'Free during the alpha phase',
      },

      step2: {
        title: 'Why points?',
        description: 'Because <strong>seeing your progress</strong> makes saving more motivating!',
        optional: "(It's 100% optional, you can ignore them)",
        saving: 'Savings achieved',
        savingDesc: 'Every progress counts',
        goalReached: 'Goal reached',
        goalDesc: 'Celebrate your wins',
        streak: '7-day streak',
        streakDesc: 'Consistency pays off',
        challenge: 'Challenge completed',
        challengeDesc: 'Weekly challenges',
        secretTitle: '💡 The secret',
        secretDesc:
          "The more points you accumulate, the more badges and features you unlock. <strong>It's optional</strong>, but it makes budgeting less boring!",
      },

      step3: {
        title: 'Your data is 100% secure',
        description:
          'CoinQuest uses <strong>Bridge</strong>, the same system European banks use to securely connect your accounts.',
        certifiedTitle: 'Certified European bank connection',
        certifiedDesc: 'PSD2 compliant, just like your official banking app',
        readOnlyTitle: 'Read-only access',
        readOnlyDesc: "We can't make transfers, only view your transactions",
        noStorageTitle: 'Your credentials NEVER stored',
        noStorageDesc: 'Direct authentication with your bank, zero storage on our end',
        disconnectTitle: 'Disconnect anytime',
        disconnectDesc: 'You keep total control over your data, always',
        gdpr: '<strong>🛡️ GDPR compliant:</strong> Your data stays in Europe, encrypted end-to-end',
      },
    },
  },
  goalsProjectsTutorial: {
    welcome: {
      title: 'Welcome to Goal Management!',
      content: `
      <p>CoinQuest offers you <strong>two complementary systems</strong> to manage your finances:</p>
      <ul>
        <li><strong>Goals</strong>: For simple savings objectives</li>
        <li><strong>Projects</strong>: For complex projects with multiple steps</li>
      </ul>
      <p>Let's discover how to use them effectively!</p>
    `,
    },
    goals: {
      title: 'Goals - Simple Savings Objectives',
      content: `
      <p><strong>Goals</strong> are perfect for straightforward financial objectives:</p>
      <ul>
        <li>A target amount to reach</li>
        <li>An optional deadline</li>
        <li>Automatic progress tracking</li>
        <li>Earn XP when you contribute!</li>
      </ul>
      <p>Ideal for: monthly savings, vacations, new phone, emergency fund...</p>
    `,
      ex1Title: 'Summer vacation',
      ex1Desc: 'Save €1,500 by July',
      ex1Detail1: 'Target amount: €1,500',
      ex1Detail2: 'Deadline: July 31, 2026',
      ex1Detail3: 'Regular contributions: €250/month',
      ex2Title: 'New smartphone',
      ex2Desc: 'Set aside €800 for an iPhone',
      ex2Detail1: 'Target amount: €800',
      ex2Detail2: 'No deadline',
      ex2Detail3: 'Free contributions based on your means',
      ex3Title: 'Emergency fund',
      ex3Desc: 'Build a safety reserve',
      ex3Detail1: 'Target amount: €3,000',
      ex3Detail2: 'Long-term goal (12 months)',
      ex3Detail3: 'Automatic contributions: €250/month',
      tip1: 'Create multiple goals simultaneously for different objectives',
      tip2: 'Add contributions whenever you save',
      tip3: 'Earn XP with every contribution!',
    },
    projects: {
      title: 'Projects - Complex Structured Plans',
      content: `
      <p><strong>Projects</strong> are designed for large-scale plans with multiple phases:</p>
      <ul>
        <li>Pre-configured templates (travel, home, car...)</li>
        <li>Multiple expense categories</li>
        <li>Milestones to track progress</li>
        <li>States: active, paused, completed, cancelled</li>
      </ul>
      <p>Ideal for: big trips, real estate, weddings, renovations...</p>
    `,
      ex1Title: 'Trip to Japan',
      ex1Desc: 'Complete project with multiple categories',
      ex1Detail1: 'Total budget: €4,000',
      ex1Detail2: 'Categories: Flights, Accommodation, Local transport, Activities',
      ex1Detail3: 'Milestones: Book flights, Book hotels, Buy JR Pass',
      ex1Detail4: 'Duration: 6 months of preparation',
      ex2Title: 'Buy an apartment',
      ex2Desc: 'Multi-year real estate project',
      ex2Detail1: 'Total budget: €50,000 (down payment)',
      ex2Detail2: 'Categories: Down payment savings, Notary fees, Agency fees, Renovations',
      ex2Detail3: 'Milestones: €10k, €25k, €40k, €50k',
      ex2Detail4: 'Duration: 24 months',
      ex3Title: 'Buy a car',
      ex3Desc: 'Finance a new vehicle',
      ex3Detail1: 'Total budget: €15,000',
      ex3Detail2: 'Categories: Down payment, Insurance, Registration',
      ex3Detail3: 'Milestones: Save down payment, Get financing',
      ex3Detail4: 'Duration: 8 months',
      tip1: 'Use templates to get started quickly',
      tip2: 'Adjust categories to your specific needs',
      tip3: 'Mark milestones as completed to track your progress',
    },
    when: {
      title: 'When to use what?',
      content: `
      <h3>Use a <strong>Goal</strong> if:</h3>
      <ul>
        <li>You have a simple, direct savings objective</li>
        <li>A single target amount is enough</li>
        <li>You want something quick to create</li>
        <li>No need to split into sub-categories</li>
      </ul>
      <h3>Use a <strong>Project</strong> if:</h3>
      <ul>
        <li>Your objective requires multiple expense categories</li>
        <li>You want to track steps/milestones</li>
        <li>It's a medium or long-term project</li>
        <li>You need a detailed overview</li>
      </ul>
      <p class="mt-4"><strong>💡 Tip:</strong> You can combine both! For example, have a "Wedding" Project
      with multiple categories, and a separate "Honeymoon" Goal for the vacation.</p>
    `,
    },
    // NEW: Financial coach
    coach: {
      title: 'Your Financial Coach',
      content: `
      <p>CoinQuest automatically analyzes your habits and gives you
      <strong>personalized recommendations</strong> to optimize your budget.</p>
      <p>The coach learns from your transactions and adapts to your financial profile.</p>
    `,
      examplesTitle: 'What the coach detects',
      ex1Title: 'Forgotten subscriptions',
      ex1Desc: 'Spots recurring expenses you could reduce or cancel',
      ex2Title: 'Goal acceleration',
      ex2Desc: 'Suggestions to reach your goals faster',
      ex3Title: 'Spending alerts',
      ex3Desc: 'Warns you when a category exceeds its usual budget',
      ex4Title: 'Savings opportunities',
      ex4Desc: 'Identifies amounts you could set aside each month',
      tip1: 'Check your insights regularly to earn +15 XP per action!',
      tip2: 'The more you use the app, the more accurate the coach becomes.',
    },
    gaming: {
      title: 'Gamification & Rewards',
      content: `
      <p>Whether you use Goals or Projects, <strong>you always earn XP</strong>:</p>
      <ul>
        <li>🎯 <strong>+50 XP</strong>: Create a new goal or project</li>
        <li>💰 <strong>+20 XP</strong>: Add a contribution</li>
        <li>✅ <strong>+100 XP</strong>: Complete a milestone (project)</li>
        <li>🏆 <strong>+200 XP</strong>: Reach your final goal!</li>
      </ul>
      <p class="mt-4">The more consistent you are, the more XP you earn and achievements you unlock!</p>
    `,
      tip1: 'Check your goals regularly to stay motivated',
      tip2: 'Celebrate every milestone reached',
      tip3: 'Share your successes with the community for bonus XP',
    },
    ready: {
      title: 'Ready to Start!',
      content: `
      <p>You now have everything you need to manage your financial goals effectively:</p>
      <ul>
        <li>✅ You know the difference between Goals and Projects</li>
        <li>✅ You know when to use each one</li>
        <li>✅ Your financial coach analyzes your habits</li>
        <li>✅ You can earn XP by saving</li>
      </ul>
      <h3>Where to start?</h3>
      <p>1. <strong>Simple objective?</strong> Create a Goal from the "Goals" tab</p>
      <p>2. <strong>Complex project?</strong> Explore Project templates</p>
      <p>3. <strong>Need advice?</strong> Check your Financial Coach</p>
      <p class="mt-4 text-center font-semibold text-purple-600">
        Happy budgeting and have fun! 🎉
      </p>
    `,
    },
  },

  // Goals-only tutorial
  goalsTutorial: {
    intro: {
      title: 'Your Savings Goals',
      content: `
      <p><strong>Goals</strong> let you define and track your savings objectives easily.</p>
      <p>Create a goal in seconds and track your progress in real time!</p>
    `,
    },
    create: {
      title: 'Create a Goal',
      content: `
      <p>To create a goal:</p>
      <ul>
        <li>Click "New Goal"</li>
        <li>Give it a clear name (e.g. "Vacation 2026")</li>
        <li>Set the target amount</li>
        <li>Add a deadline (optional)</li>
        <li>Choose a category (optional)</li>
      </ul>
    `,
      ex1Title: 'iPhone 16',
      ex1Desc: '€1,200 - No deadline',
      ex2Title: 'NYC Vacation',
      ex2Desc: '€3,000 - Before December 2026',
    },
    contributions: {
      title: 'Add Contributions',
      content: `
      <p>Every time you save, add a contribution:</p>
      <ul>
        <li>Click on an existing goal</li>
        <li>Press "Add a contribution"</li>
        <li>Enter the amount</li>
        <li>Earn XP automatically! 🎮</li>
      </ul>
    `,
      tip1: 'Even small regular contributions add up',
      tip2: 'The more often you contribute, the more XP you earn',
      tip3: 'Set reminders so you never forget',
    },
    achieve: {
      title: 'Reach Your Goals',
      content: `
      <p>When you reach 100% of your goal:</p>
      <ul>
        <li>🎉 Unlock a special achievement</li>
        <li>💪 Earn 200 bonus XP</li>
        <li>📊 Your success stats increase</li>
        <li>🔥 Keep your streak alive</li>
      </ul>
      <p class="mt-4">Then mark your goal as completed and start a new one!</p>
    `,
    },
  },

  // Projects-only tutorial
  projectsTutorial: {
    intro: {
      title: 'Your Structured Projects',
      content: `
      <p><strong>Projects</strong> help you manage complex plans with multiple phases and categories.</p>
      <p>Perfect for big goals that need detailed planning!</p>
    `,
    },
    templates: {
      title: 'Project Templates',
      content: '<p>Get started quickly with our pre-configured templates:</p>',
      ex1Title: 'Travel',
      ex1Desc: 'Transport, accommodation, activities, dining',
      ex1Detail1: 'Suggested budget: €2,000 - €5,000',
      ex1Detail2: '4 pre-defined categories',
      ex2Title: 'Real Estate',
      ex2Desc: 'Down payment, notary, agency, renovations',
      ex2Detail1: 'Suggested budget: €30,000 - €100,000',
      ex2Detail2: '5 pre-defined categories',
      ex3Title: 'Vehicle',
      ex3Desc: 'Purchase, insurance, registration',
      ex3Detail1: 'Suggested budget: €10,000 - €30,000',
      ex3Detail2: '3 pre-defined categories',
      ex4Title: 'Wedding',
      ex4Desc: 'Venue, catering, decoration, outfits, honeymoon',
      ex4Detail1: 'Suggested budget: €15,000 - €40,000',
      ex4Detail2: '8 pre-defined categories',
      tip1: 'Templates include recommended budgets',
      tip2: 'You can customize all categories',
      tip3: 'Add or remove categories to fit your needs',
    },
    milestones: {
      title: 'Milestones',
      content: `
      <p>Milestones help you break your project into stages:</p>
      <ul>
        <li>Set intermediate objectives</li>
        <li>Track your progress step by step</li>
        <li>Celebrate each milestone reached (+100 XP)</li>
        <li>Stay motivated throughout the project</li>
      </ul>
    `,
      exTitle: 'Japan Trip - Milestones',
      exDesc: 'Example milestones for a trip',
      exDetail1: '✅ Milestone 1: Save €1,000 (25%)',
      exDetail2: '⏳ Milestone 2: Book flights (50%)',
      exDetail3: '⏳ Milestone 3: Book hotels (75%)',
      exDetail4: '⏳ Milestone 4: Full activities budget (100%)',
    },
    states: {
      title: 'State Management',
      content: `
      <p>Easily manage the state of your projects:</p>
      <ul>
        <li>🟢 <strong>Active</strong>: Ongoing project</li>
        <li>⏸️ <strong>Paused</strong>: Temporarily suspended</li>
        <li>✅ <strong>Completed</strong>: Goal achieved!</li>
        <li>❌ <strong>Cancelled</strong>: Project abandoned</li>
      </ul>
      <p class="mt-4">Change state at any time as your priorities evolve.</p>
    `,
      tip1: 'Pause non-priority projects',
      tip2: 'Review your completed projects history',
      tip3: 'Analyze why certain projects were cancelled',
    },
    tracking: {
      title: 'Tracking & Analysis',
      content: `
      <p>Visualize your progress in detail:</p>
      <ul>
        <li>📈 Progress charts by category</li>
        <li>💰 Budget breakdown</li>
        <li>⏱️ Time remaining until target date</li>
        <li>🎯 Overall completion percentage</li>
      </ul>
      <p class="mt-4">Make informed decisions with detailed statistics.</p>
    `,
    },
  },
  // ==========================================
  // PROFILE
  // ==========================================
  profile: {
    title: 'Profile',
    subtitle: 'Manage your profile and view your statistics',
    edit: 'Edit',
    save: 'Save',
    tabs: {
      profile: 'Profile',
      gaming: 'Gaming',
      history: 'History',
      security: 'Security',
    },
    info: {
      title: 'Personal information',
      name: 'Name',
      email: 'Email',
      memberSince: 'Member since',
      lastLogin: 'Last login',
      changeAvatar: 'Change avatar',
      xpToNext: '{xp} XP to level {level}',
    },
    preferences: {
      title: 'Preferences',
      currency: 'Currency',
      language: 'Language',
      gamingOptions: 'Gaming Options',
      achievementNotifs: 'Achievement notifications',
      leaderboardVisible: 'Visible in leaderboards',
      challengeInvites: 'Challenge invitations',
    },
    gamingStats: {
      currentLevel: 'Current level',
      totalXP: 'Total XP',
      achievementsUnlocked: 'Achievements unlocked',
      currentStreak: 'Current streak',
      detailedProgress: 'Detailed progress',
      xpPerMonth: 'XP earned per month',
      xpSources: 'XP sources breakdown',
      recentActivity: 'Recent activity',
      ranking: 'Your ranking',
      globalRank: 'Global ranking',
      monthlyRank: 'This month',
      weeklyRank: 'This week',
    },
    history: {
      title: 'Activity history',
      filters: 'Filters',
      activityType: 'Activity type',
      all: 'All',
      xpGains: 'XP Gains',
      achievements: 'Achievements',
      challenges: 'Challenges',
      levels: 'Levels',
      dateFrom: 'Start date',
      dateTo: 'End date',
      loadMore: 'Load more history',
    },
    security: {
      title: 'Security',
      changePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      changeBtn: 'Change password',
      activeSessions: 'Active sessions',
      revoke: 'Revoke',
      currentSession: 'Current session',
      passwordChanged: 'Password updated successfully',
      passwordError: 'Error changing password',
      sessionRevoked: 'Session revoked',
      sessionRevokeError: 'Error revoking session',
    },
  },

  // ==========================================
  // ACHIEVEMENTS
  // ==========================================
  achievements: {
    title: 'Achievements',
    subtitle: 'Unlock achievements and earn XP',
    checkBtn: 'Check achievements',
    checking: 'Checking...',
    stats: {
      unlocked: 'Unlocked',
      completed: 'Completed',
      legendary: 'Legendary',
      totalXP: 'Total XP',
    },
    filters: {
      title: 'Filters',
      all: 'All',
      unlocked: 'Unlocked',
      locked: 'In progress',
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
    recentUnlocks: 'Recently unlocked',
    loading: 'Loading achievements...',
    progression: 'Progress',
    xpReward: '+{xp} XP',
    unlockedLabel: 'Unlocked',
    noResults: 'No achievements found',
    noResultsHint: 'Try changing filters or start using the app!',
    emptyState: {
      title: 'Your first achievements await!',
      description: 'Start using the app to unlock your first achievements',
      cta: 'Create a transaction',
    },
    checkSuccess: '{count} new achievement(s) unlocked!',
    checkNone: 'No new achievements for now',
    checkError: 'Error checking achievements',
    loadError: 'Unable to load achievements',
    rarity: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
  },

  // ==========================================
  // TOASTS / FEEDBACK MESSAGES
  // ==========================================
  toasts: {
    transactionCreated: 'Transaction created successfully!',
    transactionUpdated: 'Transaction updated',
    transactionDeleted: 'Transaction deleted',
    goalCreated: 'Goal created successfully!',
    goalUpdated: 'Goal updated',
    goalCompleted: 'Congratulations! Goal reached!',
    categoryCreated: 'Category created',
    achievementUnlocked: 'New achievement unlocked!',
    levelUp: 'Next level reached!',
    challengeCompleted: 'Challenge completed successfully!',
    streakMilestone: 'New streak record!',
    bankConnected: 'Bank account connected',
    syncCompleted: 'Sync completed',
    settingsSaved: 'Settings saved',
    passwordChanged: 'Password changed',
    profileUpdated: 'Profile updated',
    error: {
      generic: 'An error occurred',
      network: 'Connection error',
      unauthorized: 'Unauthorized',
      notFound: 'Not found',
    },
  },

  // ==========================================
  // CURRENCIES
  // ==========================================
  currencies: {
    EUR: 'Euro (€)',
    USD: 'Dollar ($)',
    GBP: 'Pound (£)',
    CHF: 'Swiss Franc (CHF)',
    CAD: 'Canadian Dollar (C$)',
  },

  // ==========================================
  // LANGUAGES
  // ==========================================
  languages: {
    fr: 'Français',
    en: 'English',
    es: 'Español',
  },
}

export default en
