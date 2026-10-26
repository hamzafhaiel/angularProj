# Base enseignant et ajout HttpClient

Cette version suit le ZIP `4SSA5-main (1).zip` fourni par l'enseignant.
Elle remplace la version étendue précédente à la demande de l'utilisateur.
Le projet garde son nom local `angularProj` et ses dépendances Angular installées.

## Éléments repris du ZIP

- Home avec interpolation, événements, `ngModel`, signaux, `@if` et `@for`.
- Les composants et dossiers `conferance-list` et `conferance-details`.
- Le service injectable `Conferance` dans `services/conferance.ts`.
- Les champs `id`, `name`, `date`, `place` et les trois conférences de l'enseignant.
- Les cartes et leur bouton Details, le design bleu du détail, l'en-tête et le pied de page.
- Les routes `/home`, `/list`, `/details/:id`, la redirection et la page inconnue.
- `withComponentInputBinding()` et `id = input.required<string>()`.

## Adaptation HTTP

La liste statique du service devient une ressource JSON Server `/conferences`.
`getAll()` retourne `Observable<Conference[]>`, et `getById()` retourne
`Observable<Conference>`. Les méthodes POST, PUT, PATCH et DELETE du cours sont
également disponibles dans ce service. Les composants consomment maintenant
GET, POST, PUT et DELETE ; PATCH reste exposé au niveau du service.

`provideHttpClient(withFetch())` est ajouté aux providers. Le service centralise
les URLs, lit `environment.apiUrl`, utilise `HttpParams` pour un filtre de lieu
et transforme les erreurs HTTP en messages lisibles. La dépendance JSON Server
est fixée à 0.17.4, comme dans le cours.

Pour la liste, `toSignal()` transforme l'état d'une requête GET en signal.
Un déclencheur de rechargement permet de réessayer après une erreur.
Pour le détail, `toObservable(id)` et `switchMap` relancent la requête à chaque
nouvel identifiant et annulent une réponse devenue inutile. Le template attend
le résultat avant d'accéder à `conference.name`, `date` et `place`.

Le helper `requestState()` expose chargement, données ou erreur, et évite qu'une
erreur termine le flux global de rechargement. `catchError` reste à l'intérieur
de la requête remplacée par `switchMap`. `toSignal()` nettoie l'abonnement à la
destruction du composant. Aucun `ngOnInit()` limité au premier ID n'est nécessaire.

Les IDs non numériques, nuls, négatifs ou dépassant la précision entière de
JavaScript sont refusés avant une requête. Une réponse serveur 404 affiche une
conférence introuvable ; une erreur réseau affiche une erreur de chargement et Retry.

## Limites du périmètre

La nouvelle route `/add` propose un formulaire d'ajout avec `FormBuilder` et
les mêmes validateurs que la modification. `ajouter()` consomme `add()` par POST,
sans envoyer d'ID. Après la réponse du serveur, la navigation ouvre
`/details/:id` avec l'identifiant généré. Une erreur conserve les valeurs saisies,
et une navigation échouée après création peut être relancée sans second POST.

L'interface conserve les écrans de l'enseignant. Un formulaire de modification
est maintenant intégré à la page de détail et un bouton Supprimer à chaque carte
pour compléter la consommation de `update()` et `delete()`. Le formulaire utilise
`FormBuilder`, `ReactiveFormsModule`, les champs `name`, `date`, `place` et des
validateurs. L'ID vient de la conférence chargée et n'est pas modifiable.

`enregistrer()` s'abonne à `update()` : après succès du PUT, le composant recharge
le détail. `supprimer(id)` s'abonne à `delete()` : après succès du DELETE, la liste
est rechargée. Les erreurs restent visibles sans effacer les champs saisis ou
retirer prématurément une carte. Les doubles soumissions sont bloquées ;
`takeUntilDestroyed()` nettoie les abonnements et `finalize()` rétablit les états.

Les inscriptions et patchs de capacité de la version étendue ne sont pas repris.
Ils restent consultables dans l'historique Git au commit `5fd430c`.
Les anciens documents de prosits sont des références historiques et ne décrivent
pas tous le code actif de cette base.

## Vérification

Les tests HTTP utilisent `provideHttpClientTesting()` et `HttpTestingController`.
Ils vérifient les verbes, les corps envoyés, l'ID généré par le serveur et les
erreurs 0/404/500. Les tests des vues vérifient chargement, erreurs, Retry,
résultat vide, changement d'ID, annulation des requêtes, binding de route et retour
à la liste. `npm run test:api` contrôle les cinq verbes avec une vraie base
temporaire JSON Server utilisant le modèle de l'enseignant.
