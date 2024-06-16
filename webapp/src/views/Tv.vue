<template>
  <div v-if="!error">
    <h2>Programme TV du {{ fromDate | date }} au {{ toDate | date }}</h2>

    <div v-for="broadcastsDay in broadcastsByDay" :key="broadcastsDay.day">
      <h3>{{ broadcastsDay.day | date }}</h3>
      
      <v-row class="movie-list" no-gutter>
        <v-col v-for="broadcastMovie in broadcastsDay.broadcastMovies" :key="broadcastMovie.id"
          class="d-flex" cols="12" sm="6" md="4" lg="3">
          <v-row align="center">
            <MoviePoster :movie="broadcastMovie.movie" :episode="broadcastMovie.episode" :hideTimestamp="true" />
            <div>
              <div>sur {{ broadcastMovie.broadcast.channel }}</div>
              <div>à {{ broadcastMovie.broadcast.date | time }}</div>
              <div class="movie-details">{{ broadcastMovie.movie.ranking | ordinal }} des années {{ broadcastMovie.movie.decade }}</div>
            </div>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </div>
  <div v-else>
    Error: {{ error }}
  </div>
</template>

<script src="./Tv.ts" lang="ts"></script>

<style lang="scss" scoped>
.movie-list {
  padding: 0 20px;
}

h2 {
  margin-bottom: 20px;
}

h3 {
  font-size: 30px;
}

.movie-details {
  color: #888;
}
</style>
