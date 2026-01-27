#!/usr/bin/env node

/**
 * Script de vérification de l'environnement
 * Usage: npm run check-env
 */

import fs from 'fs'
import https from 'https'
import http from 'http'
import { networkInterfaces } from 'os'

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Obtenir l'IP locale
function getLocalIp() {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return '127.0.0.1'
}

// Lire le fichier .env
function readEnv() {
  if (!fs.existsSync('.env')) {
    log('❌ Fichier .env non trouvé', 'red')
    return {}
  }

  const envFile = fs.readFileSync('.env', 'utf8')
  const env = {}

  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })

  return env
}

// Tester une URL
function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(5000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

// Fonction principale
async function checkEnvironment() {
  log('\n🔍 Vérification de l\'environnement CoinQuest\n', 'cyan')

  const env = readEnv()
  const localIp = getLocalIp()

  log(`📍 IP Locale: ${localIp}`, 'blue')
  log('')

  // 1. Mode de déploiement
  const mode = env.VITE_DEPLOYMENT_MODE || 'auto'
  log(`🎯 Mode: ${mode}`, mode === 'auto' ? 'yellow' : 'green')
  log('')

  // 2. Vérifier Bridge API credentials
  log('🌉 Configuration Bridge API:', 'cyan')

  const bridgeClientId = env.VITE_BRIDGE_CLIENT_ID
  if (bridgeClientId) {
    if (bridgeClientId.startsWith('sandbox_')) {
      log(`  ✅ Client ID: ${bridgeClientId.substring(0, 20)}...`, 'green')
    } else {
      log(`  ⚠️  Client ID ne semble pas valide (devrait commencer par 'sandbox_')`, 'yellow')
    }
  } else {
    log('  ❌ Client ID manquant', 'red')
  }

  const bridgeSecret = env.VITE_BRIDGE_CLIENT_SECRET
  if (bridgeSecret && bridgeSecret.length > 10) {
    log('  ✅ Client Secret configuré', 'green')
  } else {
    log('  ❌ Client Secret manquant ou invalide', 'red')
  }
  log('')

  // 3. URLs API configurées
  log('🌐 URLs API Configurées:', 'cyan')

  const apiUrls = {
    'Local': env.VITE_API_BASE_URL_LOCAL,
    'Expose': env.VITE_API_BASE_URL_EXPOSE,
    'Ngrok': env.VITE_API_BASE_URL_NGROK,
    'Production': env.VITE_API_BASE_URL_PRODUCTION
  }

  for (const [name, url] of Object.entries(apiUrls)) {
    if (url) {
      log(`  ✅ ${name}: ${url}`, 'green')
    } else {
      log(`  ⚠️  ${name}: Non configuré`, 'yellow')
    }
  }
  log('')

  // 4. Test connexion API
  log('🔌 Test de connexion API...', 'cyan')

  let apiUrl = env.VITE_API_BASE_URL

  if (!apiUrl) {
    // Essayer de deviner l'URL selon le mode
    if (mode === 'local' || mode === 'auto') {
      apiUrl = env.VITE_API_BASE_URL_LOCAL || `http://${localIp}:8000/api`
    } else if (mode === 'expose') {
      apiUrl = env.VITE_API_BASE_URL_EXPOSE
    }
  }

  if (apiUrl) {
    const healthUrl = apiUrl.replace('/api', '/api/health')
    log(`  Test: ${healthUrl}`)

    const isAccessible = await testUrl(healthUrl)

    if (isAccessible) {
      log('  ✅ API accessible !', 'green')
    } else {
      log('  ❌ API non accessible', 'red')
      log('     Vérifie que Laravel Herd tourne et que l\'URL est correcte', 'yellow')
    }
  } else {
    log('  ⚠️  Aucune URL API configurée pour tester', 'yellow')
  }
  log('')

  // 5. Recommandations
  log('💡 Recommandations:', 'cyan')

  if (mode === 'auto' && !env.VITE_API_BASE_URL_EXPOSE) {
    log('  • Configure VITE_API_BASE_URL_EXPOSE pour utiliser Expose', 'yellow')
  }

  if (!bridgeClientId || !bridgeSecret) {
    log('  • Configure tes credentials Bridge API pour tester les connexions bancaires', 'yellow')
  }

  if (!env.VITE_API_BASE_URL) {
    log('  • Laisse VITE_API_BASE_URL vide pour la détection automatique', 'green')
  }

  log('')
  log('✅ Vérification terminée !', 'green')
  log('')
  log('Pour plus d\'informations, exécute: npm run debug-env', 'blue')
  log('')
}

// Exécution
checkEnvironment().catch(err => {
  log(`\n❌ Erreur: ${err.message}\n`, 'red')
  process.exit(1)
})
