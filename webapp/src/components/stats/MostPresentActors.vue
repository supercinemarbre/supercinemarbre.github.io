<script setup lang="ts">
import Ordinal from 'src/components/common/Ordinal.vue';
import { fetchMovies } from 'src/services/api-client';
import type { Movie } from 'src/types.d';
import { ref, computed } from 'vue';

function byRanking(a: Movie, b: Movie) {
  return a.ranking - b.ranking;
}

const minimumMovies = 5;
const allMovies = ref<Movie[]>([]);
const state = ref<'loading' | 'loaded'>('loading');

allMovies.value = await fetchMovies();
state.value = 'loaded';
  
const headers = computed(() => {
  return [
    { text: "Classement", value: "ranking", align: "center" },
    { text: "Acteur", value: "actor" },
    { text: "Nb. classés", value: "movieCount" },
    { text: "Classé", value: "movies" },
  ];
});

const items = computed(() => {
  const moviesByActor = groupMoviesByActor(); 
  let previousCount = -1, previousRanking = 1;
  return Object.entries(moviesByActor)
    .map((entry) => ({ actor: entry[0], movies: entry[1] }))
    .filter(entry => entry.movies.length >= minimumMovies)
    .sort((entry1, entry2) => {
      const movieCountDiff = entry2.movies.length - entry1.movies.length;
      const tieBreaker = entry1.movies[0].ranking - entry2.movies[0].ranking; // best ranking
      return movieCountDiff + tieBreaker * 0.0001;
    })
    .map(({ actor, movies }, index) => {
      let ranking;
      if (movies.length == previousCount) {
        ranking = previousRanking;
      } else {
        ranking = index + 1;
        previousCount = movies.length;
        previousRanking = ranking
      }
      return {
        actor,
        movies: movies.sort(byRanking),
        movieCount: movies.length,
        ranking
      }
    });
});

function groupMoviesByActor() {
  const result: Record<string, Movie[]> = {};
  allMovies.value.forEach(movie => {
    movie.actors.forEach(actor => {
      if (!result[actor]) {
        result[actor] = [];
      }
      result[actor].push(movie)
    })
  })
  return result;
}
</script>

<template>
  <div>
    <p>
      Cette liste rassemble les acteurs dont au moins <b>{{ minimumMovies }}</b> films ont été classés, toutes décennies confondues.<br />
      Ne sont considérés que les films où l'acteur est parmi les têtes d'affiches.<br />
      Ses films sont triés du meilleur au moins bien classé (à prendre avec des pincettes hein, on compare des pommes à des oranges !).
    </p>

    <!-- eslint-disable vue/valid-v-slot -->
    <v-data-table
      :items="items"
      :headers="headers"
      disable-pagination
      hide-default-footer>
      <template v-slot:item.ranking="{ item }">
        <span class="ranking">{{ item.ranking }}</span>
      </template>
      <template v-slot:item.actor="{ item }">
        <span class="actor">{{ item.actor }}</span>
      </template>
      <template v-slot:item.movieCount="{ item }">
        <span class="movie-count">{{ item.movieCount }}</span>
      </template>
      <template v-slot:item.movies="{ item }">
        <div class="movies">
          <div class="movie" v-for="movie in item.movies" :key="'actor' + item.actor + movie.tconst">
            <router-link :to="'/' + movie.decade + '#' + movie.tconst">
              {{ movie.title }}
              <span class="movie-ranking">({{ movie.ranking }}<Ordinal :value="movie.ranking" /> des années {{ movie.decade }})</span>
            </router-link>
          </div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<style lang="scss" scoped>
p {
  margin-left: 15px;
}

.ranking {
  font-size: 200%;
  font-weight: bold;
}
@media (max-width: 600px) {
  .ranking {
    font-size: 150%;
  }
}

.actor {
  font-size: 150%;
}
@media (max-width: 600px) {
  .actor {
    font-size: 120%;
  }
}

.movie-count {
  font-size: 150%;
}
@media (max-width: 600px) {
  .movie-count {
    font-size: 120%;
  }
}

.movies {
  display: flex;
  flex-direction: column;
  padding: 5px 0;
  overflow: hidden;
}
@media (max-width: 800px) {
  .movie {
    display: none;
  }
  .movie:first-child {
    display: block;
  }
}

.movie {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 85%;
  padding: 1px 5px;
}
.movie-ranking {
  color: #BBBBBB;
  margin-left: 5px;
}
@media (max-width: 800px) {
  .movie-ranking {
    display: block;
  }
}
@media (max-width: 300px) {
.movie {
    max-width: 150px;
    overflow: hidden;
  }
}

</style>