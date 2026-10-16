# Prosit 3 : Navigation dynamique

## Déjà réalisé

Le détail utilise `/list/:id` et lit `ActivatedRoute.paramMap` avec `toSignal()`.
Le composant de présentation reçoit la conférence avec `input()`.
Un changement d'identifiant actualise le détail sans abonnement manuel.
Le service `Router` permet déjà de revenir à la liste par programmation.

## Compléments réalisés

| URL | Rôle |
| --- | --- |
| `/registration` | Choisir une conférence |
| `/registration/:id` | Confirmer l'inscription à la conférence sélectionnée |
| `/registration/:id/confirmation` | Afficher le résultat de l'inscription |

Le lien depuis le détail transmet l'identifiant dans l'URL. La page
d'inscription utilise `ActivatedRoute` et `toSignal()` pour sélectionner les
mêmes données que le détail. Après une sauvegarde réussie, `Router.navigate()`
ouvre automatiquement la confirmation de cette conférence.

`RegistrationStore` centralise les identifiants inscrits dans un signal et les
conserve dans `sessionStorage`. La confirmation vérifie l'inscription avant
d'afficher un succès. Les identifiants inconnus, les données stockées invalides,
les doublons et les erreurs de sauvegarde sont pris en compte.

Cette inscription est une démonstration locale à la session du navigateur :
elle ne réserve pas de place sur un serveur et ne crée pas de compte.
Le PDF ne fournit ni API d'inscription ni règles de formulaire métier.

Le lien de menu Inscription reste actif sur les deux routes paramétrées.
Les liens de retour permettent de retrouver la conférence ou la liste.
Les tests vérifient le parcours complet, le changement d'identifiant, l'accès
direct, la restauration de session et les cas d'erreur.
