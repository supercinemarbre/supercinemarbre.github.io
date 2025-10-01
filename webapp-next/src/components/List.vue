<script setup lang="ts">
import type { Movie } from 'src/types';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { fetchEpisodes, fetchMovies, type EpisodeMap } from '../services/api-client';
import { watchDebounced } from '../services/utils';
import MovieListDesktop from './movie-list/MovieListDesktop.vue';
import MovieListMobile from './movie-list/MovieListMobile.vue';
import type { SpoilerFreeSettings } from './spoiler-free/SpoilerFree.settings';
import SpoilerFree from './spoiler-free/SpoilerFree.vue';
import { isMobileMode } from '../services/responsive';

const props = defineProps({
  decade: String
});

const state = ref('loading' as 'loading' | 'loaded')
const searchInput = ref('')
const searchInputUndebounced = ref('')
const itemsPerPage = computed(() => props.decade ? -1 : 5)
const allMovies: Ref<Movie[]> = ref([])
const episodes: Ref<EpisodeMap> = ref({})
const spoilerFreeFromEpisode = ref(false as false | number);

const decadeTitle = computed(() => props.decade ? `La liste ultime des années ${props.decade}` : '')
const movies = computed(() => {
  const visibleMovies = allMovies.value
      .filter(movie => !spoilerFreeFromEpisode.value || movie.id.episode <= spoilerFreeFromEpisode.value);
  if (props.decade) {
    return visibleMovies.filter(movie => movie.decade === props.decade)
      .sort((a, b) => a.ranking - b.ranking)
  } else {
    return visibleMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
  }
})
const filteredMovies = computed(() => {
  return movies.value.filter(m => m.searchString.includes(searchInput.value.toLowerCase()))
})

watchDebounced(searchInputUndebounced, (value) => searchInput.value = value, 300);

function onSpoilerFreeSettingsChange(settings: SpoilerFreeSettings) {
  spoilerFreeFromEpisode.value = settings.enabled ? settings.lastWatched : false;
}

// Initialization

;[allMovies.value, episodes.value] = await Promise.all([
  fetchMovies(),
  fetchEpisodes()
]);
allMovies.value.forEach(movie => {
  movie.searchString =
    (movie.primaryTitle + '|' +
      movie.title + '|' +
      movie.actors?.join('|') + '|' +
      movie.directors?.join('|') +
      movie.year + '|' +
      'episode ' + movie.id.episode).toLowerCase()
  movie.episode = movie.id.episode
})
state.value = 'loaded';


</script>

<template>
  <h1>
    <span v-if="state !== 'loading'">
      <span v-if="decadeTitle">{{ decadeTitle }}</span>
      <span v-if="!decadeTitle">Tous les films classés du <a href="http://supercinebattle.fr/">Super Ciné
          Battle</a></span>
    </span>
  </h1>

  <v-container fluid style="margin-bottom: 15px">
    <v-row>
      <v-col cols="5" lg="4">
        <SpoilerFree ref="spoilerFree" :episodes="episodes" @onChange="onSpoilerFreeSettingsChange"></SpoilerFree>
      </v-col>
      <v-spacer />
      <v-col cols="6" lg="7" class="align-bottom">
        <v-text-field v-model="searchInputUndebounced"
          :placeholder="isMobileMode ? 'Rechercher...' : 'Rechercher un film, réalisateur, acteur...'"
          hide-details>
          <template #prepend-inner>
            <v-icon>mdi-movie-search</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-container>

  <MovieListDesktop v-if="!isMobileMode" :movies="filteredMovies" :episodes="episodes" :currentDecade="props.decade"
    :state="state" :search="searchInput" :sortBy="decade ? [] : [{ key: 'episode', order: 'desc' }]"
    :itemsPerPage="itemsPerPage"></MovieListDesktop>
  <MovieListMobile v-if="isMobileMode" :movies="filteredMovies" :episodes="episodes" :currentDecade="props.decade"
    :state="state" :search="searchInput" :sortBy="decade ? [] : [{ key: 'episode', order: 'desc' }]"
    :itemsPerPage="itemsPerPage"></MovieListMobile>
</template>

<style lang="scss" scoped>
.align-bottom {
  display: flex;
  align-items: flex-end;
}
</style>
