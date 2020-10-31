# Super Ciné Marbre

Le marbre du [Super Cine Battle](https://www.supercinebattle.fr), en version interactive.

<a href="https://supercinemarbre.github.io"><img src="https://raw.githubusercontent.com/supercinemarbre/supercinemarbre.github.io/master/docs/img/card.png" width="400" /></a>

## Sommaire

* [Application web](#application-web) (`webapp/`)
* [Importeur de listes](#importeur-de-listes) (`importer/`)
* [Serveur de programme TV](#serveur-de-programme-tv) (`importer/tv-schedule-server.ts`)
* [Procédures](#procédures)
  * [Mettre à jour l'application web](#mettre-à-jour-lapplication-web)
  * [Corriger un film](#corriger-un-film)
  * [Mettre à jour les listes](#mettre-à-jour-les-listes)
  * [Mettre à jour les timestamps](#mettre-à-jour-les-timestamps)
* [Feuille de route](#feuille-de-route)
* [Licence](#licence)

## Lancer l'application web

```
cd webapp
npm install
npm start
```

### Commandes application web

* `npm run build` : Build JS
* `npm run lint` : Lint des sources

## Importeur de listes

```
cd importer
npm install
IMDB_INIT=true npm start
```

Attention :

1. Le premier lancement peut être long, à cause du téléchargement et de l'extraction d'une base IMDB.
2. Pour que l'import OMDB fonctionne (couvertures de films etc.), il faudra obtenir une clef d'API (gratuite) à http://www.omdbapi.com et la mettre dans un fichier `importer/data/omdbapikey`.
3. Pour que l'import des timestamps fonctionne, il faudra obtenir une clef d'API (gratuite) à https://console.developers.google.com/apis et la mettre dans un fichier `importer/data/googlesheetsapikey`.

### Commandes

* `SCB_INIT=true npm...` : Mettre à jour les listes SCB depuis supercinebattle.fr
* `GSHEETS_INIT=true npm...` : Mettre à jour les timestamps depuis [ce document](https://docs.google.com/spreadsheets/d/1_h4Yh9xU72iqH3gZI6OquYG-jfBYPP4d1k-T9jwxEq8/edit) Google Sheets
* `IMDB_INIT=true npm...` : Mettre à jour la base IMDB depuis imdb.com
* `[IMDB_ONLY=true] [OMDB_ONLY=true] [ALL=true] npm run invalidate -- [nom(s) de film(s) SCB]` : Invalider des données de films. `IMDB_ONLY` et `OMDB_ONLY` permettent d'annuler seulement les données issues de IMDB, `ALL` annule sur tous les films.

## Serveur de programme TV

Afin d'être en permanence à jour, le programme TV est géré par un serveur à héberger en dehors de Github.
Les données se mettront à jour quotidiennement.

```
cd importer
npm install
npm start:tv
```

## Procédures

### Mettre à jour l'application web

Il faut faire un build à la racine pour que les changements soient correctement déployés :

```bash
npm run build
```

### Corriger un film

1. Modifier `scb_patch.json`, en ajoutant une clef avec le nom SCB exact du film dans la liste. En valeur, on peut mettre soit directement l'ID IMDB soit un objet avec toutes les valeurs à écraser sur l'objet `scb_movies.json`.

2. Invalider les données de `scb_movies.json`, de préférence avec l'outil dédié :

```bash
cd importer
npm run invalidate "Nom SCB exact" "On peut en mettre plusieurs"
```

3.  Et enfin relancer l'import :

```bash
npm start
```

Variables d'environnement optionnelles :

```bash
IMDB_ONLY=1 npm run invalidate [...] # ne réinitialise que les infos IMDB
OMDB_ONLY=1 npm run invalidate [...] # ne réinitialise que les infos OMDB
ALL=1 npm run invalidate [...] # réinitialise tous les films
```

### Mettre à jour les listes

Avec l'option `SCB_INIT`, l'outil va aller chercher la dernière version des listes sur supercinebattle.fr :

```
cd importer
SCB_INIT=true npm start
```

### Mettre à jour les timestamps

Avec l'option `GSHEETS_INIT`, l'outil va aller chercher la dernière version des timestamps sur [ce document Google Sheets](https://docs.google.com/spreadsheets/d/1_h4Yh9xU72iqH3gZI6OquYG-jfBYPP4d1k-T9jwxEq8/edit?pli=1#gid=2128260303):

```
cd importer
GSHEETS_INIT=true npm start
```

## Licence

Copyright (C) 2020 Marwane Kalam-Alami

Distribué sous licence [ISC/OpenBSD](https://fr.wikipedia.org/wiki/Licence_ISC).