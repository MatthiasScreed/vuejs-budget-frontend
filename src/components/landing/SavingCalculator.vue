<!-- src/components/landing/SavingsCalculator.vue -->

<template>
  <div class="savings-calculator">
    <h3 class="calculator-title">💰 Calculez votre potentiel d'économies</h3>

    <div class="calculator-form">
      <!-- Revenu mensuel -->
      <div class="input-group">
        <label for="income" class="input-label"> Votre revenu mensuel net </label>
        <div class="input-wrapper">
          <input
            id="income"
            v-model.number="income"
            type="number"
            step="100"
            min="0"
            class="input-field"
            placeholder="2500"
          />
          <span class="input-suffix">€</span>
        </div>
      </div>

      <!-- Dépenses fixes -->
      <div class="input-group">
        <label for="expenses" class="input-label"> Vos dépenses mensuelles fixes </label>
        <div class="input-wrapper">
          <input
            id="expenses"
            v-model.number="expenses"
            type="number"
            step="100"
            min="0"
            class="input-field"
            placeholder="1800"
          />
          <span class="input-suffix">€</span>
        </div>
      </div>
    </div>

    <!-- Résultats -->
    <div v-if="isInputValid" class="calculator-results">
      <div class="result-primary">
        <span class="result-label"> Capacité d'épargne </span>
        <span class="result-value">
          {{ formatCurrency(calculation.monthlyCapacity) }}
        </span>
        <span class="result-subtext"> par mois </span>
      </div>

      <div class="result-secondary">
        <div class="result-item">
          <span class="result-icon">📅</span>
          <div>
            <p class="result-number">
              {{ formatCurrency(calculation.yearlyPotential) }}
            </p>
            <p class="result-description">potentiel annuel</p>
          </div>
        </div>

        <div class="result-item">
          <span class="result-icon">📊</span>
          <div>
            <p class="result-number">{{ calculation.percentageOfIncome.toFixed(0) }}%</p>
            <p class="result-description">de votre revenu</p>
          </div>
        </div>
      </div>

      <!-- Message d'encouragement -->
      <div class="result-message">
        <p v-if="calculation.percentageOfIncome >= 20">
          🎉 Excellent ! Vous avez une très bonne capacité d'épargne.
        </p>
        <p v-else-if="calculation.percentageOfIncome >= 10">
          💪 Bien ! Vous pouvez constituer une épargne solide.
        </p>
        <p v-else>✨ CoinQuest vous aidera à optimiser vos dépenses.</p>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else class="calculator-error">
      <p>⚠️ Vos dépenses ne peuvent pas dépasser votre revenu</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSavingsCalculator } from '@/composables/useSavingsCalculator'

// Utilisation du composable
const { income, expenses, calculation, isInputValid, formatCurrency } = useSavingsCalculator()
</script>

<style scoped>
.savings-calculator {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.calculator-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.calculator-form {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  font-size: 1.125rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 12px;
  color: #333;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #ffd700;
  background: white;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  font-weight: 600;
  color: #667eea;
}

.calculator-results {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-primary {
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid #ffd700;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.result-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.result-value {
  display: block;
  font-size: 3rem;
  font-weight: 800;
  color: #ffd700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.result-subtext {
  display: block;
  font-size: 0.875rem;
  opacity: 0.8;
}

.result-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.result-icon {
  font-size: 2rem;
}

.result-number {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.result-description {
  font-size: 0.75rem;
  opacity: 0.8;
}

.result-message {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.calculator-error {
  background: rgba(255, 100, 100, 0.2);
  border: 2px solid rgba(255, 100, 100, 0.5);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: #ffcccc;
}

/* Responsive */
@media (max-width: 640px) {
  .savings-calculator {
    padding: 1.5rem;
  }

  .result-value {
    font-size: 2.5rem;
  }

  .result-secondary {
    grid-template-columns: 1fr;
  }
}
</style>
