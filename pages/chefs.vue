<script setup lang="ts">
const { data: chefs, pending, error } = await useFetch('/api/chefs')
</script>

<template>
  <div class="page-shell">
    <section class="mb-12 grid gap-8 rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
      <div class="max-w-2xl"><p class="eyebrow">The Tasty community</p><h1 class="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">The people behind the recipes.</h1><p class="mt-5 text-lg leading-relaxed text-slate-500">Meet passionate chefs, discover their stories, and explore the dishes they share with the community.</p></div>
      <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><UiIcon name="users" :size="34" :stroke-width="1.4" /></div>
    </section>

    <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><div v-for="i in 6" :key="i" class="h-80 animate-pulse rounded-3xl border border-stone-200 bg-white"></div></div>
    <div v-else-if="error" class="panel px-6 py-16 text-center"><p class="font-bold text-red-600">The chefs could not be loaded.</p></div>
    <div v-else-if="!chefs?.length" class="panel px-6 py-16 text-center"><UiIcon name="users" :size="34" class="mx-auto text-emerald-700" /><h2 class="mt-4 text-xl font-bold">The community is just getting started</h2><p class="mt-2 text-slate-500">The first chef can join by publishing a recipe.</p><NuxtLink to="/add" class="button-primary mt-6"><UiIcon name="plus" :size="18" />Add recipe</NuxtLink></div>
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="chef in chefs" :key="chef.id" :to="`/chef/${chef.id}`" class="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950">
        <div class="p-7">
          <div class="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 shadow-md"><img v-if="chef.chef_profiles?.profile_image" :src="chef.chef_profiles.profile_image" :alt="chef.username" class="h-full w-full object-cover" /><UiIcon v-else name="chef" :size="38" :stroke-width="1.4" /></div>
          <h2 class="text-2xl font-extrabold text-slate-900">{{ chef.username }}</h2><p class="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700"><UiIcon name="pin" :size="16" />{{ chef.chef_profiles?.location || 'Romania' }}</p>
          <p class="mt-4 line-clamp-2 min-h-12 text-sm leading-relaxed text-slate-500">{{ chef.chef_profiles?.bio || 'Passionate about cooking and recipes that bring people together.' }}</p>
          <div class="my-6 grid grid-cols-2 divide-x divide-stone-200 rounded-2xl bg-stone-50 py-3 text-center"><div><strong class="block text-lg text-slate-900">{{ chef._count.recipes }}</strong><span class="text-xs text-slate-500">Recipes</span></div><div><strong class="block text-lg text-slate-900">{{ chef.chef_profiles?.years_experience || 0 }}</strong><span class="text-xs text-slate-500">Years of experience</span></div></div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
