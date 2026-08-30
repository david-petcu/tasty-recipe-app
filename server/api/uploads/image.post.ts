import { requireSessionChefId } from '~/server/utils/auth'
import { uploadImage } from '~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file')
  const kindPart = parts?.find(part => part.name === 'kind')
  const kindValue = kindPart?.data?.toString()
  const kind = kindValue === 'profile' ? 'profiles' : kindValue === 'recipe' ? 'recipes' : null

  if (!kind) throw createError({ statusCode: 400, message: 'The image type is not valid.' })
  const url = await uploadImage(event, chefId, file!, kind)
  return { url }
})
