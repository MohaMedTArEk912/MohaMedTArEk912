import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

async function mountPage() {
  const root = document.getElementById('root')!
  const isComic = root.dataset.edition === 'comic'
  const { default: Page } = await (isComic ? import('./App') : import('./Portfolio'))
  const intro = document.querySelector('.archive-boot')
  if (intro && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const start = performance.getEntriesByName('comic-intro-start')[0]?.startTime ?? performance.now()
    const hold = Math.max(0, 1350 - (performance.now() - start))
    await new Promise(resolve => setTimeout(resolve, hold))
    intro.classList.add('departing')
    await new Promise(resolve => setTimeout(resolve, 320))
  }
  createRoot(root).render(<StrictMode><Page /></StrictMode>)
}

void mountPage().catch(error => {
  console.error(error)
  const status = document.querySelector('[data-boot-status]')
  if (status) status.textContent = 'The comic could not load. Refresh to try again.'
})
