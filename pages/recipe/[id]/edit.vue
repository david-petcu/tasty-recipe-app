<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const id = String(route.params.id)
const { user } = useAuth()
const { notify } = useNotifications()
const submitting = ref(false)
const { data: recipe, error } = await useFetch(`/api/recipes/${id}`)

if (error.value || !recipe.value) throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
if (String(recipe.value.chefs?.id) !== String(user.value?.id)) {
  throw createError({ statusCode: 403, statusMessage: 'You can only edit your own recipes' })
}

const initialValue = {
  title: recipe.value.title,
  description: recipe.value.description || '',
  image: recipe.value.image || '',
  cooking_time: recipe.value.cooking_time,
  difficulty: recipe.value.difficulty || 'medium',
  category: recipe.value.category || 'dinner',
  servings: recipe.value.servings || 1,
  instructions: recipe.value.instructions,
  ingredients: recipe.value.recipe_ingredients?.map(item => ({
    name: item.ingredients?.name || '',
    quantity: item.quantity,
    unit: item.ingredients?.unit || ''
  })) || [{ name: '', quantity: '', unit: '' }]
}

async function updateRecipe(form: typeof initialValue) {
  submitting.value = true
  try {
    await $fetch(`/api/recipes/${id}`, { method: 'PATCH', body: form })
    notify('The recipe was updated successfully.', 'success')
    await navigateTo(`/recipe/${id}`)
  } catch (updateError: any) {
    notify(updateError.data?.message || 'The recipe could not be updated.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-shell page-section max-w-5xl">
    <div class="page-header"><p class="eyebrow">Recipe management</p><h1 class="page-title">Edit recipe</h1><p class="page-description">Update the details, ingredients, or instructions for <strong class="font-medium text-slate-300">{{ recipe?.title }}</strong>.</p></div>
    <RecipeForm :initial-value="initialValue" :busy="submitting" submit-label="Save changes" @submit="updateRecipe"><template #cancel><NuxtLink :to="`/recipe/${id}`" class="button-secondary">Cancel</NuxtLink></template></RecipeForm>
  </div>
</template>
