// src/i18n/locales/en.ts
export default {
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
    defaultSubtitle: 'Here is your financial overview',
    loading: 'Loading your data...',
    financialOverview: 'Financial Overview',
    savingsCapacity: 'Savings Capacity',
    savingsRate: 'Savings Rate',
    activeGoals: 'Active Goals',
    spendingByCategory: 'Spending by Category',
    aiProjections: 'AI Projections',
    recentActivity: 'Recent Activity',

    // Cards
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',

    // Actions
    newGoal: 'New Goal',
    newBank: 'Bank',
    analyze: 'Analyze',

    // Messages
    welcome: 'Welcome!',
    welcomeMessage: 'Track your finances daily',
    nextSteps: 'Next Steps',
    allGoalsReached: 'All your goals are reached!',
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
  // FINANCIAL GOALS
  // ==========================================
  goals: {
    title: 'Financial Goals',
    newGoal: 'New Goal',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    deadline: 'Deadline',
    progress: 'Progress',
    completed: 'Completed!',
    remaining: 'Remaining',
    viewAll: 'View All',
    activeGoals: 'Active Goals',
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
}
