<template>
  <span v-if="isValid">
    {{ ratingLabel }}
    <img src="../../public/img/imdb.png" />
  </span>
</template>

<script src="./RatingIMDB.ts" lang="ts"></script>

<style lang="scss" scoped>
img {
  margin-top: -4px;
  margin-left: 6px;
  vertical-align: middle;
  height: 30px;
}
</style>
