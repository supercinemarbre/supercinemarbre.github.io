<template>
  <v-data-table
    :loading="state === 'loading'"
    :search="search"
    :headers="headers"
    :items="movies"
    :items-per-page="10"
    :mobile-breakpoint="991"
    :disable-pagination="!!currentDecade"
    :hide-default-footer="!!currentDecade"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :footer-props="{
      showFirstLastPage: true,
      showCurrentPage: true
    }">
    <template v-slot:item.ranking="{ item }">
      <span class="movie-ranking" v-if="!!currentDecade">{{ item.ranking }}<Ordinal :value="item.ranking" /></span>
      <span v-if="!currentDecade">
        <router-link :to="'/' + item.decade + '#' + item.tconst">
          <div class="movie-ranking">{{ item.ranking }}<Ordinal :value="item.ranking" /></div>
          Années {{ item.decade }}
        </router-link>
      </span>
    </template>
    <template v-slot:item.posterUrl="{ item }">
      <a v-if="item.posterUrl" class="movie-poster" :href="'https://www.imdb.com/title/' + item.tconst">
        <v-img :src="item.posterUrl" width="70" height="100" aspect-ratio="1" />
      </a>
    </template>
    <template v-slot:item.imdbRating="{ item }">
      <v-lazy>
        <div>
          <a class="movie-rating" v-if="!!item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">
            <RatingIMDB :rating="item.imdbRating" />
          </a>
          <div class="movie-rating" v-if="!!item.rottenTomatoesRating">
            <RatingRT :rating="item.rottenTomatoesRating" />
          </div>
          <div class="movie-rating" v-if="!!item.metascore">
            <RatingMetacritic :rating="item.metascore" />
          </div>
        </div>
      </v-lazy>
    </template>
    <template v-slot:item.imdbVotes="{ item }">
      <PopularityIMDB :votes="item.imdbVotes" />
    </template>
    <template v-slot:item.searchString="{ item }">
      <div>
        <a :name="item.tconst" class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.title }}</a>
        <div class="movie-alt-title" v-if="item.title !== item.primaryTitle">{{ item.primaryTitle }}</div>
      </div>
      <div class="movie-casting">
        <div v-if="item.directors">de {{ item.directors.join(', ') }}</div>
        <div v-if="item.actors">avec {{ item.actors.join(', ') }}</div>
        <div v-if="item.comment" style="margin-top: 5px"><b>Note:</b> {{ item.comment }}</div>
      </div>
    </template>
    <template v-slot:top="{ pagination, options, updateOptions }">
      <v-data-footer 
        :pagination="pagination" 
        :options="options"
        @update:options="updateOptions"
        showFirstLastPage
        showCurrentPage
        items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
    </template>
  </v-data-table>
</template>

<script src="./MovieListDesktop.ts" lang="ts"></script>

<style lang="scss" scoped>
.movie-ranking {
  font-size: 200%;
  font-weight: bold;
}
@media (max-width: 990px) {
  .movie-ranking {
    font-size: 120%;
  }
}

.movie-poster {
  display: inline-block;
  height: 110px;
  padding: 5px;
  box-sizing: border-box;
  overflow: hidden;
}

.movie-rating {
  white-space: nowrap;
  display: inline-block;
  margin-right: 10px;
}
@media (min-width: 991px) and (max-width: 1600px) {
  .movie-rating {
    display: block;
    margin-bottom: 4px;
  }
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
  margin-bottom: 5px;
}

.movie-alt-title {
  margin-top: -5px;
  margin-bottom: 5px;
  color: #888888;
}
::v-deep .movie-casting {
  color: #BBBBBB;
  font-size: 90%;
  margin-bottom: 5px;
}
</style>
