// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/filepond@^4/dist/filepond.css' },
        { rel: 'stylesheet', href: 'https://unpkg.com/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap' }
      ],
      script: [
        { src: 'https://unpkg.com/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.js' },
        { src: 'https://unpkg.com/filepond-plugin-file-encode/dist/filepond-plugin-file-encode.js' },
        { src: 'https://unpkg.com/filepond@^4/dist/filepond.js' }
      ]
    },
  },
  nitro: {
    preset: "vercel",
  },
  css: [
    '@/assets/styles/main.css'
  ]
})
