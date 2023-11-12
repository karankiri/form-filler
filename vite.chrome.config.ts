import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from "path";

const fetchVersion = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace(
        /__APP_VERSION__/,
        `v${process.env.npm_package_version}`
      )
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fetchVersion()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    }
  },
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, 'dist'),
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, './background.ts'),
      name: 'Form Filler'
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.global.js',
        extend: true,
      }
    }
  }
})
