<!-- components/LanguageSwitcher.vue -->
<template>
  <div class="relative" ref="menuRef">
    <button
      @click="toggleMenu"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <span class="text-2xl">{{ currentFlag }}</span>
      <span class="text-sm font-medium">{{ currentLocale.toUpperCase() }}</span>
      <ChevronDownIcon class="w-4 h-4 text-gray-500" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="switchLanguage(lang.code)"
        class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
        :class="{ 'bg-blue-50': currentLocale === lang.code }"
      >
        <span class="text-xl">{{ lang.flag }}</span>
        <span class="text-sm">{{ lang.name }}</span>
        <CheckIcon v-if="currentLocale === lang.code" class="w-4 h-4 text-blue-600 ml-auto" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'

const { locale } = useI18n()
const menuOpen = ref(false)
const menuRef = ref(null)

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

const currentLocale = computed(() => locale.value)
const currentFlag = computed(() => {
  return languages.find((lang) => lang.code === currentLocale.value)?.flag || '🌐'
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const switchLanguage = (code: string) => {
  locale.value = code
  localStorage.setItem('coinquest_locale', code) // ✅ IMPORTANT: utiliser 'coinquest_locale' et non 'user-locale'
  menuOpen.value = false
}

onClickOutside(menuRef, () => {
  menuOpen.value = false
})
</script>
