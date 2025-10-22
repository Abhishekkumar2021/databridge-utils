import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        // Base alias for the renderer source folder
        '@renderer': resolve(__dirname, 'src/renderer/src'),

        // Aliases for components and folders
        components: resolve(__dirname, 'src/renderer/src/components'),
        ui: resolve(__dirname, 'src/renderer/src/components/ui'),
        hooks: resolve(__dirname, 'src/renderer/src/hooks'),
        lib: resolve(__dirname, 'src/renderer/src/lib'),
        pages: resolve(__dirname, 'src/renderer/src/pages'),
        contexts: resolve(__dirname, 'src/renderer/src/contexts')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
