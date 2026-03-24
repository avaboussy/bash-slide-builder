export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DAY_TYPES = ['Strength', 'Resistance', 'Endurance', 'Power', 'Force', 'Speed & Stamina'];

export const STUDIOS = ['Ballston', 'Rosslyn', 'Mosaic'];

// Combos/exercises PER BLOCK per day type
export const BLOCK_COUNTS = {
  'Strength': 3,
  'Resistance': 3,
  'Endurance': 3,
  'Power': 3,
  'Force': 4,
  'Speed & Stamina': 6,
};

// Exact bar image placement per studio, measured from real templates (inches)
// Ballston/Rosslyn: x=0.721 y=7.963 w=12.780 h=2.703
// Mosaic:           x=0.002 y=3.829 w=14.220 h=3.008
export const BAR_DIMS = {
  'Ballston': { x: 0.721,  y: 7.963, w: 12.780, h: 2.703 },
  'Rosslyn':  { x: 0.721,  y: 7.963, w: 12.780, h: 2.703 },
  'Mosaic':   { x: 0.002,  y: 3.829, w: 14.220, h: 3.008 },
};

// Derived barY/barH for text overlay positioning (used in block slides)
export const BAR_Y = {
  'Ballston': 7.963,
  'Rosslyn':  7.963,
  'Mosaic':   3.829,
};
export const BAR_H = {
  'Ballston': 2.703,
  'Rosslyn':  2.703,
  'Mosaic':   3.008,
};

// All asset keys to attempt loading
// Icons (inline replacements) → /icons/
// Everything else → /images/
export const ALL_ASSET_KEYS = [
  // Inline icons (loaded from /icons/)
  'duck', 'roll', 'dash',
  // Full-cell replacements
  'freestyle_3col', 'freestyle_4col', 'freestyle_6col',
  'shoeshine_3col', 'shoeshine_4col', 'shoeshine_6col',
  // Block background images (bags and floor, all variants)
  'bags_3col', 'bags_4col', 'bags_6col',
  'floor_3col_timed', 'floor_3col_reps',
  'floor_3col_timed_buyin', 'floor_3col_reps_buyin',
  'floor_4col_timed', 'floor_4col_reps',
  'floor_4col_timed_buyin', 'floor_4col_reps_buyin',
  'floor_6col_timed', 'floor_6col_reps',
  'floor_6col_timed_buyin', 'floor_6col_reps_buyin',
  // Single intro bar (positioned per studio)
  'intro_bar',
  // 6 Core Punches — 8 variants based on defense combos present
  'corepunches_none',
  'corepunches_duck',
  'corepunches_roll',
  'corepunches_dash',
  'corepunches_duck_roll',
  'corepunches_duck_dash',
  'corepunches_roll_dash',
  'corepunches_duck_roll_dash',
  // Other shared slides
  'warmup_bar', 'justbash', 'walkout_bar',
];

const INLINE_ICON_KEYS = ['duck', 'roll', 'dash'];

function assetPath(key) {
  if (INLINE_ICON_KEYS.includes(key)) return `/icons/${key}`;
  return `/images/${key}`;
}

const newBlock = () => Array.from({ length: 6 }, () => ({ punches: '', name: '', nonstop: false }));
const newFloorBlock = () => Array.from({ length: 6 }, () => ({ name: '', reps: '' }));

const newDay = () => ({
  type: 'Strength',
  floorMode: 'timed',
  date: '',
  bagsBlock1: newBlock(),
  bagsBlock2: newBlock(),
  floorBlock1: newFloorBlock(),
  floorBlock2: newFloorBlock(),
  buyIn1: false,
  buyInText1: '',
  buyIn2: false,
  buyInText2: '',
  justBash: false,
  justBashText: '',
});

export const state = {
  day: 0,
  week: DAYS.map(() => newDay()),
  assets: {},
};

// Abbreviation → icon key mapping (used in punch sequence parsing)
export const ABBREV_MAP = {
  // Duck variants → duck icon
  'DKF': 'duck', 'DKB': 'duck', 'DKD': 'duck',
  // Roll variants → roll icon
  'RF': 'roll', 'RB': 'roll',
  // Dash variants → dash icon
  'DO': 'dash', 'DI': 'dash',
};

// Full expansion labels for the cheat sheet
export const ABBREV_LABELS = {
  'DKF': 'DUCK FRONT',
  'DKB': 'DUCK BACK',
  'DKD': 'DUCK DOWN',
  'RF':  'ROLL FRONT',
  'RB':  'ROLL BACK',
  'DO':  'DASH OUT',
  'DI':  'DASH IN',
};

// ── ASSET LOADING ─────────────────────────────────────────
const ASSET_EXTS = ['png', 'jpg', 'svg'];

export async function loadAssetsFromFolder() {
  await Promise.all(
    ALL_ASSET_KEYS.map(async (key) => {
      const base = assetPath(key);
      for (const ext of ASSET_EXTS) {
        try {
          const res = await fetch(`${base}.${ext}`);
          if (res.ok) {
            const blob = await res.blob();
            state.assets[key] = await blobToDataURL(blob);
            break;
          }
        } catch { /* silently skip */ }
      }
    })
  );
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
