import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  estimated_cost: { min: number; max: number }
  duration_months: number
  categories: ProjectCategory[]
  milestones: ProjectMilestone[]
}

interface ProjectCategory {
  name: string
  icon: string
  color: string
  percentage: number
  estimated_amount: number
  required: boolean
}

interface ProjectMilestone {
  name: string
  description: string
  target_date_offset: number // jours depuis début projet
  target_amount: number
  completion_criteria: string
}

interface UserProject {
  id: number
  template_id: string
  name: string
  target_amount: number
  current_amount: number
  start_date: string
  target_date: string
  status: 'planning' | 'active' | 'completed' | 'paused'
  categories: ProjectCategory[]
  milestones: ProjectMilestone[]
}

/**
 * Composable pour gestion des projets avec templates
 * Voyage, immobilier, voiture, événements, etc.
 */
export function useProjects() {
  const { get, post, put, delete: del } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()

  // State
  const templates = ref<ProjectTemplate[]>([])
  const userProjects = ref<UserProject[]>([])
  const currentProject = ref<UserProject | null>(null)
  const loading = ref(false)

  /**
   * Charger tous les templates disponibles
   */
  async function loadTemplates(): Promise<void> {
    loading.value = true

    try {
      templates.value = await remember(
        'project_templates',
        async () => {
          const response = await get<ProjectTemplate[]>('/projects/templates')
          return response.data || getDefaultTemplates()
        },
        60 * 60 * 1000, // 1 heure (change rarement)
        ['projects', 'templates']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadTemplates')
      templates.value = getDefaultTemplates()
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les projets utilisateur
   */
  async function loadUserProjects(): Promise<void> {
    try {
      userProjects.value = await remember(
        'user_projects',
        async () => {
          const response = await get<UserProject[]>('/projects')
          return response.data || []
        },
        5 * 60 * 1000, // 5 minutes
        ['projects', 'user']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadUserProjects')
    }
  }

  /**
   * Créer un projet depuis un template
   */
  async function createProjectFromTemplate(
    templateId: string,
    customization: {
      name: string
      target_amount: number
      target_date: string
      custom_categories?: Partial<ProjectCategory>[]
    }
  ): Promise<boolean> {
    try {
      const response = await post<UserProject>('/projects', {
        template_id: templateId,
        ...customization
      })

      if (response.success && response.data) {
        userProjects.value.unshift(response.data)
        invalidateProjectCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'createProjectFromTemplate')
      return false
    }
  }

  /**
   * Mettre à jour un projet
   */
  async function updateProject(id: number, data: Partial<UserProject>): Promise<boolean> {
    try {
      const response = await put<UserProject>(`/projects/${id}`, data)

      if (response.success && response.data) {
        updateProjectInList(response.data)
        invalidateProjectCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'updateProject')
      return false
    }
  }

  /**
   * Calculer la progression d'un projet
   */
  function calculateProjectProgress(project: UserProject): number {
    if (project.target_amount <= 0) return 0

    const progress = (project.current_amount / project.target_amount) * 100
    return Math.min(100, Math.round(progress))
  }

  /**
   * Obtenir le template par ID
   */
  function getTemplate(templateId: string): ProjectTemplate | undefined {
    return templates.value.find(t => t.id === templateId)
  }

  /**
   * Personnaliser un template avec montant
   */
  function customizeTemplate(templateId: string, targetAmount: number): ProjectTemplate | null {
    const template = getTemplate(templateId)

    if (!template) return null

    const customized = { ...template }

    // Recalculer les montants par catégorie
    customized.categories = template.categories.map(cat => ({
      ...cat,
      estimated_amount: Math.round((targetAmount * cat.percentage) / 100)
    }))

    return customized
  }

  /**
   * Vérifier si un projet est en retard
   */
  function isProjectOverdue(project: UserProject): boolean {
    const targetDate = new Date(project.target_date)
    const now = new Date()

    return now > targetDate && project.status !== 'completed'
  }

  /**
   * Calculer le montant à épargner par mois
   */
  function calculateMonthlySavings(project: UserProject): number {
    const remaining = project.target_amount - project.current_amount
    const startDate = new Date(project.start_date)
    const targetDate = new Date(project.target_date)

    const monthsRemaining = Math.max(1,
      Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    )

    return Math.round(remaining / monthsRemaining)
  }

  /**
   * Obtenir les templates par défaut
   */
  function getDefaultTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'travel',
        name: '🧳 Voyage',
        description: 'Planifier et budgéter un voyage',
        icon: '✈️',
        estimated_cost: { min: 500, max: 5000 },
        duration_months: 6,
        categories: [
          { name: 'Transport', icon: '🚗', color: '#3B82F6', percentage: 40, estimated_amount: 0, required: true },
          { name: 'Hébergement', icon: '🏨', color: '#10B981', percentage: 35, estimated_amount: 0, required: true },
          { name: 'Activités', icon: '🎯', color: '#F59E0B', percentage: 15, estimated_amount: 0, required: false },
          { name: 'Nourriture', icon: '🍽️', color: '#EF4444', percentage: 10, estimated_amount: 0, required: true }
        ],
        milestones: [
          { name: 'Réservation transport', description: 'Réserver billets', target_date_offset: 90, target_amount: 0, completion_criteria: 'transport_booked' },
          { name: 'Réservation hébergement', description: 'Réserver logement', target_date_offset: 60, target_amount: 0, completion_criteria: 'accommodation_booked' }
        ]
      },
      {
        id: 'real_estate',
        name: '🏠 Immobilier',
        description: 'Achat immobilier et frais associés',
        icon: '🏡',
        estimated_cost: { min: 10000, max: 100000 },
        duration_months: 24,
        categories: [
          { name: 'Apport', icon: '💰', color: '#059669', percentage: 70, estimated_amount: 0, required: true },
          { name: 'Frais notaire', icon: '📋', color: '#7C3AED', percentage: 8, estimated_amount: 0, required: true },
          { name: 'Frais agence', icon: '🏢', color: '#DC2626', percentage: 5, estimated_amount: 0, required: true },
          { name: 'Travaux', icon: '🔨', color: '#F59E0B', percentage: 15, estimated_amount: 0, required: false },
          { name: 'Équipement', icon: '🛋️', color: '#8B5CF6', percentage: 2, estimated_amount: 0, required: false }
        ],
        milestones: [
          { name: '20% apport', description: 'Premier palier apport', target_date_offset: 180, target_amount: 0, completion_criteria: 'apport_20_percent' },
          { name: 'Dossier bancaire', description: 'Constitution dossier', target_date_offset: 60, target_amount: 0, completion_criteria: 'bank_file_ready' }
        ]
      }
    ]
  }

  /**
   * Mettre à jour un projet dans la liste
   */
  function updateProjectInList(updatedProject: UserProject): void {
    const index = userProjects.value.findIndex(p => p.id === updatedProject.id)

    if (index !== -1) {
      userProjects.value[index] = updatedProject
    }
  }

  /**
   * Invalider les caches projets
   */
  function invalidateProjectCaches(): void {
    invalidateByTag('projects')
    invalidateByTag('goals')
    invalidateByTag('analytics')
  }

  // Computed properties
  const activeProjects = computed(() =>
    userProjects.value.filter(p => p.status === 'active')
  )

  const completedProjects = computed(() =>
    userProjects.value.filter(p => p.status === 'completed')
  )

  const overdueProjects = computed(() =>
    activeProjects.value.filter(p => isProjectOverdue(p))
  )

  const totalProjectValue = computed(() =>
    userProjects.value.reduce((sum, p) => sum + p.target_amount, 0)
  )

  const totalProjectSaved = computed(() =>
    userProjects.value.reduce((sum, p) => sum + p.current_amount, 0)
  )

  return {
    // State
    templates,
    userProjects,
    currentProject,
    loading,

    // Computed
    activeProjects,
    completedProjects,
    overdueProjects,
    totalProjectValue,
    totalProjectSaved,

    // Methods
    loadTemplates,
    loadUserProjects,
    createProjectFromTemplate,
    updateProject,
    calculateProjectProgress,
    getTemplate,
    customizeTemplate,
    isProjectOverdue,
    calculateMonthlySavings
  }
}
