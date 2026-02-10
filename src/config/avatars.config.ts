// src/config/avatars.config.ts

/**
 * Configuration des avatars des témoignages
 * École 42: Configuration centralisée
 */
export const TESTIMONIAL_AVATARS = {
  marie: {
    name: 'Marie Dubois',
    // Option 1: DiceBear
    dicebear: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    // Option 2: UI Avatars
    uiAvatar:
      'https://ui-avatars.com/api/?name=Marie+Dubois&size=300&rounded=true&background=667eea&color=fff&bold=true',
    // Option 3: Locale (à ajouter manuellement)
    local: '/images/avatars/marie.jpg',
    // Couleur pour fallback
    color: '#667eea',
  },
  thomas: {
    name: 'Thomas Martin',
    dicebear: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    uiAvatar:
      'https://ui-avatars.com/api/?name=Thomas+Martin&size=300&rounded=true&background=764ba2&color=fff&bold=true',
    local: '/images/avatars/thomas.jpg',
    color: '#764ba2',
  },
  sophie: {
    name: 'Sophie Leroy',
    dicebear: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    uiAvatar:
      'https://ui-avatars.com/api/?name=Sophie+Leroy&size=300&rounded=true&background=f093fb&color=fff&bold=true',
    local: '/images/avatars/sophie.jpg',
    color: '#f093fb',
  },
} as const

export type TestimonialKey = keyof typeof TESTIMONIAL_AVATARS
