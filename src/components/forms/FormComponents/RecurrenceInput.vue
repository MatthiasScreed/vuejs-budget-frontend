<template name="RecurrenceInput.vue">
  <div class="recurrence-input-container">
    <!-- Toggle récurrence -->
    <div class="flex items-center justify-between mb-4">
      <label class="flex items-center space-x-3 cursor-pointer">
        <input
          v-model="isRecurring"
          type="checkbox"
          class="form-checkbox"
          @change="handleToggleRecurrence"
        >
        <div>
          <span class="text-sm font-medium text-gray-700">🔄 Transaction récurrente</span>
          <p class="text-xs text-gray-500">Répéter automatiquement cette transaction</p>
        </div>
      </label>
    </div>

    <!-- Configuration récurrence -->
    <div v-if="isRecurring" class="space-y-6 bg-purple-50 rounded-xl p-6">
      <!-- Fréquence -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="frequency" class="form-label required">
            📅 Fréquence
          </label>
          <select
            id="frequency"
            v-model="recurrenceData.frequency"
            class="form-select"
            @change="updatePreview"
          >
            <option value="">Choisir la fréquence</option>
            <option value="daily">📅 Quotidien</option>
            <option value="weekly">📆 Hebdomadaire</option>
            <option value="biweekly">🗓️ Bi-hebdomadaire</option>
            <option value="monthly">📅 Mensuel</option>
            <option value="quarterly">🗓️ Trimestriel</option>
            <option value="yearly">📆 Annuel</option>
            <option value="custom">⚙️ Personnalisé</option>
          </select>
        </div>

        <!-- Intervalle personnalisé -->
        <div v-if="recurrenceData.frequency === 'custom'" class="form-group">
          <label for="custom-interval" class="form-label required">
            🔢 Tous les X jours
          </label>
          <input
            id="custom-interval"
            v-model.number="recurrenceData.interval"
            type="number"
            min="1"
            max="365"
            class="form-input"
            placeholder="30"
            @input="updatePreview"
          >
        </div>
      </div>

      <!-- Options avancées -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Date de fin -->
        <div class="form-group">
          <label for="end-type" class="form-label">
            🏁 Fin de récurrence
          </label>
          <select
            id="end-type"
            v-model="recurrenceData.endType"
            class="form-select"
            @change="updatePreview"
          >
            <option value="never">♾️ Jamais</option>
            <option value="date">📅 À une date</option>
            <option value="occurrences">🔢 Après X occurrences</option>
          </select>
        </div>

        <!-- Date de fin spécifique -->
        <div v-if="recurrenceData.endType === 'date'" class="form-group">
          <label for="end-date" class="form-label">
            📅 Date de fin
          </label>
          <input
            id="end-date"
            v-model="recurrenceData.endDate"
            type="date"
            :min="tomorrow"
            class="form-input"
            @change="updatePreview"
          >
        </div>

        <!-- Nombre d'occurrences -->
        <div v-if="recurrenceData.endType === 'occurrences'" class="form-group">
          <label for="occurrences" class="form-label">
            🔢 Nombre de répétitions
          </label>
          <input
            id="occurrences"
            v-model.number="recurrenceData.occurrences"
            type="number"
            min="1"
            max="365"
            class="form-input"
            placeholder="12"
            @input="updatePreview"
          >
        </div>
      </div>

      <!-- Jours de la semaine (si hebdomadaire) -->
      <div v-if="recurrenceData.frequency === 'weekly'" class="form-group">
        <label class="form-label">📅 Jours de la semaine</label>
        <div class="grid grid-cols-7 gap-2 mt-2">
          <label
            v-for="(day, index) in weekDays"
            :key="day.key"
            class="flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
            :class="{ 'bg-purple-100 border-purple-300': recurrenceData.weekDays.includes(index) }"
          >
            <input
              v-model="recurrenceData.weekDays"
              :value="index"
              type="checkbox"
              class="sr-only"
              @change="updatePreview"
            >
            <span class="text-xs font-medium">{{ day.short }}</span>
            <span class="text-xs text-gray-500">{{ day.name }}</span>
          </label>
        </div>
      </div>

      <!-- Aperçu -->
      <div v-if="preview" class="bg-white rounded-lg p-4 border border-purple-200">
        <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
          <span>👁️</span>
          <span>Aperçu de la récurrence</span>
        </h4>
        <p class="text-sm text-gray-700 mb-3">{{ preview.description }}</p>

        <!-- Prochaines dates -->
        <div v-if="preview.nextDates.length > 0" class="space-y-2">
          <p class="text-xs font-medium text-gray-600">📅 Prochaines occurrences :</p>
          <div class="grid grid-cols-3 gap-2 text-xs">
          <span
            v-for="date in preview.nextDates.slice(0, 6)"
            :key="date"
            class="bg-purple-50 text-purple-700 px-2 py-1 rounded text-center"
          >
            {{ formatDate(date) }}
          </span>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="mt-3 grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span class="font-medium">Total estimé :</span>
            <span class="ml-1">{{ preview.estimatedTotal }}€</span>
          </div>
          <div>
            <span class="font-medium">Occurrences/an :</span>
            <span class="ml-1">{{ preview.yearlyCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
