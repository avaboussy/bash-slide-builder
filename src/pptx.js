import PptxGenJS from 'pptxgenjs';
import { BLOCK_COUNTS, BAR_DIMS, BAR_Y, BAR_H, ABBREV_MAP } from './state.js';

// Slide dimensions match real templates: 14.222" x 10.667"
const W = 14.222;
const H = 10.667;

const C = {
  black:  '000000',
  red:    'E8001D',
  white:  'FFFFFF',
  yellow: 'FFD600',
  blue:   '4a9eff',
  gray:   '1A1A1A',
};

// ── HELPERS ───────────────────────────────────────────────

// Place a bar image at exact studio-specific coordinates
function barImage(slide, dataUrl, studio) {
  if (!dataUrl) return;
  const d = BAR_DIMS[studio] || BAR_DIMS['Ballston'];
  slide.addImage({ data: dataUrl, x: d.x, y: d.y, w: d.w, h: d.h });
}

function colCount(dayType) {
  const n = BLOCK_COUNTS[dayType];
  return Math.min(n, 3); // always 3 cols max per row
}

// Returns the correct full-cell image key for freestyle/shoeshine
// based on how many combos are in this block
function cellImageKey(name, blockCount) {
  const col = blockCount <= 3 ? 3 : blockCount <= 4 ? 4 : 6;
  return `${name}_${col}col`;
}

// Parse a punch string and substitute inline icon images where recognised.
// Returns an array of pptxgenjs text-run objects.
function punchRuns(punchStr, assets, fontSize) {
  const INLINE = {
    duck:  'duck',
    roll:  'roll',
    dash:  'dash',
    '⚡':  'dash',
  };

  const tokens = (punchStr || '').trim().split(/\s+/);
  const runs = [];

  tokens.forEach((tok, i) => {
    const lower = tok.toLowerCase();
    const iconKey = INLINE[lower];
    const dataUrl = iconKey && assets[iconKey];

    if (dataUrl) {
      // pptxgenjs doesn't support inline images in text runs directly,
      // so we fall back to the text token styled differently
      runs.push({ text: tok.toUpperCase(), options: { color: C.yellow, bold: true, fontSize } });
    } else {
      runs.push({ text: tok.toUpperCase(), options: { color: C.white, bold: true, fontSize } });
    }
    if (i < tokens.length - 1) runs.push({ text: ' ', options: { fontSize } });
  });

  return runs;
}

// ── SLIDE BUILDERS ────────────────────────────────────────

function addIntroSlide(pres, studio, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  barImage(slide, assets['intro_bar'], studio);
}

// Parse all combos in a day to find unique defense types present
function detectDefense(dayData) {
  const DUCK_ABBREVS  = new Set(['dkf','dkb','dkd','duck']);
  const ROLL_ABBREVS  = new Set(['rf','rb','roll']);
  const DASH_ABBREVS  = new Set(['do','di','dash']);
  const defense = { duck: false, roll: false, dash: false };

  const allBlocks = [
    ...dayData.bagsBlock1, ...dayData.bagsBlock2,
  ];
  for (const combo of allBlocks) {
    const tokens = (combo.punches || '').toLowerCase().split(/\s+/);
    for (const tok of tokens) {
      if (DUCK_ABBREVS.has(tok)) defense.duck = true;
      if (ROLL_ABBREVS.has(tok)) defense.roll = true;
      if (DASH_ABBREVS.has(tok)) defense.dash = true;
    }
  }
  return defense;
}

function addCorePunchesSlide(pres, dayData, studio, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };

  const defense = detectDefense(dayData);
  const parts = [];
  if (defense.duck) parts.push('duck');
  if (defense.roll) parts.push('roll');
  if (defense.dash) parts.push('dash');
  const key = parts.length > 0
    ? 'corepunches_' + parts.join('_')
    : 'corepunches_none';

  barImage(slide, assets[key] || assets['corepunches_none'], studio);
}

function addWarmupSlide(pres, studio, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  barImage(slide, assets['warmup_bar'], studio);
}

function addWalkoutSlide(pres, studio, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  barImage(slide, assets['walkout_bar'], studio);
}

