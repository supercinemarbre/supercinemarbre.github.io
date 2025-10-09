<script setup lang="ts">
import type { Movie } from 'src/Movies/model/movie.model'
import { computeEpisodeStats } from 'src/Stats/model/episode-stats'
import { computed } from 'vue'
import ChartLine from '../molecules/ChartLine.vue'

const props = defineProps<{
  movies: Movie[]
}>()

const stats = computed(() => computeEpisodeStats(props.movies))
const seriesLabels = computed(() => new Array(stats.value.episodes.length)
    .fill(0)
    .map((_value, index) => index % 10 === 0 ? index : undefined))
</script>

<template>
  <div v-if="stats.episodes.length > 0">
    <ul>
      <li><b>Moyenne</b> : {{ stats.average }} par épisode</li>
      <li><b>Épisode le plus prolifique</b> : N°{{ stats.max.episode }} avec {{ stats.max.count }} films</li>
      <li><b>Épisode le plus passionné</b> : N°{{ stats.min.episode }} avec {{ stats.min.count }} films</li>
    </ul>
    <ChartLine :series="[stats.episodes]" :labels="seriesLabels"></ChartLine>
  </div>
</template>

<style lang="scss" scoped>
ul {
  margin: 20px;
}
</style>