# Révision du test écrit Angular

Cette fiche relie le projet de conférences au cours sur les formulaires et aux
deux photos du test. Elle contient des définitions, les corrections du sujet
fourni, des erreurs classiques et un test blanc avec son corrigé.

## 1. Définitions à savoir expliquer

| Notion | Réponse courte pour l'écrit |
| --- | --- |
| Angular | Framework pour construire des applications web à partir de composants. |
| SPA | Single Page Application : la navigation change la vue sans recharger tout le document HTML. |
| Composant | Classe TypeScript associée à un template et éventuellement à des styles ; déclarée avec `@Component`. |
| Template | Vue HTML enrichie par les directives et les liaisons Angular. |
| Service | Classe qui centralise une responsabilité partagée, comme les données ou les appels HTTP. |
| Injection de dépendances | Angular fournit à une classe les objets dont elle dépend, au lieu de lui faire construire ces objets elle-même. |
| `providedIn: 'root'` | Rend un service disponible au niveau racine ; son instance est partagée dans cet injecteur. |
| Route | Association entre un chemin d'URL et un composant, une redirection ou des routes enfants. |
| Route paramétrée | Route contenant une partie variable, par exemple `list/:id`. |
| `ActivatedRoute` | Donne les informations de la route activée, dont `paramMap`. |
| `Router` | Service qui pilote la navigation, par exemple `router.navigate(['/list', id])`. |
| `router-outlet` | Emplacement où le routeur affiche le composant de la route active. |
| `routerLink` | Directive de navigation interne sans rechargement complet de la SPA. |
| `routerLinkActive` | Ajoute une classe CSS quand le lien correspond à la route active. |
| Lazy loading | Chargement d'une fonctionnalité au moment où elle est demandée. |
| `loadComponent` | Charge un composant par import dynamique. |
| `loadChildren` | Charge les routes d'une fonctionnalité ; ici, un tableau de routes standalone. |
| `Observable` | Flux de valeurs dans le temps ; un appel HttpClient retourne un Observable. |
| Signal | Conteneur réactif dont on lit la valeur avec `nom()`. |
| `computed()` | Signal en lecture seule dérivé d'autres signaux. |
| `effect()` | Réaction destinée à un effet de bord lorsqu'un signal lu change. |
| `toSignal()` | Convertit un Observable en signal, avec nettoyage automatique dans le contexte habituel du composant. |
| `input()` / `output()` | Entrée réactive reçue du parent / événement émis vers le parent. |

Exemple d'injection dans ce projet :

```ts
private readonly store = inject(ConferenceStore);
```

Le composant demande le service à Angular ; il ne fait pas
`new ConferenceStore()` dans le code de l'application.

## 2. Liaisons et cycle de vie

| Syntaxe | Nom | Exemple |
| --- | --- | --- |
| `{{ valeur }}` | Interpolation | `<h1>{{ conference.title }}</h1>` |
| `[propriete]="expression"` | Property binding | `<button [disabled]="!isValid()">` |
| `(evenement)="methode()"` | Event binding | `<button (click)="reset()">` |
| `[(ngModel)]="nom"` | Two-way binding | Nécessite `FormsModule` |
| `[formGroup]="form"` | Liaison du groupe réactif | Nécessite `ReactiveFormsModule` |
| `formControlName="title"` | Liaison d'un contrôle du groupe | Le nom doit exister dans le groupe |
| `[formControl]="title"` | Liaison d'un contrôle autonome | Le contrôle peut exister sans groupe |

`constructor` construit l'objet ; ce n'est pas un hook Angular.
`ngOnInit()` est exécuté une fois, après l'initialisation des premières entrées.
Si `ngOnChanges()` est utilisé, son premier appel précède `ngOnInit()`.
`ngOnDestroy()` permet le nettoyage à la destruction du composant.

Dans Angular 21, le projet utilise `@if` et `@for`. Dans un ancien sujet,
`*ngIf` et `*ngFor` peuvent être attendus : leur utilisation demande les
directives correspondantes ou `CommonModule` dans un composant standalone.

## 3. Reactive Forms

**Définition à rédiger :** un Reactive Form est un formulaire dont le modèle,
les contrôles et les validateurs sont définis dans la classe TypeScript, puis
liés au template. Il convient aux formulaires complexes grâce à sa structure
explicite, ses validateurs testables et sa réutilisation pour l'ajout/modification.

