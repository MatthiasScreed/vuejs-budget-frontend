#!/usr/bin/env node

/**
 * Script de validation des variables d'environnement
 * Vérifie que toutes les variables nécessaires sont présentes et valides
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
config({ path: join(__dirname, '../.env.local') })
config({ path: join(__dirname, '../.env') })

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Variables requises
const REQUIRED_VARS = {
  // API
  VITE_API_BASE_URL: {
    description: 'URL de base de l\'API',
    validate: (value) => value && value.startsWith('http'),
    example: 'https://coinquest.us-1.sharedwithexpose.com/api',
  },

  // Bridge API
  VITE_BRIDGE_CLIENT_ID: {
    description: 'Bridge API Client ID',
    validate: (value) => value && value.length > 10,
    example: 'sandbox_id_...',
  },
  VITE_BRIDGE_CLIENT_SECRET: {
    description: 'Bridge API Client Secret',
    validate: (value) => value && value.length > 10 && !value.includes('ton_secret'),
    example: 'your_actual_secret_here',
    sensitive: true,
  },
  VITE_BRIDGE_ENVIRONMENT: {
    description: 'Bridge Environment (sandbox/production)',
    validate: (value) => ['sandbox', 'production'].includes(value),
    example: 'sandbox',
  },
  VITE_BRIDGE_REDIRECT_URI: {
    description: 'Bridge Redirect URI',
    validate: (value) => value && value.startsWith('http'),
    example: 'https://coinquest.us-1.sharedwithexpose.com/app/banking',
  },
}

// Variables optionnelles
const OPTIONAL_VARS = {
  VITE_APP_NAME: {
    description: 'Nom de l\'application',
    default: 'CoinQuest',
  },
  VITE_DEPLOYMENT_MODE: {
    description: 'Mode de déploiement',
    default: 'auto',
  },
  VITE_DEBUG: {
    description: 'Mode debug',
    default: 'false',
  },
  VITE_DEFAULT_THEME: {
    description: 'Thème par défaut',
    default: 'light',
  },
  VITE_DEFAULT_CURRENCY: {
    description: 'Devise par défaut',
    default: 'EUR',
  },
}

/**
 * Valider les variables d'environnement
 */
function validateEnvVars() {
  log('\n🔍 Validation des variables d\'environnement\n', 'bright')

  const errors = []
  const warnings = []
  let successCount = 0

  // Variables requises
  log('Variables requises:', 'cyan')
  for (const [key, config] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[key]
    const isValid = config.validate(value)

    if (isValid) {
      const displayValue = config.sensitive ? '***' : value
      log(`  ✓ ${key}: ${displayValue}`, 'green')
      successCount++
    } else {
      log(`  ✗ ${key}: ${value || 'Non défini'}`, 'red')
      errors.push({
        key,
        message: `${config.description} - ${value ? 'Valeur invalide' : 'Variable manquante'}`,
        example: config.example,
      })
    }
  }

  // Variables optionnelles
  log('\nVariables optionnelles:', 'cyan')
  for (const [key, config] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[key]

    if (value) {
      log(`  ✓ ${key}: ${value}`, 'green')
      successCount++
    } else {
      log(`  ⚠ ${key}: Utilise la valeur par défaut (${config.default})`, 'yellow')
      warnings.push({
        key,
        message: `${config.description} - Utilise la valeur par défaut`,
        default: config.default,
      })
    }
  }

  return { errors, warnings, successCount }
}

/**
 * Afficher le rapport
 */
function displayReport(errors, warnings, successCount) {
  console.log('\n' + '='.repeat(60))
  log('📊 Rapport de validation', 'bright')
  console.log('='.repeat(60))

  const totalVars = Object.keys(REQUIRED_VARS).length + Object.keys(OPTIONAL_VARS).length

  log(`\n✓ Variables valides: ${successCount}/${totalVars}`, successCount === totalVars ? 'green' : 'yellow')
  log(`⚠ Avertissements: ${warnings.length}`, warnings.length > 0 ? 'yellow' : 'green')
  log(`✗ Erreurs: ${errors.length}`, errors.length > 0 ? 'red' : 'green')

  // Erreurs
  if (errors.length > 0) {
    console.log('\n' + '─'.repeat(60))
    log('❌ Erreurs à corriger:', 'red')
    errors.forEach((error, index) => {
      log(`\n${index + 1}. ${error.key}`, 'red')
      log(`   ${error.message}`, 'reset')
      if (error.example) {
        log(`   Exemple: ${error.example}`, 'cyan')
      }
    })
  }

  // Avertissements
  if (warnings.length > 0) {
    console.log('\n' + '─'.repeat(60))
    log('⚠️  Avertissements:', 'yellow')
    warnings.forEach((warning, index) => {
      log(`\n${index + 1}. ${warning.key}`, 'yellow')
      log(`   ${warning.message}`, 'reset')
      if (warning.default) {
        log(`   Défaut: ${warning.default}`, 'cyan')
      }
    })
  }

  // Instructions
  if (errors.length > 0) {
    console.log('\n' + '─'.repeat(60))
    log('💡 Instructions:', 'bright')
    log('  1. Éditez le fichier .env.local', 'cyan')
    log('  2. Ajoutez/corrigez les variables manquantes', 'cyan')
    log('  3. Relancez ce script pour vérifier', 'cyan')
    log('\n  Exemple de .env.local:', 'cyan')
    log('  VITE_API_BASE_URL=https://your-api.com/api', 'reset')
    log('  VITE_BRIDGE_CLIENT_ID=your_client_id', 'reset')
    log('  VITE_BRIDGE_CLIENT_SECRET=your_client_secret', 'reset')
  }

  console.log('\n' + '='.repeat(60) + '\n')
}

/**
 * Main
 */
function main() {
  const { errors, warnings, successCount } = validateEnvVars()
  displayReport(errors, warnings, successCount)

  // Exit code
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
