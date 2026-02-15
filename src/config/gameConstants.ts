export const GAME_CONSTANTS = {
  // XP Configuration
  XP: {
    BASE_TRANSACTION: 5,
    INCOME_BONUS: 10,
    SAVINGS_BONUS: 15,
    GOAL_COMPLETED: 50,
    ACHIEVEMENT_MULTIPLIER: 1.5,
    DAILY_CAP: 200,
    STREAK_BONUS_PER_DAY: 0.05 // +5% par jour de streak
  },

  // Level Configuration
  LEVELS: {
    BASE_XP: 100,
    MULTIPLIER: 1.5,
    MAX_LEVEL: 100,
    PRESTIGE_THRESHOLD: 50
  },

  // Achievement Rarities
  RARITY: {
    COMMON: { color: '#5b6270', multiplier: 1.0 },
    RARE: { color: '#3B82F6', multiplier: 1.2 },
    EPIC: { color: '#8B5CF6', multiplier: 1.5 },
    LEGENDARY: { color: '#F59E0B', multiplier: 2.0 }
  },

  // Streak Configuration
  STREAKS: {
    EXPIRY_HOURS: 25, // 25h pour maintenir un streak quotidien
    MAX_MULTIPLIER: 3.0,
    MILESTONE_DAYS: [3, 7, 14, 30, 50, 100, 365]
  },

  // Challenge Configuration
  CHALLENGES: {
    MAX_PARTICIPANTS: 1000,
    XP_REWARDS: {
      EASY: [10, 20, 30], // Top 3
      MEDIUM: [25, 40, 60],
      HARD: [50, 80, 120]
    }
  }
} as const
