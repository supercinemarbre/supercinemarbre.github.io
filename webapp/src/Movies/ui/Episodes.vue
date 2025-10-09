<script setup lang="ts">
import { fetchEpisodes } from 'src/Movies/infra/episodes.client'
import MoviePoster from 'src/Movies/ui/molecules/MoviePoster.vue'
import MovieFilters from 'src/Movies/ui/organisms/MovieFilters.vue'
import { formatDate } from 'src/shared/ui/logic/format-date'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { type Episode } from '../model/episode.model'
import type { Movie } from '../model/movie.model'
import { fetchMovies } from '../movies.api'

const state = ref<'loading' | 'loaded'>('loading')
const searchInput = ref('')
const episodes = ref<Episode[]>([])
const headers = [
  { title: 'Ep.', value: 'number', key: 'episode' },
  { title: 'Date', headerProps: { class: 'date' }, sortable: false },
  { title: 'Titre', value: 'title', sortable: false },
  { title: 'Décennie', headerProps: { class: 'decade' }, sortable: false },
  { title: 'Article', sortable: false },
  { title: 'MP3', sortable: false }
]

const hideMoviesAboveEpisode = ref(false as false | number)
const allMovies = ref<Movie[]>([])

onMounted(async () => {
  try {
    const results = await Promise.all([
      fetchMovies(),
      fetchEpisodes()
    ])
    allMovies.value = results[0]
    episodes.value = results[1]
  } catch (error) {
    console.error('Error loading episodes:', error)
  } finally {
    state.value = 'loaded'
  }
})

const episodeFilter = (_index: string, search: string | null, data: { raw: Episode }): boolean => {
  return data.raw.matches(search || '')
};

</script>

<template>
  <h1>Liste des épisodes</h1>

  <MovieFilters :episodes="episodes" @search="searchInput = $event"
    @hide-movies-above-episode="hideMoviesAboveEpisode = $event">
  </MovieFilters>

  <v-data-table :loading="state === 'loading'" :search="searchInput" :headers="headers" :items="episodes"
    :items-per-page="5" :mobile-breakpoint="0" :custom-filter="episodeFilter" hide-default-footer
    :sort-by="[{ key: 'episode', order: 'desc' }]">
    <template v-slot:item="{ item }: { item: Episode }">
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
      <tr v-if="hideMoviesAboveEpisode && hideMoviesAboveEpisode >= item.number" class="movies-row">
        <td></td>
        <td colspan="5">
          <v-lazy>
            <div class="movies">
              <div v-for="movie in item.matchingMovies(allMovies)" :key="movie.tconst" class="movie">
                <MoviePoster :movie="movie" :episode="item"></MoviePoster>
              </div>
              <div v-if="item.matchingMovies(allMovies).length === 0">
                <br />
                <span v-if="item.title.includes('Super') && item.title.includes('Battle')">
                  Les listes spéciales ne sont pas encore supportées sur Super Ciné Marbre.
                </span>
                <span v-else>
                  Classements et timestamps manquants pour cet episode. Voir <RouterLink to="/about">A
                    propos</RouterLink> pour les contribuer !
                </span>
              </div>
            </div>
          </v-lazy>
        </td>
      </tr>
    </template>
    <template v-slot:top>
      <v-data-table-footer showFirstLastPage showCurrentPage :itemsPerPageOptions="[5, 10, 50, -1]"
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