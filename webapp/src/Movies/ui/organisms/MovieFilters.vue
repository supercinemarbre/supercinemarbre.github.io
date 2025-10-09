<script setup lang="ts">
import router from 'src/config/router'
import { type Episode, type EpisodeByNumber } from 'src/Movies/model/episode.model'
import type { SpoilerFreeSettings } from 'src/Movies/SpoilerFree/model/spoiler-free.model'
import SpoilerFree from 'src/Movies/SpoilerFree/ui/SpoilerFree.vue'
import { isMobileMode } from 'src/shared/ui/logic/responsive'
import { watchDebounced } from 'src/shared/ui/logic/watch-debounced'
import { computed, ref } from 'vue'

const props = defineProps<{
    episodes: EpisodeByNumber
}>()

const emit = defineEmits<{
    (event: 'hideMoviesAboveEpisode', value: false | number): void;
    (event: 'search', value: string): void;
}>()

export type Searchable<T> = T & {
    searchString?: string;
}

const searchInput = ref(router.currentRoute.value.query.search?.toString() || '')
const episodes = computed<Episode[]>(() => Object.values(props.episodes))

function onSpoilerFreeSettingsChange(settings: SpoilerFreeSettings) {
    emit('hideMoviesAboveEpisode', settings.lastWatched)
}

emit('search', searchInput.value)
watchDebounced(searchInput, value => emit('search', value), 300)
</script>

<template>
    <v-container fluid style="margin-bottom: 15px">
        <v-row>
            <v-col cols="12" md="4" class="align-bottom">
                <SpoilerFree v-if="episodes.length" :episodes="episodes" @onChange="onSpoilerFreeSettingsChange">
                </SpoilerFree>
            </v-col>
            <v-spacer />
            <v-col cols="12" md="7" class="align-bottom">
                <v-text-field v-model="searchInput"
                    :placeholder="isMobileMode ? 'Rechercher...' : 'Rechercher un film, réalisateur, acteur...'"
                    prepend-inner-icon="mdi-movie-search" :append-inner-icon="searchInput ? 'mdi-close' : ''"
                    @click:append-inner="searchInput = ''" hide-details>
                </v-text-field>
            </v-col>
        </v-row>
    </v-container>

</template>

<style lang="scss" scoped>
.align-bottom {
    display: flex;
    align-items: flex-end;
}
</style>