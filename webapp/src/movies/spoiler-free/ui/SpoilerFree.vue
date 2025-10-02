<script setup lang="ts">
import { debounce } from 'lodash-es';
import { onMounted, ref, watch } from 'vue';
import type { SpoilerFreeSettings } from '../infra/spoiler-free.store';
import { loadSettingsFromStorage, saveSettingsToStorage, isValidSettings } from '../infra/spoiler-free.store';
import { getMaxEpisode } from 'src/movies/model/episode.model';
import type { EpisodeMap } from 'src/movies/infra/episodes.client';

const props = defineProps<{
  episodes: EpisodeMap;
}>();

const emit = defineEmits<{
  (event: 'onChange', settings: SpoilerFreeSettings): void;
}>();

const maxEpisode = getMaxEpisode(props.episodes);
const settings = ref<SpoilerFreeSettings>({
  enabled: true,
  lastWatched: maxEpisode,
});

const debouncedNotifySettingsChange = debounce(() => {
  saveSettingsToStorage(settings.value);
  emit('onChange', settings.value);
}, 300);

watch(
  () => props.episodes,
  () => {
    if (!isValidSettings(settings.value)) {
      settings.value = loadSettingsFromStorage(props.episodes, settings.value);
    }
  },
  { immediate: true }
);

watch(() => settings.value,
  () => {
    debouncedNotifySettingsChange();
  },
  { deep: true }
);

defineExpose({
  isEnabled,
  getLastWatchedEpisode,
});

function isEnabled() {
  return settings.value.enabled;
}

function getLastWatchedEpisode() {
  if (settings.value.enabled) {
    return settings.value.lastWatched;
  } else {
    return maxEpisode;
  }
}

onMounted(() => {
  settings.value = loadSettingsFromStorage(props.episodes, settings.value);
});
</script>

<template>
  <div class="spoiler-free">
    <v-switch v-model="settings.enabled" color="indigo" description="pouet" hide-details>
      <template #label>
        <div class="spoiler-free__label">
          <span>Mode sans spoilers</span>
          <span class="text-caption hidden-xs">Masque les films des épisodes non vus.</span>
        </div>
      </template>
    </v-switch>
    <v-text-field v-if="settings.enabled" v-model="settings.lastWatched" label="Dernier ép. vu"
      :suffix="'sur ' + maxEpisode" outlined hide-details class="lastwatched-input"></v-text-field>
  </div>
</template>

<style lang="scss" scoped>
.spoiler-free {
  display: flex;
  column-gap: 20px;

  &__label {
    display: flex;
    flex-direction: column;
  }
}

.lastwatched-input {
  min-width: 120px;
  max-width: 250px;
}

@media screen and (max-width: 1024px) {
  .spoiler-free {
    flex-direction: column;
  }
}
</style>