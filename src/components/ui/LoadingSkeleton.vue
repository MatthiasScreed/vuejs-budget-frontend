<template>
  <div :class="containerClasses">
    <!-- Type: Card -->
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-card-info">
          <div class="skeleton-line skeleton-line-title"></div>
          <div class="skeleton-line skeleton-line-subtitle"></div>
        </div>
      </div>
      <div class="skeleton-card-body">
        <div class="skeleton-line skeleton-line-full"></div>
        <div class="skeleton-line skeleton-line-full"></div>
        <div class="skeleton-line skeleton-line-half"></div>
      </div>
    </div>

    <!-- Type: List -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-icon"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-line skeleton-line-title"></div>
          <div class="skeleton-line skeleton-line-subtitle"></div>
        </div>
      </div>
    </div>

    <!-- Type: Table -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div v-for="col in columns" :key="col" class="skeleton-table-cell">
          <div class="skeleton-line skeleton-line-full"></div>
        </div>
      </div>
      <div v-for="row in count" :key="row" class="skeleton-table-row">
        <div v-for="col in columns" :key="`${row}-${col}`" class="skeleton-table-cell">
          <div class="skeleton-line" :class="getRandomLineClass()"></div>
        </div>
      </div>
    </div>

    <!-- Type: Stats -->
    <div v-else-if="type === 'stats'" class="skeleton-stats">
      <div v-for="i in count" :key="i" class="skeleton-stat-card">
        <div class="skeleton-stat-icon"></div>
        <div class="skeleton-line skeleton-line-number"></div>
        <div class="skeleton-line skeleton-line-label"></div>
      </div>
    </div>

    <!-- Type: Text -->
    <div v-else-if="type === 'text'" class="skeleton-text">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-line"
        :class="i === count ? 'skeleton-line-half' : 'skeleton-line-full'"
      ></div>
    </div>

    <!-- Type: Avatar -->
    <div v-else-if="type === 'avatar'" class="skeleton-avatar-wrapper">
      <div class="skeleton-avatar" :class="avatarSizeClass"></div>
      <div v-if="showText" class="skeleton-avatar-text">
        <div class="skeleton-line skeleton-line-title"></div>
        <div class="skeleton-line skeleton-line-subtitle"></div>
      </div>
    </div>

    <!-- Type: Button -->
    <div v-else-if="type === 'button'" class="skeleton-button">
      <div class="skeleton-button-content"></div>
    </div>

    <!-- Type: Custom -->
    <div v-else-if="type === 'custom'">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ==========================================
// PROPS
// ==========================================

const props = withDefaults(
  defineProps<{
    type?: 'card' | 'list' | 'table' | 'stats' | 'text' | 'avatar' | 'button' | 'custom'
    count?: number
    columns?: number
    animated?: boolean
    theme?: 'light' | 'dark'
    avatarSize?: 'sm' | 'md' | 'lg'
    showText?: boolean
  }>(),
  {
    type: 'card',
    count: 3,
    columns: 4,
    animated: true,
    theme: 'light',
    avatarSize: 'md',
    showText: true,
  },
)

// ==========================================
// COMPUTED
// ==========================================

const containerClasses = computed(() => {
  const base = ['skeleton-container']

  if (props.animated) {
    base.push('skeleton-animated')
  }

  if (props.theme === 'dark') {
    base.push('skeleton-dark')
  }

  return base
})

const avatarSizeClass = computed(() => {
  const sizes = {
    sm: 'skeleton-avatar-sm',
    md: 'skeleton-avatar-md',
    lg: 'skeleton-avatar-lg',
  }
  return sizes[props.avatarSize]
})

// ==========================================
// METHODS
// ==========================================

function getRandomLineClass() {
  const classes = ['skeleton-line-full', 'skeleton-line-half', 'skeleton-line-quarter']
  return classes[Math.floor(Math.random() * classes.length)]
}
</script>

<style scoped>
/* ========================================== */
/* BASE SKELETON */
/* ========================================== */

.skeleton-container {
  width: 100%;
}

.skeleton-animated .skeleton-line,
.skeleton-animated .skeleton-avatar,
.skeleton-animated .skeleton-icon,
.skeleton-animated .skeleton-stat-icon,
.skeleton-animated .skeleton-button-content {
  position: relative;
  overflow: hidden;
}

.skeleton-animated .skeleton-line::after,
.skeleton-animated .skeleton-avatar::after,
.skeleton-animated .skeleton-icon::after,
.skeleton-animated .skeleton-stat-icon::after,
.skeleton-animated .skeleton-button-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Dark theme */
.skeleton-dark .skeleton-line,
.skeleton-dark .skeleton-avatar,
.skeleton-dark .skeleton-icon,
.skeleton-dark .skeleton-stat-icon {
  background-color: #374151;
}

.skeleton-dark .skeleton-card,
.skeleton-dark .skeleton-stat-card {
  background-color: #1f2937;
}

/* ========================================== */
/* SKELETON LINES */
/* ========================================== */

.skeleton-line {
  height: 1rem;
  background-color: #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.skeleton-line-full {
  width: 100%;
}

.skeleton-line-half {
  width: 60%;
}

.skeleton-line-quarter {
  width: 40%;
}

.skeleton-line-title {
  height: 1.25rem;
  width: 70%;
}

.skeleton-line-subtitle {
  height: 0.875rem;
  width: 50%;
}

.skeleton-line-number {
  height: 2rem;
  width: 5rem;
  margin: 0.5rem auto;
}

.skeleton-line-label {
  height: 0.875rem;
  width: 6rem;
  margin: 0 auto;
}

/* ========================================== */
/* CARD SKELETON */
/* ========================================== */

.skeleton-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.skeleton-avatar {
  width: 3rem;
  height: 3rem;
  background-color: #e5e7eb;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-card-info {
  flex: 1;
}

.skeleton-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ========================================== */
/* LIST SKELETON */
/* ========================================== */

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.skeleton-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
}

/* ========================================== */
/* TABLE SKELETON */
/* ========================================== */

.skeleton-table {
  width: 100%;
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid #e5e7eb;
  border-bottom: none;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-top: none;
}

.skeleton-table-row:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

.skeleton-table-cell {
  display: flex;
  align-items: center;
}

/* ========================================== */
/* STATS SKELETON */
/* ========================================== */

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.skeleton-stat-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  text-align: center;
}

.skeleton-stat-icon {
  width: 3rem;
  height: 3rem;
  background-color: #e5e7eb;
  border-radius: 50%;
  margin: 0 auto 1rem auto;
}

/* ========================================== */
/* TEXT SKELETON */
/* ========================================== */

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ========================================== */
/* AVATAR SKELETON */
/* ========================================== */

.skeleton-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-avatar-sm {
  width: 2rem;
  height: 2rem;
}

.skeleton-avatar-md {
  width: 3rem;
  height: 3rem;
}

.skeleton-avatar-lg {
  width: 4rem;
  height: 4rem;
}

.skeleton-avatar-text {
  flex: 1;
  max-width: 200px;
}

/* ========================================== */
/* BUTTON SKELETON */
/* ========================================== */

.skeleton-button {
  display: inline-block;
}

.skeleton-button-content {
  width: 120px;
  height: 44px;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
}

/* ========================================== */
/* RESPONSIVE */
/* ========================================== */

@media (max-width: 640px) {
  .skeleton-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .skeleton-card {
    padding: 1rem;
  }

  .skeleton-list-item {
    padding: 0.75rem;
  }
}
</style>
