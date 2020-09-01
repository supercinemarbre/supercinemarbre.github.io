# Super Ciné Marbre

Le marbre du [Super Cine Battle](https://www.supercinebattle.fr/), en version interactive.

## Sommaire

* [Application web](#application-web)
* [Importeur de listes](#importeur-de-listes)
* [Procédures](#procédures)
  * [Mettre à jour l'application web](#mettre-à-jour-lapplication-web)
  * [Corriger un film](#corriger-un-film)
  * [Mettre à jour les listes](#mettre-à-jour-les-listes)
* [Feuille de route](#feuille-de-route)
* [Licence](#licence)

## Lancer l'application web

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

## Procédures

### Mettre à jour l'application web

Il faut faire un build à la racine pour que les changements soient correctement déployés :

```bash
npm run build
```

### Corriger un film

1. Modifier `scb_rankings_patch.json`, en ajoutant une clef avec le nom SCB exact du film dans la liste. En valeur, on peut mettre soit directement l'ID IMDB soit un objet avec toutes les valeurs à écraser sur l'objet `scb_rankings.json`.

2. Invalider les données de `scb_rankings.json`, de préférence avec l'outil dédié :

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

## Licence

Copyright (C) 2020 Marwane Kalam-Alami

Distribué sous licence [ISC/OpenBSD](https://fr.wikipedia.org/wiki/Licence_ISC).