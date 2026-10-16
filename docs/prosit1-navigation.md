# Prosit 1 : Pourquoi un système de navigation ?

## État initial

Le projet utilisait déjà `provideRouter`, `router-outlet`, `routerLink`,
les routes `/home` et `/list`, une redirection par défaut et une page inconnue.
En revanche, le détail était sélectionné dans un signal local à la liste :
l'URL restait `/list`, le lien du détail était impossible à partager et la
sélection disparaissait au rafraîchissement.

## Architecture retenue

| URL | Page |
| --- | --- |
| `/` | Redirection vers `/home` |
| `/home` | Accueil et exemples Angular existants |
| `/list` | Liste des conférences |
| `/list/:id` | Détail identifié par le paramètre de route |
| Autre URL | Page introuvable |

`App` conserve l'en-tête et le pied de page autour du `router-outlet`.
Les liens « View details » utilisent `routerLink` et disposent d'un vrai `href`.
`ConferencePage` lit le paramètre `id` et sélectionne les données communes dans
`conferences.ts`. `ConferenceDetails` affiche les données reçues, sans gérer
la navigation. Un identifiant inconnu affiche un message et un lien de retour.
Le retour explicite et la fermeture du détail conduisent à `/list`.

L'URL devient la source de la page affichée. Angular Router gère l'historique
Précédent/Suivant et recrée le détail depuis son URL lors d'une ouverture directe.
Il n'est plus nécessaire d'ajouter des booléens d'affichage pour chaque écran.
Les futures pages Inscription ou Contact pourront être ajoutées dans la
configuration des routes ; le document ne définit pas leur contenu.

## Vérification et déploiement

Les tests vérifient les liens, l'ouverture directe d'un détail, le changement
d'identifiant, le retour à la liste, l'historique et les identifiants inconnus.
Le serveur de développement Angular prend en charge les URL de l'application.
En production, l'hébergeur doit renvoyer `index.html` pour les URL applicatives
telles que `/list/2`, afin qu'un rafraîchissement fonctionne aussi côté serveur.
