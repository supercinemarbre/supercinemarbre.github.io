<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { isMobileMode } from '../../shared/_ui/logic/responsive'
import MovieFilters from './organisms/MovieFilters.vue'
import MovieListDesktop from './organisms/MovieListDesktop.vue'
import MovieListMobile from './organisms/MovieListMobile.vue'
import router from 'src/config/router'
import { fetchEpisodes } from 'src/movies/_infra/episodes.client'
import { fetchMovies } from 'src/movies/_infra/movies.client'
import { whenPresent } from '../../shared/_ui/logic/when-present'
import type { EpisodeByNumber } from '../_model/episode.model'
import type { Movie } from '../_model/movie.model'

const props = defineProps({
  decade: String
})

const state = ref('loading' as 'loading' | 'loaded')
const searchInput = ref('')
const itemsPerPage = computed(() => props.decade ? -1 : 5)
const allMovies: Ref<Movie[]> = ref([])
const episodes: Ref<EpisodeByNumber> = ref({})
const spoilerFreeFromEpisode = ref(false as false | number)

const decadeTitle = computed(() => props.decade ? `La liste ultime des années ${props.decade}` : '')
const movies = computed(() => {
  const visibleMovies = allMovies.value
    .filter(movie => !spoilerFreeFromEpisode.value || movie.id.episode <= spoilerFreeFromEpisode.value)
  if (props.decade) {
    return visibleMovies.filter(movie => movie.decade === props.decade)
      .sort((a, b) => a.ranking - b.ranking)
  } else {
    return visibleMovies.sort((a, b) => (b.year || 0) - (a.year || 0))
  }
})
const filteredMovies = computed(() => {
  return movies.value.filter(m => m.searchString.includes(searchInput.value.toLowerCase()))
})

onMounted(async () => {
  ;[allMovies.value, episodes.value] = await Promise.all([
    fetchMovies(),
    fetchEpisodes()
  ])
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
  state.value = 'loaded'

  if (router.currentRoute.value.hash && document.querySelector) {
    const target = await whenPresent(`[name=${router.currentRoute.value.hash.slice(1)}]`)
    target.scrollIntoView({ block: 'center' })
  } else {
    window.scrollTo(0, 0)
  }
})
</script>

<template>
  <h1>
    <span v-if="state !== 'loading'">
      <span v-if="decadeTitle">{{ decadeTitle }}</span>
      <span v-if="!decadeTitle">Tous les films classés du <a href="http://supercinebattle.fr/">Super Ciné
          Battle</a></span>
    </span>
  </h1>

  <MovieFilters :episodes="episodes" @search="searchInput = $event"
    @hide-movies-above-episode="spoilerFreeFromEpisode = $event"></MovieFilters>

  <MovieListDesktop v-if="!isMobileMode" :movies="filteredMovies" :episodes="episodes" :currentDecade="props.decade"
    :state="state" :search="searchInput" :sortBy="decade ? [] : [{ key: 'episode', order: 'desc' }]"
    :itemsPerPage="itemsPerPage"></MovieListDesktop>
  <MovieListMobile v-if="isMobileMode" :movies="filteredMovies" :episodes="episodes" :currentDecade="props.decade"
    :state="state" :search="searchInput" :sortBy="decade ? [] : [{ key: 'episode', order: 'desc' }]"
    :itemsPerPage="itemsPerPage"></MovieListMobile>
</template>
