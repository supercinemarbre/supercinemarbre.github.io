<script setup lang="ts">
import { debounce } from 'lodash-es'
import { Episode, getMaxEpisode } from 'src/Movies/model/episode.model'
import { computed, onMounted, ref, watch } from 'vue'
import { loadSpoilerFreeState, saveSpoilerFreeState } from '../infra/spoiler-free.store'
import { SpoilerFreeSettings } from '../model/spoiler-free.model'

const props = defineProps<{
  episodes: Episode[];
}>()

const emit = defineEmits<{
  (event: 'onChange', settings: SpoilerFreeSettings): void;
}>()

const maxEpisode = getMaxEpisode(props.episodes)
const enabled = ref(true)
const lastWatched = ref(maxEpisode)
const settings = computed(() => new SpoilerFreeSettings({ enabled: enabled.value, lastWatched: lastWatched.value, episodes: props.episodes }))

const debouncedNotifySettingsChange = debounce(() => {
  saveSpoilerFreeState(settings.value)
  emit('onChange', settings.value)
}, 300)

watch([enabled, lastWatched],
  () => debouncedNotifySettingsChange(),
  { deep: true }
)

onMounted(() => {
  const state = loadSpoilerFreeState(props.episodes, settings.value)
  enabled.value = state.enabled
  lastWatched.value = state.lastWatched
})

defineExpose({
  settings
})
</script>

<template>
  <div class="spoiler-free">
    <v-switch v-model="enabled" color="indigo" description="pouet" hide-details>
      <template #label>
        <div class="spoiler-free__label">
          <span>Mode sans spoilers</span>
          <span class="text-caption hidden-xs">Masque les films des épisodes non vus.</span>
        </div>
      </template>
    </v-switch>
    <v-text-field v-if="enabled" v-model="lastWatched" label="Dernier ép. vu"
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