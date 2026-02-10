// scripts/download-images.ts

import fs from 'fs'
import path from 'path'
import https from 'https'

/**
 * Script pour télécharger les images de la landing page
 * École 42: Script utilitaire séparé
 */

interface ImageDownload {
  url: string
  destination: string
}

const images: ImageDownload[] = [
  // Avatars depuis UI Avatars
  {
    url: 'https://ui-avatars.com/api/?name=Marie+Dubois&size=300&rounded=true&background=667eea&color=fff&bold=true',
    destination: 'public/images/avatars/marie.jpg',
  },
  {
    url: 'https://ui-avatars.com/api/?name=Thomas+Martin&size=300&rounded=true&background=764ba2&color=fff&bold=true',
    destination: 'public/images/avatars/thomas.jpg',
  },
  {
    url: 'https://ui-avatars.com/api/?name=Sophie+Leroy&size=300&rounded=true&background=f093fb&color=fff&bold=true',
    destination: 'public/images/avatars/sophie.jpg',
  },
]

/**
 * Télécharge une image
 */
async function downloadImage(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destination)

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const file = fs.createWriteStream(destination)

    https
      .get(url, (response) => {
        response.pipe(file)

        file.on('finish', () => {
          file.close()
          console.log(`✅ Téléchargé: ${destination}`)
          resolve()
        })
      })
      .on('error', (error) => {
        fs.unlink(destination, () => {})
        console.error(`❌ Erreur: ${destination}`, error.message)
        reject(error)
      })
  })
}

/**
 * Télécharge toutes les images
 */
async function downloadAllImages(): Promise<void> {
  console.log('🚀 Téléchargement des images...\n')

  for (const image of images) {
    try {
      await downloadImage(image.url, image.destination)
    } catch (error) {
      console.error(`Échec pour ${image.destination}`)
    }
  }

  console.log('\n✨ Téléchargement terminé !')
}

// Exécution
downloadAllImages()
