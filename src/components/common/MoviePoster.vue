<template>
  <router-link :to="'/' + movie.decade + '#' + movie.tconst" class="movie-container">
    <div v-if="movie.posterUrl" class="poster">
      <v-img :src="movie.posterUrl" width="70" height="100" aspect-ratio="1" />
    </div>
    <div class="movie-title">{{ movie.title }}</div>
  </router-link>
</template>

<script src="./MoviePoster.ts" lang="ts"></script>

<style lang="scss" scoped>
.movie-container {
  display: inline-block;
  width: 110px;
  text-align: center;
  margin-bottom: 10px;
}

.poster {
  display: inline-block;
  height: 110px;
  padding: 5px;
  box-sizing: border-box;
  overflow: hidden;
}

.movie-title {
  display: inline-block;
  line-height: 120%;
  width: 110px;
}
</style>