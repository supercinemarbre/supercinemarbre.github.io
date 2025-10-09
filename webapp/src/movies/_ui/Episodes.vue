<script setup lang="ts">
import { formatDate } from 'src/shared/_ui/logic/format-date';
import { computed, onMounted, ref } from 'vue';
import type { Episode, Movie } from '../../types';
import { fetchEpisodes, type EpisodeMap } from 'src/movies/_infra/episodes.client';
import { fetchMovies } from '../movies.api';
import MovieFilters from 'src/movies/_ui/organisms/MovieFilters.vue';
import MoviePoster from 'src/movies/_ui/molecules/MoviePoster.vue';

const state = ref<'loading' | 'loaded'>('loading');
const searchInput = ref('');
const episodeMap = ref<EpisodeMap>({});
const episodes = computed<Episode[]>(() => {
  return Object.values(episodeMap.value)
    .map(episode => {
      episode.searchString = toSearchString(episode.title);
      return episode;
    });
});
const headers = [
  { title: 'Ep.', value: 'number', key: 'episode' },
  { title: 'Date', headerProps: { class: 'date' }, sortable: false },
  { title: 'Titre', value: 'title', sortable: false },
  { title: 'Décennie', headerProps: { class: 'decade' }, sortable: false },
  { title: 'Article', sortable: false },
  { title: 'MP3', sortable: false }
];

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

function customFilter(_episodeIndex: Episode, search: string | null, data: { raw: Episode }): boolean {
  const searchString = toSearchString(search);
  const episode = data.raw;
  return Boolean(!search
    || episode.number?.toString() === search
    || episode.decade === search
    || (searchString && episode.searchString?.includes(searchString)));
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
</script>

<template>
  <h1>Liste des épisodes</h1>

  <MovieFilters :episode-map="episodeMap" @search="searchInput = $event" @hide-movies-above-episode="hideMoviesAboveEpisode = $event">
  </MovieFilters>

  <v-data-table :loading="state === 'loading'" :search="searchInput" :headers="headers" :items="episodes"
    :items-per-page="5" :mobile-breakpoint="0" :custom-filter="customFilter" hide-default-footer
    :sort-by="[{ key: 'episode', order: 'desc' }]">
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
:deep(.number) {
  font-size: 150% !important;
}

:deep(.episode-title) {
  font-size: 120% !important;
  font-weight: 700;
}

@media (max-width: 991px) {
  :deep(.episode-title) {
    font-size: 90% !important;
    font-weight: normal;
  }
}

@media screen and (max-width: 600px) {

  :deep(.date),
  :deep(.decade),
  :deep(.movies-row) {
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

:deep(.article .v-icon),
:deep(.download .v-icon) {
  font-size: 250% !important;
  color: #7ec6ff !important;
}
</style>