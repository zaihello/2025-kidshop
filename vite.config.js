import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base:'/2025-kidshop/',// << 用你的 GitHub repo 名稱！
  plugins: [vue()],
})
