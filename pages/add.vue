<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user } = useAuth()
const { notify } = useNotifications()
const submitting = ref(false)
const initialValue = {
  title: '', description: '', image: '', cooking_time: 30, difficulty: 'medium', category: 'dinner', servings: 2,
  instructions: '', ingredients: [{ name: '', quantity: '', unit: '' }]
}

async function submitRecipe(form: typeof initialValue) {
  submitting.value = true
  try {
    const result = await $fetch<{ recipeId: string | number }>('/api/recipes', { method: 'POST', body: form })
    notify('The recipe was published successfully.', 'success')
    await navigateTo(`/recipe/${result.recipeId}`)
  } catch (error: any) {
    notify(error.data?.message || 'The recipe could not be published.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-shell max-w-5xl">
    <div class="mb-10 text-center"><p class="eyebrow">Contribute to the collection</p><h1 class="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Publish a new recipe</h1><p class="mx-auto mt-4 max-w-2xl text-slate-500">The recipe will be published on <strong class="text-slate-300">{{ user?.username }}</strong>'s profile.</p></div>
    <RecipeForm :initial-value="initialValue" :busy="submitting" submit-label="Publish recipe" @submit="submitRecipe" />
  </div>
</template>
