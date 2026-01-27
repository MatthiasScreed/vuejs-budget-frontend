<template name="DateRangeInput.vue">
  <div class="date-range-input-container">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Date de début -->
      <div class="form-group">
        <label :for="startId" class="form-label">
          🗓️ {{ startLabel }}
        </label>
        <input
          :id="startId"
          v-model="startDate"
          type="date"
          :min="minDate"
          :max="endDate || maxDate"
          class="form-input"
          :class="{ 'input-error': errors.start }"
          @change="validateDates"
        >
        <div v-if="errors.start" class="form-error">{{ errors.start }}</div>
      </div>

      <!-- Date de fin -->
      <div class="form-group">
        <label :for="endId" class="form-label">
          🏁 {{ endLabel }}
        </label>
        <input
          :id="endId"
          v-model="endDate"
          type="date"
          :min="startDate || minDate"
          :max="maxDate"
          class="form-input"
          :class="{ 'input-error': errors.end }"
          @change="validateDates"
        >
        <div v-if="errors.end" class="form-error">{{ errors.end }}</div>
      </div>
    </div>

    <!-- Presets -->
    <div v-if="showPresets" class="mt-4">
      <div class="text-sm font-medium text-gray-700 mb-2">⚡ Raccourcis</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in datePresets"
          :key="preset.key"
          type="button"
          @click="applyPreset(preset)"
          class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <!-- Duration info -->
    <div v-if="startDate && endDate" class="mt-3 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 flex items-center space-x-2">
      <span>📊</span>
      <span>Durée: {{ durationText }}</span>
    </div>
  </div>
</template>
