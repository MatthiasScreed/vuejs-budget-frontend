<template>
  <div class="callback-container">
    <div class="loading-state">
      <div class="spinner"></div>
      <h2>Connexion en cours...</h2>
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBankingStore } from '@/stores/banking'

const router = useRouter()
const route = useRoute()
const bankingStore = useBankingStore()

const statusMessage = ref('Finalisation de la connexion bancaire...')

onMounted(async () => {
  try {
    // Récupère les paramètres de callback
    const code = route.query.code as string
    const state = route.query.state as string

    if (!code) {
      statusMessage.value = 'Erreur: Code manquant'
      setTimeout(() => router.push('/app/banking?error=no_code'), 2000)
      return
    }

    statusMessage.value = 'Envoi du code au serveur...'

    // Envoie le code au backend
    await bankingStore.handleCallback(code, state)

    statusMessage.value = 'Connexion réussie ! Redirection...'

    // Redirige vers la page banking
    setTimeout(() => router.push('/app/banking'), 1500)

  } catch (error: any) {
    console.error('Erreur callback:', error)
    statusMessage.value = 'Erreur lors de la connexion'
    setTimeout(() => router.push('/app/banking?error=callback_failed'), 2000)
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-state {
  text-align: center;
  color: white;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  opacity: 0.9;
}
</style>
