<script setup lang="ts">
import { computed } from 'vue'

const { votes = 0 } = defineProps<{
  votes?: number
}>()

const percentage = computed(() => {
  return Math.pow(votes, 0.2) * 10 - 35
})


const votesLabel = computed(() => {
  if (votes > 1000) {
    const kVotes = votes / 1000
    return `${kVotes.toFixed(0)}k votes`
  } else {
    return `${votes} votes`
  }
})
</script>

<template>
  <v-lazy>
    <div>
      <v-progress-linear
        :model-value="percentage"
        color="#BBBBBB"
        height="8"
      ></v-progress-linear>
      <div class="legend">{{ votesLabel }}</div>
    </div>
  </v-lazy>
</template>

<style lang="scss" scoped>
.legend {
  padding-top: 2px;
  color: #888888;
  font-size: 90%;
}
</style>
