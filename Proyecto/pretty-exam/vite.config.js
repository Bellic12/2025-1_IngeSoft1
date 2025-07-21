import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    electron({
      main: {
        entry: 'electron/main.js',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'sqlite3',
                'sequelize',
                '@libsql/client',
                '@libsql/win32-x64-msvc',
                'pdfjs-dist',
              ],
              plugins: [
                commonjs({
                  include: /node_modules/,
                  dynamicRequireTargets: ['node_modules/sqlite3/lib/sqlite3.js'],
                }),
              ],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.js'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
})
