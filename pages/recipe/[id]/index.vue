<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const id = route.params.id
const { notify } = useNotifications()
const deleteModalOpen = ref(false)
const deleting = ref(false)
const { data: recipe, error, pending } = await useFetch(`/api/recipes/${id}`)
const { user, fetchMe } = useAuth()
if (user.value === undefined) await fetchMe()
const { data: favoriteState } = await useFetch(`/api/favorites/${id}`)
const isSaved = ref(Boolean(favoriteState.value?.saved))
const savingFavorite = ref(false)
const canManage = computed(() => user.value && recipe.value && String(user.value.id) === String(recipe.value.chefs?.id))
const reviewPage = ref(1)
const reviewSaving = ref(false)
const reviewDeleting = ref(false)
const reviewForm = reactive({ rating: 0, comment: '' })
const { data: reviewResponse, pending: reviewsPending, refresh: refreshReviews } = await useFetch(`/api/recipes/${id}/reviews`, { query: computed(() => ({ page: reviewPage.value })), watch: [reviewPage] })
watch(() => reviewResponse.value?.currentUserReview, (review) => {
  reviewForm.rating = review?.rating || 0
  reviewForm.comment = review?.comment || ''
}, { immediate: true })
const difficultyLabel: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Advanced' }
const categoryLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', dessert: 'Dessert' }

async function saveReview() {
  if (!user.value) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!reviewForm.rating) {
    notify('Choose a star rating first.', 'error')
    return
  }
  reviewSaving.value = true
  try {
    const wasUpdate = Boolean(reviewResponse.value?.currentUserReview)
    await $fetch(`/api/recipes/${id}/reviews`, { method: 'POST', body: reviewForm })
    reviewPage.value = 1
    await refreshReviews()
    notify(wasUpdate ? 'Your review was updated.' : 'Your review was published.', 'success')
  } catch (reviewError: any) {
    notify(reviewError.data?.message || 'Your review could not be saved.', 'error')
  } finally { reviewSaving.value = false }
}

async function deleteReview() {
  reviewDeleting.value = true
  try {
    await $fetch(`/api/recipes/${id}/reviews`, { method: 'DELETE' })
    reviewForm.rating = 0
    reviewForm.comment = ''
    await refreshReviews()
    notify('Your review was deleted.', 'success')
  } catch (reviewError: any) {
    notify(reviewError.data?.message || 'Your review could not be deleted.', 'error')
  } finally { reviewDeleting.value = false }
}
async function toggleFavorite() {
  if (!user.value) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  savingFavorite.value = true
  try {
    const method = isSaved.value ? 'DELETE' : 'POST'
    const result = await $fetch<{ saved: boolean }>(`/api/favorites/${id}`, { method })
    isSaved.value = result.saved
    notify(result.saved ? 'Recipe saved to your collection.' : 'Recipe removed from your saved collection.', 'success')
  } catch (favoriteError: any) {
    notify(favoriteError.data?.message || 'Your saved recipes could not be updated.', 'error')
  } finally { savingFavorite.value = false }
}
async function deleteRecipe() {
  deleting.value = true
  try {
    await $fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    deleteModalOpen.value = false
    notify('The recipe was deleted.', 'success')
    await router.push('/')
  } catch (deleteError: any) {
    notify(deleteError.data?.message || 'The recipe could not be deleted.', 'error')
  } finally { deleting.value = false }
}
</script>