function addJustBashSlide(pres, justBashText, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  if (assets['justbash']) slide.addImage({ data: assets['justbash'], x: 0, y: 0, w: W, h: H });

  if (justBashText) {
    // Yellow text overlaid below the #JUSTBASH graphic
    // Based on real slide: text sits at roughly y=88% of slide height
    slide.addText(justBashText.toUpperCase(), {
      x: 0, y: H * 0.875, w: W, h: H * 0.08,
      fontSize: 20,
      fontFace: 'Arial',
      bold: true,
      color: C.yellow,
      align: 'center',
      valign: 'middle',
      charSpacing: 2,
      margin: 0,
    });
  }
}

// Build the background image key for a block slide
function blockBgKey(blockType, count, floorMode, buyInOn) {
  const col = count <= 3 ? 3 : count <= 4 ? 4 : 6;
  if (blockType === 'bags') return `bags_${col}col`;
  const mode = floorMode === 'reps' ? 'reps' : 'timed';
  const buyin = buyInOn ? '_buyin' : '';
  return `floor_${col}col_${mode}${buyin}`;
}

// Renders one block slide (bags combos OR floor exercises)
function addBlockSlide(pres, items, dayData, barY, barH, blockType, blockNum, studio, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };

  const count = items.length;
  const cols = Math.min(count, 3);
  const cw = W / cols;
  const buyInOn = blockNum === 1 ? dayData.buyIn1 : dayData.buyIn2;

  // Place the background bar image
  const bgKey = blockBgKey(blockType, count, dayData.floorMode, buyInOn);
  barImage(slide, assets[bgKey], studio);

  if (blockType === 'bags') {
    addBagsCombos(slide, pres, items, dayData, barY, barH, cols, cw, assets);
  } else {
    const buyInTxt = blockNum === 1 ? dayData.buyInText1 : dayData.buyInText2;
    addFloorExercises(slide, pres, items, dayData, barY, barH, cols, cw, buyInOn, buyInTxt);
  }
}

function addBagsCombos(slide, pres, combos, dayData, barY, barH, cols, cw, assets) {
  const count = combos.length;

  // Token classifier: returns 'abbrev', 'icon', or 'number'
  // Abbreviations expand to their icon parent for rendering
  function classifyToken(tok) {
    const upper = tok.toUpperCase();
    if (ABBREV_MAP[upper]) return 'abbrev';
    const lower = tok.toLowerCase();
    if (['duck', 'roll', 'dash'].includes(lower)) return 'icon';
    return 'number';
  }

  combos.forEach((combo, i) => {
    const col = i % cols;
    const x = col * cw;
    const cellPad = cw * 0.05;

    // Full-cell image check (freestyle / shoeshine)
    const pLower = (combo.punches || '').toLowerCase().trim();
    const nLower = (combo.name || '').toLowerCase().trim();
    const isFreestyle = pLower === 'freestyle' || nLower === 'freestyle';
    const isShoeshine = pLower === 'shoeshine' || nLower === 'shoeshine';

    if (isFreestyle || isShoeshine) {
      const imgName = isFreestyle ? 'freestyle' : 'shoeshine';
      const imgKey = cellImageKey(imgName, count);
      const dataUrl = assets[imgKey];
      if (dataUrl) {
        slide.addImage({ data: dataUrl, x, y: barY, w: cw, h: barH });
        return;
      }
      slide.addText(imgName.toUpperCase(), {
        x: x + cellPad, y: barY, w: cw - cellPad * 2, h: barH,
        fontSize: 28, fontFace: 'Arial Black', bold: true, italic: true,
        color: C.white, align: 'center', valign: 'middle',
      });
      return;
    }

    // Layout: shrink punch area slightly when nonstop is on to fit the extra line
    const hasNonstop = !!combo.nonstop;
    const labelH    = barH * 0.22;
    const punchH    = barH * (hasNonstop ? 0.35 : 0.42);
    const nonstopH  = barH * 0.10;
    const nameH     = barH * (hasNonstop ? 0.22 : 0.28);

    // "COMBO N" label
    slide.addText(`COMBO ${i + 1}`, {
      x: x + cellPad, y: barY + barH * 0.03, w: cw - cellPad * 2, h: labelH,
      fontSize: count <= 3 ? 22 : 16,
      fontFace: 'Arial Black', bold: true, italic: true,
      color: C.red, align: 'center', valign: 'middle', margin: 0,
    });

    // Punch sequence — abbrevs and icon words both render yellow
    if (combo.punches) {
      const tokens = combo.punches.trim().split(/\s+/);
      const needsRuns = tokens.some(t => {
        const type = classifyToken(t);
        return type === 'abbrev' || type === 'icon';
      });

      if (needsRuns) {
        const runs = tokens.map((tok, ti) => {
          const type = classifyToken(tok);
          const isHighlight = type === 'abbrev' || type === 'icon';
          return {
            text: tok.toUpperCase() + (ti < tokens.length - 1 ? ' ' : ''),
            options: {
              color: isHighlight ? C.yellow : C.white,
              bold: true,
              fontSize: count <= 3 ? 48 : 32,
              fontFace: 'Arial Black',
            },
          };
        });
        slide.addText(runs, {
          x: x + cellPad, y: barY + labelH + barH * 0.03,
          w: cw - cellPad * 2, h: punchH,
          align: 'center', valign: 'middle', margin: 0,
        });
      } else {
        slide.addText(combo.punches.toUpperCase(), {
          x: x + cellPad, y: barY + labelH + barH * 0.03,
          w: cw - cellPad * 2, h: punchH,
          fontSize: count <= 3 ? 48 : 32,
          fontFace: 'Arial Black', bold: true,
          color: C.white, align: 'center', valign: 'middle',
          charSpacing: 3, margin: 0,
        });
      }
    }

    // NONSTOP label — blue, between punch and name
    if (hasNonstop) {
      const nonstopY = barY + labelH + barH * 0.03 + punchH;
      slide.addText('NONSTOP', {
        x: x + cellPad, y: nonstopY, w: cw - cellPad * 2, h: nonstopH,
        fontSize: count <= 3 ? 14 : 10,
        fontFace: 'Arial', bold: true,
        color: C.blue, align: 'center', valign: 'middle',
        charSpacing: 2, margin: 0,
      });
    }

    // Combo name
    const displayName = combo.name || autoName(combo.punches);
    if (displayName) {
      const nameY = barY + labelH + barH * 0.03 + punchH + (hasNonstop ? nonstopH : barH * 0.04);
      slide.addText(displayName.toUpperCase(), {
        x: x + cellPad, y: nameY,
        w: cw - cellPad * 2, h: nameH,
        fontSize: count <= 3 ? 14 : 10,
        fontFace: 'Arial', bold: true,
        color: C.yellow, align: 'center', valign: 'top',
        charSpacing: 1, margin: 0,
      });
    }
  });
}

