<script setup lang="ts">
defineProps<{
    value: string[];
}>();
</script>

<template>
    <span v-for="(person, index) in value">
        <RouterLink :to="`/?search=${person}`">{{ person }}</RouterLink>
        <span v-if="index < value.length - 1">, </span>
    </span>
</template>

<style lang="scss" scoped>
a {
    color: inherit;

    &:hover {
        color: white;
    }
}
</style>