| Élément | Rôle |
| --- | --- |
| `FormControl` | Valeur, validité et état d'un champ. |
| `FormGroup` | Collection nommée de contrôles ; peut contenir des groupes imbriqués. |
| `FormArray` | Collection indexée de contrôles, utile pour une liste dynamique de champs. |
| `FormBuilder` | Utilitaire qui simplifie la construction des contrôles, groupes et tableaux. |
| `Validators` | Validateurs standards : `required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern`. |
| `ValidatorFn` | Fonction synchrone retournant `null` si valide, ou un objet d'erreurs. |
| Validateur asynchrone | Retourne une Promise ou un Observable ; utile pour une vérification serveur. |

`FormsModule` sert notamment à `ngModel`. `ReactiveFormsModule` sert aux
directives des Reactive Forms. Dans ce projet standalone, les modules nécessaires
sont ajoutés à `imports` du composant, pas à un `app.module.ts` inexistant.

### Exemple complet minimal

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="login()">
      <label>Username <input formControlName="username"></label>
      <label>Password <input type="password" formControlName="password"></label>
      <button type="submit" [disabled]="loginForm.invalid">login</button>
    </form>
  `,
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const credentials = this.loginForm.getRawValue();
    // Transmettre credentials au service d'authentification si celui-ci existe.
  }
}
```

L'exemple construit et valide le formulaire ; il n'authentifie pas à lui seul
un utilisateur. Le projet actuel n'a pas de service d'authentification.

### États et méthodes

| Élément | À retenir |
| --- | --- |
| `valid` / `invalid` | Booléens, pas des méthodes. |
| `errors` | `null` si aucune erreur, sinon objet tel que `{ required: true }`. |
| `touched` | Le champ a reçu puis perdu le focus, ou a été marqué par programmation. |
| `dirty` | Valeur modifiée par l'utilisateur dans l'interface, ou état marqué explicitement. |
| `pristine` / `untouched` | États initiaux ; `reset()` les rétablit. |
| `status` | Peut être `VALID`, `INVALID`, `PENDING` ou `DISABLED`. |
| `setValue()` | Remplace les valeurs ; pour un groupe, la structure complète doit correspondre. |
| `patchValue()` | Met à jour une partie des champs d'un groupe. |
| `reset()` | Rétablit valeurs et états ; un contrôle nullable peut revenir à `null`. |
| `getRawValue()` | Inclut les contrôles désactivés. |
| `value` | Pour un groupe actif, exclut les contrôles désactivés. |
| `markAllAsTouched()` | Rend toutes les erreurs pertinentes visibles après une tentative d'envoi. |

Pièges : `setValue()` ne marque pas automatiquement le champ `dirty`.
`required` n'interdit pas nécessairement une chaîne d'espaces ; il faut une
contrainte adaptée. `minLength` utilise la clé d'erreur **`minlength`**.
`Validators.min(3)` vérifie une valeur numérique ; `Validators.minLength(3)`
vérifie la longueur d'un texte. Un groupe `PENDING` ou `DISABLED` n'est ni
`valid` ni `invalid` : ces booléens ne sont pas toujours des opposés absolus.

### Reactive Forms et Signals

```ts
formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });
isValid = computed(() => this.formStatus() === 'VALID');
titleLength = computed(() => this.formValue().title?.length ?? 0);
```

Imports : `toSignal` depuis `@angular/core/rxjs-interop`, `computed` depuis
`@angular/core`. Le template lit `isValid()` et `titleLength()`.

Les Observables ne disparaissent pas : `toSignal` fait le pont avec les Signals.
RxJS ne nécessite pas intrinsèquement Zone.js. Les Signals améliorent la lecture
et le suivi réactif ; ils ne rendent pas automatiquement tout programme plus rapide.
Réserver `effect()` aux effets de bord, et `computed()` aux valeurs dérivées.

## 4. Reconnaître les erreurs de code

