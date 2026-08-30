<script setup lang="ts">
const props = defineProps<{ modelValue: string; kind: 'profile' | 'recipe'; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { notify } = useNotifications()
const uploading = ref(false)
const input = ref<HTMLInputElement | null>(null)

async function selectFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notify('Choose a JPEG, PNG, or WebP image.', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    notify('The image cannot exceed 5 MB.', 'error')
    return
  }

  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    body.append('kind', props.kind)
    const result = await $fetch<{ url: string }>('/api/uploads/image', { method: 'POST', body })
    emit('update:modelValue', result.url)
    notify('Image uploaded successfully.', 'success')
  } catch (error: any) {
    notify(error.data?.message || 'The image could not be uploaded.', 'error')
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div>
    <label class="field-label">{{ label }}</label>
    <div class="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
      <div class="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-400 sm:w-32">
        <img v-if="modelValue" :src="modelValue" alt="Selected image preview" class="h-full w-full object-cover" />
        <UiIcon v-else name="image" :size="30" />
      </div>
      <div class="flex-1">
        <p class="text-sm leading-6 text-slate-300">JPEG, PNG or WebP, up to 5 MB.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <label class="button-secondary cursor-pointer py-2.5">
            <UiIcon name="image" :size="17" />{{ uploading ? 'Uploading...' : modelValue ? 'Replace image' : 'Upload image' }}
            <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="uploading" @change="selectFile" />
          </label>
          <button v-if="modelValue" type="button" class="button-secondary py-2.5" :disabled="uploading" @click="emit('update:modelValue', '')">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>
