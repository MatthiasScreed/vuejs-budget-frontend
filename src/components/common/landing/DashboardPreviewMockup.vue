<!-- src/components/landing/DashboardPreviewMockup.vue -->

<template>
  <div class="dashboard-mockup">
    <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" class="mockup-svg">
      <!-- Fond -->
      <rect width="1200" height="800" fill="#f8f9fa" rx="16" />

      <!-- Header -->
      <rect width="1200" height="60" fill="#ffffff" />
      <circle cx="30" cy="30" r="8" fill="#667eea" />
      <rect x="50" y="22" width="150" height="16" rx="8" fill="#e2e8f0" />

      <!-- Sidebar -->
      <rect width="250" height="740" y="60" fill="#ffffff" />

      <!-- Sidebar Items -->
      <g v-for="(item, index) in sidebarItems" :key="index">
        <rect
          :x="20"
          :y="100 + index * 60"
          width="210"
          height="40"
          rx="8"
          :fill="index === 0 ? '#667eea' : '#f7fafc'"
        />
        <circle :cx="40" :cy="120 + index * 60" r="6" :fill="index === 0 ? '#ffffff' : '#cbd5e0'" />
        <rect
          :x="60"
          :y="112 + index * 60"
          width="100"
          height="16"
          rx="8"
          :fill="index === 0 ? '#ffffff' : '#e2e8f0'"
        />
      </g>

      <!-- Main Content Area -->
      <g transform="translate(270, 80)">
        <!-- Metrics Cards -->
        <g v-for="(card, index) in [0, 1, 2]" :key="card">
          <rect
            :x="index * 310"
            y="0"
            width="290"
            height="120"
            rx="12"
            fill="#ffffff"
            stroke="#e2e8f0"
            stroke-width="2"
          />
          <!-- Icon -->
          <circle :cx="20 + index * 310" cy="20" r="12" fill="#667eea" opacity="0.2" />
          <!-- Title -->
          <rect :x="50 + index * 310" y="14" width="120" height="12" rx="6" fill="#cbd5e0" />
          <!-- Value -->
          <rect :x="20 + index * 310" y="50" width="150" height="24" rx="12" fill="#1a202c" />
          <!-- Subtitle -->
          <rect :x="20 + index * 310" y="85" width="80" height="10" rx="5" fill="#e2e8f0" />
        </g>

        <!-- Chart Area -->
        <rect
          y="140"
          width="910"
          height="400"
          rx="12"
          fill="#ffffff"
          stroke="#e2e8f0"
          stroke-width="2"
        />

        <!-- Chart Title -->
        <rect x="20" y="160" width="200" height="16" rx="8" fill="#1a202c" />

        <!-- Donut Chart -->
        <circle
          cx="300"
          cy="350"
          r="100"
          fill="none"
          stroke="#667eea"
          stroke-width="30"
          stroke-dasharray="200 314"
        />
        <circle
          cx="300"
          cy="350"
          r="100"
          fill="none"
          stroke="#764ba2"
          stroke-width="30"
          stroke-dasharray="100 314"
          stroke-dashoffset="-200"
        />
        <circle
          cx="300"
          cy="350"
          r="100"
          fill="none"
          stroke="#f093fb"
          stroke-width="30"
          stroke-dasharray="14 314"
          stroke-dashoffset="-300"
        />

        <!-- Legend -->
        <g transform="translate(450, 250)">
          <g v-for="(legend, index) in legends" :key="index">
            <circle :cy="index * 40" r="8" :fill="legend.color" />
            <rect x="20" :y="index * 40 - 8" width="120" height="12" rx="6" fill="#cbd5e0" />
            <rect x="20" :y="index * 40 + 8" width="80" height="10" rx="5" fill="#e2e8f0" />
          </g>
        </g>

        <!-- Recent Transactions -->
        <rect
          y="560"
          width="910"
          height="140"
          rx="12"
          fill="#ffffff"
          stroke="#e2e8f0"
          stroke-width="2"
        />

        <rect x="20" y="580" width="180" height="16" rx="8" fill="#1a202c" />

        <!-- Transaction Items -->
        <g v-for="i in 2" :key="i">
          <circle :cx="30" :cy="610 + i * 40" r="10" fill="#667eea" opacity="0.2" />
          <rect :x="50" :y="604 + i * 40" width="150" height="12" rx="6" fill="#4a5568" />
          <rect :x="750" :y="604 + i * 40" width="80" height="12" rx="6" fill="#667eea" />
        </g>
      </g>

      <!-- Floating UI Elements (for depth) -->
      <g opacity="0.8">
        <rect
          x="1000"
          y="100"
          width="150"
          height="80"
          rx="8"
          fill="#ffffff"
          filter="url(#shadow)"
        />
        <circle cx="1025" cy="125" r="8" fill="#43e97b" />
        <rect x="1045" y="118" width="80" height="14" rx="7" fill="#cbd5e0" />
      </g>

      <!-- Shadow Filter -->
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * Données du mockup
 * École 42: Données séparées du rendu
 */
const sidebarItems = ref(['Dashboard', 'Transactions', 'Objectifs', 'Analytique', 'Progression'])

const legends = ref([
  { color: '#667eea', label: 'Logement' },
  { color: '#764ba2', label: 'Alimentation' },
  { color: '#f093fb', label: 'Transport' },
])
</script>

<style scoped>
.dashboard-mockup {
  width: 100%;
  position: relative;
}

.mockup-svg {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: perspective(1000px) rotateY(-5deg);
  transition: transform 0.3s ease;
}

.mockup-svg:hover {
  transform: perspective(1000px) rotateY(0deg);
}

@media (max-width: 768px) {
  .mockup-svg {
    transform: none;
  }
}
</style>
