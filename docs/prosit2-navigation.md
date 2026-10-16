# Prosit 2 : Comment concevoir ce système de navigation ?

## Vérification de l'existant

Le prosit 1 avait déjà apporté l'accueil, la liste, le détail avec paramètre
`id`, l'accès direct par URL, la redirection par défaut et la page inconnue.
`provideRouter(routes)` configure le routeur et `router-outlet` affiche une
seule page à la fois, entre l'en-tête et le pied de page.

## Compléments du prosit 2

| Page | URL | Composant |
| --- | --- | --- |
| Accueil | `/home` | `Home` |
| Liste des conférences | `/list` | `ConferenceList` |
| Détail d'une conférence | `/list/:id` | `ConferencePage` |
| Inscription | `/registration` | `Registration` |
| Contact | `/contact` | `Contact` |
| Profil utilisateur | `/profile` | `Profile` |
| URL vide | `/` | Redirection vers `/home` |
| URL inexistante | `**` | `Notfound` |

Chaque page possède un composant. Les nouvelles pages présentent un contenu
minimal et des liens internes ; les formulaires, comptes et services métier
ne sont pas définis dans ce prosit et ne sont pas implémentés ici.

Le menu utilise `routerLink` pour naviguer sans recharger l'application.
`routerLinkActive` applique un style visible au lien actif et
`ariaCurrentWhenActive="page"` expose cet état aux technologies d'assistance.
Le lien de la liste reste actif sur les détails `/list/:id`.
Le menu peut passer sur plusieurs lignes sur petit écran.

Les tests couvrent l'accès direct aux nouvelles pages, une seule page visible,
les liens du menu, le lien actif sur chaque route et sur le détail, ainsi que
les comportements de navigation déjà testés pour le prosit 1.

Comme pour le prosit 1, le serveur de production doit renvoyer `index.html`
pour les URL applicatives afin de permettre leur ouverture directe.
