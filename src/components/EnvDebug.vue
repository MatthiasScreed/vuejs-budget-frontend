<template>
  <div class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md text-xs font-mono z-50">
    <h3 class="font-bold mb-2">🔍 Environment Debug</h3>
    <div class="space-y-1">
      <div>
        <span class="text-blue-400">VITE_API_URL:</span>
        <span class="text-green-400">{{ apiUrl }}</span>
      </div>
      <div>
        <span class="text-blue-400">MODE:</span>
        <span class="text-green-400">{{ mode }}</span>
      </div>
      <div>
        <span class="text-blue-400">DEV:</span>
        <span class="text-green-400">{{ isDev }}</span>
      </div>
      <div class="mt-2 pt-2 border-t border-gray-700">
        <span class="text-blue-400">API Client Base URL:</span>
        <span class="text-yellow-400">{{ clientApiUrl }}</span>
      </div>
    </div>
    <button
      @click="testApi"
      class="mt-3 w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
    >
      Test API Call
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const apiUrl = ref(import.meta.env.VITE_API_URL)
const mode = ref(import.meta.env.MODE)
const isDev = ref(import.meta.env.DEV)

// Essaie de récupérer l'URL de base d'axios
const clientApiUrl = computed(() => {
  try {
    // Vérifie si tu as une instance axios exportée
    return 'Checking...'
  } catch (error) {
    return 'Not available'
  }
})

async function testApi() {
  try {
    console.log('🧪 Testing API with URL:', apiUrl.value)
    const response = await axios.get('/api/health')
    console.log('✅ API Response:', response)
    alert('API OK! Check console for details')
  } catch (error: any) {
    console.error('❌ API Error:', error)
    alert('API Error: ' + error.message)
  }
}
</script>
