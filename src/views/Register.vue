<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo et titre -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img src="@/assets/images/logo/logo.svg" alt="CoinQuest Logo" class="w-32 h-32" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
        <p class="text-gray-600">Rejoins CoinQuest et commence ton aventure 🎮</p>
      </div>

      <!-- Carte formulaire -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Nom -->
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              autocomplete="name"
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ton pseudo de champion"
            />
          </div>

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
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="ton@email.com"
            />
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
                autocomplete="new-password"
                class="appearance-none block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Minimum 8 caractères"
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
            <p class="mt-2 text-xs text-gray-500">
              Au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
            </p>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label for="password_confirmation" class="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div class="relative">
              <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                :type="showPasswordConfirm ? 'text' : 'password'"
                required
                autocomplete="new-password"
                class="appearance-none block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Confirme ton mot de passe"
              />
              <button
                type="button"
                @click="showPasswordConfirm = !showPasswordConfirm"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                tabindex="-1"
              >
                <svg v-if="showPasswordConfirm" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Conditions d'utilisation -->
          <div class="pt-2">
            <label class="flex items-start cursor-pointer group">
              <input
                type="checkbox"
                v-model="form.terms_accepted"
                required
                class="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
              />
              <span class="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors select-none">
                J'accepte les
                <a
                  href="/terms"
                  target="_blank"
                  class="text-purple-600 hover:text-purple-700 underline font-medium"
                >
                  conditions d'utilisation
                </a>
                et la
                <a
                  href="/privacy"
                  target="_blank"
                  class="text-purple-600 hover:text-purple-700 underline font-medium"
                >
                  politique de confidentialité
                </a>
              </span>
            </label>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Bouton d'inscription -->
          <button
            type="submit"
            :disabled="authStore.loading || !form.terms_accepted"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span v-if="authStore.loading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.loading ? 'Création en cours...' : 'Créer mon compte' }}
          </button>

          <!-- Bonus XP -->
          <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center justify-center text-sm">
              <svg class="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="font-medium text-gray-700">Gagne <strong class="text-yellow-600">+100 XP</strong> en créant ton compte !</span>
            </div>
          </div>

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
                <span class="text-sm text-gray-600">Déjà un compte ?</span>
                <router-link
                  to="/login"
                  class="ml-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Se connecter
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.ts'

const router = useRouter()
const authStore = useAuthStore()

// État du formulaire
const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms_accepted: false,
})

// État de l'interface
const error = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

/**
 * Gérer l'inscription
 */
const handleRegister = async (): Promise<void> => {
  error.value = ''

  // Validation des conditions
  if (!form.value.terms_accepted) {
    error.value = "Tu dois accepter les conditions d'utilisation pour continuer"
    return
  }

  // Validation des mots de passe
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (form.value.password.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }

  try {
    const result = await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })

    if (result.success) {
      // Succès : redirection vers le dashboard
      router.push('/app/dashboard')
    } else {
      // Erreur : afficher le message
      error.value = result.message || "Une erreur est survenue lors de l'inscription"
    }
  } catch (err: any) {
    console.error('❌ Erreur inscription:', err)
    error.value = err.message || 'Impossible de créer le compte. Réessaye dans quelques instants.'
  }
}
</script>
