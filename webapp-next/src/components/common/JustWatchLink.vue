<script setup lang="ts">
import { Movie } from '@/types';
import { defineProps } from 'vue';

defineProps<{
  movie?: Movie;
}>();
</script>

<template>
  <a v-if="movie && movie.jwFullPath" :href="'https://www.justwatch.com' + movie.jwFullPath">
    <img src="../../../public/img/justwatch.png" />
  </a>
</template>

<style lang="scss" scoped>
img {
  margin-top: -4px;
  margin-right: -1px;
  vertical-align: middle;
  border: 1px solid rgba(0,0,0,0);
  border-radius: 4px;
  transition: 0.2s;

  &:hover {
    border-color: #ccc;
  }
}
</style>
