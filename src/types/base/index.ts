export type EntityId = string | number
export type DateString = string
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD'

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
  has_more_pages: boolean
}

export interface ValidationErrors {
  [key: string]: string[]
}

export interface FormState {
  loading: boolean
  errors: ValidationErrors
  success: boolean
}

