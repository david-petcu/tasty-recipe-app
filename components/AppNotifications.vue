<script setup lang="ts">
const { notifications, dismiss } = useNotifications()
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-24 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="item in notifications" :key="item.id" class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-slate-900 p-4 shadow-2xl" :class="item.type === 'success' ? 'border-emerald-700 text-emerald-200' : item.type === 'error' ? 'border-red-800 text-red-200' : 'border-slate-700 text-slate-200'">
        <UiIcon :name="item.type === 'success' ? 'check' : item.type === 'error' ? 'warning' : 'sparkle'" :size="19" />
        <p class="flex-1 text-sm font-semibold leading-6">{{ item.message }}</p>
        <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white" aria-label="Dismiss notification" @click="dismiss(item.id)"><UiIcon name="close" :size="17" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px) scale(.98); }
</style>
