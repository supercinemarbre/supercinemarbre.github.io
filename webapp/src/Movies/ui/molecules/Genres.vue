<script setup lang="ts">
import { computed } from 'vue'

const GENRE_TRANSLATIONS = {
  Action: 'Action',
  Adventure: 'Aventure',
  Animation: 'Animation',
  Biography: 'Biographie',
  Comedy: 'Comédie',
  Crime: 'Crime',
  Documentary: 'Documentaire',
  Drama: 'Drame',
  Family: 'Familial',
  Fantasy: 'Fantasy',
  History: 'Historique',
  Horror: 'Horreur',
  Music: 'Musique',
  Musical: 'Comédie musicale',
  Mystery: 'Mystère',
  Romance: 'Romance',
  'Sci-Fi': 'Science-fiction',
  Sport: 'Sport',
  Thriller: 'Thriller',
  War: 'Guerre',
  Western: 'Western'
}

const { genres } = defineProps<{ genres?: string[] }>()

const translatedGenres = computed(() => {
  return (genres || [])
    .map(genre => GENRE_TRANSLATIONS[genre] || genre)
    .join(', ')
})
</script>

<template>
  <span>{{ translatedGenres }}</span>
</template>
