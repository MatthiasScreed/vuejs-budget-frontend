<template>
  <div class="referral-card">
    <!-- Header -->
    <div class="referral-header">
      <div class="referral-icon">🎁</div>
      <div>
        <h3 class="referral-title">Invite un ami</h3>
        <p class="referral-sub">
          Il reçoit <strong>1 Freeze 🧊</strong> — tu reçois <strong>+200 XP ⚡</strong>
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="referral-loading">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <!-- Code + URL -->
      <div class="referral-code-block">
        <div class="code-label">Ton code de parrainage</div>
        <div class="code-row">
          <span class="code-value">{{ stats.referral_code }}</span>
          <button class="copy-btn" @click="copyCode" :class="{ copied: codeCopied }">
            <span v-if="!codeCopied">📋 Copier</span>
            <span v-else>✅ Copié !</span>
          </button>
        </div>

        <div class="url-row">
          <span class="url-value">{{ shortUrl }}</span>
          <button class="copy-btn copy-btn-sm" @click="copyUrl" :class="{ copied: urlCopied }">
            <span v-if="!urlCopied">Copier le lien</span>
            <span v-else>✅</span>
          </button>
        </div>
      </div>

      <!-- Share buttons -->
      <div class="share-buttons">
        <button class="share-btn share-whatsapp" @click="shareWhatsApp">💬 WhatsApp</button>
        <button class="share-btn share-copy" @click="copyUrl">🔗 Copier le lien</button>
      </div>

      <!-- Stats -->
      <div class="referral-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.completed }}</span>
          <span class="stat-label">amis inscrits</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">+{{ stats.total_xp_earned }}</span>
          <span class="stat-label">XP gagnés</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.next_reward?.remaining }}</span>
          <span class="stat-label">avant 1 Freeze bonus</span>
        </div>
      </div>

      <!-- Next reward progress -->
      <div v-if="stats.next_reward" class="next-reward">
        <div class="next-reward-label">
          🧊 Freeze bonus dans <strong>{{ stats.next_reward.remaining }} parrainage(s)</strong>
        </div>
        <div class="next-reward-track">
          <div class="next-reward-fill" :style="{ width: nextRewardPct + '%' }"></div>
        </div>
      </div>

      <!-- Recent referrals -->
      <div v-if="stats.recent_referrals?.length" class="recent-referrals">
        <div class="recent-label">Amis parrainés</div>
        <div v-for="(ref, i) in stats.recent_referrals" :key="i" class="recent-item">
          <div class="recent-avatar">{{ ref.name[0] }}</div>
          <div class="recent-name">{{ ref.name }}</div>
          <div class="recent-status" :class="ref.status">
            {{ ref.status === 'rewarded' ? '✅ Complété' : '⏳ En cours' }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/core/useApi'

interface ReferralStats {
  referral_code: string
  referral_url: string
  total_referrals: number
  completed: number
  total_xp_earned: number
  next_reward: { at: number; remaining: number; description: string } | null
  recent_referrals: Array<{ name: string; completed_at: string | null; status: string }>
}

const api = useApi()
const loading = ref(true)
const stats = ref<ReferralStats>({
  referral_code: '',
  referral_url: '',
  total_referrals: 0,
  completed: 0,
  total_xp_earned: 0,
  next_reward: null,
  recent_referrals: [],
})

const codeCopied = ref(false)
const urlCopied = ref(false)

const shortUrl = computed(() => {
  return stats.value.referral_url.replace('https://', '').replace('http://', '')
})

const nextRewardPct = computed(() => {
  const reward = stats.value.next_reward
  if (!reward) return 100
  const done = reward.at - reward.remaining
  return Math.round((done / reward.at) * 100)
})

async function loadStats(): Promise<void> {
  try {
    const res = await api.get('/referral')
    stats.value = res.data.data
  } catch (e) {
    console.error('[ReferralCard] Erreur chargement stats', e)
  } finally {
    loading.value = false
  }
}

async function copyCode(): Promise<void> {
  await navigator.clipboard.writeText(stats.value.referral_code)
  codeCopied.value = true
  setTimeout(() => (codeCopied.value = false), 2000)
}

async function copyUrl(): Promise<void> {
  await navigator.clipboard.writeText(stats.value.referral_url)
  urlCopied.value = true
  setTimeout(() => (urlCopied.value = false), 2000)
}

function shareWhatsApp(): void {
  const text = encodeURIComponent(
    `Essaie CoinQuest — une app pour épargner en jouant 🎮💰\n` +
      `Tu reçois un Freeze offert avec mon lien : ${stats.value.referral_url}`,
  )
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

onMounted(loadStats)
</script>

<style scoped>
.referral-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.referral-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.referral-icon {
  font-size: 2.5rem;
}

.referral-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 0.2rem;
}

.referral-sub {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

/* Code block */
.referral-code-block {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.code-label {
  font-size: 0.7rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.code-row,
.url-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.url-row {
  margin-top: 0.5rem;
}

.code-value {
  font-size: 1.4rem;
  font-weight: 900;
  color: #7c3aed;
  letter-spacing: 0.1em;
}

.url-value {
  font-size: 0.75rem;
  color: #6b7280;
  truncate: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.copy-btn {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.copy-btn.copied {
  background: #10b981;
}
.copy-btn-sm {
  font-size: 0.72rem;
  padding: 0.3rem 0.7rem;
}

/* Share */
.share-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.share-btn {
  padding: 0.65rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.share-btn:hover {
  opacity: 0.85;
}

.share-whatsapp {
  background: #dcfce7;
  color: #166534;
}
.share-copy {
  background: #f3f4f6;
  color: #374151;
}

/* Stats */
.referral-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #faf5ff;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #7c3aed;
}

.stat-label {
  font-size: 0.65rem;
  color: #9ca3af;
  text-align: center;
}

.stat-divider {
  width: 1px;
  height: 2rem;
  background: #e5e7eb;
}

/* Next reward */
.next-reward {
  margin-bottom: 1rem;
}

.next-reward-label {
  font-size: 0.78rem;
  color: #6b7280;
  margin-bottom: 0.4rem;
}

.next-reward-track {
  height: 6px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
}

.next-reward-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 100px;
  transition: width 0.5s ease;
}

/* Recent referrals */
.recent-label {
  font-size: 0.72rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.recent-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #7c3aed;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recent-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111;
}

.recent-status {
  font-size: 0.72rem;
  color: #9ca3af;
}

.recent-status.rewarded {
  color: #10b981;
}

/* Loading */
.referral-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
