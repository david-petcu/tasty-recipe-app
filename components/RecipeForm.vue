<script setup lang="ts">
interface IngredientInput { name: string; quantity: string; unit: string }
interface RecipeInput {
  title: string
  description: string
  image: string
  cooking_time: number
  difficulty: string
  category: string
  servings: number
  instructions: string
  ingredients: IngredientInput[]
}

const props = withDefaults(defineProps<{ initialValue: RecipeInput; busy?: boolean; submitLabel?: string }>(), {
  busy: false,
  submitLabel: 'Save recipe'
})
const emit = defineEmits<{ submit: [value: RecipeInput] }>()
const { data: existingIngredients } = await useFetch('/api/ingredients')
const form = ref<RecipeInput>(structuredClone(toRaw(props.initialValue)))

watch(() => props.initialValue, value => { form.value = structuredClone(toRaw(value)) }, { deep: true })

function addIngredientRow() { form.value.ingredients.push({ name: '', quantity: '', unit: '' }) }
function removeIngredientRow(index: number) { if (form.value.ingredients.length > 1) form.value.ingredients.splice(index, 1) }
function fillUnit(ingredient: IngredientInput) {
  const match = existingIngredients.value?.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase())
  if (match?.unit) ingredient.unit = match.unit
}
function submit() { emit('submit', structuredClone(toRaw(form.value))) }
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <section class="panel overflow-hidden">
      <div class="flex items-start gap-4 border-b border-slate-800 bg-slate-950/40 px-6 py-5 sm:px-8"><span class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300"><UiIcon name="book" :size="22" /></span><div><h2 class="text-lg font-extrabold text-white">Recipe details</h2><p class="mt-1 text-sm text-slate-500">The essential information shown in the collection.</p></div></div>
      <div class="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <div><label class="field-label">Recipe title *</label><input v-model="form.title" class="field" maxlength="120" placeholder="Example: Mushroom risotto" required /></div>
        <div><label class="field-label">Short description</label><input v-model="form.description" class="field" maxlength="240" placeholder="What makes this recipe special?" /></div>
        <div><label class="field-label">Cooking time *</label><div class="relative"><input v-model.number="form.cooking_time" type="number" min="1" class="field pr-20" required /><span class="absolute right-4 top-3 text-sm text-slate-500">minutes</span></div></div>
        <div><label class="field-label">Number of servings</label><input v-model.number="form.servings" type="number" min="1" class="field" required /></div>
        <div><label class="field-label">Category</label><select v-model="form.category" class="field"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="dessert">Dessert</option></select></div>
        <div><label class="field-label">Difficulty</label><select v-model="form.difficulty" class="field"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Advanced</option></select></div>
        <ImageUpload v-model="form.image" kind="recipe" label="Recipe image" class="sm:col-span-2" />
      </div>
    </section>

    <section class="panel overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-slate-800 bg-slate-950/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div class="flex items-start gap-4"><span class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300"><UiIcon name="list" :size="22" /></span><div><h2 class="text-lg font-extrabold text-white">Ingredients</h2><p class="mt-1 text-sm text-slate-500">The unit is filled in automatically for existing ingredients.</p></div></div><button type="button" class="button-secondary py-2.5" @click="addIngredientRow"><UiIcon name="plus" :size="17" />Add ingredient</button></div>
      <div class="space-y-3 p-6 sm:p-8">
        <datalist id="recipe-ingredient-list"><option v-for="item in existingIngredients" :key="item.id" :value="item.name">{{ item.unit }}</option></datalist>
        <div v-for="(ingredient, index) in form.ingredients" :key="index" class="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:grid-cols-[1fr_130px_130px_44px] sm:items-end">
          <div><label class="field-label">Ingredient</label><input v-model="ingredient.name" list="recipe-ingredient-list" class="field" placeholder="Search or add" required @input="fillUnit(ingredient)" /></div>
          <div><label class="field-label">Quantity</label><input v-model="ingredient.quantity" class="field" placeholder="200" required /></div>
          <div><label class="field-label">Unit</label><input v-model="ingredient.unit" class="field" placeholder="g, ml, pcs" /></div>
          <button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-950 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30" :disabled="form.ingredients.length === 1" aria-label="Remove ingredient" @click="removeIngredientRow(index)"><UiIcon name="trash" :size="18" /></button>
        </div>
      </div>
    </section>

    <section class="panel p-6 sm:p-8"><div class="mb-5 flex items-start gap-4"><span class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300"><UiIcon name="utensils" :size="22" /></span><div><h2 class="text-lg font-extrabold text-white">Instructions</h2><p class="mt-1 text-sm text-slate-500">Describe each step clearly, in the order it should be followed.</p></div></div><textarea v-model="form.instructions" rows="8" class="field resize-y leading-relaxed" placeholder="Write the cooking instructions..." required></textarea></section>

    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><slot name="cancel"><NuxtLink to="/" class="button-secondary">Cancel</NuxtLink></slot><button type="submit" class="button-primary min-w-48" :disabled="busy"><span v-if="busy">Saving...</span><template v-else><UiIcon name="check" :size="18" />{{ submitLabel }}</template></button></div>
  </form>
</template>
