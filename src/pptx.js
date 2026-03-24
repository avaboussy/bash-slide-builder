import PptxGenJS from 'pptxgenjs';
import { BLOCK_COUNTS, BAR_Y } from './state.js';

// Slide dimensions match real templates: 14.222" x 10.667"
const W = 14.222;
const H = 10.667;

const C = {
  black:  '000000',
  red:    'E8001D',
  white:  'FFFFFF',
  yellow: 'FFD600',
  gray:   '1A1A1A',
};

// ── HELPERS ───────────────────────────────────────────────

function bgImage(slide, dataUrl) {
  if (!dataUrl) return;
  slide.addImage({ data: dataUrl, x: 0, y: 0, w: W, h: H });
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
  const key = `intro_${studio.toLowerCase()}`;
  bgImage(slide, assets[key]);
}

function addCorePunchesSlide(pres, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  bgImage(slide, assets['corepunches']);
}

function addWarmupSlide(pres, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  bgImage(slide, assets['warmup']);
}

function addWalkoutSlide(pres, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  bgImage(slide, assets['walkout']);
}

function addJustBashSlide(pres, justBashText, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };
  bgImage(slide, assets['justbash']);

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

// Renders one block slide (bags combos OR floor exercises)
function addBlockSlide(pres, items, dayData, barY, barH, blockType, blockNum, assets) {
  const slide = pres.addSlide();
  slide.background = { color: C.black };

  const count = items.length;
  const cols = Math.min(count, 3);
  const cw = W / cols;

  // Divider lines between columns
  for (let c = 1; c < cols; c++) {
    slide.addShape(pres.ShapeType.rect, {
      x: c * cw, y: barY + H * 0.03, w: 0.025, h: barH * 0.94,
      fill: { color: '333333' }, line: { color: '333333' },
    });
  }

  if (blockType === 'bags') {
    addBagsCombos(slide, pres, items, dayData, barY, barH, cols, cw, assets);
  } else {
    const buyInOn  = blockNum === 1 ? dayData.buyIn1  : dayData.buyIn2;
    const buyInTxt = blockNum === 1 ? dayData.buyInText1  : dayData.buyInText2;
    addFloorExercises(slide, pres, items, dayData, barY, barH, cols, cw, buyInOn, buyInTxt);
  }
}

