<script setup lang="ts">
import router from 'src/config/router';
import { isMobileMode } from 'src/shared/ui/logic/reactivity/responsive';
import { watchDebounced } from 'src/shared/ui/logic/reactivity/watch-debounced';
import type { Episode } from 'src/types.d';
import { computed, ref } from 'vue';
import type { SpoilerFreeSettings } from '../../spoiler-free/infra/spoiler-free.store';
import type { EpisodeMap } from 'src/episodes/infra/episodes.client';
import { getMaxEpisode } from 'src/episodes/model/episode.model';
import SpoilerFree from '../../spoiler-free/ui/SpoilerFree.vue';

const props = defineProps<{
    episodeMap: EpisodeMap
}>();

const emit = defineEmits<{
    (event: 'hideMoviesAboveEpisode', value: false | number): void;
    (event: 'search', value: string): void;
}>();

const searchInput = ref(router.currentRoute.value.query.search?.toString() || '')
const episodes = computed<Episode[]>(() => {
    return Object.values(props.episodeMap)
        .map(episode => {
            episode.searchString = toSearchString(episode.title);
            return episode;
        });
});

function toSearchString(value: string) {
    return value ? value.replace(/[^a-zA-Z]/g, '').toLowerCase() : ''; // fixme ternary
}

function onSpoilerFreeSettingsChange(settings: SpoilerFreeSettings) {
    emit('hideMoviesAboveEpisode', settings.enabled ? settings.lastWatched : getMaxEpisode(props.episodeMap));
}

emit('search', searchInput.value);
watchDebounced(searchInput, value => emit('search', value), 300);
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