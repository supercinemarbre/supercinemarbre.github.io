<template>
  <div>
    <p>
      Cette liste rassemble les acteurs dont au moins <b>{{ minimumMovies }}</b> films ont été classés, toutes décennies confondues.<br />
      Ne sont considérés que les films où l'acteur est parmi les têtes d'affiches.<br />
      Ses films sont triés du meilleur au moins bien classé (à prendre avec des pincettes hein, on compare des pommes à des oranges !).
    </p>
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
          <div class="movie" v-for="movie in item.movies" :key="item.actor + movie.tconst">
            <router-link :to="'/' + movie.decade + '#' + movie.tconst">
              {{ movie.scbTitle }}
              <span class="movie-ranking">({{ movie.ranking }}<Ordinal :value="movie.ranking" /> des années {{ movie.decade }})</span>
            </router-link>
          </div>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script src="./MostPresentActors.ts" lang="ts"></script>

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