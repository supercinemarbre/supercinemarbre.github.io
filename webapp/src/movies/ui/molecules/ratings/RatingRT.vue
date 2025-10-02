<script setup lang="ts">
import { computed } from 'vue';

const { rating } = defineProps<{
  rating?: number;
}>();

const isValid = computed(() => typeof rating === 'number');

const ratingLabel = computed(() => {
  return isValid.value ? `${rating}%` : '';
});

const tomatometer = computed(() => {
  return rating && rating >= 60 ? 'fresh' : 'rotten';
});
</script>

<template>
  <span v-if="isValid">
    <img v-if="tomatometer === 'fresh'" src="/img/rt-fresh.png" />
    <img v-if="tomatometer === 'rotten'" src="/img/rt-rotten.png" />
    {{ ratingLabel }}
  </span>
</template>

<style lang="scss" scoped>
img {
  margin-top: -4px;
  margin-right: -1px;
  vertical-align: middle;
  height: 18px;
}
</style>
