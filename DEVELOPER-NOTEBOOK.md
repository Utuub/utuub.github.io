# Developer Notebook — CSCI 310 Project 1

Aidan Wasson · Fall 2026

> The syllabus says this course allows and encourages AI use, and that all
> development activity gets documented here whether AI was used or not. AI was
> used on this project, and this file is the record of where and how.
>
> **Destination note:** the handout says to document prompts and responses on
> the course Document Site. Per Dr. Chang's Brightspace note on the Project1
> event, that site is not ready, so the documentation goes in a Markdown
> template he attached instead:
> https://drive.google.com/file/d/1JlNtA5-0rTN6G04hLxeMMfWBZXxHb1T7/view
> The submission also has to include the source code and the presentation
> slides. This file is the source to paste into that template.

---

## Session 1 — Sat Sep 19, 2026

### What I asked for

I asked Claude (Anthropic's assistant, running in Claude Code) to get the
project moving ahead of a full working session, with the assignment handout and
the CSCI 310 syllabus as context. The request was broad rather than
step-by-step: read the requirements, then build a starting point.

The relevant constraints it was working from, all from the handout:

- A project page titled "My Project" with six reserved blocks
- Exact Figure 1 and Figure 2 geometry
- A personal homepage as the entry point, since I did not have one
- Hosted on GitHub Pages
- CSS in `css/`, JS in `js/`
- jQuery or pure JavaScript only — no Vue, React or Angular
- At least five client-side JavaScript dynamic effects
- Images and text, both of which change between the desktop and mobile layouts
- No `<table>` tags for layout

### What came back

A full working site: three pages, four stylesheets, four scripts, and nine
hand-written SVG images. Content for the homepage came from my own resume
rather than being invented — the internships, the projects, the GPA and the
graduation date are all real.

Design decisions it made, which I am keeping:

- **Plain JavaScript over jQuery.** Everything the project needs is a few lines
  of `querySelector` and `addEventListener`. Pulling in jQuery would have added
  a dependency to save nothing.
- **Eight effects rather than five.** The rubric puts 50% of the website grade
  on the JavaScript effects, so overshooting the minimum is cheap insurance.
- **The filter dims blocks instead of hiding them.** My first instinct would
  have been `display: none` on non-matches. That breaks the 3 × 2 grid that
  Figure 1 specifies and that 30% of the grade is checking. Dimming keeps the
  geometry fixed. This was the most useful single decision in the build.
- **Every spec number in `projects.css` carries a comment** naming which part of
  Figure 1 or Figure 2 it comes from, so the layout is auditable without
  measuring it.

### What I checked rather than trusted

The layout was measured in a real browser with `getBoundingClientRect`, not
eyeballed. Desktop: 720px container, title 25px below the top, 200 × 150
blocks, 20px column gap, 25px row gap, 40px side margins, 3 × 2, zero `<table>`
elements. Mobile, loaded in a 390px frame so the media query applied: 390px
container, 300px inner content, 120 × 90 blocks, 10px gaps, 2 × 3, title 10px
below the top. All exact.

### Bug found and fixed during testing

The demo page overlay ("Press Space to start") is absolutely positioned on top
of the canvas, so it swallowed the canvas click handler — clicking the game to
start it did nothing, because the click never reached the canvas. Fixed by
adding a click listener to the overlay itself. This only turned up by actually
trying to start the game rather than reading the code.

### Still to do

- [ ] Push to `Utuub.github.io` and turn on GitHub Pages
- [ ] Play-test the game properly and tune the ball speed if it feels slow
- [ ] Build the 4-minute presentation slides
- [ ] Decide whether block 6 stays "Reserved" or gets a real project
- [ ] Zip the files plus the slides and submit to Brightspace

---

## Notes on working this way

The part AI was genuinely good at was the mechanical precision — turning a
figure with a dozen measurements on it into CSS that measures back exactly, and
then verifying that in a browser instead of assuming. The part that still needed
a decision was the tradeoff underneath the filter: hiding versus dimming is a
two-line difference in the code and the difference between meeting and breaking
the layout requirement.

I can explain every file in this project, which is the standard that matters at
the demo.
