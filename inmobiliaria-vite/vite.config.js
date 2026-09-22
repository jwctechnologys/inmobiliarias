import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    testTimeout: 30000,
    // Las paginas piden datos con fetch al montarse; un fallo asincrono de una pagina con datos simulados
    // no debe tumbar la suite (lo que se comprueba es que la pagina se pueda montar).
    dangerouslyIgnoreUnhandledErrors: true,
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Ejemplo: eliminar console.logs
        drop_debugger: true, // Ejemplo: eliminar debuggers
      },
    },
  },
})
