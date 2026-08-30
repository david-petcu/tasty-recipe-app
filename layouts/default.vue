<script setup lang="ts">
const menuOpen = ref(false)
const route = useRoute()
const { user, fetchMe, logout } = useAuth()

if (user.value === undefined) await fetchMe()
watch(() => route.fullPath, () => { menuOpen.value = false })

const links = [
  { to: '/', label: 'Recipes', icon: 'home' },
  { to: '/chefs', label: 'Chefs', icon: 'users' },
]

async function handleLogout() {
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-[#0a0c0e] text-slate-200">
    <AppNotifications />
    <header class="sticky top-0 z-50 border-b border-slate-800/90 bg-[#0a0c0e]/90 backdrop-blur-xl">
      <div class="page-shell flex h-16 items-center justify-between">
        <NuxtLink to="/" class="group flex items-center gap-2.5" aria-label="Tasty home">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300 text-slate-950 transition group-hover:bg-emerald-200">
            <UiIcon name="logo" :size="19" :stroke-width="2" />
          </span>
          <span class="text-lg font-semibold tracking-[-0.03em] text-stone-100">Tasty</span>
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link">
            <UiIcon :name="link.icon" :size="16" />{{ link.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-1.5">
          <NuxtLink to="/add" class="button-primary hidden sm:inline-flex"><UiIcon name="plus" :size="17" />Add recipe</NuxtLink>
          <NuxtLink v-if="!user" to="/login" class="button-ghost hidden md:inline-flex">Sign in</NuxtLink>
          <div v-else class="hidden items-center lg:flex">
            <NuxtLink to="/saved" class="button-ghost"><UiIcon name="heart" :size="16" />Saved</NuxtLink>
            <NuxtLink :to="`/chef/${user.id}`" class="button-ghost">{{ user.username }}</NuxtLink>
            <NuxtLink to="/settings" class="icon-button ml-1" aria-label="Account settings"><UiIcon name="settings" :size="18" /></NuxtLink>
            <button class="button-ghost ml-1" @click="handleLogout">Sign out</button>
          </div>
          <button class="icon-button md:hidden" :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'" :aria-expanded="menuOpen" aria-controls="mobile-navigation" @click="menuOpen = !menuOpen">
            <UiIcon :name="menuOpen ? 'close' : 'list'" :size="20" />
          </button>
        </div>
      </div>

      <div v-if="menuOpen" id="mobile-navigation" class="border-t border-slate-800 bg-slate-950/95 px-4 py-3 md:hidden">
        <nav class="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="mobile-nav-link"><UiIcon :name="link.icon" :size="18" />{{ link.label }}</NuxtLink>
          <NuxtLink to="/add" class="mobile-nav-link sm:hidden"><UiIcon name="plus" :size="18" />Add recipe</NuxtLink>
          <NuxtLink v-if="!user" to="/login" class="mobile-nav-link"><UiIcon name="lock" :size="18" />Sign in</NuxtLink>
          <template v-else>
            <NuxtLink to="/saved" class="mobile-nav-link"><UiIcon name="heart" :size="18" />Saved recipes</NuxtLink>
            <NuxtLink :to="`/chef/${user.id}`" class="mobile-nav-link"><UiIcon name="chef" :size="18" />My profile</NuxtLink>
            <NuxtLink to="/settings" class="mobile-nav-link"><UiIcon name="settings" :size="18" />Account settings</NuxtLink>
            <button class="mobile-nav-link w-full text-left" @click="handleLogout"><UiIcon name="logout" :size="18" />Sign out</button>
          </template>
        </nav>
      </div>
    </header>

    <main class="min-h-[calc(100vh-12rem)]"><slot /></main>

    <footer class="mt-16 border-t border-slate-800">
      <div class="page-shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-emerald-300"><UiIcon name="logo" :size="16" /></span>
          <div><p class="text-sm font-semibold text-stone-100">Tasty</p><p class="text-xs text-slate-500">Good food, clearly explained.</p></div>
        </div>
        <p class="text-xs text-slate-500">Web Development Project · David · 2026</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.nav-link { @apply inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800/70 hover:text-stone-100; }
.mobile-nav-link { @apply flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white; }
.router-link-active.nav-link,
.router-link-active.mobile-nav-link { @apply bg-slate-800 text-emerald-200; }
</style>
