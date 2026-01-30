// src/stores/projectStore.ts - VERSION CORRIGÉE AVEC AUTH GUARD
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { projectService } from '@/services/projectService'
import type {
  ProjectTemplate,
  UserProject,
  ProjectMilestone,
  CreateProjectData,
  UpdateProjectData,
} from '@/types/entities/project'
import type { ApiResponse } from '@/types/base'

export const useProjectStore = defineStore('project', () => {
  // ==========================================
  // STATE
  // ==========================================

  const templates = ref<ProjectTemplate[]>([])
  const userProjects = ref<UserProject[]>([])
  const currentProject = ref<UserProject | null>(null)
  const currentTemplate = ref<ProjectTemplate | null>(null)

  // États de chargement
  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)

  // Erreurs
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // Templates par défaut
  const defaultTemplates = ref<ProjectTemplate[]>([
    {
      id: 'travel',
      name: 'Voyage',
      description: 'Planifier et budgétiser un voyage',
      icon: '🧳',
      category: 'voyage',
      estimated_cost: 2000,
      duration_months: 6,
      difficulty: 'medium',
      popularity: 95,
      categories: [
        { name: 'Transport', icon: '✈️', estimated_percentage: 40 },
        { name: 'Hébergement', icon: '🏨', estimated_percentage: 35 },
        { name: 'Restauration', icon: '🍽️', estimated_percentage: 15 },
        { name: 'Activités', icon: '🎪', estimated_percentage: 10 },
      ],
      milestones: [
        { name: 'Réservation transport', percentage: 40, estimated_month: 2 },
        { name: 'Réservation hébergement', percentage: 70, estimated_month: 4 },
        { name: 'Budget activités', percentage: 90, estimated_month: 5 },
        { name: 'Finalisation', percentage: 100, estimated_month: 6 },
      ],
      tags: ['voyage', 'loisirs', 'économies'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'real_estate',
      name: 'Achat Immobilier',
      description: "Préparer l'achat d'un bien immobilier",
      icon: '🏠',
      category: 'immobilier',
      estimated_cost: 50000,
      duration_months: 24,
      difficulty: 'hard',
      popularity: 85,
      categories: [
        { name: 'Apport personnel', icon: '💰', estimated_percentage: 60 },
        { name: 'Frais de notaire', icon: '📋', estimated_percentage: 15 },
        { name: "Frais d'agence", icon: '🏢', estimated_percentage: 10 },
        { name: 'Travaux/Équipement', icon: '🔨', estimated_percentage: 15 },
      ],
      milestones: [
        { name: 'Constitution apport', percentage: 60, estimated_month: 18 },
        { name: 'Recherche bien', percentage: 80, estimated_month: 20 },
        { name: 'Négociation', percentage: 90, estimated_month: 22 },
        { name: 'Finalisation achat', percentage: 100, estimated_month: 24 },
      ],
      tags: ['immobilier', 'investissement', 'long-terme'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'car_purchase',
      name: 'Achat Voiture',
      description: 'Économiser pour acheter une voiture',
      icon: '🚗',
      category: 'transport',
      estimated_cost: 15000,
      duration_months: 12,
      difficulty: 'medium',
      popularity: 78,
      categories: [
        { name: 'Prix véhicule', icon: '🚗', estimated_percentage: 75 },
        { name: 'Assurance', icon: '🛡️', estimated_percentage: 10 },
        { name: 'Équipements', icon: '🔧', estimated_percentage: 10 },
        { name: 'Frais annexes', icon: '📄', estimated_percentage: 5 },
      ],
      milestones: [
        { name: 'Budget défini', percentage: 25, estimated_month: 3 },
        { name: '50% économisé', percentage: 50, estimated_month: 6 },
        { name: '75% économisé', percentage: 75, estimated_month: 9 },
        { name: 'Achat réalisé', percentage: 100, estimated_month: 12 },
      ],
      tags: ['transport', 'véhicule', 'économies'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'emergency_fund',
      name: "Fonds d'Urgence",
      description: "Constituer une réserve d'urgence de 3-6 mois de charges",
      icon: '🛡️',
      category: 'sécurité',
      estimated_cost: 8000,
      duration_months: 18,
      difficulty: 'easy',
      popularity: 92,
      categories: [{ name: 'Épargne mensuelle', icon: '💰', estimated_percentage: 100 }],
      milestones: [
        { name: '1 mois de charges', percentage: 25, estimated_month: 4 },
        { name: '3 mois de charges', percentage: 50, estimated_month: 9 },
        { name: '6 mois de charges', percentage: 100, estimated_month: 18 },
      ],
      tags: ['urgence', 'sécurité', 'épargne'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'wedding',
      name: 'Mariage',
      description: 'Organiser et financer son mariage',
      icon: '💍',
      category: 'événement',
      estimated_cost: 25000,
      duration_months: 18,
      difficulty: 'hard',
      popularity: 67,
      categories: [
        { name: 'Lieu & Réception', icon: '🏛️', estimated_percentage: 45 },
        { name: 'Traiteur', icon: '🍽️', estimated_percentage: 25 },
        { name: 'Décoration & Fleurs', icon: '💐', estimated_percentage: 15 },
        { name: 'Photos & Vidéo', icon: '📸', estimated_percentage: 10 },
        { name: 'Divers', icon: '💎', estimated_percentage: 5 },
      ],
      milestones: [
        { name: 'Réservation lieu', percentage: 30, estimated_month: 6 },
        { name: 'Prestataires confirmés', percentage: 60, estimated_month: 12 },
        { name: 'Finalisation détails', percentage: 90, estimated_month: 16 },
        { name: 'J-Day ready', percentage: 100, estimated_month: 18 },
      ],
      tags: ['mariage', 'événement', 'célébration'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  // ==========================================
  // 🔐 AUTH GUARD HELPER
  // ==========================================

  /**
   * Vérifier que l'utilisateur est authentifié avant un appel API
   */
  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    // 1️⃣ Attendre l'initialisation de l'auth
    if (!authStore.isInitialized) {
      console.log('⏳ [Projects] Attente initialisation auth...')

      let attempts = 0
      const maxAttempts = 30 // 3 secondes max

      while (!authStore.isInitialized && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }

      if (!authStore.isInitialized) {
        console.error('❌ [Projects] Auth non initialisée après timeout')
        return false
      }
    }

    // 2️⃣ Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ [Projects] Utilisateur non authentifié')
      return false
    }

    return true
  }

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Templates par catégorie
   */
  const templatesByCategory = computed(() => {
    const grouped = new Map<string, ProjectTemplate[]>()

    templates.value.forEach((template) => {
      if (!grouped.has(template.category)) {
        grouped.set(template.category, [])
      }
      grouped.get(template.category)!.push(template)
    })

    return Array.from(grouped.entries()).map(([category, templates]) => ({
      category,
      templates: templates.sort((a, b) => b.popularity - a.popularity),
    }))
  })

  /**
   * Templates populaires
   */
  const popularTemplates = computed(() =>
    templates.value.sort((a, b) => b.popularity - a.popularity).slice(0, 6),
  )

  /**
   * Projets actifs
   */
  const activeProjects = computed(() => userProjects.value.filter((p) => p.status === 'active'))

  /**
   * Projets terminés
   */
  const completedProjects = computed(() =>
    userProjects.value.filter((p) => p.status === 'completed'),
  )

  /**
   * Projets en pause
   */
  const pausedProjects = computed(() => userProjects.value.filter((p) => p.status === 'paused'))

  /**
   * Progression globale des projets
   */
  const overallProgress = computed(() => {
    if (activeProjects.value.length === 0) return 0

    const totalProgress = activeProjects.value.reduce((sum, project) => {
      return sum + (project.progress_percentage || 0)
    }, 0)

    return Math.round(totalProgress / activeProjects.value.length)
  })

  /**
   * Projets nécessitant attention
   */
  const projectsNeedingAttention = computed(() =>
    activeProjects.value.filter((project) => {
      // Projets en retard ou avec des milestones manqués
      const nextMilestone = project.milestones?.find((m) => !m.completed)
      if (!nextMilestone) return false

      const now = new Date()
      const milestoneDate = new Date(nextMilestone.target_date)
      return milestoneDate <= now
    }),
  )

  /**
   * Statistiques des projets
   */
  const projectStats = computed(() => {
    const total = userProjects.value.length
    const active = activeProjects.value.length
    const completed = completedProjects.value.length
    const paused = pausedProjects.value.length

    const totalBudget = userProjects.value.reduce((sum, p) => sum + p.target_amount, 0)
    const totalSaved = userProjects.value.reduce((sum, p) => sum + p.current_amount, 0)

    return {
      total,
      active,
      completed,
      paused,
      totalBudget,
      totalSaved,
      overallProgress: overallProgress.value,
      needingAttention: projectsNeedingAttention.value.length,
    }
  })

  // ==========================================
  // ACTIONS - AVEC AUTH GUARD
  // ==========================================

  /**
   * Charger les templates disponibles
   * 🔐 Protégé par auth guard
   */
  async function fetchTemplates(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] fetchTemplates annulé - utilisateur non authentifié')
      // Fallback sur templates par défaut
      templates.value = defaultTemplates.value
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('📚 [Projects] Chargement des templates...')

      const response = await projectService.getTemplates()

      if (response.success) {
        templates.value = response.data
        console.log('✅ [Projects] Templates chargés:', templates.value.length)
      } else {
        // Fallback sur les templates par défaut
        templates.value = defaultTemplates.value
      }
    } catch (err: any) {
      console.error('❌ [Projects] Erreur fetchTemplates:', err)
      templates.value = defaultTemplates.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les projets de l'utilisateur
   * 🔐 Protégé par auth guard
   */
  async function fetchUserProjects(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] fetchUserProjects annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return
    }

    if (loading.value) {
      console.log('⏳ [Projects] Chargement déjà en cours, ignoré')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('📁 [Projects] Chargement des projets utilisateur...')

      const response = await projectService.getUserProjects()

      if (response.success) {
        userProjects.value = response.data
        console.log('✅ [Projects] Projets chargés:', userProjects.value.length)
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des projets')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des projets'
      console.error('❌ [Projects] Erreur fetchUserProjects:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer un projet depuis un template
   * 🔐 Protégé par auth guard
   */
  async function createProjectFromTemplate(
    templateId: string,
    customizations: Partial<CreateProjectData>,
  ): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] createProjectFromTemplate annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('📝 [Projects] Création projet depuis template:', templateId)

      const response = await projectService.createFromTemplate(templateId, customizations)

      if (response.success) {
        userProjects.value.push(response.data)
        console.log('✅ [Projects] Projet créé depuis template')
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la création du projet')
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }
      error.value = err.message || 'Erreur lors de la création du projet'
      console.error('❌ [Projects] Erreur createProjectFromTemplate:', err)
      return false
    } finally {
      creating.value = false
    }
  }

  /**
   * Créer un projet personnalisé
   * 🔐 Protégé par auth guard
   */
  async function createCustomProject(data: CreateProjectData): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] createCustomProject annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('📝 [Projects] Création projet personnalisé')

      const response = await projectService.createProject(data)

      if (response.success) {
        userProjects.value.push(response.data)
        console.log('✅ [Projects] Projet personnalisé créé')
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la création')
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }
      error.value = err.message || 'Erreur lors de la création du projet'
      console.error('❌ [Projects] Erreur createCustomProject:', err)
      return false
    } finally {
      creating.value = false
    }
  }

  /**
   * Mettre à jour un projet
   * 🔐 Protégé par auth guard
   */
  async function updateProject(id: number, data: UpdateProjectData): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] updateProject annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('✏️ [Projects] Mise à jour projet:', id)

      const response = await projectService.updateProject(id, data)

      if (response.success) {
        const index = userProjects.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          userProjects.value[index] = response.data
        }

        if (currentProject.value?.id === id) {
          currentProject.value = response.data
        }

        console.log('✅ [Projects] Projet mis à jour')
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour')
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }
      error.value = err.message || 'Erreur lors de la mise à jour du projet'
      console.error('❌ [Projects] Erreur updateProject:', err)
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * Supprimer un projet
   * 🔐 Protégé par auth guard
   */
  async function deleteProject(id: number): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] deleteProject annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    deleting.value = true
    error.value = null

    try {
      console.log('🗑️ [Projects] Suppression projet:', id)

      const response = await projectService.deleteProject(id)

      if (response.success) {
        userProjects.value = userProjects.value.filter((p) => p.id !== id)

        if (currentProject.value?.id === id) {
          currentProject.value = null
        }

        console.log('✅ [Projects] Projet supprimé')
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du projet'
      console.error('❌ [Projects] Erreur deleteProject:', err)
      return false
    } finally {
      deleting.value = false
    }
  }

  /**
   * Marquer un milestone comme terminé
   * 🔐 Protégé par auth guard
   */
  async function completeMilestone(projectId: number, milestoneId: number): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] completeMilestone annulé - utilisateur non authentifié')
      return false
    }

    try {
      console.log('✅ [Projects] Validation milestone:', { projectId, milestoneId })

      const response = await projectService.completeMilestone(projectId, milestoneId)

      if (response.success) {
        // Mettre à jour le projet local
        const project = userProjects.value.find((p) => p.id === projectId)
        if (project && project.milestones) {
          const milestone = project.milestones.find((m) => m.id === milestoneId)
          if (milestone) {
            milestone.completed = true
            milestone.completed_at = new Date().toISOString()

            // Recalculer la progression
            const completedMilestones = project.milestones.filter((m) => m.completed).length
            project.progress_percentage = Math.round(
              (completedMilestones / project.milestones.length) * 100,
            )

            // Vérifier si le projet est terminé
            if (project.progress_percentage >= 100) {
              project.status = 'completed'
              project.completed_at = new Date().toISOString()
            }
          }
        }

        console.log('✅ [Projects] Milestone validé')
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la validation du milestone')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la validation du milestone'
      console.error('❌ [Projects] Erreur completeMilestone:', err)
      return false
    }
  }

  /**
   * Ajouter une contribution à un projet
   * 🔐 Protégé par auth guard
   */
  async function addContribution(
    projectId: number,
    amount: number,
    description?: string,
  ): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] addContribution annulé - utilisateur non authentifié')
      return false
    }

    try {
      console.log('💰 [Projects] Ajout contribution:', { projectId, amount })

      const response = await projectService.addContribution(projectId, {
        amount,
        description,
      })

      if (response.success) {
        // Mettre à jour le montant du projet
        const project = userProjects.value.find((p) => p.id === projectId)
        if (project) {
          project.current_amount += amount
          project.progress_percentage = Math.round(
            (project.current_amount / project.target_amount) * 100,
          )

          // Vérifier si le projet est terminé
          if (project.current_amount >= project.target_amount) {
            project.status = 'completed'
            project.completed_at = new Date().toISOString()
          }
        }

        console.log('✅ [Projects] Contribution ajoutée')
        return true
      } else {
        throw new Error(response.message || "Erreur lors de l'ajout de la contribution")
      }
    } catch (err: any) {
      error.value = err.message || "Erreur lors de l'ajout de la contribution"
      console.error('❌ [Projects] Erreur addContribution:', err)
      return false
    }
  }

  /**
   * Rechercher des templates
   */
  function searchTemplates(query: string): ProjectTemplate[] {
    const lowerQuery = query.toLowerCase()
    return templates.value.filter(
      (template) =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  /**
   * Filtrer les templates par difficulté
   */
  function filterTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): ProjectTemplate[] {
    return templates.value.filter((template) => template.difficulty === difficulty)
  }

  /**
   * Filtrer les templates par budget
   */
  function filterTemplatesByBudget(maxBudget: number): ProjectTemplate[] {
    return templates.value.filter((template) => template.estimated_cost <= maxBudget)
  }

  /**
   * Obtenir un template par ID
   */
  function getTemplateById(id: string): ProjectTemplate | null {
    return templates.value.find((t) => t.id === id) || null
  }

  /**
   * Obtenir un projet par ID
   */
  function getProjectById(id: number): UserProject | null {
    return userProjects.value.find((p) => p.id === id) || null
  }

  /**
   * Calculer le temps estimé pour terminer un projet
   */
  function calculateEstimatedCompletion(project: UserProject): number | null {
    if (project.status !== 'active') return null

    const remaining = project.target_amount - project.current_amount
    const monthlyContributions = project.monthly_target || 0

    if (monthlyContributions <= 0) return null

    return Math.ceil(remaining / monthlyContributions)
  }

  /**
   * Obtenir les recommandations de templates
   */
  function getRecommendedTemplates(
    userBudget?: number,
    userPreferences?: string[],
  ): ProjectTemplate[] {
    let recommended = [...templates.value]

    // Filtrer par budget si fourni
    if (userBudget) {
      recommended = recommended.filter((t) => t.estimated_cost <= userBudget * 1.2) // 20% de marge
    }

    // Filtrer par préférences si fournies
    if (userPreferences && userPreferences.length > 0) {
      recommended = recommended.filter((t) => t.tags.some((tag) => userPreferences.includes(tag)))
    }

    // Trier par popularité
    return recommended.sort((a, b) => b.popularity - a.popularity).slice(0, 8)
  }

  /**
   * Initialiser avec les templates par défaut
   */
  async function initializeDefaults(): Promise<void> {
    if (templates.value.length === 0) {
      templates.value = defaultTemplates.value
    }
  }

  /**
   * Nettoyer les erreurs
   */
  function clearErrors(): void {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Charger toutes les données
   * 🔐 Protégé par auth guard
   */
  async function loadAll(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Projects] loadAll annulé - utilisateur non authentifié')
      return
    }

    console.log('🔄 [Projects] Chargement complet...')
    await Promise.all([fetchTemplates(), fetchUserProjects()])
    console.log('✅ [Projects] Chargement complet terminé')
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    templates.value = []
    userProjects.value = []
    currentProject.value = null
    currentTemplate.value = null
    loading.value = false
    creating.value = false
    updating.value = false
    deleting.value = false
    error.value = null
    validationErrors.value = {}
    console.log('🔄 [Projects] Store réinitialisé')
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    templates,
    userProjects,
    currentProject,
    currentTemplate,
    loading,
    creating,
    updating,
    deleting,
    error,
    validationErrors,
    defaultTemplates,

    // Getters
    templatesByCategory,
    popularTemplates,
    activeProjects,
    completedProjects,
    pausedProjects,
    overallProgress,
    projectsNeedingAttention,
    projectStats,

    // Actions
    fetchTemplates,
    fetchUserProjects,
    createProjectFromTemplate,
    createCustomProject,
    updateProject,
    deleteProject,
    completeMilestone,
    addContribution,
    searchTemplates,
    filterTemplatesByDifficulty,
    filterTemplatesByBudget,
    getTemplateById,
    getProjectById,
    calculateEstimatedCompletion,
    getRecommendedTemplates,
    initializeDefaults,
    clearErrors,
    loadAll,
    $reset,
  }
})
