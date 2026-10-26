# Reactive Forms et Signals

> Évolution Cours 6 : la section stockage ci-dessous décrit l'étape initiale
> des prosits. Les conférences utilisent maintenant une API HttpClient et
> JSON Server ; voir [HttpClient et Signals](httpclient-signals.md).

## Comparaison des consignes avec le projet

Les trois prosits de formulaires et le Cours n°3 complètent les quatre prosits
de navigation. Avant cette modification, le projet possédait la navigation et
une inscription locale, mais aucun formulaire de création de conférence.

| Document | Besoin | Réalisation |
| --- | --- | --- |
| Prosit 1 Découvrir les Reactive Forms | Choisir une approche structurée et réutilisable, expliquer ses éléments | `ConferenceForm` réutilisé pour l'ajout et la modification ; explications ci-dessous |
| Prosit 2 Construire un formulaire | Modèle complet, contraintes, erreurs, soumission TypeScript | Modèle `Conference`, contrôles typés, validateurs de champs et de groupe, événement `saved` |
| Prosit 3 ReactiveForm et Signals | Compteurs, validité et bouton réactifs | `toSignal(valueChanges/statusChanges)`, `computed()` et bouton désactivé si invalide |
| Cours n°3 diapositives 8 à 19 | FormControl, FormGroup, directives et validation | `ReactiveFormsModule`, `[formGroup]`, `formControlName`, `(ngSubmit)`, `Validators`, `getRawValue()` |
| Cours n°3 diapositives 21 à 25 | Signaux, conversion RxJS, dérivations et effets | Signaux avec valeurs initiales ; `computed()` pour l'affichage ; `effect()` limité au préremplissage du formulaire |

Les exemples du cours sont adaptés à la syntaxe TypeScript et au projet
standalone. Les guillemets typographiques présents sur certaines diapositives
ne doivent pas être copiés dans le code.

## Pourquoi les Reactive Forms

Un Reactive Form est un modèle de formulaire construit dans la classe
TypeScript. Chaque champ est un `FormControl`, le formulaire est un `FormGroup`.
Les contraintes sont définies avec les contrôles et testables sans navigateur.
Le même composant reçoit des données initiales via `input()` et émet les données
validées via `output()`, ce qui permet l'ajout et la modification.

Avec les Template Driven Forms, `FormsModule` et `ngModel` construisent une
grande partie du formulaire depuis le template. Cette approche reste adaptée
aux exemples simples de la page Home. Le nouveau formulaire utilise uniquement
`ReactiveFormsModule`, sans mélanger `ngModel` et `formControlName` sur un champ.

`FormBuilder` est une autre façon de créer les mêmes contrôles ; il est expliqué
dans le cours, mais n'est pas nécessaire lorsque l'on écrit explicitement
`new FormGroup` et `new FormControl`. Aucun remplacement par l'API distincte
Signal Forms n'est effectué : le cours demande Reactive Forms + Signals.

## Champs et règles choisies

Le prosit demande des données logiques sans imposer toutes les limites.
Les longueurs et la limite de capacité suivantes sont les choix de ce projet.

| Attribut | Règle |
| --- | --- |
| `id` | Entier positif unique généré par le store ; non saisi par l'utilisateur |
| `title` | Obligatoire, 3 à 100 caractères |
| `description` | Obligatoire, 10 à 2000 caractères |
| `category` | Obligatoire, 2 à 50 caractères |
| `place` | Obligatoire, 2 à 120 caractères |
| `date` | Date de calendrier valide ; aujourd'hui ou plus tard pour une nouvelle date |
| `maxParticipants` | Entier obligatoire de 1 à 100000 |
| `nbParticipants` | Entier obligatoire, positif ou nul, inférieur ou égal au maximum |

Les espaces seuls sont refusés et les minima textuels sont évalués après
suppression des espaces en début et en fin. Les maxima incluent tous les
caractères saisis. Les chaînes sauvegardées sont nettoyées avec `trim()`.
Une conférence historique peut garder sa date initiale lors d'une modification.
La contrainte entre participants et capacité est portée par le `FormGroup`.

Les erreurs apparaissent après visite d'un champ ou tentative de soumission.
Le bouton est activé seulement pour un statut `VALID`, et désactivé pendant
l'enregistrement. La méthode TypeScript revérifie la validité : un bouton
désactivé ne remplace pas cette vérification. Le store valide aussi les données
avant de les sauvegarder. Une future API devra les valider côté serveur.

## Signals et mise à jour

`toSignal()` convertit les Observables existants `valueChanges` et `statusChanges`
avec une valeur initiale. Les Signals ne suppriment pas ces Observables ; ils
permettent de lire leur dernière valeur directement dans le template.
`computed()` dérive les compteurs du titre et de la description, la validité et
les places disponibles. Aucun abonnement manuel aux valeurs n'est nécessaire.

L'effet de préremplissage réagit à une nouvelle conférence reçue et utilise
`form.reset(...)` pour rétablir valeurs et états. Le bouton Reset fait de même.
Les détails, la liste et l'inscription lisent désormais un store commun piloté
par signal, pour que les nouvelles conférences soient accessibles partout.

## Parcours et stockage

1. Ouvrir `/list/new` ou le lien Add conference.
2. Remplir le formulaire et vérifier les compteurs et le statut.
3. Enregistrer : le store attribue un ID et la navigation ouvre `/list/:id`.
4. Utiliser Edit conference pour ouvrir `/list/:id/edit` avec les mêmes champs.
5. Enregistrer la modification sans créer une nouvelle conférence.

Les données de conférence sont conservées dans `sessionStorage` sous
`angularProj.conferences`. Les conférences exemples sont présentes au départ.
Un rafraîchissement dans le même onglet conserve les données ; elles ne sont
pas partagées entre utilisateurs et ne constituent pas une base serveur.
Les anciennes entrées d'inscription utilisent toujours leur clé séparée.
Le nombre de participants est une donnée éditable du formulaire ; les
inscriptions de démonstration enregistrent des identifiants locaux et ne
représentent pas un comptage de réservations serveur.

Les erreurs de stockage gardent les valeurs saisies pour une nouvelle tentative.
Les soumissions simultanées sont bloquées. Si les données ont été sauvegardées
mais que la navigation échoue, une nouvelle tentative réutilise l'ID sauvegardé.
Les pages de formulaire restent lazy-loaded sous les routes conférences.

## Vérifications

Les tests portent sur les limites des champs, les espaces, les dates invalides,
les participants, les erreurs visibles, les compteurs Signals, l'émission des
données, le préremplissage, le Reset, les ID, la persistance, l'intégration
liste/détail/inscription, les erreurs de stockage et les doubles soumissions.
La création et le rafraîchissement ont aussi été contrôlés dans le navigateur.
