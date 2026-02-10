// src/utils/placeholders.ts

/**
 * Génère un SVG placeholder
 * École 42: Fonction utilitaire réutilisable
 */
export function generatePlaceholderSVG(
  width: number,
  height: number,
  text: string = 'Image',
  backgroundColor: string = '#e2e8f0',
  textColor: string = '#718096',
): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="24"
        fill="${textColor}"
      >${text}</text>
    </svg>
  `)}`
}

/**
 * Génère un avatar placeholder SVG
 */
export function generateAvatarPlaceholder(name: string, size: number = 300): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return generatePlaceholderSVG(size, size, initials, '#667eea', '#ffffff')
}
