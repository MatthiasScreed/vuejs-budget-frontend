import { ref } from 'vue'

interface TutorialExample {
  icon: string
  title: string
  description: string
  details?: string[]
}

interface TutorialStep {
  icon: string
  title: string
  content: string
  examples?: TutorialExample[]
  examplesTitle?: string
  tips?: string[]
}

/**
 * Tutoriel pour Goals vs Projects
 */
export function useGoalsProjectsTutorial() {
  const steps: TutorialStep[] = [
    {
      icon: '🎯',
      title: 'Bienvenue dans la Gestion de vos Objectifs !',
      content: `
        <p>CoinQuest vous propose <strong>deux systèmes complémentaires</strong> pour gérer vos finances :</p>
        <ul>
          <li><strong>Goals (Objectifs)</strong> : Pour vos objectifs d'épargne simples</li>
          <li><strong>Projects (Projets)</strong> : Pour vos projets complexes avec plusieurs étapes</li>
        </ul>
        <p>Découvrons ensemble comment les utiliser efficacement !</p>
      `
    },
    {
      icon: '💰',
      title: 'Goals - Objectifs d\'Épargne Simples',
      content: `
        <p>Les <strong>Goals</strong> sont parfaits pour des objectifs financiers directs :</p>
        <ul>
          <li>Un montant cible à atteindre</li>
          <li>Une date limite (optionnelle)</li>
          <li>Suivi automatique de votre progression</li>
          <li>Gain d'XP quand vous contribuez !</li>
        </ul>
        <p>Idéal pour : épargne mensuelle, vacances, nouveau téléphone, fonds d'urgence...</p>
      `,
      examples: [
        {
          icon: '🏖️',
          title: 'Vacances d\'été',
          description: 'Épargner 1 500€ d\'ici juillet',
          details: [
            'Montant cible : 1 500€',
            'Date limite : 31 juillet 2026',
            'Contributions régulières : 250€/mois'
          ]
        },
        {
          icon: '📱',
          title: 'Nouveau smartphone',
          description: 'Mettre de côté 800€ pour un iPhone',
          details: [
            'Montant cible : 800€',
            'Sans date limite',
            'Versements libres selon vos moyens'
          ]
        },
        {
          icon: '🛡️',
          title: 'Fonds d\'urgence',
          description: 'Constituer une réserve de sécurité',
          details: [
            'Montant cible : 3 000€',
            'Objectif long terme (12 mois)',
            'Contributions automatiques : 250€/mois'
          ]
        }
      ],
      tips: [
        'Créez plusieurs goals simultanément pour différents objectifs',
        'Ajoutez des contributions dès que vous économisez',
        'Gagnez de l\'XP à chaque contribution !'
      ]
    },
    {
      icon: '🏗️',
      title: 'Projects - Projets Complexes Structurés',
      content: `
        <p>Les <strong>Projects</strong> sont conçus pour des projets d'envergure avec plusieurs phases :</p>
        <ul>
          <li>Templates pré-configurés (voyage, maison, voiture...)</li>
          <li>Plusieurs catégories de dépenses</li>
          <li>Milestones (jalons) pour suivre l'avancement</li>
          <li>États : en cours, en pause, terminé, annulé</li>
        </ul>
        <p>Idéal pour : grand voyage, achat immobilier, mariage, rénovations...</p>
      `,
      examples: [
        {
          icon: '🗾',
          title: 'Voyage au Japon',
          description: 'Projet complet avec plusieurs catégories',
          details: [
            'Budget total : 4 000€',
            'Catégories : Billets d\'avion, Hébergement, Transport local, Activités',
            'Milestones : Réserver vols, Réserver hôtels, Acheter JR Pass',
            'Durée : 6 mois de préparation'
          ]
        },
        {
          icon: '🏠',
          title: 'Achat appartement',
          description: 'Projet immobilier sur plusieurs années',
          details: [
            'Budget total : 50 000€ (apport)',
            'Catégories : Épargne apport, Frais notaire, Frais agence, Travaux',
            'Milestones : 10k€, 25k€, 40k€, 50k€',
            'Durée : 24 mois'
          ]
        },
        {
          icon: '🚗',
          title: 'Achat voiture',
          description: 'Financer un véhicule neuf',
          details: [
            'Budget total : 15 000€',
            'Catégories : Apport initial, Assurance, Immatriculation',
            'Milestones : Épargner apport, Obtenir financement',
            'Durée : 8 mois'
          ]
        }
      ],
      tips: [
        'Utilisez les templates pour démarrer rapidement',
        'Ajustez les catégories selon vos besoins spécifiques',
        'Marquez les milestones comme complétés pour suivre votre progression'
      ]
    },
    {
      icon: '🤔',
      title: 'Quand utiliser quoi ?',
      content: `
        <h3>Utilisez un <strong>Goal</strong> si :</h3>
        <ul>
          <li>Vous avez un objectif d'épargne simple et direct</li>
          <li>Un seul montant cible suffit</li>
          <li>Vous voulez quelque chose de rapide à créer</li>
          <li>Pas besoin de diviser en sous-catégories</li>
        </ul>

        <h3>Utilisez un <strong>Project</strong> si :</h3>
        <ul>
          <li>Votre objectif nécessite plusieurs catégories de dépenses</li>
          <li>Vous voulez suivre des étapes/milestones</li>
          <li>C'est un projet à moyen ou long terme</li>
          <li>Vous avez besoin d'une vue d'ensemble détaillée</li>
        </ul>

        <p class="mt-4"><strong>💡 Astuce :</strong> Vous pouvez combiner les deux ! Par exemple, avoir un Project "Mariage"
        avec plusieurs catégories, et un Goal "Lune de miel" séparé pour les vacances.</p>
      `
    },
    {
      icon: '🎮',
      title: 'Gamification et Récompenses',
      content: `
        <p>Que vous utilisiez Goals ou Projects, <strong>vous gagnez toujours de l'XP</strong> :</p>
        <ul>
          <li>🎯 <strong>+50 XP</strong> : Créer un nouveau goal ou project</li>
          <li>💰 <strong>+20 XP</strong> : Ajouter une contribution</li>
          <li>✅ <strong>+100 XP</strong> : Compléter un milestone (project)</li>
          <li>🏆 <strong>+200 XP</strong> : Atteindre votre objectif final !</li>
        </ul>

        <p class="mt-4">Plus vous êtes régulier dans vos efforts, plus vous gagnez d'XP et débloquez des achievements !</p>
      `,
      tips: [
        'Consultez régulièrement vos objectifs pour rester motivé',
        'Célébrez chaque milestone atteint',
        'Partagez vos succès avec la communauté pour gagner bonus XP'
      ]
    },
    {
      icon: '🚀',
      title: 'Prêt à Commencer !',
      content: `
        <p>Vous avez maintenant toutes les clés pour gérer efficacement vos objectifs financiers :</p>
        <ul>
          <li>✅ Vous savez faire la différence entre Goals et Projects</li>
          <li>✅ Vous connaissez les cas d'usage de chacun</li>
          <li>✅ Vous pouvez gagner de l'XP en épargnant</li>
        </ul>

        <h3>Par où commencer ?</h3>
        <p>1. <strong>Objectif simple ?</strong> Créez un Goal depuis l'onglet "Objectifs"</p>
        <p>2. <strong>Projet complexe ?</strong> Explorez les templates de Projects</p>
        <p>3. <strong>Besoin d'inspiration ?</strong> Regardez les projets populaires</p>

        <p class="mt-4 text-center font-semibold text-purple-600">
          Bonne gestion et amusez-vous bien ! 🎉
        </p>
      `
    }
  ]

  return {
    steps
  }
}

