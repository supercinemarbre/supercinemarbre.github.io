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

<script src="./MoviesPerEpisodeStats.ts" lang="ts"></script>

<style lang="scss" scoped>

ul {
  margin-top: 10px;
}
</style>
