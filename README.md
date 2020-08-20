# Super Cine Marble

Projet de site pour exploration des listes [Super Cine Battle](https://www.supercinebattle.fr/).

## Application web

```
npm i
npm start
```


## Importeur de listes

```
cd importer
npm i
npm start
```

Le premier lancement peut être long (téléchargement et extraction de bases IMDB).

### Commandes

* `npm run build [-- -w]` : Build JS
* `npm run start:prod` : Lancement de la version JS
* `SKIP_SCB_INIT=true npm...` : Considérer les listes SCB comme déjà à jour
* `SKIP_IMDB_INIT=true npm...` : Considérer la base IMDB comme déjà initialisée


## Feuille de route

### V1

- [x] Extraire les listes depuis supercinebattle.fr
- [x] Croiser les informations avec IMDB
- [ ] Compléter les informations avec OMDB (notamment les URLs d'affiches)
- [ ] Créer une première version fonctionnelle de l'interface, avec liens IMDB
- [ ] Corriger les films non ou mal identifiés

### Backlog

- [ ] Faire un joli thème
- [ ] Associer les numéros d'épisodes aux pages du site
- [ ] Détecter les films dispo sur Netflix, etc.
- [ ] Moteur de recherche simple (multi-décennie)
- [ ] Tri des films
- [ ] Recherche de films par acteur/réalisateur

### Idées folles

- [ ] Contributions communautaires : soumettre des timestamps de films spécifiques
- [ ] Contributions communautaires : soumettre des transcriptions
- [ ] Intégration audio (*)

> (*) Sous réserve d'obtenir l'autorisation
