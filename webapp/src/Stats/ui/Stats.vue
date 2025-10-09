<script setup lang="ts">
import { fetchMovies } from 'src/Movies/movies.api'
import { onMounted, ref } from 'vue'
import MostPresentActors from './organisms/MostPresentActors.vue'
import MostPresentDirectors from './organisms/MostPresentDirectors.vue'
import MoviesPerEpisodeStats from './organisms/MoviesPerEpisodeStats.vue'
import type { Movie } from 'src/Movies/model/movie.model'

const movies = ref<Movie[]>([])

onMounted(async () => {
  movies.value = await fetchMovies()
  window.scrollTo(0, 0)
})

</script>

<template>
  <div>
    <h1>Statistiques</h1>
    <ul>
      <li><a href="#stats">Nombre de films traités par épisode</a></li>
      <li><a href="#directors">Hall of Fame des réalisateurs</a></li>
      <li><a href="#actors">Hall of Fame des acteurs</a></li>
    </ul>

    <h2><a id="stats" class="anchor"></a>Nombre de films traités par épisode</h2>
    <MoviesPerEpisodeStats :movies="movies"></MoviesPerEpisodeStats>

    <h2><a id="directors" class="anchor"></a>Hall of Fame des réalisateurs</h2>
    <MostPresentDirectors></MostPresentDirectors>

    <h2><a id="actors" class="anchor"></a>Hall of Fame des acteurs</h2>
    <MostPresentActors></MostPresentActors>
  </div>
</template>

<style lang="scss" scoped>
ul {
  font-size: 150%;
  font-weight: bold;
  margin-left: 20px;
  padding-bottom: 50px;
}

a.anchor {
  display: block;
  position: relative;
  top: -115px;
  visibility: hidden;
}
</style>
