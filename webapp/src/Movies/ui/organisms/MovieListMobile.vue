<script setup lang="ts">
import { toEpisodeByNumber, type Episode, type EpisodeByNumber } from 'src/Movies/model/episode.model'
import type { Movie } from 'src/Movies/model/movie.model'
import Ordinal from 'src/shared/ui/molecules/Ordinal.vue'
import type { VuetifySortItem } from 'src/types.d'
import { computed } from 'vue'
import { rowPropsHighlightingCurrentMovie } from '../logic/highlight-current-movie'
import { shortDecade } from '../logic/short-decade'
import JustWatchLink from '../molecules/JustWatchLink.vue'
import RatingIMDB from '../molecules/ratings/RatingIMDB.vue'
import RatingMetacritic from '../molecules/ratings/RatingMetacritic.vue'
import RatingRT from '../molecules/ratings/RatingRT.vue'
import TimestampLink from '../molecules/TimestampLink.vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  currentDecade?: string,
  state?: 'loading' | 'loaded',
  movies: Movie[],
  episodes: Episode[],
  sortBy: VuetifySortItem[],
  itemsPerPage: number,
}>()

const episodeByNumber = computed<EpisodeByNumber>(() => toEpisodeByNumber(props.episodes))
</script>

<template>
  <v-data-table :loading="state === 'loading'" :headers="[{ title: 'Film', value: 'searchString' }]"
    :items="movies" :items-per-page="itemsPerPage" :mobile-breakpoint="0" :disable-pagination="!!currentDecade"
    hide-default-footer no-data-text="" :sort-by="sortBy" :fixed-header="true"
    :row-props="rowPropsHighlightingCurrentMovie" item-key="tconst">
    <template v-slot:item="{ item }">
      <v-lazy>
        <div class="mobile-item">
          <div v-if="item.posterUrl" class="mobile-poster">
            <div class="mobile-ranking">
              {{ item.ranking }}
              <Ordinal :value="item.ranking" />
              <RouterLink v-if="!currentDecade" :to="'/' + item.decade + '#' + item.tconst">
                <span class="mobile-decade">({{ shortDecade(item.decade) }})</span>
              </RouterLink>
            </div>
            <v-img :src="item.posterUrl" width="70" height="100" aspect-ratio="1" />
          </div>
          <div>
            <div>
              <span class="movie-title">{{ item.title }}</span>
            </div>
            <div class="mobile-scb-details">
              <div>
                <span style="margin-right: 15px">{{ item.year }}</span>
                <span style="margin-right: 15px">{{ item.runtimeMinutes }} min</span>
              </div>
              <div>
                <TimestampLink :movie="item" :audio-url="episodeByNumber[item.id.episode]?.mp3url" :textOnly="true"
                  style="margin-right: 10px"></TimestampLink>
                <RouterLink v-if="item.id.episode !== undefined" :to="'/episodes?search=' + item.id.episode">Episode {{
                  item.id.episode }}</RouterLink>
              </div>
            </div>
            <div class="movie-casting">
              <div v-if="item.directors"> de {{ item.directors.join(', ') }}</div>
              <div v-if="item.actors">avec {{ item.actors.join(', ') }}</div>
              <div v-if="item.comment" style="margin-top: 5px"><b>Note:</b> {{ item.comment }}</div>
            </div>

            <div>
              <RatingIMDB class="movie-rating" v-if="!!item.tconst" :movie="item" />
              <div class="movie-rating" v-if="!!item.rottenTomatoesRating">
                <RatingRT :rating="item.rottenTomatoesRating" />
              </div>
              <div class="movie-rating" v-if="!!item.metascore">
                <RatingMetacritic :rating="item.metascore" />
              </div>
              <div class="movie-rating">
                <JustWatchLink :movie="item" />
              </div>
            </div>
          </div>
        </div>
      </v-lazy>
    </template>
    <template v-slot:top>
      <v-data-table-footer v-if="!currentDecade" :itemsPerPageOptions="[3, 5, 10, 50, -1]"
        items-per-page-text="$vuetify.dataTable.itemsPerPageText" />
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
@use 'src/shared/ui/styles/highlight.scss';

.movie-ranking {
  font-size: 120%;
  font-weight: bold;
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

:deep(.movie-casting) {
  color: #BBBBBB;
  font-size: 90%;
  margin-bottom: 5px;
  line-height: 120%;
}

@media (max-width: 600px) {
  :deep(.movie-casting) {
    font-size: 80%;
  }
}

@media (max-width: 300px) {
  :deep(.movie-casting) {
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

:deep(thead) {
  display: none;
}

@media (max-width: 500px) {
  :deep(.v-data-footer) {
    flex-wrap: nowrap;
    justify-content: center;
  }

  :deep(.v-data-footer__pagination) {
    margin: 0 !important;
  }

  :deep(.v-data-footer__select) {
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
</style>
