<script setup lang="ts">
import router from 'src/config/router'
import { fetchEpisodes } from 'src/Movies/infra/episodes.client'
import { fetchMovies } from 'src/Movies/infra/movies.client'
import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { isMobileMode } from '../../shared/ui/logic/responsive'
import { whenPresent } from '../../shared/ui/logic/when-present'
import { type Episode } from '../model/episode.model'
import { matchDecade, sortByRanking, sortByYear } from '../model/movie-list'
import type { Movie } from '../model/movie.model'
import MovieFilters from './organisms/MovieFilters.vue'
import MovieListDesktop from './organisms/MovieListDesktop.vue'
import MovieListMobile from './organisms/MovieListMobile.vue'

const props = defineProps({
  decade: String
})

const state = ref('loading' as 'loading' | 'loaded')
const searchInput = ref('')
const itemsPerPage = computed(() => props.decade ? -1 : 5)
const allMovies: Ref<Movie[]> = ref([])
const episodes = ref<Episode[]>([])
const spoilerFreeFromEpisode = ref(false as false | number)

const decadeTitle = computed(() => props.decade ? `La liste ultime des années ${props.decade}` : '')
const movies = computed(() => {
  const visibleMovies = allMovies.value
    .filter(movie => !spoilerFreeFromEpisode.value || movie.id.episode <= spoilerFreeFromEpisode.value)
  if (props.decade) {
    return visibleMovies.filter(matchDecade(props.decade)).sort(sortByRanking)
  } else {
    return visibleMovies.sort(sortByYear)
  }
})

const filteredMovies = computed(() => movies.value.filter(
  m => m.matches(searchInput.value)))

onMounted(async () => {
  ;[allMovies.value, episodes.value] = await Promise.all([
    fetchMovies(),
    fetchEpisodes()
  ])
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
