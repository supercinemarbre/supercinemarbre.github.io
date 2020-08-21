<script src="./Home.ts" lang="ts"></script>

<template>
  <div>
    <div v-if="state === 'loading'">
      Loading...
    </div>
    <div v-show="state === 'loaded'">
      <h1>{{ movies.length }} films</h1>
      <table>
        <tr>
          <th>Titre</th>
          <th>Année</th>
          <th>Nom Super Ciné Battle</th>
          <th>Décennie</th>
          <th>Place</th>
        </tr>
        <tr v-for="movie in movies" :key="movie.tconst + movie.scbTitle">
          <td>
            <a v-if="movie.tconst" :href="'https://www.imdb.com/title/' + movie.tconst">{{ movie.primaryTitle }}</a>
          </td>
          <td>
            <span :style="(Math.abs(movie.startYear - movie.decade) > 10) ? 'color: red' : ''">{{ movie.startYear }}</span>
          </td>
          <td>{{ movie.scbTitle }}</td>
          <td>{{ movie.decade }}</td>
          <td>{{ movie.ranking }}</td>
        </tr>
      </table>
      <!--<img alt="Vue logo" src="../assets/logo.png">-->
      <!--<HelloWorld />-->
    </div>
  </div>
</template>
