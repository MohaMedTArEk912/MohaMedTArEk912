import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

async function mountPage() {
  const root = document.getElementById('root')!
  const isComic = root.dataset.edition === 'comic'
  const { default: Page } = await (isComic ? import('./App') : import('./Portfolio'))
  createRoot(root).render(<StrictMode><Page /></StrictMode>)
}

void mountPage().catch(error => {
  console.error(error)
  const status = document.querySelector('[data-boot-status]')
  if (status) status.textContent = 'The comic could not load. Refresh to try again.'
})
