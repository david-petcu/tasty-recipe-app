<script setup lang="ts">
import { useFetch } from '#app'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const emptyFilters = () => ({ search: '', category: 'all', difficulty: 'all', maxTime: '', servings: '', chefId: '', ingredientId: '', sort: 'newest' })
const filters = ref(emptyFilters())
const page = ref(1)
const debouncedSearch = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(() => filters.value.search, (value: string) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value
    page.value = 1
  }, 300)
})
watch(() => [filters.value.category, filters.value.difficulty, filters.value.maxTime, filters.value.servings, filters.value.chefId, filters.value.ingredientId, filters.value.sort], () => { page.value = 1 })
onBeforeUnmount(() => clearTimeout(searchTimer))

const queryParams = computed(() => ({ ...filters.value, search: debouncedSearch.value, page: page.value, pageSize: 9 }))
const { data: recipeResponse, pending, error } = await useFetch('/api/recipes', { query: queryParams, watch: [queryParams] })
const recipes = computed(() => recipeResponse.value?.items || [])
const { data: chefs } = await useFetch('/api/chefs')
const { data: ingredients } = await useFetch('/api/ingredients')
const difficultyLabel: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Advanced' }
const categoryLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', dessert: 'Dessert' }

function resetFilters() {
  filters.value = emptyFilters()
  debouncedSearch.value = ''
  page.value = 1
}

