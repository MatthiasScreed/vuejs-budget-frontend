<template name="CategoryForm.vue">
  <div class="category-form-container">
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🗂️</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
            </h2>
            <p class="text-gray-500">Organisez vos finances intelligemment</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Ligne 1: Nom et Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="name" class="form-label required">
            <span class="flex items-center space-x-2">
              <span>📝</span>
              <span>Nom de la catégorie</span>
            </span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.name }"
              placeholder="ex: Courses alimentaires"
              maxlength="100"
            >
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formData.name?.length || 0 }}/100 caractères
            </div>
          </div>

          <div class="form-group">
            <label for="type" class="form-label required">
            <span class="flex items-center space-x-2">
              <span>⚡</span>
              <span>Type de catégorie</span>
            </span>
            </label>
            <select
              id="type"
              v-model="formData.type"
              class="form-select"
              :class="{ 'input-error': errors.type }"
            >
              <option value="">Choisir le type</option>
              <option value="income">💰 Revenus</option>
              <option value="expense">💸 Dépenses</option>
            </select>
            <div v-if="errors.type" class="form-error">{{ errors.type }}</div>
          </div>
        </div>

        <!-- Ligne 2: Apparence -->
        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🎨 Apparence</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Icône -->
            <div class="form-group">
              <label class="form-label">Icône</label>
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-purple-500 transition-colors"
                  :style="{ backgroundColor: formData.color + '20' }"
                  @click="iconPickerOpen = true"
                >
                  <span v-if="formData.icon" class="text-xl">{{ getIconDisplay(formData.icon) }}</span>
                  <span v-else class="text-gray-400">?</span>
                </div>
                <button
                  type="button"
                  @click="iconPickerOpen = true"
                  class="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
                >
                  Choisir une icône
                </button>
              </div>

              <!-- Icon Picker Modal -->
              <div v-if="iconPickerOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold">Choisir une icône</h4>
                    <button @click="iconPickerOpen = false" class="text-gray-400">✕</button>
                  </div>
                  <div class="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                    <button
                      v-for="icon in availableIcons"
                      :key="icon.key"
                      type="button"
                      @click="selectIcon(icon.key)"
                      class="w-10 h-10 rounded-lg border hover:border-purple-500 flex items-center justify-center text-lg"
                      :class="{ 'border-purple-500 bg-purple-50': formData.icon === icon.key }"
                    >
                      {{ icon.display }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Couleur -->
            <div class="form-group">
              <label class="form-label">Couleur</label>
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  :style="{ backgroundColor: formData.color || '#5b6270' }"
                  @click="colorPickerOpen = true"
                ></div>
                <input
                  v-model="formData.color"
                  type="text"
                  class="form-input flex-1"
                  placeholder="#5b6270"
                  pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                >
              </div>

              <!-- Color Picker -->
              <div v-if="colorPickerOpen" class="mt-2 bg-white border rounded-lg p-4 shadow-lg">
                <div class="grid grid-cols-8 gap-2 mb-3">
                  <button
                    v-for="color in presetColors"
                    :key="color"
                    type="button"
                    @click="selectColor(color)"
                    class="w-8 h-8 rounded-lg border-2"
                    :style="{ backgroundColor: color }"
                    :class="{ 'border-gray-900': formData.color === color, 'border-gray-200': formData.color !== color }"
                  ></button>
                </div>
                <button @click="colorPickerOpen = false" class="text-sm text-gray-500">Fermer</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ligne 3: Budget et Description -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="budget_limit" class="form-label">
            <span class="flex items-center space-x-2">
              <span>🎯</span>
              <span>Budget limite (optionnel)</span>
            </span>
            </label>
            <div class="relative">
              <input
                id="budget_limit"
                v-model.number="formData.budget_limit"
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                class="form-input pr-8"
                placeholder="0.00"
              >
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Recevoir une alerte si dépassé
            </p>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">
            <span class="flex items-center space-x-2">
              <span>📄</span>
              <span>Description</span>
            </span>
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              :class="{ 'input-error': errors.description }"
              placeholder="Description de la catégorie..."
              rows="3"
              maxlength="255"
            ></textarea>
            <div class="text-xs text-gray-500 mt-1">
              {{ formData.description?.length || 0 }}/255 caractères
            </div>
          </div>
        </div>

        <!-- Options avancées -->
        <div class="bg-blue-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚙️ Options avancées</h3>

          <div class="space-y-4">
            <label class="flex items-center space-x-3">
              <input
                v-model="formData.is_active"
                type="checkbox"
                class="form-checkbox"
              >
              <span class="text-sm font-medium text-gray-700">Catégorie active</span>
              <span class="text-xs text-gray-500">(Les catégories inactives sont masquées)</span>
            </label>

            <!-- Parent Category (si modification) -->
            <div v-if="isEditing" class="form-group">
              <label for="parent_id" class="form-label">Catégorie parent</label>
              <select
                id="parent_id"
                v-model="formData.parent_id"
                class="form-select"
              >
                <option value="">Aucune (catégorie principale)</option>
                <option
                  v-for="category in availableParentCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div v-if="isFormValid" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">👁️ Aperçu</h3>
          <div class="flex items-center space-x-4 bg-white rounded-lg p-4 border">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: formData.color + '20' }"
            >
              <span class="text-xl">{{ getIconDisplay(formData.icon) || '📁' }}</span>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ formData.name }}</h4>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <span class="capitalize">{{ formData.type === 'income' ? '💰 Revenus' : '💸 Dépenses' }}</span>
                <span v-if="formData.budget_limit">• Budget: {{ formData.budget_limit }}€</span>
              </div>
              <p v-if="formData.description" class="text-sm text-gray-600 mt-1">
                {{ formData.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🔄 Réinitialiser
          </button>

          <div class="flex items-center space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || loading"
              class="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{{ isEditing ? '✅ Modifier' : '➕ Créer' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