function addFloorExercises(slide, pres, exercises, dayData, barY, barH, cols, cw, buyInOn, buyInTxt) {
  const count = exercises.length;
  const isReps = dayData.floorMode === 'reps';

  // Mode label
  slide.addText(isReps ? 'REP BASED' : 'TIMED WITH BAGS', {
    x: 0, y: barY + barH * 0.02, w: W, h: barH * 0.18,
    fontSize: 18, fontFace: 'Arial Black', bold: true,
    color: isReps ? 'FF6600' : C.yellow,
    align: 'center', valign: 'middle', charSpacing: 2, margin: 0,
  });

  exercises.forEach((ex, i) => {
    const col = i % cols;
    const x = col * cw;
    const cellPad = cw * 0.05;
    const labelY  = barY + barH * 0.22;
    const labelH  = barH * 0.22;
    const nameY   = labelY + labelH + barH * 0.02;
    const nameH   = barH * 0.35;
    const repsY   = nameY + nameH;
    const repsH   = barH * 0.15;

    // Exercise 1 with buy-in: replace name with buy-in text + "TIMED WITH BAGS"
    if (i === 0 && buyInOn && buyInTxt) {
      // "EXERCISE 1" label — keep it
      slide.addText('EXERCISE 1', {
        x: x + cellPad, y: labelY, w: cw - cellPad * 2, h: labelH,
        fontSize: count <= 3 ? 20 : 14,
        fontFace: 'Arial Black', bold: true, italic: true,
        color: C.red, align: 'center', valign: 'middle', margin: 0,
      });
      // Buy-in exercise name
      slide.addText(buyInTxt.toUpperCase(), {
        x: x + cellPad, y: nameY, w: cw - cellPad * 2, h: nameH,
        fontSize: count <= 3 ? 20 : 14,
        fontFace: 'Arial', bold: true,
        color: C.white, align: 'center', valign: 'middle', margin: 0,
      });
      // "TIMED WITH BAGS" in blue
      slide.addText('TIMED WITH BAGS', {
        x: x + cellPad, y: repsY, w: cw - cellPad * 2, h: repsH,
        fontSize: count <= 3 ? 11 : 9,
        fontFace: 'Arial', bold: true,
        color: C.blue, align: 'center', valign: 'middle',
        charSpacing: 1, margin: 0,
      });
      return;
    }

    // "EXERCISE N" label
    slide.addText(`EXERCISE ${i + 1}`, {
      x: x + cellPad, y: labelY, w: cw - cellPad * 2, h: labelH,
      fontSize: count <= 3 ? 20 : 14,
      fontFace: 'Arial Black', bold: true, italic: true,
      color: C.red, align: 'center', valign: 'middle', margin: 0,
    });

    // Exercise name
    if (ex.name) {
      slide.addText(ex.name.toUpperCase(), {
        x: x + cellPad, y: nameY, w: cw - cellPad * 2, h: nameH,
        fontSize: count <= 3 ? 22 : 15,
        fontFace: 'Arial', bold: true,
        color: C.white, align: 'center', valign: 'middle', margin: 0,
      });
    }

    // Reps
    if (isReps && ex.reps) {
      slide.addText(`${ex.reps} REPS`, {
        x: x + cellPad, y: repsY, w: cw - cellPad * 2, h: repsH,
        fontSize: 12, fontFace: 'Arial', bold: true,
        color: C.yellow, align: 'center', margin: 0,
      });
    }
  });
}

