<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>

<template>
  <span>{{ value === 1 ? 'er' : 'e' }}</span>
</template>

<style lang="scss" scoped>
span {
  font-size: 70%;
}
</style>