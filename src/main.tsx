import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

async function mountPage() {
  const root = document.getElementById('root')!
  const isComic = root.dataset.edition === 'comic'
  const appPromise = isComic ? import('./App') : import('./Portfolio')
  if (isComic && 'fonts' in document) {
    // Wait for the comic display font during the single index.html boot splash
    // so React mounts directly into the finished entry gate without a second loader.
    await Promise.race([
      document.fonts.load("1em 'Chronicles Display'").catch(() => undefined),
      new Promise<void>((resolve) => window.setTimeout(resolve, 900)),
    ])
  }
  const { default: Page } = await appPromise
  createRoot(root).render(<StrictMode><Page /></StrictMode>)
}

void mountPage().catch(error => {
  console.error(error)
  const status = document.querySelector('[data-boot-status]')
  if (status) status.textContent = 'The comic could not load. Refresh to try again.'
})
