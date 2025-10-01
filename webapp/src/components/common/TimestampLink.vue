<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  movie: {
    timestamp?: number
  };
  episode: {
    mp3url: string
  };
  textOnly?: boolean;
  showTimestamp?: boolean;
}>();

const timestamp = (time: number) => {
  if (time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60) % 60;
    const seconds = time % 60;

    const minSec = `${leftPad(minutes)}:${leftPad(seconds)}`;
    if (hours > 0) {
      return `${hours}:${minSec}`;
    }
    return minSec;
  } else {
    return '';
  }
}

const leftPad = (number: number) => {
  let result = number.toString();
  while (result.length < 2) {
    result = '0' + result;
  }
  return result;
}
</script>

<template>
  <a :class="{ 'styled': !textOnly }" v-if="movie.timestamp && episode"
    :href="episode.mp3url + '#t=' + movie.timestamp">
    <v-icon>mdi-headphones</v-icon>
    <span v-if="showTimestamp">&nbsp;{{ timestamp(movie.timestamp) }}</span>
    <span v-else>&nbsp;Ecouter</span>
  </a>
</template>

<style lang="scss" scoped>
#app a {

  .styled {
    font-size: .75rem;
    border: 1px solid rgba(0, 0, 0, 0);
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