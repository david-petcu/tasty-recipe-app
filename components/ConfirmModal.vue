<script setup lang="ts">
const props = withDefaults(defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; busy?: boolean; danger?: boolean }>(), {
  confirmLabel: 'Confirm', busy: false, danger: false
})
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const cancelButton = ref<HTMLButtonElement | null>(null)
const titleId = useId()

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()
    cancelButton.value?.focus()
  }
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && !props.busy) emit('cancel')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" :aria-labelledby="titleId" @click.self="emit('cancel')">
        <div class="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-7">
          <span class="flex h-11 w-11 items-center justify-center rounded-lg" :class="danger ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-300'"><UiIcon :name="danger ? 'warning' : 'check'" :size="21" /></span>
          <h2 :id="titleId" class="mt-5 text-xl font-semibold text-white">{{ title }}</h2>
          <p class="mt-3 text-sm leading-6 text-slate-400">{{ message }}</p>
          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button ref="cancelButton" type="button" class="button-secondary" :disabled="busy" @click="emit('cancel')">Cancel</button>
            <button type="button" :class="danger ? 'button-danger' : 'button-primary'" :disabled="busy" @click="emit('confirm')">{{ busy ? 'Please wait...' : confirmLabel }}</button>
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
