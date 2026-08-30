<script setup lang="ts">
const emptyFilters = () => ({ search: '', category: 'all', difficulty: 'all', maxTime: '', servings: '', chefId: '', ingredientId: '', sort: 'newest' })
const filters = ref(emptyFilters())
const page = ref(1)
const debouncedSearch = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(() => filters.value.search, (value) => {
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
  <div>
    <section class="page-shell">
      <div class="rounded-2xl border border-slate-200 bg-white px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
        <div class="relative max-w-3xl">
          <p class="eyebrow mb-5 flex items-center gap-2"><UiIcon name="sparkle" :size="16" />Cook with inspiration</p>
          <h1 class="text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-6xl">Great recipes for meals that matter.</h1>
          <p class="mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">Discover tried-and-tested ideas, simple ingredients, and passionate chefs. Your next favorite recipe is closer than you think.</p>
          <div class="mt-9 flex flex-wrap gap-3">
            <a href="#recipes" class="button-primary">Explore recipes<UiIcon name="arrow" :size="18" /></a>
            <NuxtLink to="/add" class="button-secondary"><UiIcon name="plus" :size="18" />Publish a recipe</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section id="recipes" class="page-shell scroll-mt-28 pt-16">
      <div class="mb-8"><p class="eyebrow">Our collection</p><h2 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">What are we cooking today?</h2><p class="mt-2 text-slate-500">Search, filter, and sort the collection to find the right recipe.</p></div>

      <div class="panel mb-8 p-4 sm:p-6">
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label class="relative md:col-span-2"><span class="sr-only">Search recipes</span><UiIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-3.5 text-slate-500" /><input v-model="filters.search" class="field pl-11" placeholder="Search by title or ingredient" /></label>
          <label><span class="sr-only">Category</span><select v-model="filters.category" class="field"><option value="all">All categories</option><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="dessert">Dessert</option></select></label>
          <label><span class="sr-only">Sort recipes</span><select v-model="filters.sort" class="field"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="time-asc">Shortest time</option><option value="time-desc">Longest time</option><option value="difficulty">Difficulty</option></select></label>
          <label><span class="sr-only">Difficulty</span><select v-model="filters.difficulty" class="field"><option value="all">Any difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Advanced</option></select></label>
          <label><span class="sr-only">Maximum time</span><input v-model="filters.maxTime" type="number" min="1" placeholder="Maximum time (min)" class="field" /></label>
          <label><span class="sr-only">Servings</span><select v-model="filters.servings" class="field"><option value="">Any servings</option><option value="1">1 serving</option><option value="2">2 servings</option><option value="4">4 servings</option><option value="6">6 servings</option><option value="8">8 servings</option></select></label>
          <label><span class="sr-only">Chef</span><select v-model="filters.chefId" class="field"><option value="">Any chef</option><option v-for="chef in chefs" :key="chef.id" :value="String(chef.id)">{{ chef.username }}</option></select></label>
          <label class="lg:col-span-2"><span class="sr-only">Ingredient</span><select v-model="filters.ingredientId" class="field"><option value="">Any ingredient</option><option v-for="ingredient in ingredients" :key="ingredient.id" :value="String(ingredient.id)">{{ ingredient.name }}</option></select></label>
          <div class="flex items-center justify-between gap-4 lg:col-span-2"><p class="text-sm text-slate-400"><strong class="text-slate-200">{{ recipeResponse?.total || 0 }}</strong> recipes found</p><button type="button" class="button-secondary py-2.5" @click="resetFilters">Reset filters</button></div>
        </div>
      </div>

      <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-72 animate-pulse rounded-3xl border border-stone-200 bg-white"><div class="h-2 rounded-t-3xl bg-stone-100"></div><div class="space-y-4 p-7"><div class="h-4 w-24 rounded bg-stone-100"></div><div class="h-7 w-4/5 rounded bg-stone-100"></div><div class="h-4 w-full rounded bg-stone-100"></div></div></div>
      </div>
      <div v-else-if="error" class="panel flex flex-col items-center px-6 py-16 text-center"><span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"><UiIcon name="warning" :size="26" /></span><h3 class="mt-5 text-xl font-bold text-slate-900">We could not load the recipes</h3><p class="mt-2 text-slate-500">Please try again in a few moments.</p></div>
      <div v-else-if="!recipes.length" class="panel flex flex-col items-center px-6 py-16 text-center"><span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><UiIcon name="search" :size="26" /></span><h3 class="mt-5 text-xl font-bold text-slate-900">No recipes match your filters</h3><p class="mt-2 text-slate-400">Try another spelling or change the selected filters.</p><button class="button-secondary mt-6" @click="resetFilters">Reset filters</button></div>
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="r in recipes" :key="r.id" :to="`/recipe/${r.id}`" class="group relative flex min-h-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950">
          <div v-if="r.image" class="h-44 overflow-hidden border-b border-slate-800"><img :src="r.image" :alt="r.title" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div>
          <div v-else class="h-1 bg-emerald-700"></div>
          <div class="flex flex-1 flex-col p-7">
            <div class="mb-5 flex items-center justify-between gap-3"><div class="flex flex-wrap gap-2"><span class="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-slate-600"><UiIcon name="gauge" :size="14" />{{ difficultyLabel[r.difficulty] || r.difficulty }}</span><span class="rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-300">{{ categoryLabel[r.category] || r.category }}</span></div><span class="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500"><UiIcon name="clock" :size="16" />{{ r.cooking_time }} min</span></div>
            <h3 class="text-xl font-extrabold leading-snug text-slate-900 transition group-hover:text-emerald-800">{{ r.title }}</h3>
            <p class="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{{ r.description || 'A recipe worth trying and sharing with the people you love.' }}</p>
            <div class="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-5"><span class="flex items-center gap-2 text-sm text-slate-400"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><UiIcon name="chef" :size="16" /></span>{{ r.chefs?.username || 'Unknown author' }}</span><span v-if="r.reviewCount" class="flex items-center gap-1 text-sm font-bold text-amber-300"><UiIcon name="star" :size="15" filled />{{ r.averageRating.toFixed(1) }} <span class="font-medium text-slate-400">({{ r.reviewCount }})</span></span></div>
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