function addBagsCombos(slide, pres, combos, dayData, barY, barH, cols, cw, assets) {
  const count = combos.length;

  combos.forEach((combo, i) => {
    const col = i % cols;
    const x = col * cw;
    const cellPad = cw * 0.05;

    // Check if this cell should be a full-cell image (freestyle/shoeshine)
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
      // Fallback if image not loaded: styled text
      slide.addText(imgName.toUpperCase(), {
        x: x + cellPad, y: barY, w: cw - cellPad * 2, h: barH,
        fontSize: 28, fontFace: 'Arial Black', bold: true, italic: true,
        color: C.white, align: 'center', valign: 'middle',
      });
      return;
    }

    // Normal combo cell
    const labelH = barH * 0.22;
    const punchH = barH * 0.42;
    const nameH  = barH * 0.28;

    // "COMBO N" label
    slide.addText(`COMBO ${i + 1}`, {
      x: x + cellPad, y: barY + barH * 0.03, w: cw - cellPad * 2, h: labelH,
      fontSize: count <= 3 ? 22 : 16,
      fontFace: 'Arial Black', bold: true, italic: true,
      color: C.red, align: 'center', valign: 'middle', margin: 0,
    });

    // Punch sequence
    if (combo.punches) {
      // Check for inline icons: render yellow for duck/roll/dash tokens
      const tokens = combo.punches.trim().split(/\s+/);
      const ICON_TOKENS = new Set(['duck', 'roll', 'dash', '⚡']);
      const hasIcons = tokens.some(t => ICON_TOKENS.has(t.toLowerCase()));

      if (hasIcons) {
        const runs = tokens.map((tok, ti) => {
          const isIcon = ICON_TOKENS.has(tok.toLowerCase());
          return {
            text: tok.toUpperCase() + (ti < tokens.length - 1 ? ' ' : ''),
            options: {
              color: isIcon ? C.yellow : C.white,
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

    // Combo name
    const displayName = combo.name || autoName(combo.punches);
    if (displayName) {
      slide.addText(displayName.toUpperCase(), {
        x: x + cellPad, y: barY + labelH + punchH + barH * 0.04,
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

  // Buy-in: rendered as a full-width band at the very top of the bar
  // Shrinks the remaining space for exercises when present
  let exBarY = barY;
  let exBarH = barH;

  if (buyInOn && buyInTxt) {
    const buyInH = barH * 0.20;
    // Buy-in background band — blue
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: barY, w: W, h: buyInH,
      fill: { color: '0a1a2e' }, line: { color: '4a9eff', width: 1 },
    });
    // "BUY IN" label
    slide.addText('BUY IN', {
      x: 0, y: barY, w: W * 0.10, h: buyInH,
      fontSize: 10, fontFace: 'Arial Black', bold: true,
      color: '4a9eff', align: 'center', valign: 'middle', margin: 0,
    });
    // Exercise name
    slide.addText(buyInTxt.toUpperCase(), {
      x: W * 0.10, y: barY, w: W * 0.62, h: buyInH,
      fontSize: 16, fontFace: 'Arial Black', bold: true,
      color: C.white, align: 'center', valign: 'middle', charSpacing: 1, margin: 0,
    });
    // "TIMED WITH BAGS" label on the right
    slide.addText('TIMED WITH BAGS', {
      x: W * 0.72, y: barY, w: W * 0.28, h: buyInH,
      fontSize: 11, fontFace: 'Arial Black', bold: true,
      color: '4a9eff', align: 'center', valign: 'middle', charSpacing: 1, margin: 0,
    });
    exBarY = barY + buyInH;
    exBarH = barH - buyInH;
  }

  // Mode label
  slide.addText(isReps ? 'REP BASED' : 'TIMED WITH BAGS', {
    x: 0, y: exBarY + exBarH * 0.02, w: W, h: exBarH * 0.18,
    fontSize: 18, fontFace: 'Arial Black', bold: true,
    color: isReps ? 'FF6600' : C.yellow,
    align: 'center', valign: 'middle', charSpacing: 2, margin: 0,
  });

  exercises.forEach((ex, i) => {
    const col = i % cols;
    const x = col * cw;
    const cellPad = cw * 0.05;
    const labelY  = exBarY + exBarH * 0.22;
    const labelH  = exBarH * 0.22;
    const nameY   = labelY + labelH + exBarH * 0.02;
    const nameH   = exBarH * 0.35;
    const repsY   = nameY + nameH;
    const repsH   = exBarH * 0.15;

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

  const barYFrac = BAR_Y[studio];
  const barY = H * barYFrac;
  const barH = H - barY;

  const count = BLOCK_COUNTS[dayData.type];
  const block1 = dayData.bagsBlock1.slice(0, count);
  const block2 = dayData.bagsBlock2.slice(0, count);

  addIntroSlide(pres, studio, assets);
  addCorePunchesSlide(pres, assets);
  addWarmupSlide(pres, assets);
  addBlockSlide(pres, block1, dayData, barY, barH, 'bags', 1, assets);
  addBlockSlide(pres, block2, dayData, barY, barH, 'bags', 2, assets);
  if (dayData.justBash) addJustBashSlide(pres, dayData.justBashText, assets);
  addWalkoutSlide(pres, assets);

  await pres.writeFile({ fileName: buildFileName(studio, date, 'BAGS', dayData.type) });
}

export async function generateFloorDeck(dayData, dayName, studio, date, assets) {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: 'BASH', width: W, height: H });
  pres.layout = 'BASH';

  const barYFrac = BAR_Y[studio];
  const barY = H * barYFrac;
  const barH = H - barY;

  const count = BLOCK_COUNTS[dayData.type];
  const block1 = dayData.floorBlock1.slice(0, count);
  const block2 = dayData.floorBlock2.slice(0, count);

  addIntroSlide(pres, studio, assets);
  addCorePunchesSlide(pres, assets);
  addWarmupSlide(pres, assets);
  addBlockSlide(pres, block1, dayData, barY, barH, 'floor', 1, assets);
  addBlockSlide(pres, block2, dayData, barY, barH, 'floor', 2, assets);
  if (dayData.justBash) addJustBashSlide(pres, dayData.justBashText, assets);
  addWalkoutSlide(pres, assets);

  await pres.writeFile({ fileName: buildFileName(studio, date, 'FLOOR', dayData.type) });
}
