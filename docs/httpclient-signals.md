# Cours 6 HttpClient et Signals

## Comparaison avec le projet précédent

Avant ce cours, `ConferenceStore` sauvegardait les conférences dans
`sessionStorage`. Le projet ne consommait aucun web service. Désormais les données
proviennent de JSON Server et persistent dans son fichier `db.json`.
Les routes, formulaires, contrôles métier et conférences exemples sont conservés.
Le modèle du projet garde `place`, `maxParticipants` et `nbParticipants` plutôt
que de reprendre `location`, `price` et `nbPlaces` du modèle illustratif `EventM`.

## Correspondance avec le support

| Diapositives | Application dans le projet |
| --- | --- |
| 7 à 11 | Architecture client/serveur, JSON Server 0.17.4, fichier JSON, API CRUD |
| 13 à 18 | `provideHttpClient(withFetch())`, service injectable, requêtes typées, `HttpParams`, GET/POST/PUT/PATCH/DELETE |
| 23 à 26 | Choix de l'approche B : service à état avec Signals pour la liste modifiable |
| 27 | `httpResource()` expliqué comme alternative GET réactive, sans l'empiler sur le store |
| 29 et 30 | `HttpErrorResponse`, erreurs lisibles, URL configurée, états chargement/erreur/données et tests |

La configuration utilise explicitement `provideHttpClient` pour clarifier les
options. Aucun passage à `HttpClientModule` n'est nécessaire. L'application
n'utilise pas SSR : le cours ne justifie pas d'ajouter une configuration
d'hydratation à ce projet navigateur.

## Architecture

`Composant -> ConferenceStore -> ConferenceApi -> HttpClient -> JSON Server`.

`ConferenceApi` centralise l'URL venant de `environment.ts`, les verbes et les
Observables typés. `ConferenceStore` possède la liste, les signaux `loading`,
`loaded`, `error`, `mutating` et le compteur dérivé `count`.
Le store s'abonne au chargement et nettoie cet abonnement avec
`takeUntilDestroyed`. Les écritures utilisent `firstValueFrom` pour attendre le
résultat avant de mettre à jour la liste puis de naviguer.

Un Observable HttpClient n'envoie sa requête qu'une fois consommé. `GET` ne doit
pas être remplacé par `PUT` pour lire. `POST` n'envoie aucun ID généré localement.
`PUT` envoie tous les champs de la conférence ; `PATCH` ne modifie ici que sa
capacité. La liste n'est pas rechargée après chaque écriture réussie : sa valeur
Signal est mise à jour à partir de la réponse du serveur.

Le store coordonne chargement et mutations afin qu'une réponse GET ancienne ne
remplace pas une modification récente. Les pages attendent la fin du chargement
avant d'annoncer une conférence inexistante. La restauration des inscriptions
locales conserve les ID sans les filtrer prématurément sur une liste encore vide.

## Lancement

```bash
npm ci
npm run api
```

Dans un second terminal :

```bash
npm start
```

API : `http://localhost:3000/conferences`. Interface : `http://localhost:4200`.
Le script `preapi` crée `db.json` à partir de `db.seed.json` seulement si le
fichier n'existe pas. Il ne réinitialise pas les données à chaque démarrage.
Le fichier de travail `db.json` est ignoré par Git.

Les anciens ajouts présents uniquement dans `angularProj.conferences` ne sont
pas importés automatiquement. Les inscriptions restent une démonstration locale
en session et ne sont pas des réservations côté serveur.

## Parcours de vérification

1. Ouvrir la liste et constater le compteur des conférences reçues par GET.
2. Ajouter une conférence ; vérifier POST et l'ID numérique attribué par le serveur.
3. Modifier la conférence ; vérifier PUT avec l'objet complet.
4. Cliquer Add 10 places sur les détails ; vérifier PATCH et la conservation des autres champs.
5. Recharger la page : les valeurs proviennent à nouveau du serveur.
6. Supprimer une conférence depuis la liste : DELETE retire la donnée après succès.
7. API arrêtée ou URL erronée : un message et Retry sont proposés, sans faux succès.

Le service expose également GET par ID et GET filtré par `place`, testés sans
ajouter une interface de recherche non demandée par le cours.

## Tests et limites

Les tests HTTP utilisent `provideHttpClientTesting()` et `HttpTestingController`
pour vérifier méthode, URL, paramètres, corps, ID du serveur et erreurs 0/404/500.
Les tests du store couvrent les signaux, les réponses vides ou invalides, les
écritures échouées et les mutations concurrentes. Les tests d'intégration Angular
conservent les parcours de formulaire et d'inscription avec un transport HTTP
en mémoire. `npm run test:api` vérifie les cinq verbes sur un vrai JSON Server
avec une base temporaire isolée.

La version JSON Server est fixée à 0.17.4 comme dans le support, notamment pour
les ID numériques. Ce backend pédagogique n'apporte ni authentification ni
validation serveur des règles métier. Il ne doit pas être utilisé comme service
de production. Les règles de formulaire restent validées dans Angular et devront
être réimplémentées par une future API de production.

Le support simplifie certains points : des Observables peuvent émettre de façon
synchrone et tous ne sont pas froids ; ce sont les requêtes HttpClient considérées
ici qui sont froides. Un générique TypeScript ne valide pas le JSON reçu à
l'exécution. Les Signals et RxJS sont complémentaires.

Références : support fourni `Cours_n6_HttpClient_Signals (1).pptx`,
[Angular configuration HTTP](https://angular.dev/guide/http/setup),
[tests HttpClient](https://angular.dev/guide/http/testing),
[JSON Server 0.17.4](https://github.com/typicode/json-server/tree/v0.17.4).
