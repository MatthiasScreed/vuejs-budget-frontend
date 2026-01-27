#!/usr/bin/env node

/**
 * Script de test de connexion API
 * Teste les connexions vers les APIs en local et production
 */

import axios from 'axios'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
config({ path: join(__dirname, '../.env.local') })
config({ path: join(__dirname, '../.env') })

// Configuration
const TIMEOUT = 10000 // 10 secondes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

// URLs à tester
const APIs = {
  local: {
    name: 'API Locale (Herd)',
    baseUrl: 'http://budget-api.test/api',
    endpoints: {
      health: '/health',
      ping: '/ping',
      csrf: '/csrf-cookie',
    }
  },
  production: {
    name: 'API Production (Expose)',
    baseUrl: process.env.VITE_API_BASE_URL || 'https://coinquest.us-1.sharedwithexpose.com/api',
    endpoints: {
      health: '/health',
      ping: '/ping',
      csrf: '/csrf-cookie',
    }
  }
}

// Bridge API
const BRIDGE_CONFIG = {
  clientId: process.env.VITE_BRIDGE_CLIENT_ID,
  clientSecret: process.env.VITE_BRIDGE_CLIENT_SECRET,
  environment: process.env.VITE_BRIDGE_ENVIRONMENT || 'sandbox',
  redirectUri: process.env.VITE_BRIDGE_REDIRECT_URI,
}

/**
 * Afficher un message formaté
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Afficher un titre de section
 */
function section(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60))
}

/**
 * Tester une URL
 */
async function testEndpoint(baseUrl, endpoint, name) {
  const url = `${baseUrl}${endpoint}`
  const startTime = Date.now()

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      validateStatus: () => true, // Accepter tous les status
    })

    const duration = Date.now() - startTime
    const status = response.status

    if (status >= 200 && status < 300) {
      log(`  ✓ ${name}: ${status} (${duration}ms)`, 'green')
      return { success: true, status, duration, data: response.data }
    } else if (status === 404) {
      log(`  ⚠ ${name}: ${status} - Endpoint non trouvé (${duration}ms)`, 'yellow')
      return { success: false, status, duration, error: 'Not Found' }
    } else if (status === 419) {
      log(`  ⚠ ${name}: ${status} - CSRF Token manquant (normal) (${duration}ms)`, 'yellow')
      return { success: true, status, duration, info: 'CSRF required' }
    } else {
      log(`  ✗ ${name}: ${status} (${duration}ms)`, 'red')
      return { success: false, status, duration, error: response.statusText }
    }
  } catch (error) {
    const duration = Date.now() - startTime

    if (error.code === 'ECONNABORTED') {
      log(`  ✗ ${name}: TIMEOUT après ${TIMEOUT}ms`, 'red')
      return { success: false, error: 'Timeout', duration: TIMEOUT }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      log(`  ✗ ${name}: Connexion impossible (${error.code})`, 'red')
      return { success: false, error: error.code, duration }
    } else {
      log(`  ✗ ${name}: ${error.message}`, 'red')
      return { success: false, error: error.message, duration }
    }
  }
}

/**
 * Tester une API complète
 */
async function testAPI(apiConfig) {
  section(`🔍 Test: ${apiConfig.name}`)
  log(`URL: ${apiConfig.baseUrl}`, 'cyan')

  const results = {}

  for (const [key, endpoint] of Object.entries(apiConfig.endpoints)) {
    results[key] = await testEndpoint(apiConfig.baseUrl, endpoint, key.toUpperCase())
  }

  return results
}

/**
 * Vérifier la configuration Bridge
 */
function checkBridgeConfig() {
  section('🏦 Configuration Bridge API')

  const checks = {
    clientId: !!BRIDGE_CONFIG.clientId && BRIDGE_CONFIG.clientId !== 'ton_secret_ici',
    clientSecret: !!BRIDGE_CONFIG.clientSecret && BRIDGE_CONFIG.clientSecret !== 'ton_secret_bridge_ici_a_remplacer',
    redirectUri: !!BRIDGE_CONFIG.redirectUri,
    environment: !!BRIDGE_CONFIG.environment,
  }

  log(`  Client ID: ${checks.clientId ? '✓ Configuré' : '✗ Manquant'}`, checks.clientId ? 'green' : 'red')
  log(`  Client Secret: ${checks.clientSecret ? '✓ Configuré' : '✗ Manquant ou placeholder'}`, checks.clientSecret ? 'green' : 'red')
  log(`  Redirect URI: ${checks.redirectUri ? '✓ ' + BRIDGE_CONFIG.redirectUri : '✗ Manquant'}`, checks.redirectUri ? 'green' : 'red')
  log(`  Environment: ${checks.environment ? '✓ ' + BRIDGE_CONFIG.environment : '✗ Manquant'}`, checks.environment ? 'green' : 'red')

  const allConfigured = Object.values(checks).every(v => v)
  return allConfigured
}

/**
 * Afficher le résumé
 */
function displaySummary(localResults, prodResults, bridgeConfigured) {
  section('📊 Résumé')

  // API Locale
  const localSuccess = Object.values(localResults).filter(r => r.success).length
  const localTotal = Object.keys(localResults).length
  log(`  API Locale: ${localSuccess}/${localTotal} endpoints OK`, localSuccess === localTotal ? 'green' : 'yellow')

  // API Production
  const prodSuccess = Object.values(prodResults).filter(r => r.success).length
  const prodTotal = Object.keys(prodResults).length
  log(`  API Production: ${prodSuccess}/${prodTotal} endpoints OK`, prodSuccess === prodTotal ? 'green' : 'yellow')

  // Bridge
  log(`  Bridge API: ${bridgeConfigured ? '✓ Configuré' : '✗ Non configuré'}`, bridgeConfigured ? 'green' : 'red')

  // Recommandations
  console.log('\n' + '─'.repeat(60))
  log('💡 Recommandations:', 'bright')

  if (localSuccess === 0) {
    log('  • L\'API locale est inaccessible. Vérifiez que Herd est démarré.', 'yellow')
    log('    Commande: herd start', 'cyan')
  }

  if (prodSuccess === 0) {
    log('  • L\'API de production est inaccessible. Vérifiez l\'URL Expose.', 'yellow')
    log('    URL actuelle: ' + APIs.production.baseUrl, 'cyan')
  }

  if (!bridgeConfigured) {
    log('  • Bridge API non configuré. Obtenez vos credentials sur:', 'yellow')
    log('    https://dashboard.bridgeapi.io/', 'cyan')
  }

  console.log('─'.repeat(60) + '\n')
}

/**
 * Main
 */
async function main() {
  log('\n🚀 Test de connexion API - CoinQuest', 'bright')
  log('Date: ' + new Date().toLocaleString('fr-FR'), 'cyan')

  // Test API Locale
  const localResults = await testAPI(APIs.local)

  // Test API Production
  const prodResults = await testAPI(APIs.production)

  // Check Bridge config
  const bridgeConfigured = checkBridgeConfig()

  // Résumé
  displaySummary(localResults, prodResults, bridgeConfigured)

  // Exit code
  const hasErrors =
    Object.values(localResults).some(r => !r.success) ||
    Object.values(prodResults).some(r => !r.success) ||
    !bridgeConfigured

  process.exit(hasErrors ? 1 : 0)
}

// Exécution
main().catch(error => {
  log('\n❌ Erreur fatale:', 'red')
  console.error(error)
  process.exit(1)
})
