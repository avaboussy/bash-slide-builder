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

// Bar start Y as fraction of slide height
// Ballston/Rosslyn = bottom bar, Mosaic = middle
export const BAR_Y = {
  'Ballston': 0.747,
  'Rosslyn':  0.747,
  'Mosaic':   0.359,
};

// All asset keys to attempt loading
// Icons (inline replacements) → /icons/
// Everything else → /images/
export const ALL_ASSET_KEYS = [
  'duck', 'roll', 'dash',
  'freestyle_3col', 'freestyle_4col', 'freestyle_6col',
  'shoeshine_3col', 'shoeshine_4col', 'shoeshine_6col',
  'intro_ballston', 'intro_rosslyn', 'intro_mosaic',
  'corepunches', 'warmup', 'justbash', 'walkout',
];

const INLINE_ICON_KEYS = ['duck', 'roll', 'dash'];

function assetPath(key) {
  if (INLINE_ICON_KEYS.includes(key)) return `/icons/${key}`;
  return `/images/${key}`;
}

const newBlock = () => Array.from({ length: 6 }, () => ({ punches: '', name: '' }));
const newFloorBlock = () => Array.from({ length: 6 }, () => ({ name: '', reps: '' }));

const newDay = () => ({
  type: 'Strength',
  floorMode: 'timed',
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
  studio: 'Ballston',
  date: '',
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
