<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">🔧 Diagnostic CoinQuest</h1>
            <p class="text-gray-600 mt-1">Vérification de la connexion et configuration</p>
          </div>
          <button
            @click="runAllTests"
            :disabled="testing"
            class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ testing ? 'Test en cours...' : '🔄 Relancer les tests' }}
          </button>
        </div>
      </div>

      <!-- Variables d'environnement -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">📋 Variables d'environnement</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(value, key) in envVars" :key="key" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="font-mono text-sm text-gray-600">{{ key }}</span>
              <span v-if="value" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
            </div>
            <div class="mt-2 font-mono text-sm" :class="value ? 'text-gray-900' : 'text-red-600'">
              {{ value || 'Non défini' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Test de connexion API -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">🌐 Connexion API</h2>

        <!-- API Backend -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Backend API</h3>
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono text-sm">{{ apiUrl }}</span>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="apiStatus === 'connected' ? 'bg-green-100 text-green-800' : apiStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
              >
                {{ apiStatusText }}
              </span>
            </div>
            <div v-if="apiLatency" class="text-sm text-gray-600">
              Latence: {{ apiLatency }}ms
            </div>
            <div v-if="apiError" class="mt-2 text-sm text-red-600">
              {{ apiError }}
            </div>
          </div>
        </div>

        <!-- Endpoints -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Endpoints testés</h3>
          <div class="space-y-2">
            <div
              v-for="endpoint in endpoints"
              :key="endpoint.path"
              class="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div class="flex-1">
                <div class="font-mono text-sm text-gray-900">{{ endpoint.method }} {{ endpoint.path }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ endpoint.description }}</div>
              </div>
              <div class="flex items-center gap-3">
                <span v-if="endpoint.latency" class="text-sm text-gray-600">{{ endpoint.latency }}ms</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(endpoint.status)"
                >
                  {{ endpoint.statusText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bridge API -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">🏦 Bridge API</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-700">Client ID</span>
            <span :class="bridgeConfig.clientId ? 'text-green-600' : 'text-red-600'">
              {{ bridgeConfig.clientId ? '✓ Configuré' : '✗ Manquant' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-700">Client Secret</span>
            <span :class="bridgeConfig.clientSecret ? 'text-green-600' : 'text-red-600'">
              {{ bridgeConfig.clientSecret ? '✓ Configuré' : '✗ Manquant' }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-700">Environnement</span>
            <span class="text-gray-900">{{ bridgeConfig.environment }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-700">Redirect URI</span>
            <span class="text-gray-900 font-mono text-sm">{{ bridgeConfig.redirectUri || 'Non défini' }}</span>
          </div>
        </div>
      </div>

      <!-- Informations système -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">💻 Informations système</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Navigateur</div>
            <div class="font-semibold text-gray-900">{{ browserInfo }}</div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Online</div>
            <div class="font-semibold" :class="isOnline ? 'text-green-600' : 'text-red-600'">
              {{ isOnline ? '✓ Connecté' : '✗ Hors ligne' }}
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">Heure locale</div>
            <div class="font-semibold text-gray-900">{{ currentTime }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'

// ==========================================
// STATE
// ==========================================

const testing = ref(false)
const currentTime = ref(new Date().toLocaleString('fr-FR'))
const isOnline = ref(navigator.onLine)

// API Status
const apiStatus = ref<'checking' | 'connected' | 'disconnected'>('checking')
const apiLatency = ref<number | null>(null)
const apiError = ref<string | null>(null)

// Endpoints
const endpoints = ref([
  {
    path: '/health',
    method: 'GET',
    description: 'Health check endpoint',
    status: 'pending' as 'pending' | 'success' | 'error',
    statusText: 'En attente',
    latency: null as number | null,
  },
  {
    path: '/ping',
    method: 'GET',
    description: 'Ping endpoint',
    status: 'pending' as 'pending' | 'success' | 'error',
    statusText: 'En attente',
    latency: null as number | null,
  },
  {
    path: '/user',
    method: 'GET',
    description: 'User profile (nécessite auth)',
    status: 'pending' as 'pending' | 'success' | 'error',
    statusText: 'En attente',
    latency: null as number | null,
  },
])

// ==========================================
// COMPUTED
// ==========================================

const apiUrl = computed(() => import.meta.env.VITE_API_BASE_URL || 'Non défini')

const apiStatusText = computed(() => {
  if (apiStatus.value === 'connected') return '✓ Connecté'
  if (apiStatus.value === 'checking') return '⏳ Vérification...'
  return '✗ Déconnecté'
})

const envVars = computed(() => ({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_DEPLOYMENT_MODE: import.meta.env.VITE_DEPLOYMENT_MODE,
  VITE_BRIDGE_CLIENT_ID: import.meta.env.VITE_BRIDGE_CLIENT_ID,
  VITE_BRIDGE_ENVIRONMENT: import.meta.env.VITE_BRIDGE_ENVIRONMENT,
  VITE_BRIDGE_REDIRECT_URI: import.meta.env.VITE_BRIDGE_REDIRECT_URI,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_DEBUG: import.meta.env.VITE_DEBUG,
}))

const bridgeConfig = computed(() => ({
  clientId: !!import.meta.env.VITE_BRIDGE_CLIENT_ID,
  clientSecret: !!import.meta.env.VITE_BRIDGE_CLIENT_SECRET,
  environment: import.meta.env.VITE_BRIDGE_ENVIRONMENT || 'Non défini',
  redirectUri: import.meta.env.VITE_BRIDGE_REDIRECT_URI,
}))

const browserInfo = computed(() => {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Inconnu'
})

// ==========================================
// METHODS
// ==========================================

function getStatusClass(status: string) {
  if (status === 'success') return 'bg-green-100 text-green-800'
  if (status === 'pending') return 'bg-gray-100 text-gray-800'
  return 'bg-red-100 text-red-800'
}

async function testEndpoint(endpoint: typeof endpoints.value[0]) {
  const startTime = Date.now()

  try {
    const response = await api.get(endpoint.path)
    const latency = Date.now() - startTime

    endpoint.latency = latency
    endpoint.status = 'success'
    endpoint.statusText = '✓ OK'
  } catch (error: any) {
    const latency = Date.now() - startTime

    endpoint.latency = latency
    endpoint.status = 'error'
    endpoint.statusText = error.message || 'Erreur'
  }
}

async function testAPIConnection() {
  apiStatus.value = 'checking'
  apiError.value = null
  const startTime = Date.now()

  try {
    const response = await api.get('/health')
    apiLatency.value = Date.now() - startTime

    if (response.success) {
      apiStatus.value = 'connected'
    } else {
      apiStatus.value = 'disconnected'
      apiError.value = response.message || 'Erreur inconnue'
    }
  } catch (error: any) {
    apiLatency.value = Date.now() - startTime
    apiStatus.value = 'disconnected'
    apiError.value = error.message || 'Impossible de se connecter'
  }
}

async function runAllTests() {
  testing.value = true

  // Reset
  endpoints.value.forEach(e => {
    e.status = 'pending'
    e.statusText = 'Test en cours...'
    e.latency = null
  })

  // Test API connection
  await testAPIConnection()

  // Test endpoints
  for (const endpoint of endpoints.value) {
    await testEndpoint(endpoint)
  }

  testing.value = false
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  runAllTests()

  // Update time every second
  setInterval(() => {
    currentTime.value = new Date().toLocaleString('fr-FR')
  }, 1000)

  // Listen to online/offline events
  window.addEventListener('online', () => (isOnline.value = true))
  window.addEventListener('offline', () => (isOnline.value = false))
})
</script>
