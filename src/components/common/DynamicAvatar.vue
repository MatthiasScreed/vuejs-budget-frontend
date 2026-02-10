<!-- src/components/common/DynamicAvatar.vue -->

<template>
  <div class="dynamic-avatar" :style="avatarStyle">
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      class="avatar-image"
      @error="handleImageError"
    />
    <div v-else class="avatar-initials">
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/**
 * Props du composant
 * École 42: Props typées et documentées
 */
interface Props {
  src?: string
  name: string
  size?: number
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: undefined,
  size: 60,
  backgroundColor: undefined,
})

const imageError = ref(false)

/**
 * Extrait les initiales du nom
 * École 42: Max 25 lignes, fonction claire
 */
const initials = computed(() => {
  const names = props.name.trim().split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return props.name.substring(0, 2).toUpperCase()
})

/**
 * Génère une couleur basée sur le nom
 */
const generateColor = (name: string): string => {
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0',
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Style dynamique de l'avatar
 */
const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  background: props.backgroundColor || generateColor(props.name),
  fontSize: `${props.size / 2.5}px`,
}))

/**
 * Gère l'erreur de chargement d'image
 */
const handleImageError = (): void => {
  imageError.value = true
}

const alt = computed(() => `Avatar de ${props.name}`)
</script>

<style scoped>
.dynamic-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  user-select: none;
}
</style>
