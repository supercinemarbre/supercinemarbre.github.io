<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ChartLine from '../molecules/ChartLine.vue'
import type { Movie } from 'src/movies/_model/movie.model'

const props = defineProps<{
  movies: Movie[]
}>()

const moviesPerEpisode = ref<number[]>([])
const episodeNumbers = ref<(number | undefined)[]>([])

watch(() => props.movies, (newMovies) => {
  if (!newMovies || newMovies.length === 0) {
    moviesPerEpisode.value = []
    episodeNumbers.value = []
    return
  }

  const perEpisode: number[] = []
  newMovies.forEach(movie => {
    const episode = movie.id.episode
    if (perEpisode[episode] === undefined) {
      perEpisode[episode] = 0
    }
    perEpisode[episode]++
  })

  // Fill in any potential gaps with 0
  for (let i = 0; i < perEpisode.length; i++) {
    if (perEpisode[i] === undefined) {
      perEpisode[i] = 0
    }
  }

  moviesPerEpisode.value = perEpisode

  episodeNumbers.value = new Array(perEpisode.length)
    .fill(0)
    .map((_value, index) => index % 10 === 0 ? index : undefined)
}, { immediate: true })

const average = computed(() => {
  if (moviesPerEpisode.value.length === 0) return 0
  const total = moviesPerEpisode.value.reduce((a, b) => a + b, 0)
  return Math.round(10 * total / moviesPerEpisode.value.length) / 10
})

const min = computed(() => {
  if (moviesPerEpisode.value.length === 0) return { episode: 0, count: 0 }
  const minVal = { episode: 0, count: moviesPerEpisode.value[0] }
  moviesPerEpisode.value.forEach((count, episode) => {
    if (count < minVal.count && count > 0) {
      minVal.episode = episode
      minVal.count = count
    }
  })
  return minVal
})

const max = computed(() => {
  if (moviesPerEpisode.value.length === 0) return { episode: 0, count: 0 }
  const maxVal = { episode: 0, count: moviesPerEpisode.value[0] }
  moviesPerEpisode.value.forEach((count, episode) => {
    if (count > maxVal.count) {
      maxVal.episode = episode
      maxVal.count = count
    }
  })
  return maxVal
})
</script>

<template>
  <div v-if="moviesPerEpisode.length > 0">
    <ul>
      <li><b>Moyenne</b> : {{ average }} par épisode</li>
      <li><b>Épisode le plus prolifique</b> : N°{{ max.episode }} avec {{ max.count }} films</li>
      <li><b>Épisode le plus passionné</b> : N°{{ min.episode }} avec {{ min.count }} films</li>
    </ul>
    <ChartLine :series="[moviesPerEpisode]" :labels="episodeNumbers"></ChartLine>
  </div>
</template>

<style lang="scss" scoped>
ul {
  margin-top: 10px;
}
</style>