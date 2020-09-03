<template>
  <div v-resize="onResize">
    <MovieListDesktop
      v-if="!mobileMode"
      :movies="movies"
      :episodes="episodes"
      :currentDecade="currentDecade"
      :state="state"
      :search="search"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    ></MovieListDesktop>
    <MovieListMobile
      v-if="mobileMode"
      :movies="movies"
      :episodes="episodes"
      :currentDecade="currentDecade"
      :state="state"
      :search="search"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    ></MovieListMobile>
  </div>
</template>

<script src="./MovieList.ts" lang="ts"></script>
