<script setup lang="ts">
import { debounce } from 'lodash-es';
import { onMounted, ref, watch } from 'vue';
import type { EpisodeMap } from '../../services/api-client';
import { getMaxEpisode } from '../../services/utils';
import  type { SpoilerFreeSettings } from './SpoilerFree.settings';
import { loadSettingsFromStorage, saveSettingsToStorage, isValidSettings } from './SpoilerFree.settings';

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
    return maxEpisode.value;
  }
}

onMounted(() => {
  settings.value = loadSettingsFromStorage(props.episodes, settings.value);
});
</script>

<template>
  <div class="spoiler-free">
    <v-switch
      v-model="settings.enabled"
      label="Mode sans spoilers"
      style="margin-right: 10px"
    ></v-switch>
    <v-text-field
      v-if="settings.enabled"
      v-model="settings.lastWatched"
      label="Dernier ép. vu"
      :suffix="'sur ' + maxEpisode"
      outlined
      style="width: 190px"
    ></v-text-field>
  </div>
</template>

<style lang="scss" scoped>
.spoiler-free {
  width: 100%;
  margin-bottom: -30px;

  > div {
    display: inline-block;
  }
}
</style>