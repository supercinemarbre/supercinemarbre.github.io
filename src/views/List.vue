<template>
  <div v-resize="onResize">
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

    <v-data-table
      v-if="!mobileMode"
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
          <a :name="item.tconst" class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.scbTitle }}</a>
          <div class="movie-alt-title" v-if="item.scbTitle !== item.primaryTitle">{{ item.primaryTitle }}</div>
        </div>
        <div class="movie-casting">
          <div v-if="item.directors">de {{ item.directors.join(', ') }}</div>
          <div v-if="item.actors">avec {{ item.actors.join(', ') }}</div>
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

    <v-data-table
      v-if="mobileMode"
      :loading="state === 'loading'"
      :search="search"
      :headers="[{ text: 'Film', value: 'searchString' }]"
      :items="movies"
      :items-per-page="10"
      :mobile-breakpoint="0"
      :disable-pagination="!!currentDecade"
      :hide-default-footer="!!currentDecade"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :fixed-header="true">
      <template v-slot:item="{ item }">
        <v-lazy>
          <div class="mobile-item">
            <div v-if="item.posterUrl" class="mobile-poster">
              <div class="mobile-ranking">
                {{ item.ranking }}<Ordinal :value="item.ranking" />
                <router-link v-if="!currentDecade" :to="'/' + item.decade + '#' + item.tconst">
                  <span class="mobile-decade">({{ shortDecade(item.decade) }})</span>
                </router-link>
              </div>
              <a :href="'https://www.imdb.com/title/' + item.tconst">
                <v-img :src="item.posterUrl" width="70" height="100" aspect-ratio="1" />
              </a>
            </div>
            <div class="mobile-details">
              <div>
                <a :name="item.tconst" class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.scbTitle }}</a>
              </div>
              <div class="mobile-scb-details">
                <span style="margin-right: 15px">{{ item.startYear }}</span>
                <span>Episode {{ item.episode }}</span>
              </div>
              <div class="movie-casting">
                <div v-if="item.directors" > de {{ item.directors.join(', ') }}</div>
                <div v-if="item.actors">avec {{ item.actors.join(', ') }}</div>
              </div>
      
              <div class="mobile-ratings">
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
            </div>
          </div>
        </v-lazy>
      </template>
      <template v-slot:top="{ pagination, options, updateOptions }">
        <v-data-footer 
          :pagination="pagination" 
          :options="options"
          @update:options="updateOptions"
          items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
      </template>
    </v-data-table>
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

::v-deep td .v-progress-linear {
  width: 150px;
}

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
}
.movie-alt-title {
  color: gray;
}
::v-deep .movie-casting {
  color: #AAA;
  font-size: 90%;
  margin: 5px 0;
}
@media (max-width: 990px) {
  ::v-deep .movie-casting {
    line-height: 120%;
  }
}
@media (max-width: 600px) {
  ::v-deep .movie-casting {
    font-size: 80%;
  }
}

@media (max-width: 990px) {
  ::v-deep thead {
    display: none;
  }
}
@media (max-width: 500px) {
  ::v-deep .v-data-footer {
    flex-wrap: nowrap;
    justify-content: center;
  }
  ::v-deep .v-data-footer__pagination {
    margin: 0 !important;
  }
  ::v-deep .v-data-footer__select {
    font-size: 0;
  }
}
.mobile-item {
  display: flex;
  line-height: 120%;
  padding: 5px 10px;
  border-bottom: 1px solid #393939;
}
.mobile-poster {
  margin-right: 15px;
}
.mobile-scb-details {
  margin-top: 5px;
  font-size: 85%;
}
.mobile-ranking {
  text-align: center;
  margin-bottom: 3px;
}
.mobile-decade {
  font-size: 80%;
  margin-left: 5px;
}
.mobile-ratings {
  margin-bottom: 10px;
}
.mobile-popularity {
  width: 150px;
}
</style>