| Code ou symptôme | Problème | Correction |
| --- | --- | --- |
| `[formGroup]="form"` inconnu, souvent `NG8002` | Directive absente du contexte du template | Importer `ReactiveFormsModule` dans le composant qui contient le template. |
| `ngModel` inconnu | `FormsModule` absent | Importer `FormsModule`. |
| `formControlName` sans parent `[formGroup]`, `NG01050` | Aucun groupe parent lié | Ajouter `<form [formGroup]="form">`. |
| `Cannot find control with name: 'titre'` | Clé différente du modèle TypeScript | Employer la clé exacte, par exemple `title`. |
| `form.valid()` | Un booléen est appelé comme fonction | Écrire `form.valid`. |
| `{{ titleLength }}` pour un signal | Le signal n'est pas lu | Écrire `{{ titleLength() }}`. |
| `[disabled]="isValid()"` | La logique est inversée | Écrire `[disabled]="!isValid()"`. |
| `computed(() => form.valid)` | Aucune dépendance Signal suivie | Convertir `statusChanges` avec `toSignal`, puis lire ce signal. |
| `control.errors.required` | `errors` peut être `null` | `control.hasError('required')` ou accès optionnel. |
| `Validators.required()` sans contrôle | Appel incorrect du validateur | Passer `Validators.required` à la liste de validateurs. |
| `form.setValue({ title: 'A' })` avec plusieurs champs | Structure incomplète | Utiliser `patchValue`, ou fournir tous les champs. |
| `path: '/list/:id'` | Slash initial dans la configuration | `path: 'list/:id'`. |
| `{ route: 'login', ... }` | Mauvaise propriété de route | Employer `path`. |
| Redirection vide sans `pathMatch: 'full'` | Correspondance par préfixe trop large | Ajouter `pathMatch: 'full'`. |
| `**` avant les routes normales | Intercepte trop tôt les URL | Mettre le wildcard en dernier. |
| `404Component` | Identifiant TypeScript ne pouvant pas commencer par un chiffre | `NotFoundComponent`. |
| `splice(-1, 1)` | Supprime le dernier élément par erreur | Vérifier que l'index recherché est positif ou nul. |
| Mauvais port d'API | Le client ne contacte pas le bon serveur | Vérifier l'URL exacte, par exemple le port 7000 du sujet. |
| `put(url)` pour récupérer une liste | Mauvaise méthode HTTP | `return httpClient.get<Company[]>(url)`. |

## 5. HTTP et erreurs de navigation

| Code | Signification à connaître |
| --- | --- |
| 200 | OK : requête réussie. |
| 201 | Created : ressource créée. |
| 204 | No Content : réussite sans corps de réponse. |
| 301 / 302 | Redirection permanente / temporaire. |
| 304 | Not Modified : réutilisation d'une représentation en cache. |
| 400 | Bad Request : requête incorrecte. |
| 401 | Unauthorized : authentification nécessaire ou invalide. |
| 403 | Forbidden : accès refusé. |
| 404 | Not Found : ressource introuvable. |
| 405 | Method Not Allowed : méthode HTTP non autorisée. |
| 409 | Conflict : conflit avec l'état actuel de la ressource. |
| 422 | Unprocessable Content : contenu compris, mais non traitable. |
| 429 | Too Many Requests : trop de requêtes. |
| 500 | Internal Server Error : erreur interne du serveur. |
| 502 | Bad Gateway : réponse invalide du serveur amont. |
| 503 | Service Unavailable : service indisponible. |

Dans Angular, une erreur réseau ou de délai peut apparaître avec `status: 0`.
Ce n'est pas un code de réponse HTTP ; vérifier réseau, serveur et éventuellement
les restrictions CORS. Ne pas conclure automatiquement « erreur 404 ».

**Distinction essentielle :** une route Angular `**` affiche une page introuvable
dans la SPA. Cela ne prouve pas que le serveur a renvoyé HTTP 404 : avec un
fallback SPA, `index.html` peut avoir été renvoyé avec HTTP 200.

Méthodes à retenir : `GET` lit ; `POST` crée habituellement ; `PUT` remplace ;
`PATCH` modifie partiellement ; `DELETE` supprime. Le contrat de l'API précise
les opérations réellement disponibles.

## 6. Correction des photos du test

### Exercice 1 QCM

1. **b**, réponse la plus proche : faciliter la fourniture des dépendances aux composants et services.
2. **a est probablement la réponse visée**, mais le slash initial est une erreur dans les choix proposés.
   La syntaxe correcte est `{ path: 'user/:id', component: UserComponent }`.
   Écrire `path`, pas `route`, et mettre `:id` dans le chemin.
