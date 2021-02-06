<template>
  <a :class="{ 'styled': !textOnly }" v-if="movie.timestamp && episode" :href="episode.mp3url + '#t=' + movie.timestamp">
    <v-icon>mdi-headphones</v-icon>
    Ecouter
  </a>
</template>

<script src="./TimestampLink.ts" lang="ts"></script>

<style lang="scss" scoped>
#app a {

  .styled {
    font-size: .75rem;
    border: 1px solid rgba(0,0,0,0);
    border-radius: 4px;
    padding: 3px 4px;
    line-height: 0px;
    transition: 0.15s cubic-bezier(0, 1.1, 0.8, 2);
  }

  &:hover {
    color: #fff;
    border-color: #ccc;
  }

  & i {
    transition: 0.15s cubic-bezier(0, 1.1, 0.8, 2);
    font-size: 1.0rem;
    color: #7ec6ff;
    line-height: 0px;
  }

  &:hover i {
    margin-top: 1px;
    backface-visibility: hidden;
    transform: scale(1.2) translateZ(0);
    -webkit-font-smoothing: subpixel-antialiased;
    color: #fff;
  }
}
</style>