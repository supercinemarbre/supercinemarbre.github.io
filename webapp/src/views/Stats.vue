<template>
  <div>
    <h2>Sommaire</h2>

    <ul>
      <li><a href="#stats">Nombre de films traités par épisode</a></li>
      <li><a href="#directors">Hall of Fame des réalisateurs</a></li>
      <li><a href="#actors">Hall of Fame des acteurs</a></li>
    </ul>

    <h2><a id="stats" class="anchor"></a>Nombre de films traités par épisode</h2>
    <MoviesPerEpisodeStats :movies="movies"></MoviesPerEpisodeStats>

    <h2><a id="directors" class="anchor"></a>Hall of Fame des réalisateurs</h2>
    <MostPresentDirectors></MostPresentDirectors>

    <h2><a id="actors" class="anchor"></a>Hall of Fame des acteurs</h2>
    <MostPresentActors></MostPresentActors>
  </div>
</template>

<script src="./Stats.ts" lang="ts"></script>

<style lang="scss" scoped>
ul {
  font-size: 150%;
  font-weight: bold;
  padding-bottom: 50px;
}

a.anchor {
  display: block;
  position: relative;
  top: -115px;
  visibility: hidden;
}
</style>
