<script setup lang="ts">
import { formatDate } from 'src/formatting';
import { isMobileMode } from 'src/services/responsive';
import { computed, onMounted, ref } from 'vue';
import router from '../router';
import { fetchEpisodes, fetchMovies, type EpisodeMap } from '../services/api-client';
import { getMaxEpisode, watchDebounced } from '../services/utils';
import type { Episode, Movie } from '../types';
import type { SpoilerFreeSettings } from './spoiler-free/SpoilerFree.settings';
import SpoilerFree from './spoiler-free/SpoilerFree.vue';
import MoviePoster from './common/MoviePoster.vue';

const state = ref<'loading' | 'loaded'>('loading');
const searchInput = ref(router.currentRoute.value.query.search?.toString());
const searchInputUndebounced = ref('')

const episodeMap = ref<EpisodeMap>({});
const episodes = computed<Episode[]>(() => {
  return Object.values(episodeMap.value)
    .map(episode => {
      episode.searchString = toSearchString(episode.title);
      return episode;
    })
    .sort((e1, e2) => e2.number - e1.number);
});
const headers = [
  { title: 'Ep.', value: 'number' },
  { title: 'Date', headerProps: { class: 'date' }, sortable: false },
  { title: 'Titre', value: 'title', sortable: false },
  { title: 'Décennie', headerProps: { class: 'decade' }, sortable: false },
  { title: 'Article', sortable: false },
  { title: 'MP3', sortable: false }
];
// const headers = [
//   { title: "Classement", key: "ranking", align: "center", filterable: false },
//   { title: "Poster", key: "posterUrl", align: "center", sortable: false, filterable: false },
//   { title: "Titre", key: "searchString" },
//   { title: "Année", key: "year", align: "center", filterable: false },
//   { title: "Notes & liens", key: "imdbRating", sort: (a, b) => (b || 0) - (a || 0), filterable: false, class: "column-imdb-ranking" },
//   { title: "Popularité IMDB", key: "imdbVotes", sort: (a, b) => (b || 0) - (a || 0), filterable: false },
//   { title: "Episode", key: "episode", align: "center", filterable: false }
// ];
const hideMoviesAboveEpisode = ref(false as false | number);
const allMovies = ref<Movie[]>([]);

onMounted(async () => {
  try {
    const results = await Promise.all([
      fetchMovies(),
      fetchEpisodes()
    ])
    allMovies.value = results[0]
      .map(movie => {
        movie.episode = movie.id.episode;
        return movie;
      });
    episodeMap.value = results[1];
  } catch (error) {
    console.error('Error loading episodes:', error);
  } finally {
    state.value = 'loaded';
  }
});

function toSearchString(value: string) {
  return value ? value.replace(/[^a-zA-Z]/g, '').toLowerCase() : ''; // fixme ternary
}

function onSpoilerFreeSettingsChange(settings: SpoilerFreeSettings) {
  hideMoviesAboveEpisode.value = settings.enabled ? settings.lastWatched : getMaxEpisode(episodeMap.value);
}


function customFilter(_value: Episode, search: string | null, item: Episode): boolean {
  const searchString = toSearchString(search);
  return !search
    || item.number.toString() === search
    || item.decade === search
    || (searchString && item.searchString.includes(searchString));
}

function episodeMovies(episodeNumber: number) {
  return allMovies.value
    .filter(m => m.episode === episodeNumber)
    .sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return b.timestamp || -a.timestamp;
    });
}


// XXX code duplication in List.vue
watchDebounced(searchInputUndebounced, (value) => searchInput.value = value, 300);

</script>

<template>
  <h1>Liste des épisodes</h1>

  <v-container fluid style="margin-bottom: 15px">
    <v-row>
      <v-col cols="5" lg="4">
        <SpoilerFree v-if="episodes.length" :episodes="episodes" @onChange="onSpoilerFreeSettingsChange"></SpoilerFree>
      </v-col>
      <v-spacer />
      <v-col cols="6" lg="7" class="align-bottom">
        <v-text-field v-model="searchInputUndebounced"
          :placeholder="isMobileMode ? 'Rechercher...' : 'Rechercher un film, réalisateur, acteur...'" hide-details>
          <template #prepend-inner>
            <v-icon>mdi-movie-search</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-container>

  <v-data-table :loading="state === 'loading'" :search="searchInput" :headers="headers" :items="episodes"
    :items-per-page="5" :mobile-breakpoint="0" :custom-filter="customFilter" hide-default-footer>
    <template v-slot:item="{ item }">
      <tr>
        <td class="number">{{ item.number }}</td>
        <td class="date hidden-xs">{{ formatDate(item.date) }}</td>
        <td class="episode-title">
          <a :href="item.url">{{ item.title }}</a>
          <div class="inline-details">
            Années {{ item.decade }}
          </div>
        </td>
        <td class="decade">{{ item.decade }}</td>
        <td class="article">
          <a :href="item.url"><v-icon>mdi-bookmark</v-icon></a>
        </td>
        <td class="download">
          <a :href="item.mp3url"><v-icon>mdi-download</v-icon></a>
        </td>
      </tr>
      <tr v-if="hideMoviesAboveEpisode >= item.number" class="movies-row">
        <td></td>
        <td colspan="5">
          <v-lazy>
            <div class="movies">
              <div v-for="movie in episodeMovies(item.number)" :key="movie.tconst" class="movie">
                <MoviePoster :movie="movie" :episode="item"></MoviePoster>
              </div>
              <div v-if="episodeMovies(item.number).length === 0">
                <br />
                <span v-if="item.title.includes('Super') && item.title.includes('Battle')">
                  Les listes spéciales ne sont pas encore supportées sur Super Ciné Marbre.
                </span>
                <span v-else>
                  Classements et timestamps manquants pour cet episode. Voir <router-link to="/about">A
                    propos</router-link> pour les contribuer !
                </span>
              </div>
            </div>
          </v-lazy>
        </td>
      </tr>
    </template>
    <template v-slot:top="{ pagination, options, updateOptions }">
      <v-data-table-footer :pagination="pagination" :options="options" @update:options="updateOptions" showFirstLastPage
        showCurrentPage :itemsPerPageOptions="[5, 10, 50, -1]"
        items-per-page-text="$vuetify.dataTable.itemsPerPageText" />
    </template>
  </v-data-table>
</template>


<style lang="scss" scoped>
:deep .number {
  font-size: 150% !important;
}

:deep .episode-title {
  font-size: 120% !important;
  font-weight: 700;
}
@media (max-width: 991px) {
  :deep .episode-title {
    font-size: 90% !important;
    font-weight: normal;
  }
}

@media screen and (max-width: 600px) {
  :deep .date,
  :deep .decade,
  :deep .movies-row {
    display: none !important;
  }
}

.movies {
  margin-top: 5px;
  margin-bottom: 30px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

:deep .article .v-icon, :deep .download .v-icon {
  font-size: 250% !important;
  color: #7ec6ff !important;
}
</style>