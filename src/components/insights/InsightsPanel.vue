<!-- src/components/insights/InsightsPanel.vue -->
<template>
  <div class="space-y-6">
    <!-- ==========================================
         HEADER : Titre + Actions + Badge
         ========================================== -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center"
        >
          <LightBulbIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Insights Financiers</h2>
          <p class="text-sm text-gray-500">Recommandations personnalisées</p>
        </div>
        <!-- Badge non-lus -->
        <span
          v-if="hasUnread"
          class="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full"
        >
          {{ badgeText }}
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Marquer tout comme lu -->
        <button
          v-if="hasUnread"
          @click="handleMarkAllRead"
          class="text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          Tout marquer lu
        </button>

        <!-- Générer -->
        <button
          @click="handleGenerate"
          :disabled="generating"
          class="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': generating }" />
          <span>{{ generating ? 'Analyse...' : 'Analyser' }}</span>
        </button>
      </div>
    </div>

    <!-- ==========================================
         RÉSUMÉ ÉCONOMIES POTENTIELLES
         ========================================== -->
    <div
      v-if="totalPotentialSaving > 0"
      class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <CurrencyEuroIcon class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-sm font-medium text-green-800">Économies potentielles détectées</p>
            <p class="text-xs text-green-600">Basé sur {{ insights.length }} insight(s) actif(s)</p>
          </div>
        </div>
        <span class="text-xl font-bold text-green-700">
          {{ formatCurrency(totalPotentialSaving) }}/an
        </span>
      </div>
    </div>

    <!-- ==========================================
         FILTRES PAR TYPE
         ========================================== -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="filter in typeFilters"
        :key="filter.value"
        @click="handleFilterType(filter.value)"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200"
        :class="
          activeFilter === filter.value
            ? 'bg-blue-100 border-blue-300 text-blue-700'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        "
      >
        {{ filter.icon }} {{ filter.label }}
        <span v-if="getTypeCount(filter.value)" class="ml-1 text-xs opacity-70">
          ({{ getTypeCount(filter.value) }})
        </span>
      </button>
    </div>

    <!-- ==========================================
         LOADING STATE
         ========================================== -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-white border border-gray-200 rounded-xl p-5 animate-pulse"
      >
        <div class="flex items-start space-x-4">
          <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==========================================
         ÉTAT VIDE
         ========================================== -->
    <div
      v-else-if="insights.length === 0"
      class="bg-white border border-gray-200 rounded-xl p-8 text-center"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SparklesIcon class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-base font-medium text-gray-900 mb-1">Aucun insight pour le moment</h3>
      <p class="text-sm text-gray-500 mb-4">
        Cliquez sur "Analyser" pour générer des recommandations basées sur vos transactions.
      </p>
      <button
        @click="handleGenerate"
        :disabled="generating"
        class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Lancer l'analyse
      </button>
    </div>

    <!-- ==========================================
         LISTE DES INSIGHTS
         ========================================== -->
    <TransitionGroup v-else name="insight-list" tag="div" class="space-y-3">
      <div
        v-for="insight in insights"
        :key="insight.id"
        class="group bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-md"
        :class="[
          !insight.is_read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200',
          insight.acted_at ? 'opacity-70' : '',
        ]"
        @click="handleRead(insight)"
      >
        <div class="flex items-start space-x-4">
          <!-- Icône insight -->
          <div
            class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            :class="getPriorityBgClass(insight.priority)"
          >
            {{ insight.icon || getDefaultIcon(insight.type) }}
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <h4
                  class="text-sm font-medium text-gray-900"
                  :class="{ 'font-semibold': !insight.is_read }"
                >
                  {{ insight.title }}
                </h4>
                <!-- Dot non-lu -->
                <span
                  v-if="!insight.is_read"
                  class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                ></span>
              </div>

              <!-- Priority badge -->
              <span
                class="flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-medium rounded-full"
                :class="getPriorityLabelClass(insight.priority)"
              >
                {{ getPriorityLabel(insight.priority) }}
              </span>
            </div>

            <p class="mt-1 text-sm text-gray-600 leading-relaxed">
              {{ insight.description }}
            </p>

            <!-- Économie potentielle -->
            <div
              v-if="insight.potential_saving"
              class="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg"
            >
              <CurrencyEuroIcon class="w-3.5 h-3.5 text-green-600" />
              <span class="text-xs font-medium text-green-700">
                {{ formatCurrency(insight.potential_saving) }}/an d'économie
              </span>
            </div>

            <!-- Impact objectifs -->
            <div
              v-if="insight.goal_impact && insight.goal_impact.length > 0"
              class="mt-2 space-y-1"
            >
              <div
                v-for="(impact, idx) in insight.goal_impact.slice(0, 2)"
                :key="idx"
                class="flex items-center space-x-1.5 text-xs text-blue-600"
              >
                <ChartBarIcon class="w-3.5 h-3.5" />
                <span> {{ impact.goal_name }} : {{ impact.months_saved }} mois gagnés </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-3 flex items-center space-x-2">
              <!-- Bouton action principale -->
              <button
                v-if="insight.action_label && !insight.acted_at"
                @click.stop="handleAction(insight)"
                class="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BoltIcon class="w-3.5 h-3.5" />
                <span>{{ insight.action_label }}</span>
              </button>

              <!-- Badge XP si action effectuée -->
              <span
                v-if="insight.acted_at"
                class="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-lg"
              >
                <CheckCircleIcon class="w-3.5 h-3.5" />
                <span>Action effectuée · +15 XP</span>
              </span>

              <!-- Rejeter -->
              <button
                v-if="!insight.acted_at"
                @click.stop="handleDismiss(insight.id)"
                class="px-2 py-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                Ignorer
              </button>

              <!-- Date -->
              <span class="ml-auto text-xs text-gray-400">
                {{ formatDate(insight.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- ==========================================
         PAGINATION
         ========================================== -->
    <div v-if="lastPage > 1" class="flex items-center justify-center space-x-2 pt-2">
      <button
        v-for="page in lastPage"
        :key="page"
        @click="goToPage(page)"
        class="w-8 h-8 text-sm font-medium rounded-lg transition-colors"
        :class="
          currentPage === page
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
        "
      >
        {{ page }}
      </button>
    </div>

    <!-- ==========================================
         XP TOAST (affiché après action)
         ========================================== -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="showXpToast"
        class="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl shadow-lg"
      >
        <SparklesIcon class="w-5 h-5 text-yellow-300" />
        <span class="text-sm font-medium">+{{ lastXpEarned }} XP</span>
        <span class="text-xs text-purple-200">Insight appliqué !</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInsights } from '@/composables/useInsights'
import {
  LightBulbIcon,
  ArrowPathIcon,
  CurrencyEuroIcon,
  SparklesIcon,
  ChartBarIcon,
  BoltIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

// ==========================================
// COMPOSABLE
// ==========================================

const {
  insights,
  summary,
  loading,
  generating,
  hasUnread,
  badgeText,
  totalPotentialSaving,
  currentPage,
  lastPage,
  generate,
  markAsRead,
  markAllAsRead,
  handleInsightAction,
  dismiss,
  filterByType,
  goToPage,
  getTypeLabel,
} = useInsights()

// ==========================================
// STATE LOCAL
// ==========================================

const activeFilter = ref<string | undefined>(undefined)
const showXpToast = ref(false)
const lastXpEarned = ref(0)

// ==========================================
// FILTRES
// ==========================================

const typeFilters = [
  { value: undefined, label: 'Tous', icon: '📋' },
  { value: 'cost_reduction', label: 'Coûts', icon: '💳' },
  { value: 'savings_opportunity', label: 'Épargne', icon: '💰' },
  { value: 'unusual_spending', label: 'Alertes', icon: '⚠️' },
  { value: 'goal_acceleration', label: 'Objectifs', icon: '🎯' },
  { value: 'behavioral_pattern', label: 'Habitudes', icon: '📊' },
]

// ==========================================
// COMPUTED
// ==========================================

/**
 * Compteur par type depuis le summary
 */
function getTypeCount(type: string | undefined): number | undefined {
  if (!type || !summary.value) return undefined
  return summary.value.by_type[type]
}

// ==========================================
// HANDLERS
// ==========================================

/**
 * Filtrer par type
 */
async function handleFilterType(type: string | undefined): Promise<void> {
  activeFilter.value = type
  await filterByType(type)
}

/**
 * Générer de nouveaux insights
 */
async function handleGenerate(): Promise<void> {
  await generate()
}

/**
 * Marquer tout comme lu
 */
async function handleMarkAllRead(): Promise<void> {
  await markAllAsRead()
}

/**
 * Marquer un insight comme lu au clic
 */
async function handleRead(insight: any): Promise<void> {
  if (!insight.is_read) {
    await markAsRead(insight.id)
  }
}

/**
 * Exécuter l'action sur un insight
 */
async function handleAction(insight: any): Promise<void> {
  const result = await handleInsightAction(insight.id)

  if (result?.gaming?.xp_earned) {
    lastXpEarned.value = result.gaming.xp_earned
    showXpToast.value = true
    setTimeout(() => {
      showXpToast.value = false
    }, 3000)
  }
}

/**
 * Rejeter un insight
 */
async function handleDismiss(id: number): Promise<void> {
  await dismiss(id)
}

// ==========================================
// HELPERS UI
// ==========================================

/**
 * Classe de fond selon la priorité
 */
function getPriorityBgClass(priority: number): string {
  const classes: Record<number, string> = {
    1: 'bg-red-100',
    2: 'bg-amber-100',
    3: 'bg-blue-100',
  }
  return classes[priority] ?? 'bg-gray-100'
}

/**
 * Classe du label de priorité
 */
function getPriorityLabelClass(priority: number): string {
  const classes: Record<number, string> = {
    1: 'bg-red-100 text-red-700',
    2: 'bg-amber-100 text-amber-700',
    3: 'bg-blue-100 text-blue-700',
  }
  return classes[priority] ?? 'bg-gray-100 text-gray-700'
}

/**
 * Label de priorité
 */
function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: 'Urgent',
    2: 'Important',
    3: 'Info',
  }
  return labels[priority] ?? 'Info'
}

/**
 * Icône par défaut selon le type
 */
function getDefaultIcon(type: string): string {
  const icons: Record<string, string> = {
    cost_reduction: '💳',
    savings_opportunity: '💰',
    unusual_spending: '⚠️',
    goal_acceleration: '🎯',
    behavioral_pattern: '📊',
  }
  return icons[type] ?? '💡'
}

/**
 * Formater un montant en euros
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formater une date relative
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffH < 1) return "À l'instant"
  if (diffH < 24) return `Il y a ${diffH}h`
  if (diffD < 7) return `Il y a ${diffD}j`

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}
</script>

<style scoped>
/* ==========================================
   ANIMATIONS LISTE
   ========================================== */
.insight-list-enter-active {
  transition: all 0.3s ease-out;
}

.insight-list-leave-active {
  transition: all 0.2s ease-in;
}

.insight-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.insight-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.insight-list-move {
  transition: transform 0.3s ease;
}
</style>
