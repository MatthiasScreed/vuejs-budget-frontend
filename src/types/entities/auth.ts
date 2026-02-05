import type { EntityId, DateString, Currency } from '../base'
//import type { UserLevel } from './gaming' // Import depuis gaming

export interface UserLevel {
  id: number
  user_id: number
  level: number
  total_xp: number
  current_level_xp: number
  next_level_xp: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  currency: string
  language: string
  timezone: string

  // ✅ CORRECTION: Assurer que level est toujours défini
  level: UserLevel | null

  // Gaming data optionnelles
  gaming_preferences?: Record<string, any>
  notification_settings?: Record<string, any>
  created_at: string
  updated_at: string
}

// ✅ HELPER: Type guard pour vérifier si user a un level
export function hasLevel(user: User | null): user is User & { level: UserLevel } {
  return user !== null && user.level !== null
}

// ✅ HELPER: Obtenir un level par défaut
export function getDefaultLevel(): UserLevel {
  return {
    id: 0,
    user_id: 0,
    level: 1,
    total_xp: 0,
    current_level_xp: 0,
    next_level_xp: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// ✅ HELPER: Obtenir le level de manière sécurisée
export function getSafeLevel(user: User | null): UserLevel {
  return user?.level || getDefaultLevel()
}

// ✅ Props validation pour composants Vue
export interface LevelProps {
  level: number
  xp?: number
  maxXP?: number
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// ✅ Validation runtime pour les props
export function validateLevelProps(props: any): LevelProps {
  return {
    level: typeof props.level === 'number' ? props.level : 1,
    xp: typeof props.xp === 'number' ? props.xp : 0,
    maxXP: typeof props.maxXP === 'number' ? props.maxXP : 100,
    animated: Boolean(props.animated),
    size: ['sm', 'md', 'lg'].includes(props.size) ? props.size : 'md'
  }
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  terms_accepted: boolean
  currency?: Currency
  language?: string
  timezone?: string
}

export interface AuthResponse {
  user: User
  token: string
  token_type: string
  expires_at?: DateString
}
