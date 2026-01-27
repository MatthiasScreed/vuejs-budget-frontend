#!/usr/bin/env node

/**
 * Script de debug détaillé de l'environnement
 * Usage: npm run debug-env
 */

import fs from 'fs'
import { networkInterfaces } from 'os'

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan')
  log(title.toUpperCase(), 'cyan')
  log('='.repeat(60), 'cyan')
}

// Lire le fichier .env
function readEnv() {
  if (!fs.existsSync('.env')) {
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

// Obtenir toutes les IPs réseau
function getAllIPs() {
  const nets = networkInterfaces()
  const ips = {}

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4') {
        if (!ips[name]) {
          ips[name] = []
        }
        ips[name].push({
          address: net.address,
          internal: net.internal,
          netmask: net.netmask
        })
      }
    }
  }

  return ips
}

// Masquer les parties sensibles
function maskSecret(secret) {
  if (!secret || secret.length < 10) return '(non configuré)'
  return secret.substring(0, 8) + '*'.repeat(Math.min(secret.length - 8, 20))
}

// Fonction principale
function debugEnvironment() {
  log('\n🔍 DEBUG ENVIRONNEMENT COINQUEST', 'magenta')

  const env = readEnv()
  const ips = getAllIPs()

  // 1. Informations réseau
  section('📡 Informations Réseau')

  for (const [interface, addresses] of Object.entries(ips)) {
    log(`\n${interface}:`, 'cyan')
    addresses.forEach(addr => {
      const type = addr.internal ? '(loopback)' : '(externe)'
      log(`  ${addr.address} ${type}`, 'blue')
    })
  }

  // 2. Configuration Mode
  section('🎯 Mode de Déploiement')

  const mode = env.VITE_DEPLOYMENT_MODE || 'auto'
  log(`Mode actuel: ${mode}`, mode === 'auto' ? 'yellow' : 'green')
  log(`\nModes disponibles:`)
  log('  • local    - Développement local (IP ou .test domain)', 'blue')
  log('  • expose   - Tunnel Expose.dev', 'blue')
  log('  • ngrok    - Tunnel Ngrok', 'blue')
  log('  • production - Serveur de production', 'blue')
  log('  • auto     - Détection automatique (recommandé)', 'green')

  // 3. URLs API
  section('🌐 Configuration URLs API')

  const apiUrls = [
    { name: 'URL Actuelle', key: 'VITE_API_BASE_URL', required: false },
    { name: 'URL Local', key: 'VITE_API_BASE_URL_LOCAL', required: false },
    { name: 'URL Expose', key: 'VITE_API_BASE_URL_EXPOSE', required: false },
    { name: 'URL Ngrok', key: 'VITE_API_BASE_URL_NGROK', required: false },
    { name: 'URL Production', key: 'VITE_API_BASE_URL_PRODUCTION', required: false }
  ]

  apiUrls.forEach(({ name, key, required }) => {
    const value = env[key]
    if (value) {
      log(`✅ ${name}: ${value}`, 'green')
    } else if (required) {
      log(`❌ ${name}: REQUIS MAIS MANQUANT`, 'red')
    } else {
      log(`⚪ ${name}: Non configuré (optionnel)`, 'yellow')
    }
  })

  // 4. Configuration Bridge API
  section('🌉 Configuration Bridge API')

  const bridgeConfig = [
    { name: 'Client ID', key: 'VITE_BRIDGE_CLIENT_ID', mask: false },
    { name: 'Client Secret', key: 'VITE_BRIDGE_CLIENT_SECRET', mask: true },
    { name: 'Connect URL', key: 'VITE_BRIDGE_CONNECT_URL', mask: false },
    { name: 'API URL', key: 'VITE_BRIDGE_API_URL', mask: false }
  ]

  bridgeConfig.forEach(({ name, key, mask }) => {
    const value = env[key]
    if (value) {
      const displayValue = mask ? maskSecret(value) : value

      // Validation spéciale pour Client ID
      if (key === 'VITE_BRIDGE_CLIENT_ID') {
        if (value.startsWith('sandbox_')) {
          log(`✅ ${name}: ${displayValue}`, 'green')
        } else {
          log(`⚠️  ${name}: ${displayValue} (devrait commencer par 'sandbox_')`, 'yellow')
        }
      } else {
        log(`✅ ${name}: ${displayValue}`, 'green')
      }
    } else {
      log(`❌ ${name}: Non configuré`, 'red')
    }
  })

  // 5. Autres configurations
  section('⚙️  Autres Configurations')

  const otherConfig = [
    { name: 'App Name', key: 'VITE_APP_NAME' },
    { name: 'App Version', key: 'VITE_APP_VERSION' },
    { name: 'Expose Subdomain', key: 'VITE_EXPOSE_SUBDOMAIN' }
  ]

  otherConfig.forEach(({ name, key }) => {
    const value = env[key]
    if (value) {
      log(`${name}: ${value}`, 'blue')
    }
  })

  // 6. URLs calculées
  section('🔗 URLs Calculées (selon mode)')

  log('\nSi mode = local:', 'cyan')
  const localIp = Object.values(ips).flat().find(ip => !ip.internal)?.address || '127.0.0.1'
  log(`  Frontend: http://${localIp}:3000`, 'blue')
  log(`  API: ${env.VITE_API_BASE_URL_LOCAL || `http://${localIp}:8000/api`}`, 'blue')

  if (env.VITE_API_BASE_URL_EXPOSE) {
    log('\nSi mode = expose:', 'cyan')
    log(`  Frontend: http://${localIp}:3000 (ou expose si configuré)`, 'blue')
    log(`  API: ${env.VITE_API_BASE_URL_EXPOSE}`, 'blue')
  }

  if (env.VITE_API_BASE_URL_NGROK) {
    log('\nSi mode = ngrok:', 'cyan')
    log(`  Frontend: Variable selon ngrok`, 'blue')
    log(`  API: ${env.VITE_API_BASE_URL_NGROK}`, 'blue')
  }

  // 7. Commandes utiles
  section('🚀 Commandes Utiles')

  log('\nDémarrage:', 'cyan')
  log('  npm run dev              - Mode auto (détection)', 'blue')
  log('  npm run dev:local        - Force mode local', 'blue')
  log('  npm run dev:expose       - Force mode expose', 'blue')
  log('  npm run dev:ngrok        - Force mode ngrok', 'blue')

  log('\nVérification:', 'cyan')
  log('  npm run check-env        - Vérification rapide', 'blue')
  log('  npm run debug-env        - Ce script (debug complet)', 'blue')

  log('\nBackend (dans le dossier Laravel):', 'cyan')
  log('  ./start-expose.sh        - Démarrer Expose', 'blue')
  log('  php artisan serve        - Démarrer Laravel sans Herd', 'blue')

  // 8. Recommandations
  section('💡 Recommandations')

  const recommendations = []

  if (!env.VITE_BRIDGE_CLIENT_ID || !env.VITE_BRIDGE_CLIENT_SECRET) {
    recommendations.push('Configure tes credentials Bridge API dans .env')
  }

  if (mode === 'auto' && !env.VITE_API_BASE_URL_EXPOSE) {
    recommendations.push('Configure VITE_API_BASE_URL_EXPOSE pour utiliser Expose facilement')
  }

  if (env.VITE_DEPLOYMENT_MODE && env.VITE_DEPLOYMENT_MODE !== 'auto') {
    recommendations.push(`Tu as forcé le mode "${env.VITE_DEPLOYMENT_MODE}". Utilise "auto" pour la détection automatique`)
  }

  if (env.VITE_API_BASE_URL) {
    recommendations.push('Tu as défini VITE_API_BASE_URL explicitement. Laisse-le vide pour la détection automatique')
  }

  if (recommendations.length > 0) {
    recommendations.forEach((rec, i) => {
      log(`${i + 1}. ${rec}`, 'yellow')
    })
  } else {
    log('✅ Configuration optimale !', 'green')
  }

  // 9. Checklist
  section('✅ Checklist')

  const checklist = [
    {
      label: '.env configuré',
      check: () => fs.existsSync('.env')
    },
    {
      label: 'Bridge Client ID valide',
      check: () => env.VITE_BRIDGE_CLIENT_ID?.startsWith('sandbox_')
    },
    {
      label: 'Bridge Client Secret configuré',
      check: () => env.VITE_BRIDGE_CLIENT_SECRET?.length > 10
    },
    {
      label: 'Au moins une URL API configurée',
      check: () => env.VITE_API_BASE_URL_LOCAL || env.VITE_API_BASE_URL_EXPOSE || env.VITE_API_BASE_URL
    }
  ]

  checklist.forEach(({ label, check }) => {
    const passed = check()
    if (passed) {
      log(`✅ ${label}`, 'green')
    } else {
      log(`❌ ${label}`, 'red')
    }
  })

  // Fin
  log('\n' + '='.repeat(60), 'cyan')
  log('🎉 Debug terminé !', 'green')
  log('='.repeat(60) + '\n', 'cyan')
}

// Exécution
try {
  debugEnvironment()
} catch (err) {
  log(`\n❌ Erreur: ${err.message}\n`, 'red')
  console.error(err.stack)
  process.exit(1)
}