function changePage(nextPage: number) {
  page.value = nextPage
  document.querySelector('#recipes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="page-shell page-section">
    <section class="grid gap-8 border-b border-slate-800 pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
      <div class="max-w-3xl">
        <p class="eyebrow flex items-center gap-2"><UiIcon name="sparkle" :size="14" />Recipes for real life</p>
        <h1 class="page-title max-w-2xl sm:text-5xl">Find something worth cooking.</h1>
        <p class="page-description">Thoughtful recipes from passionate chefs, with clear steps and everyday ingredients.</p>
      </div>
      <NuxtLink to="/add" class="button-primary w-fit"><UiIcon name="plus" :size="17" />Publish a recipe</NuxtLink>
    </section>

    <section id="recipes" class="scroll-mt-24 pt-9">
      <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 class="text-2xl font-semibold text-stone-100">Browse recipes</h2><p class="mt-1 text-sm text-slate-400">Search by title or ingredient, then narrow the results.</p></div>
        <p class="text-sm text-slate-400" aria-live="polite"><strong class="font-semibold text-stone-200">{{ recipeResponse?.total || 0 }}</strong> recipes</p>
      </div>

      <div class="panel mb-8 p-4 sm:p-5">
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label class="relative md:col-span-2"><span class="sr-only">Search recipes</span><UiIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-3.5 text-slate-500" /><input v-model="filters.search" class="field pl-11" placeholder="Search by title or ingredient" /></label>
          <label><span class="sr-only">Category</span><select v-model="filters.category" class="field"><option value="all">All categories</option><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="dessert">Dessert</option></select></label>
          <label><span class="sr-only">Sort recipes</span><select v-model="filters.sort" class="field"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="time-asc">Shortest time</option><option value="time-desc">Longest time</option><option value="difficulty">Difficulty</option></select></label>
          <label><span class="sr-only">Difficulty</span><select v-model="filters.difficulty" class="field"><option value="all">Any difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Advanced</option></select></label>
          <label><span class="sr-only">Maximum time</span><input v-model="filters.maxTime" type="number" min="1" placeholder="Maximum time (min)" class="field" /></label>
          <label><span class="sr-only">Servings</span><select v-model="filters.servings" class="field"><option value="">Any servings</option><option value="1">1 serving</option><option value="2">2 servings</option><option value="4">4 servings</option><option value="6">6 servings</option><option value="8">8 servings</option></select></label>
          <label><span class="sr-only">Chef</span><select v-model="filters.chefId" class="field"><option value="">Any chef</option><option v-for="chef in chefs" :key="chef.id" :value="String(chef.id)">{{ chef.username }}</option></select></label>
          <label class="lg:col-span-2"><span class="sr-only">Ingredient</span><select v-model="filters.ingredientId" class="field"><option value="">Any ingredient</option><option v-for="ingredient in ingredients" :key="ingredient.id" :value="String(ingredient.id)">{{ ingredient.name }}</option></select></label>
          <div class="flex items-center justify-end lg:col-span-2"><button type="button" class="button-ghost" @click="resetFilters">Reset filters</button></div>
        </div>
      </div>

      <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="panel overflow-hidden"><div class="skeleton h-44 rounded-none"></div><div class="space-y-4 p-5"><div class="skeleton h-4 w-24"></div><div class="skeleton h-6 w-4/5"></div><div class="skeleton h-4 w-full"></div></div></div>
      </div>
      <div v-else-if="error" class="empty-state"><UiIcon name="warning" :size="28" class="mx-auto text-red-400" /><h3 class="mt-4 text-lg font-semibold">We could not load the recipes</h3><p class="mt-2 text-sm text-slate-400">Please try again in a few moments.</p></div>
      <div v-else-if="!recipes.length" class="empty-state"><UiIcon name="search" :size="28" class="mx-auto text-emerald-300" /><h3 class="mt-4 text-lg font-semibold">No recipes match your filters</h3><p class="mt-2 text-sm text-slate-400">Try another spelling or change the selected filters.</p><button class="button-secondary mt-6" @click="resetFilters">Reset filters</button></div>
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="r in recipes" :key="r.id" :to="`/recipe/${r.id}`" class="group relative flex min-h-72 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 transition hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950">
          <div v-if="r.image" class="h-44 overflow-hidden border-b border-slate-800"><img :src="r.image" :alt="r.title" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div>
          <div v-else class="flex h-32 items-center justify-center bg-slate-900 text-slate-700"><UiIcon name="utensils" :size="34" /></div>
          <div class="flex flex-1 flex-col p-5">
            <div class="mb-4 flex items-center justify-between gap-3"><div class="flex flex-wrap gap-2"><span class="badge"><UiIcon name="gauge" :size="13" />{{ difficultyLabel[r.difficulty] || r.difficulty }}</span><span class="badge-accent">{{ categoryLabel[r.category] || r.category }}</span></div><span class="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-400"><UiIcon name="clock" :size="15" />{{ r.cooking_time }} min</span></div>
            <h3 class="text-lg font-semibold leading-snug text-stone-100 transition group-hover:text-emerald-200">{{ r.title }}</h3>
            <p class="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{{ r.description || 'A recipe worth trying and sharing with the people you love.' }}</p>
            <div class="mt-auto flex items-center justify-between gap-3 border-t border-slate-800 pt-4"><span class="flex items-center gap-2 text-sm text-slate-400"><UiIcon name="chef" :size="16" />{{ r.chefs?.username || 'Unknown author' }}</span><span v-if="r.reviewCount" class="flex items-center gap-1 text-sm font-semibold text-amber-300"><UiIcon name="star" :size="14" filled />{{ r.averageRating.toFixed(1) }} <span class="font-normal text-slate-500">({{ r.reviewCount }})</span></span></div>
          </div>
        </NuxtLink>
      </div>

      <nav v-if="recipeResponse && recipeResponse.totalPages > 1" class="mt-10 flex items-center justify-center gap-3" aria-label="Recipe pages">
        <button type="button" class="button-secondary px-4 py-2.5" :disabled="page === 1" @click="changePage(page - 1)">Previous</button>
        <span class="px-2 text-sm text-slate-300" aria-live="polite">Page {{ page }} of {{ recipeResponse.totalPages }}</span>
        <button type="button" class="button-secondary px-4 py-2.5" :disabled="page === recipeResponse.totalPages" @click="changePage(page + 1)">Next</button>
      </nav>
    </section>
  </div>
</template>
