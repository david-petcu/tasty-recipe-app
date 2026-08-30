<script setup lang="ts">
const { data: chefs, pending, error } = await useFetch('/api/chefs')
</script>

<template>
  <div class="page-shell page-section">
    <section class="page-header">
      <p class="eyebrow">The Tasty community</p>
      <h1 class="page-title">Meet the people behind the recipes.</h1>
      <p class="page-description">Discover the cooks, their stories, and the dishes they share with the community.</p>
    </section>

    <div v-if="pending" class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"><div v-for="i in 6" :key="i" class="panel h-72 animate-pulse"></div></div>
    <div v-else-if="error" class="empty-state"><UiIcon name="warning" :size="28" class="mx-auto text-red-400" /><p class="mt-4 font-semibold">The chefs could not be loaded.</p></div>
    <div v-else-if="!chefs?.length" class="empty-state"><UiIcon name="users" :size="30" class="mx-auto text-emerald-300" /><h2 class="mt-4 text-lg font-semibold">The community is just getting started</h2><p class="mt-2 text-sm text-slate-400">The first chef can join by publishing a recipe.</p><NuxtLink to="/add" class="button-primary mt-6"><UiIcon name="plus" :size="18" />Add recipe</NuxtLink></div>
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="chef in chefs" :key="chef.id" :to="`/chef/${chef.id}`" class="group block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 transition hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950">
        <div class="p-5">
          <div class="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-400"><img v-if="chef.chef_profiles?.profile_image" :src="chef.chef_profiles.profile_image" :alt="chef.username" class="h-full w-full object-cover" /><UiIcon v-else name="chef" :size="32" :stroke-width="1.4" /></div>
          <h2 class="text-xl font-semibold text-stone-100 transition group-hover:text-emerald-200">{{ chef.username }}</h2><p class="mt-2 flex items-center gap-2 text-sm font-medium text-slate-400"><UiIcon name="pin" :size="15" />{{ chef.chef_profiles?.location || 'Location not provided' }}</p>
          <p class="mt-4 line-clamp-2 min-h-10 text-sm leading-6 text-slate-400">{{ chef.chef_profiles?.bio || 'Passionate about cooking and recipes that bring people together.' }}</p>
          <div class="mt-5 grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800 pt-4 text-left"><div><strong class="block text-base font-semibold text-stone-100">{{ chef._count.recipes }}</strong><span class="text-xs text-slate-500">Recipes</span></div><div class="pl-5"><strong class="block text-base font-semibold text-stone-100">{{ chef.chef_profiles?.years_experience || 0 }}</strong><span class="text-xs text-slate-500">Years cooking</span></div></div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
