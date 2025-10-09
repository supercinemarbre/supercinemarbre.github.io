import router from 'src/config/router'
import type { Movie } from 'src/movies/_model/movie.model'

export function rowPropsHighlightingCurrentMovie({ item: movie }: { item: Movie }) {
  const highlightMovie = router.currentRoute.value.hash?.slice(1) || -1
  const highlight = highlightMovie === movie.tconst
  return highlight ? { class: 'highlight' } : {}
}
