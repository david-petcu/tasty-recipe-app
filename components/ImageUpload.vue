<script setup lang="ts">
const props = defineProps<{ modelValue: string; kind: 'profile' | 'recipe'; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { notify } = useNotifications()
const uploading = ref(false)
const input = ref<HTMLInputElement | null>(null)

const MAX_SOURCE_FILE_SIZE = 15 * 1024 * 1024
const WEBP_QUALITY = 0.8

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const maxDimension = props.kind === 'profile' ? 512 : 1600
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Image processing is not supported by this browser.')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => result ? resolve(result) : reject(new Error('The image could not be compressed.')),
      'image/webp',
      WEBP_QUALITY
    )
  })

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() })
}

async function selectFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notify('Choose a JPEG, PNG, or WebP image.', 'error')
    return
  }
  if (file.size > MAX_SOURCE_FILE_SIZE) {
    notify('The original image cannot exceed 15 MB.', 'error')
    return
  }

  uploading.value = true
  try {
    const optimizedFile = await compressImage(file)
    const body = new FormData()
    body.append('file', optimizedFile)
    body.append('kind', props.kind)
    const result = await $fetch<{ url: string }>('/api/uploads/image', { method: 'POST', body })
    emit('update:modelValue', result.url)
    const savedPercent = Math.max(0, Math.round((1 - optimizedFile.size / file.size) * 100))
    notify(savedPercent > 0 ? `Image optimized and uploaded (${savedPercent}% smaller).` : 'Image optimized and uploaded.', 'success')
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
    <div class="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
      <div class="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-400 sm:w-32">
        <img v-if="modelValue" :src="modelValue" alt="Selected image preview" class="h-full w-full object-cover" />
        <UiIcon v-else name="image" :size="30" />
      </div>
      <div class="flex-1">
        <p class="text-sm leading-6 text-slate-300">JPEG, PNG or WebP, up to 15 MB. Images are optimized automatically.</p>
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
