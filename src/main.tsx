import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

function waitForComicFont() {
  if (!('fonts' in document)) return Promise.resolve()
  // Wait for the comic display font during the single index.html boot splash
  // so React mounts directly into the finished entry gate without a second loader.
  return Promise.race([
    document.fonts.load("1em 'Chronicles Display'").catch(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, 900)),
  ])
}

async function mountPage() {
  const root = document.getElementById('root')!
  const isComic = root.dataset.edition === 'comic'
  // Keep the page import in this one awaited expression: restructuring it makes the
  // bundler drop the comic stylesheet preload and the page ships unstyled.
  const { default: Page } = await (isComic
    ? import('./App').then(async (module) => { await waitForComicFont(); return module })
    : import('./Portfolio'))
  createRoot(root).render(<StrictMode><Page /></StrictMode>)
}

void mountPage().catch(error => {
  console.error(error)
  const status = document.querySelector('[data-boot-status]')
  if (status) status.textContent = 'The comic could not load. Refresh to try again.'
})
