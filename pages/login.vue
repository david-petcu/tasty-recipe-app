<script setup lang="ts">
const route = useRoute()
const { user, fetchMe } = useAuth()
const mode = ref<'login' | 'signup'>('login')
const submitting = ref(false)
const errorMessage = ref('')
const showLoginPassword = ref(false)
const showSignupPassword = ref(false)
const loginForm = ref({ identifier: '', password: '' })
const signupForm = ref({ username: '', email: '', password: '', location: '', bio: '' })

if (user.value === undefined) await fetchMe()
if (user.value) await navigateTo('/add')

function destination() {
  const redirect = String(route.query.redirect || '/add')
  return redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/add'
}

async function submitLogin() {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: loginForm.value })
    await fetchMe()
    await navigateTo(destination())
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Sign-in failed.'
  } finally { submitting.value = false }
}

async function submitSignup() {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/auth/signup', { method: 'POST', body: signupForm.value })
    await fetchMe()
    await navigateTo(destination())
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'The account could not be created.'
  } finally { submitting.value = false }
}

watch(mode, () => { errorMessage.value = '' })
</script>

<template>
  <div class="page-shell max-w-lg py-10 sm:py-14">
    <div class="mb-8 text-center">
      <span class="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-200"><UiIcon name="lock" :size="21" /></span>
      <h1 class="mt-5 text-3xl font-semibold text-stone-100">Welcome to Tasty</h1>
      <p class="mt-2 text-sm text-slate-400">Sign in to publish and manage your recipes.</p>
    </div>

    <div class="panel p-5 sm:p-7">
      <div class="mb-7 grid grid-cols-2 rounded-lg bg-slate-950 p-1" role="tablist" aria-label="Authentication mode">
        <button type="button" role="tab" :aria-selected="mode === 'login'" class="rounded-md px-4 py-2.5 text-sm font-semibold transition" :class="mode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'" @click="mode = 'login'">Sign in</button>
        <button type="button" role="tab" :aria-selected="mode === 'signup'" class="rounded-md px-4 py-2.5 text-sm font-semibold transition" :class="mode === 'signup' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'" @click="mode = 'signup'">Create account</button>
      </div>

      <div v-if="errorMessage" class="mb-5 flex gap-3 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300"><UiIcon name="warning" :size="18" />{{ errorMessage }}</div>

      <form v-if="mode === 'login'" class="space-y-5" @submit.prevent="submitLogin">
        <div><label class="field-label">Email or username</label><input v-model="loginForm.identifier" class="field" autocomplete="username" placeholder="email@example.com" required /></div>
        <div><label class="field-label">Password</label><div class="relative"><input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" class="field pr-12" autocomplete="current-password" placeholder="Your password" required /><button type="button" class="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-100" :aria-label="showLoginPassword ? 'Hide password' : 'Show password'" :title="showLoginPassword ? 'Hide password' : 'Show password'" @click="showLoginPassword = !showLoginPassword"><UiIcon :name="showLoginPassword ? 'eye-off' : 'eye'" :size="19" /></button></div></div>
        <button class="button-primary w-full" type="submit" :disabled="submitting">{{ submitting ? 'Signing in...' : 'Sign in' }}</button>
      </form>

      <form v-else class="space-y-5" @submit.prevent="submitSignup">
        <div><label class="field-label">Username</label><input v-model="signupForm.username" class="field" autocomplete="username" minlength="3" placeholder="Chef Alex" required /></div>
        <div><label class="field-label">Email address</label><input v-model="signupForm.email" type="email" class="field" autocomplete="email" placeholder="alex@example.com" required /></div>
        <div><label class="field-label">Password</label><div class="relative"><input v-model="signupForm.password" :type="showSignupPassword ? 'text' : 'password'" class="field pr-12" autocomplete="new-password" minlength="8" placeholder="At least 8 characters" required /><button type="button" class="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-slate-100" :aria-label="showSignupPassword ? 'Hide password' : 'Show password'" :title="showSignupPassword ? 'Hide password' : 'Show password'" @click="showSignupPassword = !showSignupPassword"><UiIcon :name="showSignupPassword ? 'eye-off' : 'eye'" :size="19" /></button></div></div>
        <div><label class="field-label">Location <span class="font-normal text-slate-500">(optional)</span></label><input v-model="signupForm.location" class="field" autocomplete="address-level2" placeholder="Bucharest" /></div>
        <div><label class="field-label">About you <span class="font-normal text-slate-500">(optional)</span></label><textarea v-model="signupForm.bio" rows="3" class="field resize-none" placeholder="Tell us briefly about your passion for cooking"></textarea></div>
        <button class="button-primary w-full" type="submit" :disabled="submitting">{{ submitting ? 'Creating account...' : 'Create account' }}</button>
      </form>
    </div>

    <p class="mt-6 text-center text-sm text-slate-500"><NuxtLink to="/" class="font-semibold text-emerald-400 hover:text-emerald-300">Continue without an account</NuxtLink> to browse recipes.</p>
  </div>
</template>
