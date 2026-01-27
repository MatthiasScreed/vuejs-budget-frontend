# 🎓 Système de Tutoriel Goals & Projects

**Date**: 2026-01-27
**Objectif**: Expliquer aux utilisateurs la différence entre Goals et Projects

---

## 📋 Vue d'ensemble

Un système de tutoriel interactif a été ajouté pour guider les utilisateurs dans l'utilisation des **Goals** (objectifs d'épargne simples) et des **Projects** (projets complexes).

### Composants créés

1. **`TutorialModal.vue`** - Modal de tutoriel réutilisable
2. **`useTutorial.ts`** - Composable avec le contenu des tutoriels
3. Intégration dans **`Goals.vue`** (prêt pour Projects.vue)

---

## 🎯 Fonctionnalités

### Modal Tutoriel

- ✅ **Navigation par étapes** avec indicateurs de progression
- ✅ **Exemples concrets** pour chaque concept
- ✅ **Astuces pratiques** dans des encarts colorés
- ✅ **Bouton "Aide"** toujours accessible dans l'interface
- ✅ **Affichage automatique** à la première visite
- ✅ **Option "Ne plus afficher"** avec localStorage
- ✅ **Design moderne** avec gradient et animations

### Contenu du Tutoriel

Le tutoriel comprend **6 étapes** :

1. **Introduction** - Présentation Goals vs Projects
2. **Goals** - Objectifs d'épargne simples avec 3 exemples
3. **Projects** - Projets structurés avec 3 exemples
4. **Quand utiliser quoi ?** - Guide de décision
5. **Gamification** - Système XP et récompenses
6. **Prêt à commencer** - Call-to-action

---

## 💻 Utilisation

### Dans la page Goals

Le tutoriel s'affiche automatiquement :
- À la première visite de la page (`goals_tutorial_seen` non défini)
- Délai de 1 seconde après le chargement

L'utilisateur peut :
- Naviguer entre les étapes (Précédent/Suivant)
- Cliquer sur "Aide" en haut pour réafficher
- Cliquer sur "Ne plus afficher" pour ne plus le voir

### Code d'intégration

```vue
<template>
  <TutorialModal
    v-model="showTutorial"
    :steps="tutorialSteps"
    storage-key="goals_tutorial_seen"
    @finish="handleTutorialFinish"
    @skip="handleTutorialSkip"
  />
</template>

<script setup>
import { useGoalsProjectsTutorial } from '@/composables/useTutorial'
import TutorialModal from '@/components/tutorial/TutorialModal.vue'

const { steps: tutorialSteps } = useGoalsProjectsTutorial()
const showTutorial = ref(false)

onMounted(() => {
  const tutorialSeen = localStorage.getItem('goals_tutorial_seen')
  if (!tutorialSeen) {
    setTimeout(() => showTutorial.value = true, 1000)
  }
})
</script>
```

---

## 🎨 Exemples Inclus

### Goals (Objectifs Simples)

| Exemple | Montant | Description |
|---------|---------|-------------|
| 🏖️ Vacances d'été | 1 500€ | Épargne pour vacances avec date limite |
| 📱 Nouveau smartphone | 800€ | Achat sans date fixe, versements libres |
| 🛡️ Fonds d'urgence | 3 000€ | Réserve de sécurité, objectif 12 mois |

### Projects (Projets Complexes)

| Exemple | Budget | Catégories | Durée |
|---------|--------|------------|-------|
| 🗾 Voyage Japon | 4 000€ | Vols, hébergement, transport, activités | 6 mois |
| 🏠 Achat appartement | 50 000€ | Apport, notaire, agence, travaux | 24 mois |
| 🚗 Achat voiture | 15 000€ | Apport, assurance, immatriculation | 8 mois |

---

## 🔧 Personnalisation

### Créer un nouveau tutoriel

```typescript
// Dans useTutorial.ts
export function useCustomTutorial() {
  const steps: TutorialStep[] = [
    {
      icon: '🎯',
      title: 'Mon Étape',
      content: `<p>Contenu HTML</p>`,
      examples: [
        {
          icon: '💡',
          title: 'Exemple',
          description: 'Description de l\'exemple',
          details: ['Détail 1', 'Détail 2']
        }
      ],
      tips: ['Astuce 1', 'Astuce 2']
    }
  ]

  return { steps }
}
```

### Types disponibles

```typescript
interface TutorialStep {
  icon: string                // Emoji d'icône
  title: string              // Titre de l'étape
  content: string            // Contenu HTML
  examples?: TutorialExample[]
  examplesTitle?: string     // Titre section exemples
  tips?: string[]            // Astuces
}

interface TutorialExample {
  icon: string
  title: string
  description: string
  details?: string[]         // Liste de détails
}
```

---

## 📊 Statistiques

### Performance Build

- **Taille modal**: ~2-3 KB (gzip)
- **Taille contenu**: ~8 KB (contenu des tutoriels)
- **Impact total**: ~10-11 KB
- **Build time**: Pas d'impact significatif

### UX

- ⚡ Affichage instantané (pas de chargement)
- 🎨 Animations fluides (CSS transitions)
- 📱 Responsive (mobile-friendly)
- ♿ Accessible (peut fermer avec ESC)

---

## 🚀 Prochaines Étapes

### À Faire

- [ ] Ajouter le tutoriel dans la vue `Projects.vue`
- [ ] Créer un tutoriel spécifique pour Banking (Bridge)
- [ ] Ajouter des vidéos/GIFs dans les étapes
- [ ] Tracking analytics des tutoriels vus/complétés
- [ ] Version courte (onboarding rapide)

### Tutoriels à Créer

1. **Banking Tutorial** - Connexion bancaire Bridge
2. **Gaming Tutorial** - Système XP, achievements, streaks
3. **Dashboard Tutorial** - Lecture du tableau de bord
4. **Categories Tutorial** - Gestion des catégories

---

## 🎓 Pour l'Utilisateur

### Comment réafficher le tutoriel ?

1. **Méthode 1** : Cliquer sur le bouton "❓ Aide" en haut de la page
2. **Méthode 2** : Ouvrir la console développeur et exécuter :
   ```javascript
   localStorage.removeItem('goals_tutorial_seen')
   location.reload()
   ```

### Réinitialiser tous les tutoriels

```javascript
// Dans la console navigateur
localStorage.removeItem('goals_tutorial_seen')
localStorage.removeItem('projects_tutorial_seen')
localStorage.removeItem('banking_tutorial_seen')
location.reload()
```

---

## 📝 Notes Techniques

### LocalStorage Keys

- `goals_tutorial_seen` - Tutoriel Goals/Projects
- `projects_tutorial_seen` - Tutoriel Projects seul
- `banking_tutorial_seen` - Tutoriel Banking (à venir)

### Événements Émis

```typescript
emit('finish')  // Utilisateur termine le tutoriel
emit('skip')    // Utilisateur clique "Ne plus afficher"
```

### Props du Modal

```typescript
{
  modelValue: boolean          // v-model pour afficher/cacher
  steps: TutorialStep[]       // Étapes du tutoriel
  storageKey?: string         // Clé localStorage (optionnel)
}
```

---

**Créé par**: Claude
**Documentation**: 2026-01-27
**Version**: 1.0.0
