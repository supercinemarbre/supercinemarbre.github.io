<template>
  <div>
    <h1><span v-if="state !== 'loading'">{{ title }}</span></h1>

    <v-card style="margin-bottom: 15px">
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
    </v-card>

    <v-data-table
      :loading="state === 'loading'"
      :search="search"
      :headers="headers"
      :items="movies"
      :items-per-page="10"
      :disable-pagination="!!currentDecade"
      :hide-default-footer="!!currentDecade"
      :fixed-header="true">
      <template v-slot:item.ranking="{ item }">
        <span class="movie-ranking" v-if="!!currentDecade">{{ item.ranking }}</span>
        <span v-if="!currentDecade">{{ item.ranking }} (années {{ item.decade }})</span>
      </template>
      <template v-slot:item.posterUrl="{ item }">
        <a v-if="item.posterUrl" class="movie-poster" :href="'https://www.imdb.com/title/' + item.tconst">
          <v-img :src="item.posterUrl" width="70" height="100" aspect-ratio="1" />
        </a>
      </template>
      <template v-slot:item.ratings="{ item }">
        <a class="movie-rating" v-if="!!item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">
          <RatingIMDB :rating="item.imdbRating" />
        </a>
        <div class="movie-rating" v-if="!!item.rottenTomatoesRating">
          <RatingRT :rating="item.rottenTomatoesRating" />
        </div>
        <div class="movie-rating" v-if="!!item.metascore">
          <RatingMetacritic :rating="item.metascore" />
        </div>
      </template>
      <template v-slot:item.primaryTitle="{ item }">
        <a class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.primaryTitle }}</a>
      </template>
    </v-data-table>
  </div>
</template>

<script src="./List.ts" lang="ts"></script>

<style lang="scss" scoped>
.movie-ranking {
  font-size: 200%;
  font-weight: bold;
}

.movie-poster {
  display: inline-block;
  height: 110px;
  padding: 5px;
  box-sizing: border-box;
}

.movie-rating {
  white-space: nowrap;
  display: block;
  margin-bottom: 4px;
}
.icon {
  margin-top: -4px;
  margin-right: 4px;
  vertical-align: middle;
}
.icon.imdb {
  height: 32px;
}

.movie-title {
  display: block;
  font-size: 120%;
  font-weight: bold;
}
</style>
