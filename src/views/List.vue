<template>
  <div>
    <div v-if="state === 'loading'">
      Chargement...
    </div>
    <div v-show="state === 'loaded'">
      <h1>{{ title }}</h1>
      <p>{{ movies.length }} films</p>
      <table>
        <tr>
          <th v-if="currentDecade"></th>
          <th class="left">Titre</th>
          <th class="left test">Nom Super Ciné Battle</th>
          <th>Année</th>
          <th>Episode</th>
          <th v-if="!currentDecade">Classement</th>
        </tr>
        <tr v-for="movie in movies" :key="movie.tconst + movie.scbTitle">
          <td v-if="currentDecade"><b>{{ movie.ranking }}</b></td>
          <td class="left"><a v-if="movie.tconst" :href="'https://www.imdb.com/title/' + movie.tconst">{{ movie.primaryTitle }}</a></td>
          <td class="left test">{{ movie.scbTitle }}</td>
          <td>{{ movie.startYear }}</td>
          <td>{{ movie.episode }}</td>
          <td v-if="!currentDecade">{{ movie.ranking }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script src="./List.ts" lang="ts"></script>

<style lang="scss">
td, th {
  padding: 5px;
  font-size: 18px;
  min-width: 50px;
  max-width: 400px;
  text-align: center;
}

.left {
  text-align: left;
}

.test {
  font-size: 80%;
  color: #AAA;
  max-width: 200px;
}
</style>