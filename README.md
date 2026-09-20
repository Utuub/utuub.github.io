# Aidan Wasson — personal site

Personal homepage and project demonstration page. Built for **CSCI 310 Project 1**.

Live: https://utuub.github.io/

## Stack

HTML, CSS and plain JavaScript. No framework, no jQuery, no UI component
library — nothing is loaded from a CDN except the two web fonts.

## Structure

```
index.html            personal homepage — the entry point
projects.html         the "My Project" page (Figure 1 / Figure 2 spec)
demo.html             the JavaScript demo — canvas brick breaker
css/
  base.css            design tokens, reset, nav, footer, theme variables
  home.css            homepage layout
  projects.css        the "My Project" grid — every spec number is commented
  demo.css            the demo page
js/
  theme.js            dark/light theme toggle
  main.js             typewriter, scroll reveal, counters, nav, layout watcher
  projects.js         the six blocks, the detail modal, the live filter
  demo.js             the brick breaker game
img/                  hand-written SVG artwork
DEVELOPER-NOTEBOOK.md the development log, including AI prompts and responses
```

## The layout spec

`css/projects.css` implements Figure 1 and Figure 2 exactly, and each number
carries a comment saying which part of the spec it comes from.

| | Figure 1 — desktop | Figure 2 — mobile |
|---|---|---|
| container | 720px | 390px (inner content 300px) |
| title offset from top | 25px | 10px |
| block size | 200 × 150 | 120 × 90 |
| grid | 3 cols × 2 rows | 2 cols × 3 rows |
| column gap | 20px | 10px |
| row gap | 25px | 10px |
| side margins | 40px | centred in the 300px inner area |

Measured in the browser, both match to the pixel. The grid is CSS Grid — no
`<table>` tags are used for layout anywhere on the site.

## The eight JavaScript dynamic effects

The assignment asks for at least five.

1. **Theme toggle** — dark/light, saved in `localStorage`, applied before first
   paint so the page does not flash. `js/theme.js`
2. **Typewriter headline** — types and deletes through five phrases.
   `js/main.js → typewriter()`
3. **Scroll reveal** — `IntersectionObserver` fades sections in as they enter
   the viewport. `js/main.js → scrollReveal()`
4. **Animated counters** — the stat numbers count up when scrolled into view,
   on an ease-out curve. `js/main.js → countUp()`
5. **Mobile nav + scroll spy** — hamburger menu, and the nav link for whichever
   section is on screen is highlighted. `js/main.js`
6. **Layout watcher** — `matchMedia` reports live whether Figure 1 or Figure 2
   is the active layout. `js/main.js → layoutWatcher()`
7. **Project blocks and detail modal** — the six blocks are built from one data
   array and open a detail overlay on click, using event delegation.
   `js/projects.js`
8. **Live filter** — keyword search and tag buttons dim non-matching blocks as
   you type. Non-matches are dimmed rather than removed so the 3 × 2 grid
   geometry required by Figure 1 never changes. `js/projects.js`

Plus the demo itself: a brick breaker on an HTML canvas with a fixed-timestep
loop, axis-aligned collision detection, and mouse / touch / keyboard input.
`js/demo.js`

## Running it locally

```bash
python -m http.server 8765
```

Then open http://localhost:8765/.

## Deploying

Pushed to the `Utuub.github.io` repository, served by GitHub Pages from the
`main` branch root.
