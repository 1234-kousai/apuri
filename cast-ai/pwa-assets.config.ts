import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[64, 'favicon.ico']]
    },
    maskable: {
      sizes: [512],
      resizeOptions: {
        background: '#ffffff'
      }
    },
    apple: {
      sizes: [180],
      resizeOptions: {
        background: '#ffffff'
      }
    }
  },
  images: ['public/logo.svg']
})