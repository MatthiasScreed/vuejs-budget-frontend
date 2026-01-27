<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo et titre -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img src="../assets/images/logo/logo.svg" alt="CoinQuest Logo" class="w-32 h-32" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
        <p class="text-gray-600">Connecte-toi pour continuer ton aventure 🎮</p>
      </div>

      <!-- Carte formulaire -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              :class="[
                'appearance-none block w-full px-4 py-3 border rounded-lg transition-all',
                'placeholder-gray-400 text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
              ]"
              placeholder="votre@email.com"
            />
            <p v-if="errors.email" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errors.email }}
            </p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                :class="[
                  'appearance-none block w-full px-4 py-3 pr-12 border rounded-lg transition-all',
                  'placeholder-gray-400 text-gray-900',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                ]"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                tabindex="-1"
              >
                <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ errors.password }}
            </p>
          </div>

          <!-- Remember me -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
              Se souvenir de moi
            </label>
          </div>

          <!-- Erreur générale -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Bouton connexion -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span v-if="authStore.loading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>

          <!-- Navigation -->
          <div class="pt-4 border-t border-gray-200">
            <div class="text-center space-y-3">
              <router-link
                to="/"
                class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </router-link>
              <div>
                <span class="text-sm text-gray-600">Pas encore de compte ?</span>
                <router-link
                  to="/register"
                  class="ml-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  S'inscrire
                </router-link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.ts'
import type { LoginCredentials } from '@/types/entities/auth.ts'

const router = useRouter()
const authStore = useAuthStore()

// État du formulaire
const form = reactive<LoginCredentials>({
  email: '',
  password: '',
  remember: false
})

// État de l'interface
const error = ref('')
const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)

// Validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!form.email) {
    newErrors.email = 'L\'adresse email est requise'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = 'L\'adresse email n\'est pas valide'
  }

  if (!form.password) {
    newErrors.password = 'Le mot de passe est requis'
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

// Gestion de la connexion
const handleLogin = async () => {
  error.value = ''
  Object.keys(errors).forEach(key => delete errors[key])

  if (!validateForm()) {
    return
  }

  try {
    const result = await authStore.login(form)

    if (result.success) {
      console.log('✅ Redirection vers dashboard...')
      await router.push('/dashboard')
    } else {
      error.value = result.message || 'Erreur de connexion'
    }
  } catch (err: any) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
    console.error('Erreur de connexion:', err)
  }
}

// Auto-focus
onMounted(() => {
  const emailInput = document.getElementById('email') as HTMLInputElement
  emailInput?.focus()
})
</script>
