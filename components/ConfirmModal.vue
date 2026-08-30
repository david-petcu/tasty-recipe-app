<script setup lang="ts">
withDefaults(defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; busy?: boolean; danger?: boolean }>(), {
  confirmLabel: 'Confirm', busy: false, danger: false
})
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" :aria-label="title" @click.self="$emit('cancel')">
        <div class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-7">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl" :class="danger ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'"><UiIcon :name="danger ? 'warning' : 'check'" :size="23" /></span>
          <h2 class="mt-5 text-2xl font-extrabold text-white">{{ title }}</h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">{{ message }}</p>
          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" class="button-secondary" :disabled="busy" @click="$emit('cancel')">Cancel</button>
            <button type="button" class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-60" :class="danger ? 'bg-red-700 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-500'" :disabled="busy" @click="$emit('confirm')">{{ busy ? 'Please wait...' : confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
