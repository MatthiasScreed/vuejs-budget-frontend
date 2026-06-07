<template>
  <!-- Bouton flottant -->
  <button
    v-if="!isOpen"
    class="feedback-fab"
    @click="isOpen = true"
    title="Signaler un problème ou donner un avis"
  >
    💬
  </button>

  <!-- Modale feedback -->
  <Transition name="slide-up">
    <div v-if="isOpen" class="feedback-modal">
      <!-- Header -->
      <div class="feedback-header">
        <span class="feedback-title">💬 Ton avis compte</span>
        <button class="feedback-close" @click="close">✕</button>
      </div>

      <!-- Succès -->
      <div v-if="sent" class="feedback-success">
        <div class="text-3xl mb-2">🎉</div>
        <div class="font-semibold text-gray-900">Merci !</div>
        <div class="text-sm text-gray-500 mt-1">On lit chaque message.</div>
      </div>

      <template v-else>
        <!-- Type -->
        <div class="feedback-types">
          <button
            v-for="type in types"
            :key="type.value"
            class="type-btn"
            :class="{ active: form.type === type.value }"
            @click="form.type = type.value"
          >
            {{ type.icon }} {{ type.label }}
          </button>
        </div>

        <!-- Message -->
        <textarea
          v-model="form.message"
          class="feedback-textarea"
          :placeholder="placeholder"
          rows="4"
          maxlength="1000"
        />
        <div class="char-count">{{ form.message.length }}/1000</div>

        <!-- Page courante (auto) -->
        <div class="feedback-meta">
          📍 Page : <span class="meta-value">{{ currentPage }}</span>
        </div>

        <!-- Submit -->
        <button class="feedback-submit" :disabled="!canSubmit || sending" @click="submit">
          {{ sending ? 'Envoi...' : 'Envoyer' }}
        </button>
      </template>
    </div>
  </Transition>

  <!-- Backdrop mobile -->
  <div v-if="isOpen" class="feedback-backdrop" @click="close" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/core/useApi'

const route = useRoute()
const api = useApi()

const isOpen = ref(false)
const sending = ref(false)
const sent = ref(false)

const form = ref({ type: 'bug', message: '' })

const types = [
  { value: 'bug', icon: '🐛', label: 'Bug' },
  { value: 'idea', icon: '💡', label: 'Idée' },
  { value: 'other', icon: '💬', label: 'Autre' },
]

const placeholder = computed(() => {
  if (form.value.type === 'bug') return "Décris le problème — que s'est-il passé ?"
  if (form.value.type === 'idea') return 'Quelle fonctionnalité tu aimerais voir ?'
  return 'Dis-nous ce que tu penses...'
})

const currentPage = computed(() => route.path)

const canSubmit = computed(() => form.value.message.trim().length >= 10)

async function submit(): Promise<void> {
  if (!canSubmit.value) return
  sending.value = true

  try {
    await api.post('/feedback', {
      type: form.value.type,
      message: form.value.message.trim(),
      page: currentPage.value,
    })
    sent.value = true
    setTimeout(close, 2500)
  } catch {
    // Fallback silencieux — on ne bloque pas l'utilisateur
    sent.value = true
    setTimeout(close, 2500)
  } finally {
    sending.value = false
  }
}

function close(): void {
  isOpen.value = false
  sent.value = false
  form.value = { type: 'bug', message: '' }
}
</script>

<style scoped>
.feedback-fab {
  position: fixed;
  bottom: 5.5rem;
  right: 1.25rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #7c3aed;
  color: white;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
  z-index: 40;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
}

/* Sur desktop, remonter le bouton (pas de bottom nav) */
@media (min-width: 1024px) {
  .feedback-fab {
    bottom: 1.5rem;
  }
}

.feedback-modal {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 1.25rem 1.25rem 2rem;
  z-index: 50;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  max-width: 480px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .feedback-modal {
    bottom: 5rem;
    right: 1.5rem;
    left: auto;
    border-radius: 16px;
    width: 360px;
  }
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feedback-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111;
}

.feedback-close {
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Types */
.feedback-types {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.type-btn {
  flex: 1;
  padding: 0.45rem 0.5rem;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: white;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn.active {
  border-color: #7c3aed;
  background: #faf5ff;
  color: #7c3aed;
}

/* Textarea */
.feedback-textarea {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem;
  font-size: 0.85rem;
  resize: none;
  outline: none;
  font-family: inherit;
  color: #111;
  line-height: 1.5;
  box-sizing: border-box;
}

.feedback-textarea:focus {
  border-color: #7c3aed;
}

.char-count {
  text-align: right;
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

/* Meta */
.feedback-meta {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.meta-value {
  color: #6b7280;
  font-weight: 500;
}

/* Submit */
.feedback-submit {
  width: 100%;
  padding: 0.75rem;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.feedback-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Success */
.feedback-success {
  text-align: center;
  padding: 1.5rem 0;
}

/* Backdrop */
.feedback-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 49;
}

@media (min-width: 640px) {
  .feedback-backdrop {
    display: none;
  }
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
