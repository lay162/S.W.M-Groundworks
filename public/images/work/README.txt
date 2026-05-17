S.W.M Groundworks — where to add job photos
==========================================

DROP FILES HERE (on your PC):
  swm-groundsworks/public/images/work/

Use the folder that best matches the job. If you are not sure yet, use misc/.

  driveways/    — block paving, tarmac, resin, gravel drives, paths
  extensions/   — extension builds, roofing stages
  foundations/  — digouts, concrete floors, footings
  fencing/      — fences, gates, panels
  gardens/      — landscaping, lawns, planting, full garden jobs
  patios/       — paving, Indian stone, porcelain, tiles
  porches/      — porch builds and front entrances
  steps/        — steps, stonework, kerbs
  misc/         — anything uncategorised (we will sort these for you)

FILE TIPS
  • JPG or JPEG is best (same as your current photos).
  • Use simple names, e.g. driveway-wirral-2025.jpeg (avoid odd characters).
  • Removing a photo from a folder is fine — it will drop off the site on the next build.
  • After add/remove, run: npm run sync-gallery  (or npm run build — sync runs automatically)

WHEN YOU ARE READY (optional)
  Come back in chat if you want a specific job order (prep → finish) tweaked by hand.

WHAT UPDATES THE SITE:
  • npm run sync-gallery — rebuilds src/data/workGallery.js from these folders
  • npm run build — syncs then builds for GitHub Pages
  • src/App.jsx — SERVICES cards (optional hero image per service)
  • public/BusinessCard/index.html — optional, if you want them on the digital card

Paths always look like:
  /images/work/driveways/your-photo.jpeg
