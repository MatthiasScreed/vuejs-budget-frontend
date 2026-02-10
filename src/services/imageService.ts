// src/services/imageService.ts

/**
 * Service de gestion des images
 * École 42: Service séparé, responsabilité unique
 */
export class ImageService {
  /**
   * Génère une URL d'avatar via DiceBear API
   */
  static generateAvatar(name: string, style: string = 'avataaars'): string {
    const seed = encodeURIComponent(name)
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`
  }

  /**
   * Génère une URL d'avatar via UI Avatars
   */
  static generateUIAvatar(name: string, backgroundColor?: string, color?: string): string {
    const params = new URLSearchParams({
      name: name,
      size: '300',
      rounded: 'true',
      bold: 'true',
      ...(backgroundColor && { background: backgroundColor.replace('#', '') }),
      ...(color && { color: color.replace('#', '') }),
    })

    return `https://ui-avatars.com/api/?${params.toString()}`
  }

  /**
   * Génère un placeholder via placeholder.com
   */
  static generatePlaceholder(width: number, height: number, text?: string): string {
    const textParam = text ? `/${encodeURIComponent(text)}` : ''
    return `https://via.placeholder.com/${width}x${height}/667eea/ffffff${textParam}`
  }

  /**
   * Vérifie si une image existe
   */
  static async imageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Obtient une image avec fallback
   */
  static async getImageWithFallback(primaryUrl: string, fallbackUrl: string): Promise<string> {
    const exists = await this.imageExists(primaryUrl)
    return exists ? primaryUrl : fallbackUrl
  }
}
