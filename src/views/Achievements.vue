<template>
  <div class="max-w-6xl mx-auto">
    <!-- Debug info en développement -->
    <div v-if="isDevelopment" class="mb-6 bg-purple-100 border border-purple-300 rounded-lg p-4">
      <p class="text-purple-800 font-medium">🏆 Composant Achievements.vue chargé avec succès !</p>
      <p class="text-purple-600 text-sm">Route: {{ $route.name }} | Path: {{ $route.path }}</p>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">🏆 Succès</h1>
          <p class="text-gray-600 mt-2">Débloquez des achievements et gagnez de l'XP</p>
        </div>

        <!-- Actions header -->
        <div class="flex items-center gap-4">
          <button @click="forceCheckAchievements" class="gaming-button" :disabled="checking">
            {{ checking ? '🔄 Vérification...' : '🔍 Vérifier les succès' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats globales -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="stat-card">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalUnlocked }}</div>
          <div class="text-sm text-gray-600">Débloqués</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.completionRate }}%</div>
          <div class="text-sm text-gray-600">Complétés</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ stats.legendaryCount }}</div>
          <div class="text-sm text-gray-600">Légendaires</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.totalXP }}</div>
          <div class="text-sm text-gray-600">XP Total</div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="gaming-card mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 Filtres</h3>

      <div class="flex flex-wrap gap-4">
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
    <div v-if="recentUnlocks.length > 0" class="gaming-card mb-8">
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
      <div v-for="category in filteredCategories" :key="category.id" class="gaming-card">
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
            class="achievement-card p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
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
                  <div class="flex items-center gap-4">
                    <span class="text-blue-600 font-medium">+{{ achievement.xp_reward }} XP</span>
                  </div>

                  <div v-if="isUnlocked(achievement.id)" class="text-green-600 font-medium">
                    ✅ Débloqué
                  </div>
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
      <router-link to="/app/transactions" class="gaming-button inline-flex items-center gap-2">
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

// ✅ STORE
const achievementStore = useAchievementStore()

// ✅ STATE depuis le store
const { achievements, userProgress, recentUnlocks, categories, loading, checking } =
  storeToRefs(achievementStore)

// ✅ STATS CALCULÉES depuis la DB
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
    .reduce((sum, a) => sum + a.xp_reward, 0),
}))

// ✅ MÉTHODES
function isUnlocked(achievementId: number): boolean {
  return userProgress.value[achievementId]?.unlocked || false
}

function getProgress(achievementId: number): number {
  const progress = userProgress.value[achievementId]?.progress || 0
  return Math.min(100, Math.max(0, progress))
}

async function forceCheckAchievements() {
  try {
    checking.value = true
    toast.info('🔍 Vérification des succès...')

    // ✅ Appel API réel
    const result = await achievementStore.checkAchievements()

    if (result?.newUnlocks && result.newUnlocks.length > 0) {
      toast.success(`🎉 ${result.newUnlocks.length} nouveau(x) succès débloqué(s) !`)

      // Afficher les nouveaux succès
      result.newUnlocks.forEach((achievement: any) => {
        toast.success(`🏆 ${achievement.name} - +${achievement.xp_reward} XP`)
      })
    } else {
      toast.info('Aucun nouveau succès pour le moment')
    }
  } catch (error) {
    toast.error('Erreur lors de la vérification')
  } finally {
    checking.value = false
  }
}

// ✅ LIFECYCLE
onMounted(async () => {
  try {
    loading.value = true
    await achievementStore.loadAchievementData()
  } catch (error: any) {
    console.error('❌ Erreur chargement achievements:', error)
    toast.error(error.message || 'Impossible de charger les succès')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* SUPPRESSION COMPLÈTE DES @APPLY - TOUTES LES CLASSES SONT DANS main.css */

.achievement-card:hover {
  transform: translateY(-1px);
}

/* Pas de définitions CSS avec @apply ici - tout est dans main.css global */
</style>
