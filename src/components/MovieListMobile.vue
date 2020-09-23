<template>
  <v-data-table
    :loading="state === 'loading'"
    :search="search"
    :headers="[{ text: 'Film', value: 'searchString' }]"
    :items="movies"
    :items-per-page="itemsPerPage"
    :mobile-breakpoint="0"
    :disable-pagination="!!currentDecade"
    hide-default-footer
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    :fixed-header="true"
    item-key="tconst">
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
              <a :name="item.tconst" class="movie-title" v-if="item.tconst" :href="'https://www.imdb.com/title/' + item.tconst">{{ item.title }}</a>
            </div>
            <div class="mobile-scb-details">
              <span style="margin-right: 15px">{{ item.year }}</span>
              <span style="margin-right: 15px">{{ item.runtimeMinutes }} min</span>
              <router-link v-if="item.episode" :to="'/episodes?search=' + item.episode">Episode {{ item.episode }}</router-link>
              <TimestampLink :movie="item" :episode="episodes[item.episode]" style="margin-left: 10px"></TimestampLink>
            </div>
            <div class="movie-casting">
              <div v-if="item.directors" > de {{ item.directors.join(', ') }}</div>
              <div v-if="item.actors">avec {{ item.actors.join(', ') }}</div>
              <div v-if="item.comment" style="margin-top: 5px"><b>Note:</b> {{ item.comment }}</div>
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
      <v-data-footer v-if="!currentDecade"
        :pagination="pagination" 
        :options="options"
        @update:options="updateOptions"
        :itemsPerPageOptions="[3,5,10,50,-1]"
        items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
    </template>
  </v-data-table>
</template>

<script src="./MovieListMobile.ts" lang="ts"></script>

<style lang="scss" scoped>
.movie-ranking {
  font-size: 120%;
  font-weight: bold;
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
@media (max-width: 300px) {
  .movie-title {
    font-size: 100%;
  }
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
  line-height: 120%;
}
@media (max-width: 600px) {
  ::v-deep .movie-casting {
    font-size: 80%;
  }
}
@media (max-width: 300px) {
  ::v-deep .movie-casting {
    display: none;
  }
  .mobile-scb-details {
    & span {
      display: block;
      font-size: 80%;
      line-height: 120%;
    }
  }
}

::v-deep thead {
  display: none;
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
  padding: 8px 10px;
  border-bottom: 1px solid #393939;
}
.mobile-poster {
  margin-right: 15px;
}
.mobile-scb-details {
  color: #888;
  margin-bottom: 5px;
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
.mobile-popularity {
  width: 150px;
}
</style>