// ── FILENAME ──────────────────────────────────────────────

function buildFileName(studio, date, deckType, dayType) {
  // e.g. "BALLSTON 3.22 BAGS STRENGTH.pptx"
  const parts = [
    studio.toUpperCase(),
    date || 'DATE',
    deckType.toUpperCase(),
    dayType.toUpperCase(),
  ];
  return parts.join(' ') + '.pptx';
}

// ── AUTO-NAME ─────────────────────────────────────────────

function autoName(punches) {
  if (!punches) return '';
  const map = {
    '1': 'Jab', '2': 'Cross', '3': 'Front Hook',
    '4': 'Back Hook', '5': 'Front Upper', '6': 'Back Upper',
  };
  const parts = punches.trim().split(/\s+/).filter(Boolean);
  const named = parts.map(p => map[p] || p);
  return named.join(' – ');
}

// ── PUBLIC API ────────────────────────────────────────────

export async function generateBagsDeck(dayData, dayName, studio, date, assets) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE'; // 13.333" x 7.5" — closest standard; we override below
  pres.defineLayout({ name: 'BASH', width: W, height: H });
  pres.layout = 'BASH';

  const barY = BAR_Y[studio];
  const barH = BAR_H[studio];

  const count = BLOCK_COUNTS[dayData.type];
  const block1 = dayData.bagsBlock1.slice(0, count);
  const block2 = dayData.bagsBlock2.slice(0, count);

  addIntroSlide(pres, studio, assets);
  addCorePunchesSlide(pres, dayData, studio, assets);
  addWarmupSlide(pres, studio, assets);
  addBlockSlide(pres, block1, dayData, barY, barH, 'bags', 1, studio, assets);
  addBlockSlide(pres, block2, dayData, barY, barH, 'bags', 2, studio, assets);
  if (dayData.justBash) addJustBashSlide(pres, dayData.justBashText, assets);
  addWalkoutSlide(pres, studio, assets);

  await pres.writeFile({ fileName: buildFileName(studio, date, 'BAGS', dayData.type) });
}

export async function generateFloorDeck(dayData, dayName, studio, date, assets) {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: 'BASH', width: W, height: H });
  pres.layout = 'BASH';

  const barY = BAR_Y[studio];
  const barH = BAR_H[studio];

  const count = BLOCK_COUNTS[dayData.type];
  const block1 = dayData.floorBlock1.slice(0, count);
  const block2 = dayData.floorBlock2.slice(0, count);

  addIntroSlide(pres, studio, assets);
  addCorePunchesSlide(pres, dayData, studio, assets);
  addWarmupSlide(pres, studio, assets);
  addBlockSlide(pres, block1, dayData, barY, barH, 'floor', 1, studio, assets);
  addBlockSlide(pres, block2, dayData, barY, barH, 'floor', 2, studio, assets);
  if (dayData.justBash) addJustBashSlide(pres, dayData.justBashText, assets);
  addWalkoutSlide(pres, studio, assets);

  await pres.writeFile({ fileName: buildFileName(studio, date, 'FLOOR', dayData.type) });
}
