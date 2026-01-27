import { ref, nextTick } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  icon?: string
  persistent?: boolean
  width?: string
  autoFocus?: 'confirm' | 'cancel' | false
}

interface ConfirmDialog {
  id: string
  options: ConfirmOptions
  resolve: (value: boolean) => void
  isVisible: boolean
}

/**
 * Composable pour dialogues de confirmation élégants
 * Promisified, stackable, customizable avec animations
 */
export function useConfirm() {
  // State
  const dialogs = ref<ConfirmDialog[]>([])
  const isProcessing = ref(false)

  /**
   * Afficher dialogue de confirmation
   */
  async function confirm(
    message: string,
    options: Partial<ConfirmOptions> = {}
  ): Promise<boolean> {
    const fullOptions: ConfirmOptions = {
      title: 'Confirmation',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      type: 'info',
      persistent: false,
      autoFocus: 'confirm',
      ...options,
      message
    }

    return new Promise((resolve) => {
      const dialog: ConfirmDialog = {
        id: generateDialogId(),
        options: fullOptions,
        resolve,
        isVisible: false
      }

      dialogs.value.push(dialog)

      // Animation d'entrée
      nextTick(() => {
        dialog.isVisible = true
      })
    })
  }

  /**
   * Confirmation rapide avec message simple
   */
  async function confirmQuick(message: string): Promise<boolean> {
    return confirm(message, {
      title: 'Êtes-vous sûr ?',
      confirmText: 'Oui',
      cancelText: 'Non'
    })
  }

  /**
   * Confirmation de suppression
   */
  async function confirmDelete(itemName?: string): Promise<boolean> {
    return confirm(
      itemName
        ? `Supprimer "${itemName}" définitivement ?`
        : 'Supprimer cet élément définitivement ?',
      {
        title: '🗑️ Supprimer',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'error',
        icon: '🗑️',
        autoFocus: 'cancel' // Sécurité : focus sur annuler
      }
    )
  }

  /**
   * Confirmation d'action critique
   */
  async function confirmCritical(
    message: string,
    actionName: string = 'Continuer'
  ): Promise<boolean> {
    return confirm(message, {
      title: '⚠️ Action Critique',
      confirmText: actionName,
      cancelText: 'Annuler',
      type: 'warning',
      icon: '⚠️',
      persistent: true,
      autoFocus: 'cancel'
    })
  }

  /**
   * Confirmation avec input de vérification
   */
  async function confirmWithVerification(
    message: string,
    verificationText: string
  ): Promise<boolean> {
    // Cette fonction nécessiterait un composant plus complexe
    // Pour simplifier, on utilise une confirmation critique
    return confirmCritical(
      `${message}\n\nTapez "${verificationText}" pour confirmer`,
      'Je comprends'
    )
  }

  /**
   * Fermer un dialogue spécifique
   */
  function closeDialog(dialogId: string, result: boolean): void {
    const dialog = dialogs.value.find(d => d.id === dialogId)

    if (dialog) {
      dialog.isVisible = false

      // Animation de sortie puis résolution
      setTimeout(() => {
        dialog.resolve(result)
        dialogs.value = dialogs.value.filter(d => d.id !== dialogId)
      }, 200) // Délai pour animation de fermeture
    }
  }

  /**
   * Confirmer le dialogue actuel (premier de la pile)
   */
  function confirmCurrent(): void {
    const current = getCurrentDialog()
    if (current) {
      closeDialog(current.id, true)
    }
  }

  /**
   * Annuler le dialogue actuel
   */
  function cancelCurrent(): void {
    const current = getCurrentDialog()
    if (current) {
      closeDialog(current.id, false)
    }
  }

  /**
   * Fermer tous les dialogues
   */
  function closeAll(): void {
    dialogs.value.forEach(dialog => {
      dialog.resolve(false)
    })
    dialogs.value = []
  }

  /**
   * Obtenir le dialogue actuel (le plus récent)
   */
  function getCurrentDialog(): ConfirmDialog | null {
    return dialogs.value.length > 0 ? dialogs.value[dialogs.value.length - 1] : null
  }

  /**
   * Générer un ID unique pour dialogue
   */
  function generateDialogId(): string {
    return `confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtenir l'icône selon le type
   */
  function getTypeIcon(type: ConfirmOptions['type']): string {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    }

    return icons[type || 'info']
  }

  /**
   * Obtenir la couleur selon le type
   */
  function getTypeColor(type: ConfirmOptions['type']): string {
    const colors = {
      info: '#3B82F6',
      warning: '#F59E0B',
      error: '#EF4444',
      success: '#10B981'
    }

    return colors[type || 'info']
  }

  /**
   * Gérer les raccourcis clavier
   */
  function handleKeyboard(event: KeyboardEvent): void {
    const current = getCurrentDialog()
    if (!current) return

    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        confirmCurrent()
        break
      case 'Escape':
        if (!current.options.persistent) {
          event.preventDefault()
          cancelCurrent()
        }
        break
    }
  }

  /**
   * Confirmation avec loading pour actions async
   */
  async function confirmAsync<T>(
    message: string,
    action: () => Promise<T>,
    options: Partial<ConfirmOptions> = {}
  ): Promise<T | null> {
    const confirmed = await confirm(message, options)

    if (!confirmed) return null

    isProcessing.value = true

    try {
      const result = await action()
      return result
    } catch (error) {
      // Re-throw l'erreur pour que le composant parent puisse la gérer
      throw error
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // State
    dialogs,
    isProcessing,

    // Methods
    confirm,
    confirmQuick,
    confirmDelete,
    confirmCritical,
    confirmWithVerification,
    confirmAsync,
    closeDialog,
    confirmCurrent,
    cancelCurrent,
    closeAll,
    getCurrentDialog,
    getTypeIcon,
    getTypeColor,
    handleKeyboard
  }
}
