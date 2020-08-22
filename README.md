# <img src="https://raw.githubusercontent.com/mkalam-alami/supercinemarbre/master/public/img/logo.png" width="300">  

Projet de site pour exploration des listes [Super Cine Battle](https://www.supercinebattle.fr/).

## Application web

```
npm i
npm start
```

### Commandes

* `npm run build` : Build JS
* `npm run lint` : Lint des sources

## Importeur de listes

```
cd importer
npm i
npm start
```

Le premier lancement peut être long (téléchargement et extraction de base IMDB).

### Commandes

* `npm run build [-- -w]` : Build JS
* `npm run start:prod` : Lancement de la version JS
* `SCB_INIT=true npm...` : Mettre à jour les listes SCB depuis supercinebattle.fr
* `IMDB_INIT=true npm...` : Mettre à jour la base IMDB depuis imdb.com
* `npm run invalidate -- [nom de film SCB]` : Invalider le lien entre un film SCB et IMDB

## Feuille de route

### V1

- [x] Extraire les listes depuis supercinebattle.fr
- [x] Croiser les informations avec IMDB
- [x] Corriger les films non ou mal identifiés
- [x] Créer une première version fonctionnelle de l'interface, avec liens IMDB
- [x] Compléter les informations avec OMDB (notamment URLs d'affiches, classements, titre français)
- [x] Mettre au propre (licences, liens etc.)

### Backlog

- [x] Faire un joli thème
- [x] Moteur de recherche simple (multi-décennie)
- [x] Tri des films
- [ ] Associer les numéros d'épisodes aux pages du site
- [ ] Permettre de cliquer sur les liens Metascore/Rotten Tomatoes
- [ ] Compléter avec un lien Just Watch (pour disponibilité VOD/streaming)
- [ ] Compléter avec infos TMDB (titre français, budget/box office)
- [ ] Recherche de films par acteur/réalisateur
- [ ] Graphes et stats fun

### Idées folles

- [ ] Contributions communautaires : soumettre des timestamps de films spécifiques
- [ ] Contributions communautaires : soumettre des transcriptions
- [ ] Intégration audio (sous réserve d'obtenir l'autorisation du RPU)

## Licence

Copyright (C) 2020 Marwane Kalam-Alami

Distribué sous licence [ISC/OpenBSD](https://fr.wikipedia.org/wiki/Licence_ISC).