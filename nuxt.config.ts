// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Keep the existing Nuxt 3-style application folders during the Nuxt 4
  // migration. Server, public and generated Prisma files remain at root.
  srcDir: '.',
  dir: {
    app: 'app'
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  experimental: {
    appManifest: false
  },
  alias: {
    '#app-manifest': 'mocked-exports/empty'
  },
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'tasty-dev-secret-change-in-production',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  app: {
    head: {
      title: 'Tasty — Recipes that bring people together',
      meta: [
        { name: 'description', content: 'Discover authentic recipes and passionate chefs.' },
        { name: 'theme-color', content: '#020617' },
        { name: 'color-scheme', content: 'dark' }
      ]
    }
  }
})
