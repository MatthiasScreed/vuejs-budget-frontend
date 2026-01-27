<template>
  <div class="bank-provider-list">
    <!-- Header -->
    <div class="header">
      <h2 class="title">Connecter une banque</h2>
      <p class="subtitle">
        Synchronisez automatiquement vos transactions bancaires
      </p>
    </div>

    <!-- Search -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher votre banque..."
        class="search-input"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des banques...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadProviders" class="retry-btn">
        Réessayer
      </button>
    </div>

    <!-- Provider List -->
    <div v-else class="providers-grid">
      <div
        v-for="provider in filteredProviders"
        :key="provider.id"
        @click="selectProvider(provider)"
        class="provider-card"
      >
        <div class="provider-logo">
          <img
            v-if="provider.logo_url"
            :src="provider.logo_url"
            :alt="provider.name"
          />
          <div v-else class="provider-placeholder">
            {{ provider.name.charAt(0) }}
          </div>
        </div>

        <div class="provider-info">
          <h3 class="provider-name">{{ provider.name }}</h3>
          <p class="provider-capabilities">
            {{ formatCapabilities(provider.capabilities) }}
          </p>
        </div>

        <div class="provider-arrow">→</div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredProviders.length === 0" class="empty-state">
      <p>Aucune banque trouvée</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBankingStore } from '@/stores/banking.ts';

interface Provider {
  id: string;
  name: string;
  logo_url?: string;
  capabilities: string[];
}

const bankingStore = useBankingStore();

const searchQuery = ref('');
const loading = ref(false);
const error = ref('');

const providers = ref<Provider[]>([]);

const filteredProviders = computed(() => {
  if (!searchQuery.value) return providers.value;

  const query = searchQuery.value.toLowerCase();
  return providers.value.filter(p =>
    p.name.toLowerCase().includes(query)
  );
});

const loadProviders = async () => {
  loading.value = true;
  error.value = '';

  try {
    const result = await bankingStore.fetchProviders();
    providers.value = result.providers;
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement';
  } finally {
    loading.value = false;
  }
};

const selectProvider = async (provider: Provider) => {
  try {
    await bankingStore.initiateConnection(provider.id);
  } catch (e: any) {
    error.value = e.message;
  }
};

const formatCapabilities = (capabilities: string[]): string => {
  const labels: Record<string, string> = {
    'ais': 'Comptes',
    'pis': 'Paiements',
    'cbi': 'Informations'
  };

  return capabilities
    .map(c => labels[c] || c)
    .join(' • ');
};

onMounted(() => {
  loadProviders();
});
</script>

<style scoped>
.bank-provider-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

.search-box {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.providers-grid {
  display: grid;
  gap: 1rem;
}

.provider-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}

.provider-logo img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
}

.provider-placeholder {
  width: 48px;
  height: 48px;
  background: #8b5cf6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  border-radius: 8px;
}

.provider-info {
  flex: 1;
}

.provider-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.provider-capabilities {
  font-size: 0.85rem;
  color: #666;
}

.provider-arrow {
  font-size: 1.5rem;
  color: #8b5cf6;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>
