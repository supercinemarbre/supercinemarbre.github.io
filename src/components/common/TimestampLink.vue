<template>
  <a class="movie-play" v-if="movie.timestamp" :href="episodes[movie.episode].mp3url + '#t=' + movie.timestamp">
    <v-icon>mdi-headphones</v-icon>
  </a>
</template>

<script src="./TimestampLink.ts" lang="ts"></script>

<style lang="scss" scoped>
.movie-play {
  margin-left: 5px;

  & i {
    transition: 0.15s cubic-bezier(0, 1.1, 0.8, 2);
  }

  &:hover i {
    backface-visibility: hidden;
    transform: scale(1.3) translateZ(0);
    -webkit-font-smoothing: subpixel-antialiased;
    color: #bce2ff;
  }
}
</style>