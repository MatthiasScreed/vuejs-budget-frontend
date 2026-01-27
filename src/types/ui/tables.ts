// ==========================================
// UI TABLES TYPES - types/ui/tables.ts
// ==========================================

import type { EntityId, DateString } from '../base'

// ==========================================
// TABLE COLUMN CONFIGURATION
// ==========================================

export interface TableColumn<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sticky?: 'left' | 'right'
  hidden?: boolean

  // Formatage et rendu
  format?: (value: any, item: T) => string
  render?: (value: any, item: T, index: number) => any
  renderHeader?: () => any

  // Tri et filtre
  sortKey?: string
  sortCompare?: (a: T, b: T) => number
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean'
  filterOptions?: SelectOption[]

  // Style
  className?: string
  headerClassName?: string
  cellClassName?: string | ((value: any, item: T) => string)
}

export interface SelectOption {
  value: string | number | boolean
  label: string
  icon?: string
  color?: string
  disabled?: boolean
}

// ==========================================
// TABLE PROPS PRINCIPAL
// ==========================================

export interface TableProps<T = any> {
  // Données
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string | null
  empty_message?: string

  // Identifiant unique
  rowKey?: keyof T | ((item: T) => string | number)

  // Pagination
  pagination?: TablePaginationConfig

  // Tri
  sortable?: boolean
  defaultSort?: {
    column: string
    direction: 'asc' | 'desc'
  }
  onSort?: (column: string, direction: 'asc' | 'desc') => void

  // Filtres
  filterable?: boolean
  filters?: Record<string, any>
  onFilter?: (filters: Record<string, any>) => void

  // Sélection
  selectable?: boolean
  selectMode?: 'single' | 'multiple'
  selectedRows?: T[]
  onSelect?: (selectedRows: T[]) => void

  // Actions
  actions?: TableAction<T>[]
  rowActions?: TableRowAction<T>[]
  bulkActions?: TableBulkAction<T>[]

  // Style et comportement
  striped?: boolean
  bordered?: boolean
  hover?: boolean
  compact?: boolean
  sticky_header?: boolean
  max_height?: string
  className?: string

  // Events
  onRowClick?: (item: T, index: number) => void
  onRowDoubleClick?: (item: T, index: number) => void
  onRefresh?: () => void
}

// ==========================================
// PAGINATION
// ==========================================

export interface TablePaginationConfig {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  show_pagination: boolean
  show_size_changer?: boolean
  show_quick_jumper?: boolean
  show_total?: boolean
  page_size_options?: number[]
  onChange?: (page: number, pageSize: number) => void
}

// ==========================================
// ACTIONS
// ==========================================

export interface TableAction<T = any> {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean | ((item: T) => boolean)
  loading?: boolean
  visible?: boolean | ((item: T) => boolean)
  action: (item: T) => void | Promise<void>
  confirm?: {
    title: string
    message: string
    danger?: boolean
  }
}

export interface TableRowAction<T = any> extends TableAction<T> {
  position?: 'start' | 'end'
  dropdown?: boolean
}

export interface TableBulkAction<T = any> {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  action: (selectedItems: T[]) => void | Promise<void>
  confirm?: {
    title: string
    message: (count: number) => string
  }
}

// ==========================================
// TABLE FILTERING
// ==========================================

export interface TableFilter {
  column: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'starts' | 'ends' | 'in' | 'between'
  value: any
  active: boolean
}

export interface FilterConfig {
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean'
  label: string
  placeholder?: string
  options?: SelectOption[]
  multiple?: boolean
  clearable?: boolean
}

// ==========================================
// SPÉCIALISATION POUR ENTITÉS
// ==========================================

export interface TransactionTableProps extends Omit<TableProps<Transaction>, 'columns'> {
  showCategory?: boolean
  showActions?: boolean
  showStatus?: boolean
  showRecurring?: boolean
  groupByDate?: boolean
  highlightToday?: boolean
}

export interface GoalTableProps extends Omit<TableProps<FinancialGoal>, 'columns'> {
  showProgress?: boolean
  showDeadline?: boolean
  showStatus?: boolean
  onContribute?: (goal: FinancialGoal) => void
}

export interface AchievementTableProps extends Omit<TableProps<Achievement>, 'columns'> {
  showProgress?: boolean
  showRarity?: boolean
  showCategory?: boolean
  filterUnlocked?: boolean
  onView?: (achievement: Achievement) => void
}

// ==========================================
// TABLE EXPORT & IMPORT
// ==========================================

export interface TableExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  filename?: string
  columns?: string[]
  include_filters?: boolean
  include_summary?: boolean
}

export interface TableImportConfig {
  format: 'csv' | 'excel' | 'json'
  mapping: Record<string, string>
  validation_rules?: Record<string, any>
  skip_duplicates?: boolean
  dry_run?: boolean
}

// ==========================================
// ADVANCED TABLE FEATURES
// ==========================================

export interface TableGrouping<T = any> {
  column: keyof T
  direction: 'asc' | 'desc'
  show_summary?: boolean
  collapsed_by_default?: boolean
}

export interface TableSummary<T = any> {
  column: keyof T
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom'
  format?: (value: any) => string
  custom_calculate?: (data: T[]) => any
}

export interface VirtualTableProps<T = any> extends TableProps<T> {
  item_height: number
  buffer_size?: number
  overscan?: number
  scroll_to_index?: number
}

// ==========================================
// TABLE STATE MANAGEMENT
// ==========================================

export interface TableState<T = any> {
  data: T[]
  filtered_data: T[]
  selected_rows: T[]
  loading: boolean
  error: string | null
  sort: {
    column: string | null
    direction: 'asc' | 'desc' | null
  }
  filters: Record<string, any>
  pagination: {
    current_page: number
    per_page: number
    total: number
  }
}

export interface TableActions<T = any> {
  setData: (data: T[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSort: (column: string, direction: 'asc' | 'desc') => void
  setFilters: (filters: Record<string, any>) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  selectRow: (row: T) => void
  selectRows: (rows: T[]) => void
  clearSelection: () => void
  refresh: () => void
}
