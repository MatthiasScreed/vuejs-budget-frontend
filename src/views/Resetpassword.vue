<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'

const route = useRoute()
const router = useRouter()

const form = reactive({
  email: (route.query.email as string) ?? '',
  token: (route.query.token as string) ?? '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')
const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  error.value = ''

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    return
  }
  if (form.password.length < 8) {
    errors.password = '8 caractères minimum'
    return
  }
  if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true

  try {
    await api.post('/auth/reset-password', {
      email: form.email,
      token: form.token,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    success.value = true
    setTimeout(() => router.push({ name: 'Login' }), 3000)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Lien invalide ou expiré'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img src="/images/logo/logo.svg" alt="CoinQuest" class="w-20 h-20" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
        <p class="text-gray-600">Choisis un nouveau mot de passe sécurisé</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <!-- Succès -->
        <div v-if="success" class="text-center space-y-4">
          <div class="text-6xl">✅</div>
          <h3 class="text-xl font-bold text-gray-900">Mot de passe modifié !</h3>
          <p class="text-gray-600 text-sm">Redirection vers la connexion dans 3 secondes...</p>
          <router-link to="/login" class="inline-block text-sm font-semibold text-purple-600">
            Se connecter →
          </router-link>
        </div>

        <!-- Formulaire -->
        <form v-else class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Nouveau mot de passe -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Nouveau mot de passe</label
            >
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :class="[
                  'appearance-none block w-full px-4 py-3 pr-12 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all',
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300',
                ]"
                placeholder="8 caractères minimum"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500"
                tabindex="-1"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <!-- Confirmation -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Confirmer le mot de passe</label
            >
            <input
              v-model="form.password_confirmation"
              type="password"
              :class="[
                'appearance-none block w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all',
                errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-300',
              ]"
              placeholder="Répète le mot de passe"
            />
            <p v-if="errors.password_confirmation" class="mt-2 text-sm text-red-600">
              {{ errors.password_confirmation }}
            </p>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center py-3 px-4 text-base font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg"
          >
            <svg
              v-if="loading"
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
            {{ loading ? 'Mise à jour...' : 'Changer le mot de passe' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
