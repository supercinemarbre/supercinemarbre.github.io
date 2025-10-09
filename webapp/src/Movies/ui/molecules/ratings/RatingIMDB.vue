<script setup lang="ts">
import type { Movie } from 'src/Movies/model/movie.model'
import { computed } from 'vue'

const { movie }: { movie: Movie} = defineProps<{
  movie?: Movie;
}>()

const isValid = computed(() => typeof movie?.imdbRating === 'number')

const ratingLabel = computed(() => {
  const rating = movie?.imdbRating
  if (rating) {
    return rating.toFixed(1)
  }
  return ''
})
</script>

<template>
  <a v-if="!!movie.tconst && isValid" :href="'https://www.imdb.com/title/' + movie.tconst">
    <img src="/img/imdb.png" />
    {{ ratingLabel }}
  </a>
</template>

<style lang="scss" scoped>
a:hover img {
  border-color: #ccc;
}

img {
  margin-top: -4px;
  margin-right: 2px;
  vertical-align: middle;
  height: 16px;
  border: 1px solid rgba(0,0,0,0);
  border-radius: 6px;
  transition: 0.2s;
}
</style>
