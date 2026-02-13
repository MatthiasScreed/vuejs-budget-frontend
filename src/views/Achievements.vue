<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">🏆 Succès</h1>
          <p class="text-gray-600 mt-2">Débloquez des achievements et gagnez de l'XP</p>
        </div>

        <button
          @click="forceCheckAchievements"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          :disabled="checking"
        >
          {{ checking ? '🔄 Vérification...' : '🔍 Vérifier les succès' }}
        </button>
      </div>
    </div>

    <!-- Stats globales -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalUnlocked }}</div>
          <div class="text-sm text-gray-600">Débloqués</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.completionRate }}%</div>
          <div class="text-sm text-gray-600">Complétés</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ stats.legendaryCount }}</div>
          <div class="text-sm text-gray-600">Légendaires</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.totalXP }}</div>
          <div class="text-sm text-gray-600">XP Total</div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 Filtres</h3>

      <div class="flex flex-wrap gap-3">
        <button
          v-for="filter in filterOptions"
          :key="filter.value"
          @click="selectedFilter = filter.value"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            selectedFilter === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          "
        >
          {{ filter.icon }} {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Succès récents -->
    <div
      v-if="recentUnlocks.length > 0"
      class="bg-white rounded-xl border border-gray-200 p-4 mb-8"
    >
      <h3 class="text-lg font-semibold text-gray-900 mb-4">✨ Derniers débloqués</h3>

      <div class="flex gap-4 overflow-x-auto pb-2">
        <div
          v-for="unlock in recentUnlocks"
          :key="unlock.id"
          class="flex-shrink-0 w-64 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ unlock.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ unlock.name }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(unlock.unlocked_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Chargement des succès...</p>
    </div>

    <!-- Catégories d'achievements -->
    <div v-else class="space-y-8">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ category.icon }}</span>
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-600">{{ category.achievements.length }} succès</p>
            </div>
          </div>

          <!-- Barre de progression de la catégorie -->
          <div class="text-right">
            <div class="text-sm text-gray-600 mb-1">
              {{ getCompletedCount(category) }}/{{ category.achievements.length }}
            </div>
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: getCategoryProgress(category) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Liste des achievements de la catégorie -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            v-for="achievement in category.achievements"
            :key="achievement.id"
            class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
            :class="{
              'bg-gradient-to-r from-green-50 to-green-100 border-green-200': isUnlocked(
                achievement.id,
              ),
              'bg-white': !isUnlocked(achievement.id),
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <span
                  class="text-3xl transition-all duration-200"
                  :class="{ 'grayscale opacity-50': !isUnlocked(achievement.id) }"
                >
                  {{ achievement.icon }}
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ achievement.name }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ achievement.description }}</p>
                  </div>

                  <!-- Badge de rareté -->
                  <span
                    class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ml-2"
                    :class="getRarityClasses(achievement.rarity)"
                  >
                    {{ getRarityLabel(achievement.rarity) }}
                  </span>
                </div>

                <!-- Progress bar si en cours -->
                <div
                  v-if="!isUnlocked(achievement.id) && getProgress(achievement.id) > 0"
                  class="mb-3"
                >
                  <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{{ getProgress(achievement.id) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      :style="{ width: getProgress(achievement.id) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- Récompenses -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-blue-600 font-medium">+{{ achievement.xp_reward }} XP</span>
                  <span v-if="isUnlocked(achievement.id)" class="text-green-600 font-medium">
                    ✅ Débloqué
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si pas de résultats -->
    <div v-if="!loading && filteredCategories.length === 0" class="text-center py-12">
      <div class="text-4xl mb-4">🎯</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun succès trouvé</h3>
      <p class="text-gray-600">
        Essayez de changer les filtres ou commencez à utiliser l'application !
      </p>
    </div>

    <!-- Message d'état vide -->
    <div v-if="!loading && achievements.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🏆</div>
      <h3 class="text-xl font-medium text-gray-900 mb-2">Vos premiers succès vous attendent !</h3>
      <p class="text-gray-600 mb-6">
        Commencez à utiliser l'application pour débloquer vos premiers achievements
      </p>
      <router-link
        to="/app/transactions"
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        💰 Créer une transaction
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAchievementStore } from '@/stores/achievementStore'
import { useToast } from 'vue-toastification'

const toast = useToast()

// ==========================================
// STORE
// ==========================================

const achievementStore = useAchievementStore()
const { achievements, userProgress, recentUnlocks, categories, loading, checking } =
  storeToRefs(achievementStore)

// ==========================================
// STATE LOCAL
// ==========================================

const selectedFilter = ref('all')

// ==========================================
// OPTIONS DE FILTRES
// ==========================================

const filterOptions = [
  { value: 'all', label: 'Tous', icon: '📋' },
  { value: 'unlocked', label: 'Débloqués', icon: '✅' },
  { value: 'locked', label: 'En cours', icon: '🔒' },
  { value: 'common', label: 'Commun', icon: '⚪' },
  { value: 'rare', label: 'Rare', icon: '🔵' },
  { value: 'epic', label: 'Épique', icon: '🟣' },
  { value: 'legendary', label: 'Légendaire', icon: '🟡' },
]

// ==========================================
// COMPUTED
// ==========================================

const stats = computed(() => ({
  totalUnlocked: achievements.value.filter((a) => isUnlocked(a.id)).length,
  completionRate:
    achievements.value.length > 0
      ? Math.round(
          (achievements.value.filter((a) => isUnlocked(a.id)).length / achievements.value.length) *
            100,
        )
      : 0,
  legendaryCount: achievements.value.filter((a) => a.rarity === 'legendary' && isUnlocked(a.id))
    .length,
  totalXP: achievements.value
    .filter((a) => isUnlocked(a.id))
    .reduce((sum, a) => sum + (a.xp_reward || 0), 0),
}))

const filteredCategories = computed(() => {
  if (!categories.value) return []

  return categories.value
    .map((category) => ({
      ...category,
      achievements: category.achievements.filter((achievement) => {
        // Filtre par état
        if (selectedFilter.value === 'unlocked' && !isUnlocked(achievement.id)) return false
        if (selectedFilter.value === 'locked' && isUnlocked(achievement.id)) return false

        // Filtre par rareté
        if (['common', 'rare', 'epic', 'legendary'].includes(selectedFilter.value)) {
          if (achievement.rarity !== selectedFilter.value) return false
        }

        return true
      }),
    }))
    .filter((category) => category.achievements.length > 0)
})

// ==========================================
// MÉTHODES
// ==========================================

function isUnlocked(achievementId: number): boolean {
  return userProgress.value[achievementId]?.unlocked || false
}

function getProgress(achievementId: number): number {
  const progress = userProgress.value[achievementId]?.progress || 0
  return Math.min(100, Math.max(0, progress))
}

function getCompletedCount(category: any): number {
  return category.achievements.filter((a: any) => isUnlocked(a.id)).length
}

function getCategoryProgress(category: any): number {
  if (category.achievements.length === 0) return 0
  return (getCompletedCount(category) / category.achievements.length) * 100
}

function getRarityClasses(rarity: string): string {
  const classes: Record<string, string> = {
    common: 'bg-gray-100 text-gray-700',
    rare: 'bg-blue-100 text-blue-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-yellow-100 text-yellow-700',
  }
  return classes[rarity] || classes.common
}

function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: 'Commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
  }
  return labels[rarity] || 'Commun'
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function forceCheckAchievements(): Promise<void> {
  try {
    toast.info('🔍 Vérification des succès...')
    const result = await achievementStore.checkAchievements()

    if (result?.newUnlocks && result.newUnlocks.length > 0) {
      toast.success(`🎉 ${result.newUnlocks.length} nouveau(x) succès débloqué(s) !`)
      result.newUnlocks.forEach((achievement: any) => {
        toast.success(`🏆 ${achievement.name} - +${achievement.xp_reward} XP`)
      })
    } else {
      toast.info('Aucun nouveau succès pour le moment')
    }
  } catch (error) {
    toast.error('Erreur lors de la vérification')
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  try {
    await achievementStore.loadAchievementData()
  } catch (error: any) {
    console.error('❌ Erreur chargement achievements:', error)
    toast.error(error.message || 'Impossible de charger les succès')
  }
})
</script>