3. **c : `routerLink`**. `router-outlet` est la zone d'affichage, pas un lien.
4. **c : `ngOnInit()`**. Le constructeur n'est pas un hook Angular.
5. **b : `FormsModule`** pour `ngModel`. `ReactiveFormsModule` est destiné à l'autre approche.

### Exercice 2 Liste et suppression

Ancienne syntaxe attendue dans beaucoup de sujets :

```html
<h1>Liste des employés</h1>
<ul>
  <li *ngFor="let emp of employes">
    Name: {{ emp.name }}
    Salary: {{ emp.salary }}
    Age: {{ emp.age }}
    <button type="button" (click)="supprimerEmploye(emp)">Supprimer</button>
  </li>
</ul>
```

La directive exige `NgFor` ou `CommonModule` dans les imports du composant
standalone. Équivalent dans ce projet Angular 21 :

```html
<ul>
  @for (emp of employes; track emp) {
    <li>
      Name: {{ emp.name }} Salary: {{ emp.salary }} Age: {{ emp.age }}
      <button type="button" (click)="supprimerEmploye(emp)">Supprimer</button>
    </li>
  }
</ul>
```

```ts
supprimerEmploye(emp: Employe): void {
  const index = this.employes.indexOf(emp);
  if (index >= 0) this.employes.splice(index, 1);
}
```

`indexOf` retourne `-1` si l'objet n'est pas dans le tableau. `Employe` représente
le type `{ name: string; salary: number; age: number }`.

### Exercice 3 Routes

```ts
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent },
];
```

Les noms de classes doivent correspondre aux imports. `loginComponent` n'est
correct que si c'est réellement le nom déclaré ; la convention est `LoginComponent`.
Une route littérale `notFound` ne capture pas toutes les URL inconnues.

### Exercice 3 Formulaire login

Les blancs de la photo se complètent par :

```ts
loginForm = new FormGroup({
  username: new FormControl('', Validators.required),
  password: new FormControl('', Validators.required),
});
```

Le template et les imports sont ceux de l'exemple complet de la section 3.

### Exercice 3 Service HTTP

```ts
url = 'http://localhost:7000/companies';

constructor(private httpClient: HttpClient) {}

fetchCompanies() {
  return this.httpClient.get<Company[]>(this.url);
}
```

Les corrections sont : port **7000**, instance **httpClient**, méthode **get**,
et **return** pour transmettre l'Observable à l'appelant. Importer `HttpClient`
depuis `@angular/common/http`. Dans une application standalone, fournir
`provideHttpClient()` dans les providers de configuration. L'appelant doit
consommer l'Observable, par exemple via `subscribe()` ou `async`, pour envoyer
la requête. `Company` est l'interface des objets renvoyés par cette API.
Le projet de conférences actuel utilise un store local et ne contacte pas cette
API ; cet exemple corrige le sujet photographié.

## 7. Test blanc à faire sans regarder le corrigé

Durée suggérée : 45 minutes. Barème d'entraînement : 20 points.

### A QCM et définitions 5 points

1. Quel module fournit `[formGroup]` ? a) FormsModule b) ReactiveFormsModule c) RouterModule.
2. Quel élément conserve la valeur et l'état d'un champ ? a) FormControl b) Router c) effect.
3. Que retourne un validateur synchrone si le champ est valide ? a) true b) null c) une chaîne vide.
4. Quel outil convient à un compteur dérivé d'un signal ? a) computed b) new FormGroup c) redirectTo.
5. En deux phrases, expliquer pourquoi un Reactive Form convient à l'ajout et à la modification d'une conférence.

### B Compléter un formulaire 6 points

Créer un composant standalone avec : un titre obligatoire d'au moins trois
caractères, un maximum de participants obligatoire supérieur ou égal à un,
un groupe lié au template et un événement de soumission. Exposer un compteur
de caractères et la validité sous forme de Signals. Afficher l'erreur de titre
après visite du champ et désactiver Enregistrer tant que le formulaire est invalide.

### C Identifier les erreurs 5 points

Pour chaque ligne, expliquer l'erreur et la corriger :

