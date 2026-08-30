<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user, fetchMe } = useAuth()
const { notify } = useNotifications()

const profileSaving = ref(false)
const passwordSaving = ref(false)
const deleting = ref(false)
const deleteModalOpen = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showDeletePassword = ref(false)

const profileForm = reactive({
  username: user.value?.username || '',
  email: user.value?.email || '',
  bio: user.value?.chef_profiles?.bio || '',
  location: user.value?.chef_profiles?.location || '',
  profile_image: user.value?.chef_profiles?.profile_image || '',
  years_experience: user.value?.chef_profiles?.years_experience || 0
})
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmation: '' })
const deletePassword = ref('')

async function saveProfile() {
  profileSaving.value = true
  try {
    await $fetch('/api/account/profile', { method: 'PATCH', body: profileForm })
    await fetchMe()
    notify('Your profile was updated successfully.', 'success')
  } catch (error: any) {
    notify(error.data?.message || 'The profile could not be updated.', 'error')
  } finally { profileSaving.value = false }
}

async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmation) {
    notify('The new passwords do not match.', 'error')
    return
  }
  passwordSaving.value = true
  try {
    await $fetch('/api/account/password', { method: 'PATCH', body: passwordForm })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmation = ''
    notify('Your password was changed successfully.', 'success')
  } catch (error: any) {
    notify(error.data?.message || 'The password could not be changed.', 'error')
  } finally { passwordSaving.value = false }
}

async function deleteAccount() {
  deleting.value = true
  try {
    await $fetch('/api/account', { method: 'DELETE', body: { password: deletePassword.value } })
    user.value = null
    deleteModalOpen.value = false
    notify('Your account was permanently deleted.', 'success')
    await navigateTo('/')
  } catch (error: any) {
    deleteModalOpen.value = false
    notify(error.data?.message || 'The account could not be deleted.', 'error')
  } finally { deleting.value = false }
}
</script>

<template>
  <div class="page-shell page-section max-w-4xl">
    <div class="page-header"><p class="eyebrow">Your account</p><h1 class="page-title">Account settings</h1><p class="page-description">Manage your public profile, password, and account.</p></div>

    <div class="space-y-7">
      <section class="panel overflow-hidden">
        <div class="border-b border-slate-800 bg-slate-950/40 px-6 py-5 sm:px-8"><h2 class="text-xl font-extrabold text-white">Public profile</h2><p class="mt-1 text-sm text-slate-500">These details appear on your chef page.</p></div>
        <form class="grid gap-5 p-6 sm:grid-cols-2 sm:p-8" @submit.prevent="saveProfile">
          <div><label class="field-label">Username</label><input v-model="profileForm.username" class="field" minlength="3" maxlength="40" autocomplete="username" required /></div>
          <div><label class="field-label">Email address</label><input v-model="profileForm.email" type="email" class="field" maxlength="254" autocomplete="email" required /></div>
          <div><label class="field-label">Location</label><input v-model="profileForm.location" class="field" maxlength="100" autocomplete="address-level2" placeholder="Bucharest" /></div>
          <div><label class="field-label">Years of experience</label><input v-model.number="profileForm.years_experience" type="number" class="field" min="0" max="80" step="1" required /></div>
          <ImageUpload v-model="profileForm.profile_image" kind="profile" label="Profile image" class="sm:col-span-2" />
          <div class="sm:col-span-2"><label class="field-label">Bio</label><textarea v-model="profileForm.bio" rows="4" class="field resize-y" maxlength="500" placeholder="Tell the community about your cooking style."></textarea><p class="mt-2 text-right text-xs text-slate-500">{{ profileForm.bio.length }}/500</p></div>
          <div class="sm:col-span-2 flex justify-end"><button class="button-primary min-w-40" type="submit" :disabled="profileSaving">{{ profileSaving ? 'Saving...' : 'Save profile' }}</button></div>
        </form>
      </section>

      <section class="panel overflow-hidden">
        <div class="border-b border-slate-800 bg-slate-950/40 px-6 py-5 sm:px-8"><h2 class="text-xl font-extrabold text-white">Change password</h2><p class="mt-1 text-sm text-slate-500">Use at least eight characters for your new password.</p></div>
        <form class="grid gap-5 p-6 sm:grid-cols-2 sm:p-8" @submit.prevent="changePassword">
          <div class="sm:col-span-2"><label class="field-label">Current password</label><div class="relative"><input v-model="passwordForm.currentPassword" :type="showCurrentPassword ? 'text' : 'password'" class="field pr-12" autocomplete="current-password" required /><button type="button" class="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white" :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'" @click="showCurrentPassword = !showCurrentPassword"><UiIcon :name="showCurrentPassword ? 'eye-off' : 'eye'" :size="19" /></button></div></div>
          <div><label class="field-label">New password</label><div class="relative"><input v-model="passwordForm.newPassword" :type="showNewPassword ? 'text' : 'password'" class="field pr-12" minlength="8" maxlength="128" autocomplete="new-password" required /><button type="button" class="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white" :aria-label="showNewPassword ? 'Hide password' : 'Show password'" @click="showNewPassword = !showNewPassword"><UiIcon :name="showNewPassword ? 'eye-off' : 'eye'" :size="19" /></button></div></div>
          <div><label class="field-label">Confirm new password</label><input v-model="passwordForm.confirmation" type="password" class="field" minlength="8" maxlength="128" autocomplete="new-password" required /></div>
          <div class="sm:col-span-2 flex justify-end"><button class="button-primary min-w-40" type="submit" :disabled="passwordSaving">{{ passwordSaving ? 'Changing...' : 'Change password' }}</button></div>
        </form>
      </section>

      <section class="rounded-xl border border-red-900/70 bg-red-950/20 p-6 sm:p-8">
        <h2 class="text-xl font-extrabold text-red-300">Delete account</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Deleting your account permanently removes your profile, recipes, and recipe ingredient links. This cannot be undone.</p>
        <div class="mt-6 max-w-md"><label class="field-label">Password confirmation</label><div class="relative"><input v-model="deletePassword" :type="showDeletePassword ? 'text' : 'password'" class="field pr-12" autocomplete="current-password" placeholder="Enter your password" /><button type="button" class="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white" :aria-label="showDeletePassword ? 'Hide password' : 'Show password'" @click="showDeletePassword = !showDeletePassword"><UiIcon :name="showDeletePassword ? 'eye-off' : 'eye'" :size="19" /></button></div></div>
        <button type="button" class="button-danger mt-4" :disabled="!deletePassword" @click="deleteModalOpen = true"><UiIcon name="trash" :size="17" />Delete my account</button>
      </section>
    </div>

    <ConfirmModal :open="deleteModalOpen" title="Permanently delete your account?" message="Your profile and every recipe you published will be removed permanently. This action cannot be undone." confirm-label="Delete account" :busy="deleting" danger @cancel="deleteModalOpen = false" @confirm="deleteAccount" />
  </div>
</template>
