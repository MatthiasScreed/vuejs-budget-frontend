import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import { useFormatting } from '@/composables/ui'

interface ReportConfig {
  period: 'month' | 'quarter' | 'year' | 'custom'
  start_date?: string
  end_date?: string
  categories?: number[]
  include_gaming?: boolean
  format: 'pdf' | 'csv' | 'excel' | 'json'
}

interface FinancialReport {
  period: string
  summary: {
    total_income: number
    total_expenses: number
    net_savings: number
    transaction_count: number
    categories_used: number
  }
  categories: CategoryReport[]
  goals_progress: GoalProgress[]
  gaming_stats?: GamingReport
  trends: TrendData[]
}

interface CategoryReport {
  category_name: string
  budgeted: number
  actual: number
  variance: number
  transaction_count: number
  average_transaction: number
}

interface GoalProgress {
  goal_name: string
  target_amount: number
  current_amount: number
  progress_percent: number
  on_track: boolean
}

interface GamingReport {
  xp_gained: number
  level_progression: number
  achievements_unlocked: number
  streaks_maintained: number
  challenges_completed: number
}

interface TrendData {
  date: string
  income: number
  expenses: number
  balance: number
}

/**
 * Composable pour rapports avancés et exportations
 * Génération PDF, CSV, Excel avec données gaming
 */
