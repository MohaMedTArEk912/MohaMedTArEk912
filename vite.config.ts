import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function githubPagesPlugin(): Plugin {
  let baseUrl = '/'
  return {
    name: 'github-pages-assets',
    configResolved(config) {
      baseUrl = config.base.endsWith('/') ? config.base : `${config.base}/`
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html']
        if (index?.type !== 'asset') this.error('The comic route requires the built index.html.')

        const comicHtml = String(index.source)
          .replace(/(<link rel="canonical" href="[^"]+\/|<meta property="og:url" content="[^"]+\/)"/g, '$1comic/"')
        this.emitFile({ type: 'asset', fileName: 'comic/index.html', source: comicHtml })
        this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' })

        const notFoundSource = readFileSync(resolve(import.meta.dirname, '404.html'), 'utf8')
          .replaceAll('%BASE_URL%', baseUrl)
        this.emitFile({ type: 'asset', fileName: '404.html', source: notFoundSource })
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    githubPagesPlugin(),
  ],
  build: {
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      input: {
        portfolio: resolve(import.meta.dirname, 'index.html'),
        resume: resolve(import.meta.dirname, 'resume/index.html'),
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-core',
              test: /[\\/]node_modules[\\/]three[\\/]/,
            },
            {
              name: 'r3f-drei',
              test: /[\\/]node_modules[\\/](@react-three|three-stdlib|troika-|maath|suspend-react|camera-controls|meshline)[\\/]/,
            },
            {
              name: 'animation',
              test: /[\\/]node_modules[\\/](gsap|@gsap|lenis|framer-motion|motion-dom|motion-utils)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
