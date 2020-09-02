<template>
  <div>
    <h1>
      <span v-if="state !== 'loading'">
        <span v-if="decadeTitle">{{ decadeTitle }}</span>
        <span v-if="!decadeTitle">Tous les films classés du <a href="http://supercinebattle.fr/">Super Ciné Battle</a></span>
      </span>
    </h1>

    <v-card style="margin-bottom: 15px">
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
          placeholder="Chercher un film, réalisateur, acteur..."
        ></v-text-field>
      </v-card-title>
    </v-card>

    <MovieList
      :movies="movies"
      :currentDecade="currentDecade"
      :state="state"
      :search="search"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    ></MovieList>
  </div>
</template>

<script src="./List.ts" lang="ts"></script>

<style lang="scss" scoped>
@media (max-width: 990px) {
  h1 {
    font-size: 130%;
    text-align: center;
    margin: 5px 5px 10px 5px !important;
  }
}

// TODO Move this IMDB popularity styling
::v-deep td .v-progress-linear {
  width: 150px;
}
</style>
