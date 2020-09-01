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
      :mobile-breakpoint="800"
      :disable-pagination="!!currentDecade"
      :hide-default-footer="!!currentDecade"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :fixed-header="true">
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
          <div v-if="item.directors">De {{ item.directors.join(', ') }}</div>
          <div v-if="item.actors">Avec {{ item.actors.join(', ') }}</div>
        </div>
      </template>
      <template v-slot:top="{ pagination, options, updateOptions }">
        <v-data-footer 
          :pagination="pagination" 
          :options="options"
          @update:options="updateOptions"
          items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
      </template>
    </v-data-table>

    <v-data-table
      v-if="mobileMode"
      :loading="state === 'loading'"
      :search="search"
      :headers="['movie']"
      :items="movies"
      :items-per-page="10"
      :mobile-breakpoint="0"
      :disable-pagination="!!currentDecade"
      :hide-default-footer="!!currentDecade"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :fixed-header="true">
      <template v-slot:item="{ item }">
        <div class="mobile-item">
          <div v-if="item.posterUrl" class="mobile-poster">
            <a :href="'https://www.imdb.com/title/' + item.tconst">
              <v-img :src="item.posterUrl" width="70" height="100" aspect-ratio="1" />
            </a>
            <div class="mobile-ranking">
              {{ item.ranking }}<Ordinal :value="item.ranking" />
              <router-link v-if="!currentDecade" :to="'/' + item.decade + '#' + item.tconst">
                <span class="mobile-decade">({{ shortDecade(item.decade) }})</span>
              </router-link>
            </div>
          </div>
          <div class="mobile-details">
            <a :name="item.tconst" class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.scbTitle }}</a>
            <div class="movie-alt-title" v-if="item.scbTitle !== item.primaryTitle">{{ item.primaryTitle }}</div>
     
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
::v-deep .v-progress-linear {
  width: 150px;
}

.movie-ranking {
  font-size: 200%;
  font-weight: bold;
}
@media (max-width: 991px) {
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
@media (max-width: 991px) {
  .movie-poster {
    height: 60px;
  }
  .movie-poster .v-image {
    margin-top: 25px;
  }
}

.movie-rating {
  white-space: nowrap;
  display: inline-block;
  margin-right: 10px;
}
@media (min-width: 800px) and (max-width: 991px) {
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
.movie-casting {
  color: #AAA;
  font-size: 90%;
  margin-top: 5px;
}

.mobile-item {
  display: flex;
  padding: 5px 10px;
}
.mobile-poster {
  margin-right: 15px;
}
.mobile-ranking {
  text-align: center;
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
