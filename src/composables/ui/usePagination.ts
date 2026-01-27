import { ref, computed, watch } from 'vue'

interface PaginationConfig {
  total: number
  perPage: number
  currentPage?: number
  maxVisible?: number
  showQuickJumper?: boolean
  showSizeChanger?: boolean
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  from: number
  to: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Composable pour pagination intelligente et responsive
 * Navigation fluide, jump rapide, changement taille page
 */
export function usePagination(config: PaginationConfig) {
  // State
  const currentPage = ref(config.currentPage || 1)
  const perPage = ref(config.perPage)
  const total = ref(config.total)
  const maxVisible = ref(config.maxVisible || 7)

  /**
   * Aller à une page spécifique
   */
  function goToPage(page: number): void {
    if (isValidPage(page)) {
      currentPage.value = page
    }
  }

  /**
   * Page suivante
   */
  function nextPage(): void {
    if (hasNext.value) {
      currentPage.value++
    }
  }

  /**
   * Page précédente
   */
  function prevPage(): void {
    if (hasPrev.value) {
      currentPage.value--
    }
  }

  /**
   * Première page
   */
  function firstPage(): void {
    currentPage.value = 1
  }

  /**
   * Dernière page
   */
  function lastPage(): void {
    currentPage.value = lastPageNumber.value
  }

  /**
   * Changer le nombre d'éléments par page
   */
  function changePerPage(newPerPage: number): void {
    const currentFrom = (currentPage.value - 1) * perPage.value + 1

    perPage.value = newPerPage
    currentPage.value = Math.ceil(currentFrom / newPerPage)
  }

  /**
   * Vérifier si une page est valide
   */
  function isValidPage(page: number): boolean {
    return page >= 1 && page <= lastPageNumber.value
  }

  /**
   * Obtenir les pages visibles pour navigation
   */
  function getVisiblePages(): number[] {
    const pages: number[] = []
    const current = currentPage.value
    const max = lastPageNumber.value
    const visible = maxVisible.value

    if (max <= visible) {
      // Afficher toutes les pages
      for (let i = 1; i <= max; i++) {
        pages.push(i)
      }
    } else {
      // Calcul intelligent des pages visibles
      const half = Math.floor(visible / 2)
      let start = Math.max(1, current - half)
      let end = Math.min(max, start + visible - 1)

      // Ajuster si proche du début/fin
      if (end - start + 1 < visible) {
        start = Math.max(1, end - visible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  /**
   * Obtenir les options de taille de page
   */
  function getPerPageOptions(): number[] {
    const base = [10, 20, 50, 100]
    const current = perPage.value

    if (!base.includes(current)) {
      base.push(current)
      base.sort((a, b) => a - b)
    }

    return base
  }

  /**
   * Réinitialiser à la première page
   */
  function reset(): void {
    currentPage.value = 1
  }

  /**
   * Mettre à jour le total d'éléments
   */
  function updateTotal(newTotal: number): void {
    total.value = newTotal

    // Ajuster la page actuelle si nécessaire
    if (currentPage.value > lastPageNumber.value) {
      currentPage.value = Math.max(1, lastPageNumber.value)
    }
  }

  /**
   * Obtenir les métadonnées de pagination
   */
  function getMeta(): PaginationMeta {
    return {
      total: total.value,
      perPage: perPage.value,
      currentPage: currentPage.value,
      lastPage: lastPageNumber.value,
      from: from.value,
      to: to.value,
      hasNext: hasNext.value,
      hasPrev: hasPrev.value
    }
  }

  // Computed properties
  const lastPageNumber = computed(() => Math.ceil(total.value / perPage.value) || 1)

  const from = computed(() => (currentPage.value - 1) * perPage.value + 1)

  const to = computed(() => Math.min(currentPage.value * perPage.value, total.value))

  const hasNext = computed(() => currentPage.value < lastPageNumber.value)

  const hasPrev = computed(() => currentPage.value > 1)

  const visiblePages = computed(() => getVisiblePages())

  const perPageOptions = computed(() => getPerPageOptions())

  const showFirstLast = computed(() => lastPageNumber.value > maxVisible.value)

  const showEllipsis = computed(() => {
    const visible = visiblePages.value
    return {
      start: visible.length > 0 && visible[0] > 2,
      end: visible.length > 0 && visible[visible.length - 1] < lastPageNumber.value - 1
    }
  })

  // Watcher pour valider les changements
  watch([total, perPage], () => {
    if (currentPage.value > lastPageNumber.value) {
      currentPage.value = Math.max(1, lastPageNumber.value)
    }
  })

  return {
    // State
    currentPage,
    perPage,
    total,
    maxVisible,

    // Computed
    lastPageNumber,
    from,
    to,
    hasNext,
    hasPrev,
    visiblePages,
    perPageOptions,
    showFirstLast,
    showEllipsis,

    // Methods
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePerPage,
    reset,
    updateTotal,
    getMeta,
    isValidPage
  }
}
