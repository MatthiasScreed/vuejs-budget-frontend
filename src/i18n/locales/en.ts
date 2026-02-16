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
}
