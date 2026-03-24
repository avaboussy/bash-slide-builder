# Images

Drop your image files here. The app auto-loads them at startup and places each
one at the correct position for each studio.

All files support `.png`, `.jpg`, or `.svg` — tried in that order, first match wins.

---

## How positioning works

Every image is a **bar image** — it covers the content area of the slide, not
the full slide. The app places it at the exact coordinates for each studio:

| Studio | x | y | w | h |
|--------|---|---|---|---|
| Ballston / Rosslyn | 0.721" | 7.963" | 12.780" | 2.703" |
| Mosaic | 0.002" | 3.829" | 14.220" | 3.008" |

You provide one image per slide type. The app handles the positioning.

The one exception is `justbash.png` — that's a full slide image (14.222" × 10.667").

---

## What the app draws on top of your images

The app overlays **only the variable content** — everything else should be in
your image:

**Bags block slides:** punch sequences, combo names, NONSTOP label
**Floor block slides:** exercise names, reps (if reps mode), buy-in exercise name
**JustBash slide:** the yellow text underneath #JUSTBASH
**Core Punches slide:** nothing — the whole bar including any defense icons is in your image

Labels like "COMBO 1", "EXERCISE 1", "TIMED WITH BAGS", "REP BASED", divider
lines, and all decorative elements should be baked into your images.

---

## Fixed slide images

One image per slide type. Used on every deck regardless of day type.

| File | Slide |
|------|-------|
| `intro_bar.png` | Welcome / intro slide |
| `warmup_bar.png` | Warmup slide |
| `walkout_bar.png` | Walk-out slide — swap this monthly |
| `justbash.png` | #JustBash slide — **full slide**, not a bar |

---

## 6 Core Punches — 8 variants

The app parses the day's combos to detect which defense moves are present
(duck = DKF/DKB/DKD, roll = RF/RB, dash = DO/DI), then picks the matching image.
Falls back to `corepunches_none` if a specific variant isn't found.

| File | When used |
|------|-----------|
| `corepunches_none.png` | No defense moves in any combo |
| `corepunches_duck.png` | Duck only |
| `corepunches_roll.png` | Roll only |
| `corepunches_dash.png` | Dash only |
| `corepunches_duck_roll.png` | Duck + Roll |
| `corepunches_duck_dash.png` | Duck + Dash |
| `corepunches_roll_dash.png` | Roll + Dash |
| `corepunches_duck_roll_dash.png` | All three |

---

## Block slide backgrounds — 15 images

These are the combo and exercise block slides. The app picks the right image
based on column count, floor mode, and whether buy-in is active on Exercise 1.

"Buy-in" variants are used when the Buy In toggle is on for that block —
your image should show Exercise 1 labelled as a buy-in rather than a normal exercise.

### Bags blocks (3 images)

| File | Used for |
|------|----------|
| `bags_3col.png` | Strength, Resistance, Endurance, Power |
| `bags_4col.png` | Force |
| `bags_6col.png` | Speed & Stamina |

### Floor blocks (12 images)

| File | Used for |
|------|----------|
| `floor_3col_timed.png` | 3-col, Timed With Bags |
| `floor_3col_reps.png` | 3-col, Rep Based |
| `floor_3col_timed_buyin.png` | 3-col, Timed With Bags, buy-in on Ex 1 |
| `floor_3col_reps_buyin.png` | 3-col, Rep Based, buy-in on Ex 1 |
| `floor_4col_timed.png` | 4-col (Force), Timed With Bags |
| `floor_4col_reps.png` | 4-col (Force), Rep Based |
| `floor_4col_timed_buyin.png` | 4-col, Timed With Bags, buy-in on Ex 1 |
| `floor_4col_reps_buyin.png` | 4-col, Rep Based, buy-in on Ex 1 |
| `floor_6col_timed.png` | 6-col (Speed & Stamina), Timed With Bags |
| `floor_6col_reps.png` | 6-col, Rep Based |
| `floor_6col_timed_buyin.png` | 6-col, Timed With Bags, buy-in on Ex 1 |
| `floor_6col_reps_buyin.png` | 6-col, Rep Based, buy-in on Ex 1 |

---

## Full-cell replacement images

These replace an entire combo or exercise cell when "freestyle" or "shoeshine"
is typed into a combo field. Provide one pre-scaled version per column count
so they fill the cell correctly.

| File | Used when |
|------|-----------|
| `freestyle_3col.png` | Freestyle cell in a 3-col block |
| `freestyle_4col.png` | Freestyle cell in a 4-col block (Force) |
| `freestyle_6col.png` | Freestyle cell in a 6-col block (Speed & Stamina) |
| `shoeshine_3col.png` | Shoeshine cell in a 3-col block |
| `shoeshine_4col.png` | Shoeshine cell in a 4-col block |
| `shoeshine_6col.png` | Shoeshine cell in a 6-col block |

---

## Summary — total images needed

| Category | Count |
|----------|-------|
| Fixed slides (intro, warmup, walkout, justbash) | 4 |
| Core Punches variants | 8 |
| Bags block backgrounds | 3 |
| Floor block backgrounds | 12 |
| Freestyle / Shoeshine cell replacements | 6 |
| **Total** | **33** |
