<template>
  <div>
    <h1>Liste des épisodes</h1>

    <v-card style="margin-bottom: 15px">
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Recherche"
          single-line
          hide-details
          placeholder="Chercher un épisode"
        ></v-text-field>
      </v-card-title>
    </v-card>

    <v-data-table
      :loading="state === 'loading'"
      :search="search"
      :headers="[
          { text: 'Ep.' },
          { text: 'Décennie', class: 'decade' },
          { text: 'Titre', value: 'searchString' },
          { text: 'MP3' }
        ]"
      :items="episodes"
      :mobile-breakpoint="0">
      <template v-slot:item="{ item }">
        <tr>
          <td class="number">{{ item.number }}</td>
          <td class="decade">{{ item.decade }}</td>
          <td class="episode-title">
            <a :href="item.url">{{ item.title }}</a>
          </td>
          <td class="download">
            <a :href="item.mp3url"><v-icon>mdi-download</v-icon></a>
          </td>
        </tr>
        <tr class="movies-row">
          <td></td>
          <td colspan="3">
            <v-lazy>
              <div class="movies">
                <MoviePoster
                  v-for="movie in episodeMovies(item.number)"
                  :key="movie.tconst"
                  :movie="movie"
                ></MoviePoster>
              </div>
            </v-lazy>
          </td>
        </tr>
      </template>
      <template v-slot:top="{ pagination, options, updateOptions }">
        <v-data-footer 
          :pagination="pagination" 
          :options="options"
          @update:options="updateOptions"
          showFirstLastPage
          showCurrentPage
          items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
      </template>
    </v-data-table>
  </div>
</template>

<script src="./Episodes.ts" lang="ts"></script>

<style lang="scss" scoped>
@media (max-width: 990px) {
  h1 {
    font-size: 130%;
    text-align: center;
    margin: 5px 5px 10px 5px !important;
  }
}

::v-deep .number {
  font-size: 150% !important;
}

@media (max-width: 300px) {
  ::v-deep .decade {
    display: none;
  }
}

::v-deep .episode-title {
  font-size: 120% !important;
  font-weight: 700;
}
@media (max-width: 991px) {
  ::v-deep .episode-title {
    font-size: 90% !important;
    font-weight: normal;
  }
}

::v-deep .movies {
  margin-top: 5px;
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
@media (max-width: 600px) {
  ::v-deep .movies-row {
    display: none;
  }
}
</style>
