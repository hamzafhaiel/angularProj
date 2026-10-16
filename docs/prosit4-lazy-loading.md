# Prosit 4 : Lazy Loading

## État initial

Toutes les pages étaient importées directement dans `app.routes.ts` et
utilisaient `component`. Leurs dépendances étaient donc chargées au démarrage.
Les routes des différents domaines figuraient dans un seul fichier.

## Organisation retenue

| Fonctionnalité | Chargement | Configuration |
| --- | --- | --- |
| Accueil | `loadComponent` | `app.routes.ts` |
| Contact | `loadComponent` | `app.routes.ts` |
| Profil utilisateur | `loadComponent` | `app.routes.ts` |
| Page inconnue | `loadComponent` | Dernière route racine `**` |
| Conférences | `loadChildren` | `conference-list/conference.routes.ts` |
| Inscription et confirmation | `loadChildren` | `registration/registration.routes.ts` |

Les imports dynamiques créent des points de séparation pour le build.
Les pages simples sont chargées uniquement lorsqu'elles sont demandées.
Les fonctionnalités à plusieurs écrans exposent leurs propres tableaux `Routes`,
chargés par `loadChildren`, puis leurs pages par `loadComponent`.
Une architecture avec composants standalone ne nécessite pas de NgModule.

Les routes enfants des conférences sont `''` et `':id'` sous `/list`.
Celles de l'inscription sont `''` et `':id'` sous `/registration`, puis `''`
et `'confirmation'` sous le parent `':id'`. Ces parents sans composant
n'ajoutent pas d'écran ; le `router-outlet` racine affiche toujours une page.
Le paramètre `id` du parent est hérité par sa route enfant vide.

Les URL existantes sont conservées : `/list/2`, `/registration/2` et
`/registration/2/confirmation`. Les signaux, les liens actifs, le retour à la
liste et la navigation automatique après inscription restent opérationnels.
Le préchargement automatique n'est pas activé : les fonctionnalités non visitées
ne sont pas téléchargées en arrière-plan.

## Évolution

Les domaines Administration, Intervenants, Paiement, Statistiques et Utilisateurs
cités dans le contexte pourront ajouter chacun un fichier de routes chargé par
`loadChildren` s'ils regroupent plusieurs écrans, ou une route `loadComponent`
pour une page unique. Le PDF ne définit pas leurs écrans ni leurs règles métier.
Chaque équipe pourra modifier son fichier de routes sans alourdir la racine.

## Vérification

Le build de production doit afficher des fichiers « Lazy chunk files » pour
les routes et pages différées. Les tests vérifient le chargement à la demande,
les URL directes, les paramètres hérités, l'historique, l'inscription et les
URL inconnues. L'hébergeur doit toujours renvoyer `index.html` pour les URL
applicatives lors d'un accès direct ou d'un rafraîchissement.