```ts
const routes = [{ route: '/conference/id', component: ConferencePage }];
const title = new FormControl('', Validators.min(3));
const isValid = computed(() => form.valid);
```

```html
<form>
  <input formControlName="name">
  <button [disabled]="isValid()">Enregistrer</button>
</form>
```

On suppose que le FormGroup contient un contrôle nommé `title`.

### D HTTP et navigation 4 points

1. Donner la signification de 401, 403, 404 et 500.
2. Corriger un service qui fait `this.http.put('http://localhost:3000/companies')`
   pour lire la liste d'une API située sur le port 7000.
3. Expliquer pourquoi une page Angular NotFound ne prouve pas un statut HTTP 404.
4. Écrire les routes pour l'URL vide vers Home, une conférence par ID, puis les URL inconnues.

## 8. Corrigé du test blanc

### A

1-b ; 2-a ; 3-b ; 4-a.
Le modèle et les règles sont définis en TypeScript et faciles à tester. Le
même composant reçoit des données initiales pour modifier et émet les valeurs
validées pour ajouter ou mettre à jour.

### B

```ts
import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-exam-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Titre <input formControlName="title"></label>
      @if (form.controls.title.touched && form.controls.title.hasError('required')) {
        <p>Titre obligatoire</p>
      }
      @if (form.controls.title.touched && form.controls.title.hasError('minlength')) {
        <p>Au moins trois caractères</p>
      }
      <label>Maximum <input type="number" formControlName="maxParticipants"></label>
      <p>Caractères : {{ titleLength() }}</p>
      <button type="submit" [disabled]="!isValid()">Enregistrer</button>
    </form>
  `,
})
export class ExamForm {
  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    maxParticipants: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });
  value = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  titleLength = computed(() => this.value().title?.length ?? 0);
  isValid = computed(() => this.status() === 'VALID');

  save(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    const conferenceData = this.form.getRawValue();
    // Transmettre conferenceData au store ou au service.
  }
}
```

Le projet applique en plus les règles métier sur les espaces, les nombres
entiers, les dates et la cohérence entre les participants et le maximum.

### C

- Route : `{ path: 'conference/:id', component: ConferencePage }`.
- Texte : `Validators.minLength(3)` au lieu de `Validators.min(3)`.
- Validité : lire un signal issu de `statusChanges` dans `computed`.
- Formulaire : ajouter `[formGroup]="form"` et `(ngSubmit)="save()"`.
- Champ : utiliser `formControlName="title"`, correspondant à la clé du groupe.
- Bouton : `[disabled]="!isValid()"` et `type="submit"`.
- Importer `ReactiveFormsModule` dans le composant du template.

### D

401 : authentification nécessaire ou invalide ; 403 : accès refusé ;
404 : ressource introuvable ; 500 : erreur interne du serveur.
Service : `return this.http.get<Company[]>('http://localhost:7000/companies');`.
Une vue NotFound est une décision du routeur client ; le statut HTTP dépend
de la réponse du serveur.

```ts
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'conference/:id', component: ConferencePage },
  { path: '**', component: NotFoundComponent },
];
```

## 9. Où retrouver les notions dans le projet

| Notion | Fichier |
| --- | --- |
| Contrôles, groupe, signaux et soumission | `src/app/conference-form/conference-form.ts` |
| Directives et erreurs visibles | `src/app/conference-form/conference-form.html` |
| Validateurs métier et validation de groupe | `src/app/conference-form/conference-validators.ts` |
| Ajout/modification et navigation | `src/app/conference-form/conference-editor.ts` |
| Injection, données et session | `src/app/conference-store.ts` |
| Routes et lazy loading | `src/app/app.routes.ts` et `src/app/conference-list/conference.routes.ts` |
| Paramètres réactifs | `src/app/conference-page/conference-page.ts` |
| Menu et lien actif | `src/app/header/header.html` |

## Références de vérification

Support principal : les trois prosits Reactive Forms et les diapositives 8 à 25
du Cours n°3 fournis avec la demande, ainsi que les deux photos du test.
Compléments officiels pour vérifier les API et les statuts :

- [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Angular RxJS et Signals](https://angular.dev/ecosystem/rxjs-interop)
- [Angular HttpClient et erreurs](https://angular.dev/guide/http/making-requests)
- [MDN Statuts HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
