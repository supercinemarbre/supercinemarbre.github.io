<template>
  <div>
    <h1>{{ title }}</h1>

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
        <b v-if="!!currentDecade">{{ item.ranking }}</b>
        <span v-if="!currentDecade">{{ item.ranking }} (années {{ item.decade }})</span>
      </template>
      <template v-slot:item.primaryTitle="{ item }">
        <a class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.primaryTitle }}</a>
      </template>
    </v-data-table>
  </div>
</template>

<script src="./List.ts" lang="ts"></script>

<style lang="scss">
h1 {
  padding: 15px;
}

.movie-title {
  font-size: 120%;
  font-weight: bold;
}
</style>