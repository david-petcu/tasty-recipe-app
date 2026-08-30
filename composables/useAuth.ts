export interface AuthUser {
  id: number
  username: string
  email: string
  chef_profiles?: {
    bio?: string | null
    location?: string | null
    profile_image?: string | null
    years_experience?: number | null
  } | null
  _count?: { recipes: number }
}

export function useAuth() {
  const user = useState<AuthUser | null | undefined>('auth-user', () => undefined)

  async function fetchMe() {
    try {
      user.value = await $fetch<AuthUser | null>('/api/auth/me', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
      })
    } catch {
      user.value = null
    }
    return user.value
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, fetchMe, logout }
}
