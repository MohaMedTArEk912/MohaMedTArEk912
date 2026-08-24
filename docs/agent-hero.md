# Builder Profile Hero

The GitHub profile hero is a responsive SVG identity card built around Mohamed's
full-stack & DevOps positioning. It features a portrait-derived ASCII treatment
on the visual panel, paired with engineering telemetry and selected work.

## Generate assets

```bash
node scripts/generate-agent-hero.mjs
# Or with a custom portrait path:
node scripts/generate-agent-hero.mjs --source assets/profile.png
```

The generator produces these cache-versioned files:

- `builder-profile-v2-dark.svg`
- `builder-profile-v2-light.svg`
- `builder-profile-v2-mobile-dark.svg`
- `builder-profile-v2-mobile-light.svg`

## Content sources

- Stable identity and styling live in `scripts/generate-agent-hero.mjs`.
- The five project names and focus labels come from `data/featured-projects.json`.
- Detailed project descriptions, roles, statuses, and links are presented in `README.md`.

## Rendering guarantees

- The portrait and all essential text are visible in the SVG's base state.
- Essential content does not depend on external network requests or JavaScript.
- Motion is limited to quiet decorative ambient scans and honors `prefers-reduced-motion`.
- Desktop and mobile have separate compositions so the information panel remains readable.

## Validate deterministic output

```bash
node scripts/generate-agent-hero.mjs --check
```
