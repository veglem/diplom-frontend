import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Проксируем все запросы, начинающиеся с `/api`
      '/api': {
        target: 'http://89.208.86.109:8000', // ваш бекенд
        changeOrigin: true,  // меняет Origin в заголовках на целевой URL
        secure: false,       // если бекенд на HTTP (не HTTPS)

        // Важно для передачи кук:
        cookieDomainRewrite: 'localhost', // заменяет Domain в куках
        headers: {
          "Access-Control-Expose-Headers": "X-CSRF-Token", // Разрешаем клиенту видеть заголовок
        },
      },
      '/images': {
        target: 'http://89.208.86.109:80', // ваш бекенд
        changeOrigin: true,  // меняет Origin в заголовках на целевой URL
        secure: false,       // если бекенд на HTTP (не HTTPS)

        // Важно для передачи кук:
        cookieDomainRewrite: 'localhost', // заменяет Domain в куках
        headers: {
          "Access-Control-Expose-Headers": "X-CSRF-Token", // Разрешаем клиенту видеть заголовок
        },
      },
      '/translate/v2/translate': {
        target: 'https://translate.api.cloud.yandex.net', // ваш бекенд
        changeOrigin: true,  // меняет Origin в заголовках на целевой URL
        secure: false,       // если бекенд на HTTP (не HTTPS)

        // Важно для передачи кук:
        cookieDomainRewrite: 'localhost', // заменяет Domain в куках
        headers: {
          "Access-Control-Expose-Headers": "X-CSRF-Token", // Разрешаем клиенту видеть заголовок
        },
      },
      '/translate/v2/detect': {
        target: 'https://translate.api.cloud.yandex.net', // ваш бекенд
        changeOrigin: true,  // меняет Origin в заголовках на целевой URL
        secure: false,       // если бекенд на HTTP (не HTTPS)

        // Важно для передачи кук:
        cookieDomainRewrite: 'localhost', // заменяет Domain в куках
        headers: {
          "Access-Control-Expose-Headers": "X-CSRF-Token", // Разрешаем клиенту видеть заголовок
        },
      }
    }
  }
})