/**
 * Tutoriel spécifique Goals uniquement
 */
export function useGoalsTutorial() {
  const steps: TutorialStep[] = [
    {
      icon: '🎯',
      title: 'Vos Objectifs d\'Épargne',
      content: `
        <p>Les <strong>Goals</strong> vous permettent de définir et suivre vos objectifs d'épargne facilement.</p>
        <p>Créez un objectif en quelques secondes et suivez votre progression en temps réel !</p>
      `
    },
    {
      icon: '➕',
      title: 'Créer un Objectif',
      content: `
        <p>Pour créer un goal :</p>
        <ul>
          <li>Cliquez sur "Nouvel Objectif"</li>
          <li>Donnez-lui un nom clair (ex: "Vacances 2026")</li>
          <li>Définissez le montant cible</li>
          <li>Ajoutez une date limite (optionnel)</li>
          <li>Choisissez une catégorie (optionnel)</li>
        </ul>
      `,
      examples: [
        {
          icon: '📱',
          title: 'iPhone 16',
          description: '1 200€ - Sans date limite'
        },
        {
          icon: '✈️',
          title: 'Vacances NYC',
          description: '3 000€ - Avant décembre 2026'
        }
      ]
    },
    {
      icon: '💵',
      title: 'Ajouter des Contributions',
      content: `
        <p>Chaque fois que vous économisez, ajoutez une contribution :</p>
        <ul>
          <li>Cliquez sur un goal existant</li>
          <li>Appuyez sur "Ajouter une contribution"</li>
          <li>Entrez le montant</li>
          <li>Gagnez de l'XP automatiquement ! 🎮</li>
        </ul>
      `,
      tips: [
        'Ajoutez même de petites contributions régulières',
        'Plus vous contribuez souvent, plus vous gagnez d\'XP',
        'Configurez des rappels pour ne pas oublier'
      ]
    },
    {
      icon: '🏆',
      title: 'Atteindre vos Objectifs',
      content: `
        <p>Quand vous atteignez 100% de votre goal :</p>
        <ul>
          <li>🎉 Débloquez un achievement spécial</li>
          <li>💪 Gagnez 200 XP bonus</li>
          <li>📊 Votre statistique de réussite augmente</li>
          <li>🔥 Maintenez votre streak actif</li>
        </ul>
        <p class="mt-4">Marquez ensuite votre goal comme terminé et commencez-en un nouveau !</p>
      `
    }
  ]

  return {
    steps
  }
}

