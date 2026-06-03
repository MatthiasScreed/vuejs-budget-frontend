<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { LoginCredentials } from '@/types/entities/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<LoginCredentials>({
  email: '',
  password: '',
  remember: false,
})

const error = ref('')
const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}
  if (!form.email) newErrors.email = "L'adresse email est requise"
  else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "L'adresse email n'est pas valide"
  if (!form.password) newErrors.password = 'Le mot de passe est requis'
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleLogin = async () => {
  error.value = ''
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!validateForm()) return

  try {
    const result = await authStore.login(form)
    if (result.success) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      window.location.href = '/quete'
    } else {
      error.value = result.message || 'Erreur de connexion'
    }
  } catch (err: any) {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
  }
}

onMounted(() => {
  const emailInput = document.getElementById('email') as HTMLInputElement
  emailInput?.focus()
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img src="/images/logo/logo.svg" alt="CoinQuest Logo" class="w-32 h-32" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
        <p class="text-gray-600">Connecte-toi pour continuer ton aventure 🎮</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2"
              >Adresse email</label
            >
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              :class="[
                'appearance-none block w-full px-4 py-3 border rounded-lg transition-all placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                errors.email
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400',
              ]"
              placeholder="votre@email.com"
            />
            <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-sm font-semibold text-gray-700"
                >Mot de passe</label
              >
              <!-- ✅ LIEN MOT DE PASSE OUBLIÉ -->
              <router-link
                to="/forgot-password"
                class="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </router-link>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                :class="[
                  'appearance-none block w-full px-4 py-3 pr-12 border rounded-lg transition-all placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400',
                ]"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                tabindex="-1"
              >
                <svg
                  v-if="showPassword"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Se souvenir -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              for="remember"
              class="ml-2 block text-sm text-gray-700 cursor-pointer select-none"
              >Se souvenir de moi</label
            >
          </div>

          <!-- Erreur globale -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              v-if="authStore.loading"
              class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ authStore.loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>

          <!-- Liens bas -->
          <div class="pt-4 border-t border-gray-200 text-center space-y-3">
            <router-link
              to="/"
              class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à l'accueil
            </router-link>
            <div>
              <span class="text-sm text-gray-600">Pas encore de compte ?</span>
              <router-link
                to="/register"
                class="ml-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >S'inscrire</router-link
              >
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
