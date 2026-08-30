<script setup lang="ts">
const route = useRoute()
const id = route.params.id
const { data: chef, error, pending } = await useFetch(`/api/chef/${id}`, { key: `chef-profile-${id}` })
const { user, fetchMe } = useAuth()
if (user.value === undefined) await fetchMe()

const isOwnProfile = computed(() => Boolean(user.value && chef.value && String(user.value.id) === String(chef.value.id)))
</script>

<template>
  <div class="page-shell page-section max-w-6xl">
    <div v-if="pending" class="space-y-8"><div class="h-96 animate-pulse rounded-[2.5rem] bg-stone-200"></div><div class="grid gap-6 md:grid-cols-3"><div v-for="i in 3" :key="i" class="h-64 animate-pulse rounded-3xl bg-stone-200"></div></div></div>
    <div v-else-if="error || !chef" class="panel flex flex-col items-center px-6 py-20 text-center"><span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600"><UiIcon name="warning" :size="28" /></span><h1 class="mt-6 text-2xl font-extrabold">Profile not found</h1><p class="mt-2 text-slate-500">The chef you are looking for does not exist or is no longer available.</p><NuxtLink to="/chefs" class="button-primary mt-7">Back to chefs</NuxtLink></div>
    <template v-else>
      <section class="panel overflow-hidden">
        <div class="p-6 sm:p-10">
          <div v-if="isOwnProfile" class="mb-6 flex items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div><p class="text-sm font-bold text-slate-200">Your account</p><p class="mt-1 text-sm text-slate-500">Keep your public chef profile up to date.</p></div>
            <NuxtLink to="/settings" class="button-secondary shrink-0"><UiIcon name="settings" :size="17" />Account settings</NuxtLink>
          </div>
          <div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center"><div class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-slate-400 ring-1 ring-slate-700"><img v-if="chef.chef_profiles?.profile_image" :src="chef.chef_profiles.profile_image" :alt="chef.username" class="h-full w-full object-cover" /><UiIcon v-else name="chef" :size="44" :stroke-width="1.3" /></div><div class="flex-1"><h1 class="text-3xl font-semibold text-stone-100 sm:text-4xl">{{ chef.username }}</h1><div class="mt-3 flex flex-wrap gap-2"><span v-if="chef.chef_profiles?.location" class="badge"><UiIcon name="pin" :size="15" />{{ chef.chef_profiles.location }}</span><span class="badge"><UiIcon name="star" :size="15" />{{ chef.chef_profiles?.years_experience || 0 }} years of experience</span></div></div><div class="border-l border-slate-800 px-6 py-2 text-left sm:text-center"><strong class="block text-2xl font-semibold text-stone-100">{{ chef.recipes?.length || 0 }}</strong><span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Recipes</span></div></div>
          <div class="mt-8 border-t border-stone-100 pt-7"><p class="eyebrow">About the chef</p><p class="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">{{ chef.chef_profiles?.bio || 'This chef has not added a description yet.' }}</p></div>
        </div>
      </section>

      <section class="mt-12"><div class="mb-7 flex items-end justify-between"><div><p class="eyebrow">From the chef's kitchen</p><h2 class="text-2xl font-semibold text-stone-100">{{ chef.username }}'s recipes</h2></div><span class="hidden text-sm text-slate-400 sm:block">{{ chef.recipes?.length || 0 }} results</span></div>
        <div v-if="chef.recipes?.length" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><NuxtLink v-for="recipe in chef.recipes" :key="recipe.id" :to="`/recipe/${recipe.id}`" class="group flex min-h-64 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"><img v-if="recipe.image" :src="recipe.image" :alt="recipe.title" loading="lazy" class="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.03]" /><div class="flex flex-1 flex-col p-6"><div class="mb-5 flex items-center justify-between"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><UiIcon name="book" :size="19" /></span><span class="flex items-center gap-1.5 text-sm font-semibold text-slate-500"><UiIcon name="clock" :size="15" />{{ recipe.cooking_time }} min</span></div><h3 class="text-xl font-extrabold leading-snug text-slate-900 group-hover:text-emerald-400">{{ recipe.title }}</h3><p class="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{{ recipe.description || 'Discover the ingredients and cooking instructions.' }}</p></div></NuxtLink></div>
        <div v-else class="panel flex flex-col items-center px-6 py-16 text-center"><span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-slate-500"><UiIcon name="book" :size="25" /></span><h3 class="mt-5 text-xl font-bold text-slate-900">No published recipes</h3><p class="mt-2 text-slate-500">This chef's collection is currently empty.</p></div>
      </section>
    </template>
  </div>
</template>