/**
 * Tutoriel spécifique Projects uniquement
 */
export function useProjectsTutorial() {
  const steps: TutorialStep[] = [
    {
      icon: '🏗️',
      title: 'Vos Projets Structurés',
      content: `
        <p>Les <strong>Projects</strong> vous aident à gérer des projets complexes avec plusieurs phases et catégories.</p>
        <p>Parfait pour les grands objectifs nécessitant une planification détaillée !</p>
      `
    },
    {
      icon: '📋',
      title: 'Templates de Projets',
      content: `
        <p>Démarrez rapidement avec nos templates pré-configurés :</p>
      `,
      examples: [
        {
          icon: '✈️',
          title: 'Voyage',
          description: 'Transport, hébergement, activités, restauration',
          details: ['Budget suggéré : 2 000€ - 5 000€', '4 catégories pré-définies']
        },
        {
          icon: '🏠',
          title: 'Immobilier',
          description: 'Apport, notaire, agence, travaux',
          details: ['Budget suggéré : 30 000€ - 100 000€', '5 catégories pré-définies']
        },
        {
          icon: '🚗',
          title: 'Véhicule',
          description: 'Achat, assurance, immatriculation',
          details: ['Budget suggéré : 10 000€ - 30 000€', '3 catégories pré-définies']
        },
        {
          icon: '💍',
          title: 'Mariage',
          description: 'Lieu, traiteur, décoration, tenues, voyage de noces',
          details: ['Budget suggéré : 15 000€ - 40 000€', '8 catégories pré-définies']
        }
      ],
      tips: [
        'Les templates incluent des budgets recommandés',
        'Vous pouvez personnaliser toutes les catégories',
        'Ajoutez ou supprimez des catégories selon vos besoins'
      ]
    },
    {
      icon: '🎯',
      title: 'Milestones (Jalons)',
      content: `
        <p>Les milestones vous aident à découper votre projet en étapes :</p>
        <ul>
          <li>Définissez des objectifs intermédiaires</li>
          <li>Suivez votre progression étape par étape</li>
          <li>Célébrez chaque jalon atteint (+100 XP)</li>
          <li>Restez motivé tout au long du projet</li>
        </ul>
      `,
      examples: [
        {
          icon: '🗾',
          title: 'Projet Voyage Japon - Milestones',
          description: 'Exemple de jalons pour un voyage',
          details: [
            '✅ Milestone 1 : Économiser 1 000€ (25%)',
            '⏳ Milestone 2 : Réserver les vols (50%)',
            '⏳ Milestone 3 : Réserver les hôtels (75%)',
            '⏳ Milestone 4 : Budget activités complet (100%)'
          ]
        }
      ]
    },
    {
      icon: '⚡',
      title: 'Gestion des États',
      content: `
        <p>Gérez facilement l'état de vos projets :</p>
        <ul>
          <li>🟢 <strong>Actif</strong> : Projet en cours</li>
          <li>⏸️ <strong>En pause</strong> : Temporairement suspendu</li>
          <li>✅ <strong>Terminé</strong> : Objectif atteint !</li>
          <li>❌ <strong>Annulé</strong> : Projet abandonné</li>
        </ul>
        <p class="mt-4">Changez d'état à tout moment selon l'évolution de vos priorités.</p>
      `,
      tips: [
        'Mettez en pause les projets non prioritaires',
        'Consultez l\'historique de vos projets terminés',
        'Analysez pourquoi certains projets ont été annulés'
      ]
    },
    {
      icon: '📊',
      title: 'Suivi et Analyse',
      content: `
        <p>Visualisez votre progression en détail :</p>
        <ul>
          <li>📈 Graphiques de progression par catégorie</li>
          <li>💰 Répartition du budget dépensé</li>
          <li>⏱️ Temps restant jusqu'à la date cible</li>
          <li>🎯 Pourcentage d'avancement global</li>
        </ul>
        <p class="mt-4">Prenez des décisions éclairées grâce aux statistiques détaillées.</p>
      `
    }
  ]

  return {
    steps
  }
}