export function useReports() {
  const { get, post } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()
  const { formatCurrency, formatDate } = useFormatting()

  // State
  const reports = ref<FinancialReport[]>([])
  const currentReport = ref<FinancialReport | null>(null)
  const loading = ref(false)
  const generatingExport = ref(false)

  /**
   * Générer un rapport financier complet
   */
  async function generateReport(config: ReportConfig): Promise<FinancialReport | null> {
    loading.value = true

    try {
      const cacheKey = `report_${JSON.stringify(config)}`

      const report = await remember(
        cacheKey,
        async () => {
          const response = await post<FinancialReport>('/reports/generate', config)
          return response.data
        },
        10 * 60 * 1000, // 10 minutes
        ['reports', 'analytics']
      )

      if (report) {
        currentReport.value = report
        reports.value.unshift(report)
      }

      return report
    } catch (error: any) {
      await handleApiError(error, 'generateReport')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Exporter un rapport dans un format spécifique
   */
  async function exportReport(
    reportData: FinancialReport,
    format: 'pdf' | 'csv' | 'excel'
  ): Promise<Blob | null> {
    generatingExport.value = true

    try {
      const response = await post('/reports/export', {
        report: reportData,
        format
      }, {
        headers: { 'Accept': 'application/octet-stream' }
      })

      if (response.success) {
        return new Blob([response.data], {
          type: getContentType(format)
        })
      }

      return null
    } catch (error: any) {
      await handleApiError(error, 'exportReport')
      return null
    } finally {
      generatingExport.value = false
    }
  }

  /**
   * Générer rapport mensuel automatique
   */
  async function generateMonthlyReport(): Promise<FinancialReport | null> {
    const config: ReportConfig = {
      period: 'month',
      include_gaming: true,
      format: 'json'
    }

    return generateReport(config)
  }

  /**
   * Comparer deux périodes
   */
  async function comparePeriodsAnalysis(
    period1: { start: string; end: string },
    period2: { start: string; end: string }
  ): Promise<any> {
    return remember(
      `comparison_${period1.start}_${period2.start}`,
      async () => {
        const response = await post('/reports/compare', {
          period1,
          period2
        })
        return response.data
      },
      15 * 60 * 1000, // 15 minutes
      ['reports', 'comparison']
    )
  }

  /**
   * Générer insights avancés IA
   */
  async function generateAdvancedInsights(): Promise<any[]> {
    return remember(
      'advanced_insights',
      async () => {
        const response = await get('/reports/ai-insights')
        return response.data || []
      },
      30 * 60 * 1000, // 30 minutes
      ['reports', 'ai']
    )
  }

  /**
   * Créer un rapport de performance gaming
   */
  async function generateGamingReport(period: string): Promise<GamingReport | null> {
    try {
      const response = await post<GamingReport>('/reports/gaming', { period })
      return response.data || null
    } catch (error: any) {
      await handleApiError(error, 'generateGamingReport')
      return null
    }
  }

  /**
   * Obtenir les templates de rapports
   */
  function getReportTemplates(): Array<{
    id: string
    name: string
    description: string
    config: ReportConfig
  }> {
    return [
      {
        id: 'monthly_overview',
        name: 'Vue mensuelle',
        description: 'Rapport complet du mois en cours',
        config: { period: 'month', include_gaming: true, format: 'pdf' }
      },
      {
        id: 'quarterly_analysis',
        name: 'Analyse trimestrielle',
        description: 'Performance des 3 derniers mois',
        config: { period: 'quarter', include_gaming: true, format: 'excel' }
      },
      {
        id: 'gaming_stats',
        name: 'Statistiques Gaming',
        description: 'Progression XP et achievements',
        config: { period: 'month', include_gaming: true, format: 'pdf' }
      },
      {
        id: 'budget_compliance',
        name: 'Respect des budgets',
        description: 'Analyse du respect des budgets par catégorie',
        config: { period: 'month', include_gaming: false, format: 'csv' }
      }
    ]
  }

  /**
   * Calculer les KPIs principaux
   */
  function calculateKPIs(report: FinancialReport): Record<string, any> {
    const { summary } = report

    return {
      savings_rate: summary.total_income > 0
        ? Math.round((summary.net_savings / summary.total_income) * 100)
        : 0,
      expense_ratio: summary.total_income > 0
        ? Math.round((summary.total_expenses / summary.total_income) * 100)
        : 0,
      avg_transaction: summary.transaction_count > 0
        ? Math.round((summary.total_expenses + summary.total_income) / summary.transaction_count)
        : 0,
      category_diversity: summary.categories_used,
      financial_health: calculateHealthScore(summary)
    }
  }

  /**
   * Calculer le score de santé financière
   */
  function calculateHealthScore(summary: any): number {
    let score = 50 // Base

    // Bonus épargne positive
    if (summary.net_savings > 0) score += 30

    // Bonus diversité des catégories
    if (summary.categories_used >= 5) score += 10

    // Bonus volume de transactions (engagement)
    if (summary.transaction_count >= 20) score += 10

    return Math.min(100, score)
  }

  /**
   * Télécharger un rapport
   */
  async function downloadReport(reportData: FinancialReport, format: 'pdf' | 'csv' | 'excel'): Promise<void> {
    const blob = await exportReport(reportData, format)

    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rapport_${reportData.period}.${format}`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  /**
   * Obtenir le type de contenu pour export
   */
  function getContentType(format: string): string {
    const types = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    return types[format as keyof typeof types] || 'application/octet-stream'
  }

  /**
   * Mettre à jour un rapport dans la liste
   */
  function updateProjectInList(updatedProject: any): void {
    const index = reports.value.findIndex(r => r.period === updatedProject.period)

    if (index !== -1) {
      reports.value[index] = updatedProject
    }
  }

  /**
   * Invalider les caches rapports
   */
  function invalidateReportCaches(): void {
    invalidateByTag('reports')
    invalidateByTag('analytics')
  }

  // Computed properties
  const recentReports = computed(() =>
    reports.value.slice(0, 5)
  )

  const averageSavingsRate = computed(() => {
    if (reports.value.length === 0) return 0

    const rates = reports.value.map(r => {
      const income = r.summary.total_income
      return income > 0 ? (r.summary.net_savings / income) * 100 : 0
    })

    return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length)
  })

  const reportTemplates = computed(() => getReportTemplates())

  return {
    // State
    reports,
    currentReport,
    loading,
    generatingExport,

    // Computed
    recentReports,
    averageSavingsRate,
    reportTemplates,

    // Methods
    generateReport,
    exportReport,
    downloadReport,
    generateMonthlyReport,
    comparePeriodsAnalysis,
    generateAdvancedInsights,
    generateGamingReport,
    calculateKPIs,
    getReportTemplates
  }
}