<template>
  <div class="page-shell max-w-6xl">
    <div v-if="pending" class="space-y-6"><div class="h-72 animate-pulse rounded-[2.5rem] bg-stone-200"></div><div class="grid gap-6 lg:grid-cols-3"><div class="h-80 animate-pulse rounded-3xl bg-stone-200"></div><div class="h-80 animate-pulse rounded-3xl bg-stone-200 lg:col-span-2"></div></div></div>
    <div v-else-if="error || !recipe" class="panel flex flex-col items-center px-6 py-20 text-center"><span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600"><UiIcon name="warning" :size="28" /></span><h1 class="mt-6 text-2xl font-extrabold text-slate-900">Recipe not found</h1><p class="mt-2 text-slate-500">It may have been deleted, or the address may be incorrect.</p><NuxtLink to="/" class="button-primary mt-7">Back to recipes</NuxtLink></div>
    <article v-else>
      <header class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <img v-if="recipe.image" :src="recipe.image" :alt="recipe.title" class="h-64 w-full object-cover sm:h-80" />
        <div class="px-6 py-12 sm:px-12 sm:py-14"><div class="max-w-4xl"><div class="mb-6 flex flex-wrap items-center gap-3"><span class="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">{{ difficultyLabel[recipe.difficulty] || recipe.difficulty }}</span><span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{{ categoryLabel[recipe.category] || recipe.category }}</span><span class="flex items-center gap-2 text-sm text-slate-400"><UiIcon name="book" :size="16" />Community recipe</span><span v-if="reviewResponse?.total" class="flex items-center gap-1.5 text-sm font-bold text-amber-300"><UiIcon name="star" :size="16" filled />{{ reviewResponse.average.toFixed(1) }} · {{ reviewResponse.total }} reviews</span></div><h1 class="max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-6xl">{{ recipe.title }}</h1><p class="mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">{{ recipe.description || 'A recipe ready to be discovered and enjoyed.' }}</p><div class="mt-9 flex flex-wrap gap-3"><span class="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600"><UiIcon name="clock" :size="18" />{{ recipe.cooking_time }} minutes</span><span class="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600"><UiIcon name="servings" :size="18" />{{ recipe.servings }} servings</span><button type="button" class="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition disabled:opacity-60" :class="isSaved ? 'border-rose-800 bg-rose-950/40 text-rose-300 hover:bg-rose-950/70' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-700 hover:text-emerald-300'" :disabled="savingFavorite" @click="toggleFavorite"><UiIcon name="heart" :size="18" />{{ savingFavorite ? 'Updating...' : isSaved ? 'Saved' : 'Save recipe' }}</button></div></div></div>
      </header>

      <div class="mt-8 grid items-start gap-8 lg:grid-cols-[340px_1fr]">
        <aside class="panel overflow-hidden lg:sticky lg:top-28"><div class="border-b border-slate-100 bg-slate-50 px-6 py-5"><p class="eyebrow">Prepare your meal</p><h2 class="mt-1 text-xl font-extrabold text-slate-900">Ingredients</h2></div><ul v-if="recipe.recipe_ingredients?.length" class="divide-y divide-slate-100 px-6"><li v-for="ing in recipe.recipe_ingredients" :key="ing.id" class="flex items-center justify-between gap-4 py-4"><span class="text-sm text-slate-600">{{ ing.ingredients?.name }}</span><span class="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">{{ ing.quantity }} {{ ing.ingredients?.unit }}</span></li></ul><p v-else class="p-6 text-sm text-slate-400">No ingredients are listed.</p></aside>
        <section class="panel p-6 sm:p-9"><div class="mb-7 flex items-center gap-4 border-b border-stone-100 pb-6"><span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><UiIcon name="utensils" :size="23" /></span><div><p class="eyebrow">Step by step</p><h2 class="mt-1 text-2xl font-extrabold text-slate-900">Instructions</h2></div></div><div class="whitespace-pre-line text-base leading-8 text-slate-600">{{ recipe.instructions }}</div></section>
      </div>

      <section class="panel mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <NuxtLink v-if="recipe.chefs" :to="`/chef/${recipe.chefs.id}`" class="group flex items-center gap-4"><span class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-emerald-800"><img v-if="recipe.chefs.chef_profiles?.profile_image" :src="recipe.chefs.chef_profiles.profile_image" :alt="recipe.chefs.username" class="h-full w-full object-cover" /><UiIcon v-else name="chef" :size="29" /></span><span><span class="block text-xs font-bold uppercase tracking-wider text-slate-400">Recipe published by</span><strong class="mt-1 flex items-center gap-2 text-lg text-slate-900 transition group-hover:text-emerald-800">{{ recipe.chefs.username }}<UiIcon name="arrow" :size="17" /></strong></span></NuxtLink><div v-else class="text-sm text-slate-400">Unknown author</div>
        <div v-if="canManage" class="flex flex-wrap gap-2"><NuxtLink :to="`/recipe/${id}/edit`" class="button-secondary py-2.5"><UiIcon name="star" :size="17" />Edit recipe</NuxtLink><button class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-red-950 hover:text-red-400" @click="deleteModalOpen = true"><UiIcon name="trash" :size="17" />Delete recipe</button></div>
      </section>

      <section class="panel mt-8 p-6 sm:p-8" aria-labelledby="reviews-heading">
        <div class="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p class="eyebrow">Community feedback</p><h2 id="reviews-heading" class="mt-2 text-2xl font-extrabold text-white">Ratings and reviews</h2></div>
          <div class="flex items-center gap-2"><span class="text-3xl font-extrabold text-white">{{ reviewResponse?.average ? reviewResponse.average.toFixed(1) : '—' }}</span><span class="text-sm text-slate-400">from {{ reviewResponse?.total || 0 }} reviews</span></div>
        </div>

        <form v-if="user && !canManage" class="mt-7 rounded-2xl border border-slate-700 bg-slate-950/40 p-5" @submit.prevent="saveReview">
          <label class="field-label">Your rating</label>
          <div class="flex gap-1" role="radiogroup" aria-label="Recipe rating">
            <button v-for="star in 5" :key="star" type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:text-amber-300" :class="star <= reviewForm.rating ? 'text-amber-300' : ''" role="radio" :aria-checked="star === reviewForm.rating" :aria-label="`${star} star${star === 1 ? '' : 's'}`" @click="reviewForm.rating = star"><UiIcon name="star" :size="25" :filled="star <= reviewForm.rating" /></button>
          </div>
          <label class="field-label mt-4" for="review-comment">Review <span class="font-normal text-slate-400">(optional)</span></label>
          <textarea id="review-comment" v-model="reviewForm.comment" rows="4" maxlength="1000" class="field resize-y" placeholder="What did you enjoy or change?"></textarea>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3"><span class="text-xs text-slate-400">{{ reviewForm.comment.length }}/1000</span><div class="flex gap-2"><button v-if="reviewResponse?.currentUserReview" type="button" class="button-secondary py-2.5 text-rose-300" :disabled="reviewDeleting" @click="deleteReview">{{ reviewDeleting ? 'Deleting...' : 'Delete review' }}</button><button type="submit" class="button-primary py-2.5" :disabled="reviewSaving">{{ reviewSaving ? 'Saving...' : reviewResponse?.currentUserReview ? 'Update review' : 'Publish review' }}</button></div></div>
        </form>
        <p v-else-if="!user" class="mt-7 rounded-2xl border border-slate-700 bg-slate-950/40 p-5 text-sm text-slate-300"><NuxtLink :to="{ path: '/login', query: { redirect: route.fullPath } }" class="font-bold text-emerald-300 underline decoration-emerald-700 underline-offset-4">Sign in</NuxtLink> to rate and review this recipe.</p>

        <div v-if="reviewsPending" class="mt-7 space-y-3"><div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-slate-800"></div></div>
        <div v-else-if="reviewResponse?.items.length" class="mt-7 divide-y divide-slate-800">
          <article v-for="review in reviewResponse.items" :key="review.id" class="py-6 first:pt-0 last:pb-0">
            <div class="flex items-start gap-4"><span class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800 text-emerald-300"><img v-if="review.chefs.chef_profiles?.profile_image" :src="review.chefs.chef_profiles.profile_image" :alt="review.chefs.username" class="h-full w-full object-cover" /><UiIcon v-else name="chef" :size="21" /></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center justify-between gap-2"><strong class="text-slate-100">{{ review.chefs.username }}</strong><span class="flex gap-0.5 text-amber-300" :aria-label="`${review.rating} out of 5 stars`"><UiIcon v-for="star in 5" :key="star" name="star" :size="15" :filled="star <= review.rating" :class="star > review.rating ? 'text-slate-600' : ''" /></span></div><p v-if="review.comment" class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">{{ review.comment }}</p></div></div>
          </article>
        </div>
        <p v-else class="mt-7 text-sm text-slate-400">No reviews yet. Be the first to share your experience.</p>

        <nav v-if="reviewResponse && reviewResponse.totalPages > 1" class="mt-7 flex items-center justify-center gap-3" aria-label="Review pages"><button class="button-secondary px-4 py-2.5" type="button" :disabled="reviewPage === 1" @click="reviewPage--">Previous</button><span class="text-sm text-slate-300">{{ reviewPage }} / {{ reviewResponse.totalPages }}</span><button class="button-secondary px-4 py-2.5" type="button" :disabled="reviewPage === reviewResponse.totalPages" @click="reviewPage++">Next</button></nav>
      </section>
    </article>
    <ConfirmModal :open="deleteModalOpen" title="Delete this recipe?" message="This action permanently removes the recipe and its ingredient list. It cannot be undone." confirm-label="Delete recipe" :busy="deleting" danger @cancel="deleteModalOpen = false" @confirm="deleteRecipe" />
  </div>
</template>
