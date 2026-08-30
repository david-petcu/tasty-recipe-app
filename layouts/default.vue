<script setup lang="ts">
const menuOpen = ref(false)
const route = useRoute()
const { user, fetchMe, logout } = useAuth()
if (user.value === undefined) await fetchMe()
watch(() => route.fullPath, () => { menuOpen.value = false })
const links = [{ to: '/', label: 'Recipes', icon: 'home' }, { to: '/chefs', label: 'Chefs', icon: 'users' }]
async function handleLogout() { await logout(); await navigateTo('/') }
</script>

<template>
  <div class="dark-theme min-h-screen overflow-x-hidden bg-slate-950">
    <AppNotifications />
    <header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div class="page-shell flex h-20 items-center justify-between">
        <NuxtLink to="/" class="group flex items-center gap-3" aria-label="Tasty - home page">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white"><UiIcon name="logo" :size="22" /></span>
          <span><span class="block text-xl font-extrabold leading-none text-slate-900">Tasty</span><span class="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Recipes with a story</span></span>
        </NuxtLink>
        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-stone-50 hover:text-slate-900"><UiIcon :name="link.icon" :size="17" />{{ link.label }}</NuxtLink>
        </nav>
        <div class="flex items-center gap-2">
          <NuxtLink to="/add" class="button-primary hidden sm:inline-flex"><UiIcon name="plus" :size="18" />Add recipe</NuxtLink>
          <NuxtLink v-if="!user" to="/login" class="button-secondary hidden lg:inline-flex"><UiIcon name="lock" :size="17" />Sign in</NuxtLink>
          <div v-else class="hidden items-center gap-2 lg:flex">
            <NuxtLink to="/saved" class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">Saved</NuxtLink>
            <NuxtLink :to="`/chef/${user.id}`" class="rounded-xl px-3 py-2 text-sm font-bold text-slate-300 hover:bg-slate-800">{{ user.username }}</NuxtLink>
            <NuxtLink to="/settings" class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">Settings</NuxtLink>
            <button class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white" @click="handleLogout">Sign out</button>
          </div>
          <button class="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-700 md:hidden" aria-label="Open menu" @click="menuOpen = !menuOpen"><UiIcon :name="menuOpen ? 'close' : 'list'" :size="21" /></button>
        </div>
      </div>
      <div v-if="menuOpen" class="border-t border-slate-800 bg-slate-900 px-4 py-4 md:hidden">
        <nav class="mx-auto flex max-w-7xl flex-col gap-2">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-stone-50"><UiIcon :name="link.icon" :size="19" />{{ link.label }}</NuxtLink>
          <NuxtLink to="/add" class="button-primary mt-2 sm:hidden"><UiIcon name="plus" :size="18" />Add recipe</NuxtLink>
          <NuxtLink v-if="!user" to="/login" class="button-secondary mt-2 lg:hidden"><UiIcon name="lock" :size="18" />Sign in</NuxtLink>
          <template v-else><NuxtLink to="/saved" class="rounded-xl px-4 py-3 font-semibold text-slate-300">Saved recipes</NuxtLink><NuxtLink :to="`/chef/${user.id}`" class="rounded-xl px-4 py-3 font-semibold text-slate-300">My profile: {{ user.username }}</NuxtLink><NuxtLink to="/settings" class="rounded-xl px-4 py-3 font-semibold text-slate-300">Account settings</NuxtLink><button class="rounded-xl px-4 py-3 text-left font-semibold text-slate-400 hover:bg-slate-800" @click="handleLogout">Sign out</button></template>
        </nav>
      </div>
    </header>
    <main class="min-h-[calc(100vh-18rem)] py-8 sm:py-12"><slot /></main>
    <footer class="mt-16 border-t border-slate-800 bg-slate-900">
      <div class="page-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white"><UiIcon name="logo" :size="20" /></span><div><p class="font-bold text-slate-900">Tasty</p><p class="text-xs text-slate-500">Simple recipes. Memorable moments.</p></div></div>
        <p class="text-sm text-slate-500">Web Development Project · David · 2026</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>.router-link-active:not(.button-primary) { background: rgb(6 78 59 / 0.35); color: rgb(52 211 153); }</style>
