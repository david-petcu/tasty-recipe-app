<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; size?: number | string; strokeWidth?: number | string; filled?: boolean }>(), { size: 20, strokeWidth: 1.8, filled: false })

const paths: Record<string, string[]> = {
  logo: ['M4 3v7a4 4 0 0 0 8 0V3', 'M8 3v7', 'M8 14v7', 'M18 3v18', 'M15 3c3 2 3 7 3 10h-3'],
  home: ['M3 11.5 12 4l9 7.5', 'M5 10v10h14V10', 'M9 20v-6h6v6'], users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  plus: ['M12 5v14', 'M5 12h14'], arrow: ['M5 12h14', 'm13 6 6 6-6 6'], clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20', 'M12 6v6l4 2'],
  gauge: ['M20.38 8.57a9 9 0 1 1-16.76 0', 'M12 12l4-4'], chef: ['M6 14a4 4 0 0 1 .5-7.97A5.5 5.5 0 0 1 17.5 6 4 4 0 0 1 18 14', 'M6 14h12v7H6z', 'M9 17v4', 'M15 17v4'],
  pin: ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6'], star: ['m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z'],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'], utensils: ['M3 2v7a3 3 0 0 0 3 3V2', 'M6 12v10', 'M9 2v7a3 3 0 0 1-3 3', 'M18 2v20', 'M18 2c-3 2-3 7-3 10h3'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 15H6L5 6', 'M10 11v6', 'M14 11v6'], servings: ['M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'], check: ['m5 12 4 4L19 6'], mail: ['M4 4h16v16H4z', 'm4 7 8 6 8-6'], lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  image: ['M3 3h18v18H3z', 'm3 16 5-5 4 4 3-3 6 6', 'M14.5 8.5h.01'], close: ['M18 6 6 18', 'm6 6 12 12'], search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16', 'm21 21-4.35-4.35'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'],
  'eye-off': ['m3 3 18 18', 'M10.6 10.6a2 2 0 0 0 2.8 2.8', 'M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.1', 'M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 8 10 8a10.6 10.6 0 0 0 5.4-1.5'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z'],
  sparkle: ['m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z', 'm19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z'], warning: ['M12 9v4', 'M12 17h.01', 'M10.3 3.6 2 18h20L13.7 3.6a2 2 0 0 0-3.4 0z']
}
</script>

<template><svg :width="props.size" :height="props.size" viewBox="0 0 24 24" :fill="props.filled ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="props.strokeWidth" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0"><path v-for="path in paths[props.name] || paths.sparkle" :key="path" :d="path" /></svg></template>
