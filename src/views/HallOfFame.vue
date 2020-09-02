<template>
  <div>
    <h1>Hall of Fame</h1>

    <MovieList
      :movies="allMovies"
      :state="state"
      :search="search"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    ></MovieList>
  </div>
</template>

<script src="./HallOfFame.ts" lang="ts"></script>

<style lang="scss">
</style>