import { state, DAYS, DAY_TYPES, STUDIOS, BLOCK_COUNTS, ABBREV_LABELS } from './state.js';
import { generateBagsDeck, generateFloorDeck } from './pptx.js';

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function autoName(punches) {
  if (!punches) return '';
  const map = {
    '1': 'Jab', '2': 'Cross', '3': 'Front Hook',
    '4': 'Back Hook', '5': 'Front Upper', '6': 'Back Upper',
  };
  const parts = (punches || '').trim().split(/\s+/).filter(Boolean);
  const named = parts.map(x => map[x] || x);
  return named.join(' – ');
}

function setStatus(msg, type = 'loading') {
  const el = document.getElementById('statusbar');
  if (!el) return;
  el.textContent = msg;
  el.className = `statusbar show ${type}`;
}

// ── RENDER ────────────────────────────────────────────────

export function renderAll() {
  renderHeader();
  renderSidebar();
  renderEditor();
}

function renderHeader() {
  // Asset status dots
  const dotContainer = document.getElementById('assetDots');
  if (dotContainer) {
    const KEY_LABELS = {
      'intro_bar': 'Intro Bar',
      'corepunches_none': 'Core (none)', 'corepunches_duck': 'Core+Duck', 'corepunches_roll': 'Core+Roll',
      'corepunches_dash': 'Core+Dash', 'corepunches_duck_roll': 'Core+Duck+Roll',
      'corepunches_duck_dash': 'Core+Duck+Dash', 'corepunches_roll_dash': 'Core+Roll+Dash',
      'corepunches_duck_roll_dash': 'Core+All',
      'warmup_bar': 'Warmup', 'justbash': 'JustBash', 'walkout_bar': 'Walkout',
      'freestyle_3col': 'Freestyle 3', 'freestyle_4col': 'Freestyle 4', 'freestyle_6col': 'Freestyle 6',
      'shoeshine_3col': 'Shoeshine 3', 'shoeshine_4col': 'Shoeshine 4', 'shoeshine_6col': 'Shoeshine 6',
      'bags_3col': 'Bags 3col', 'bags_4col': 'Bags 4col', 'bags_6col': 'Bags 6col',
      'floor_3col_timed': 'Floor 3 Timed', 'floor_3col_reps': 'Floor 3 Reps',
      'floor_3col_timed_buyin': 'Floor 3 Timed+BI', 'floor_3col_reps_buyin': 'Floor 3 Reps+BI',
      'floor_4col_timed': 'Floor 4 Timed', 'floor_4col_reps': 'Floor 4 Reps',
      'floor_4col_timed_buyin': 'Floor 4 Timed+BI', 'floor_4col_reps_buyin': 'Floor 4 Reps+BI',
      'floor_6col_timed': 'Floor 6 Timed', 'floor_6col_reps': 'Floor 6 Reps',
      'floor_6col_timed_buyin': 'Floor 6 Timed+BI', 'floor_6col_reps_buyin': 'Floor 6 Reps+BI',
      'duck': 'Duck', 'roll': 'Roll', 'dash': 'Dash',
    };
    dotContainer.innerHTML = Object.entries(KEY_LABELS).map(([k, label]) => {
      const loaded = !!state.assets[k];
      return `<div class="asset-dot ${loaded ? 'loaded' : 'missing'}" title="${label}: ${loaded ? '✓ loaded' : '✗ missing'}"></div>`;
    }).join('');
  }
}

function renderSidebar() {
  const dayList = document.getElementById('dayList');
  if (!dayList) return;
  dayList.innerHTML = DAYS.map((d, i) => {
    const dd = state.week[i];
    const hasData = dd.bagsBlock1.some(c => c.punches) || dd.floorBlock1.some(e => e.name);
    return `<button class="day-btn ${i === state.day ? 'active' : ''}" onclick="selDay(${i})">
      <span class="dot ${hasData ? 'on' : ''}"></span>
      <span class="dn">${d}</span>
      <span class="dt">${dd.type.split(' ')[0].toUpperCase()}</span>
    </button>`;
  }).join('');
}

function renderEditor() {
  const editor = document.getElementById('editor');
  if (!editor) return;

  const di = state.day;
  const d = state.week[di];
  const dayName = DAYS[di];
  const count = BLOCK_COUNTS[d.type];
  const cols = Math.min(count, 3);
  const gridClass = `cgrid g${cols}`;

  // Type selector
  const typeSelector = DAY_TYPES.map(t =>
    `<button class="type-btn ${d.type === t ? 'active' : ''}" onclick="setType(${di},'${t}')">${t}</button>`
  ).join('');

  // Block of combo cells
  function comboCells(block, blockKey) {
    return Array.from({ length: count }, (_, ci) => {
      const combo = block[ci] || { punches: '', name: '' };
      const gen = autoName(combo.punches);
      const id = `an-${di}-${blockKey}-${ci}`;
      return `<div class="combo-cell">
        <div class="cell-label">Combo ${ci + 1}</div>
        <input class="punches-input" type="text" placeholder="1 2 3 DKF…" value="${esc(combo.punches)}"
          oninput="upCombo(${di},'${blockKey}',${ci},'punches',this.value)">
        <input type="text" placeholder="Name (optional)" value="${esc(combo.name)}"
          oninput="upCombo(${di},'${blockKey}',${ci},'name',this.value)"
          style="margin-top:5px;font-size:11px;">
        <div class="auto-name" id="${id}">
          ${combo.name
            ? `<span style="color:#666">${esc(combo.name)}</span>`
            : gen
              ? `<span style="color:#444">${esc(gen)}</span>`
              : '<span style="color:#2a2a2a">auto-name</span>'}
        </div>
        <label class="nonstop-row">
          <input type="checkbox" ${combo.nonstop ? 'checked' : ''} onchange="upCombo(${di},'${blockKey}',${ci},'nonstop',this.checked)">
          <span class="nonstop-label">NONSTOP</span>
        </label>
      </div>`;
    }).join('');
  }

  // Block of floor cells
  function floorCells(block, blockKey) {
    const blockNum = blockKey === 'floorBlock1' ? 1 : 2;
    const buyInOn  = blockNum === 1 ? d.buyIn1 : d.buyIn2;
    const buyInTxt = blockNum === 1 ? d.buyInText1 : d.buyInText2;
    return Array.from({ length: count }, (_, ei) => {
      const ex = block[ei] || { name: '', reps: '' };
      const isFirst = ei === 0;
      // Exercise 1 has a buy-in toggle that replaces the name field when on
      const buyInToggle = isFirst ? `
        <label class="buyin-ex1-row">
          <input type="checkbox" ${buyInOn ? 'checked' : ''} onchange="toggleBuyIn(${di},${blockNum},this.checked)">
          <span class="buyin-label">Buy In</span>
        </label>` : '';
      // Normal name/reps fields always shown
      const nameField = `<input type="text" placeholder="Exercise name" value="${esc(ex.name)}"
           oninput="upFloor(${di},'${blockKey}',${ei},'name',this.value)">
         ${d.floorMode === 'reps' ? `<input type="text" placeholder="Reps" value="${esc(ex.reps)}"
           oninput="upFloor(${di},'${blockKey}',${ei},'reps',this.value)"
           style="margin-top:4px;font-size:11px;">` : ''}`;

      // Buy-in input shown below when toggled on (replaces the name visually on the slide)
      const buyInField = (isFirst && buyInOn)
        ? `<input type="text" placeholder="Buy-in exercise" value="${esc(buyInTxt)}"
             oninput="upBuyIn(${di},${blockNum},'text',this.value)"
             style="margin-top:4px;font-size:12px;border-color:#4a9eff;">
           <div style="font-size:9px;color:#4a9eff;font-weight:700;letter-spacing:1px;margin-top:3px;">TIMED WITH BAGS</div>`
        : '';

      return `<div class="combo-cell">
        <div class="cell-label">Exercise ${ei + 1}</div>
        ${nameField}
        ${buyInField}
        ${buyInToggle}
      </div>`;
    }).join('');
  }

  // Floor mode toggle
  const floorToggle = `
    <div class="floor-toggle">
      <span class="toggle-label">Mode:</span>
      <div class="toggle-group">
        <button class="toggle-opt ${d.floorMode === 'timed' ? 'active' : ''}" onclick="setFloorMode(${di},'timed')">Timed</button>
        <button class="toggle-opt ${d.floorMode === 'reps' ? 'active' : ''}" onclick="setFloorMode(${di},'reps')">Reps</button>
      </div>
    </div>`;

  // JustBash card
  const justBashCard = `
    <div class="card justbash-card">
      <div class="card-header">
        <span class="card-title">#JustBash Slide</span>
        <span class="card-meta">Optional</span>
      </div>
      <div class="card-body">
        <div class="justbash-row">
          <label class="justbash-toggle">
            <input type="checkbox" ${d.justBash ? 'checked' : ''} onchange="toggleJustBash(${di},this.checked)">
            <span class="toggle-track"></span>
          </label>
          <input type="text" class="justbash-text-input" placeholder="e.g. ISO SQUAT SHOESHINE"
            value="${esc(d.justBashText)}"
            ${!d.justBash ? 'disabled' : ''}
            oninput="upJustBash(${di},this.value)">
        </div>
      </div>
    </div>`;

  editor.innerHTML = `
    <div class="day-header">
      <div class="day-title">${dayName}</div>
      <input class="day-date-input" type="text" placeholder="3.22"
        value="${esc(d.date)}"
        oninput="setDayDate(${di}, this.value)">
      <div class="day-badge">${d.type}</div>
    </div>

    <div class="type-selector">${typeSelector}</div>

    <div class="card cheat-card">
      <div class="card-header">
        <span class="card-title">Abbreviations</span>
        <span class="card-meta">Use in punch sequences</span>
      </div>
      <div class="card-body">
        <div class="cheat-grid">${Object.entries(ABBREV_LABELS).map(([abbr, full]) =>
      `<div class="cheat-item"><span class="cheat-abbr">${abbr}</span><span class="cheat-full">${full}</span></div>`
    ).join('')}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Bag Combos</span>
        <span class="card-meta">${count} per block</span>
      </div>
      <div class="card-body">
        <div class="blocks-grid">
          <div>
            <div class="block-label">Block 1</div>
            <div class="${gridClass}">${comboCells(d.bagsBlock1, 'bagsBlock1')}</div>
          </div>
          <div>
            <div class="block-label">Block 2</div>
            <div class="${gridClass}">${comboCells(d.bagsBlock2, 'bagsBlock2')}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Floor Exercises</span>
        <span class="card-meta">${count} per block</span>
      </div>
      <div class="card-body">
        ${floorToggle}
        <div class="blocks-grid">
          <div>
            <div class="block-label">Block 1</div>
            <div class="${gridClass}">${floorCells(d.floorBlock1, 'floorBlock1')}</div>
          </div>
          <div>
            <div class="block-label">Block 2</div>
            <div class="${gridClass}">${floorCells(d.floorBlock2, 'floorBlock2')}</div>
          </div>
        </div>
      </div>
    </div>

    ${justBashCard}

    <div class="generate-bar">
      <div class="gen-opts">
        <button class="gen-btn" onclick="genDay()">⬇ Generate ${dayName} (2 files)</button>
        <button class="gen-btn secondary" onclick="genWeek()">⬇ Full Week (14 files)</button>
      </div>
      <div id="statusbar" class="statusbar"></div>
    </div>
  `;
}

// ── MUTATIONS ─────────────────────────────────────────────

window.selDay = (i) => { state.day = i; renderSidebar(); renderEditor(); };

window.setDayDate = (i, val) => { state.week[i].date = val; };

window.setType = (di, t) => { state.week[di].type = t; renderSidebar(); renderEditor(); };

window.setFloorMode = (di, mode) => { state.week[di].floorMode = mode; renderEditor(); };

window.upCombo = (di, blockKey, ci, field, val) => {
  // checkboxes come in as booleans already
  state.week[di][blockKey][ci][field] = val;
  if (field === 'punches') {
    const el = document.getElementById(`an-${di}-${blockKey}-${ci}`);
    if (el) {
      const gen = autoName(val);
      el.innerHTML = gen
        ? `<span style="color:#444">${esc(gen)}</span>`
        : '<span style="color:#2a2a2a">auto-name</span>';
    }
  }
  if (field !== 'nonstop') renderSidebar();
};

window.upFloor = (di, blockKey, ei, field, val) => {
  state.week[di][blockKey][ei][field] = val;
  renderSidebar();
};

window.toggleJustBash = (di, checked) => {
  state.week[di].justBash = checked;
  renderEditor();
};

window.upJustBash = (di, val) => {
  state.week[di].justBashText = val;
};

window.toggleBuyIn = (di, blockNum, checked) => {
  if (blockNum === 1) state.week[di].buyIn1 = checked;
  else state.week[di].buyIn2 = checked;
  renderEditor();
};

window.upBuyIn = (di, blockNum, field, val) => {
  if (blockNum === 1) state.week[di].buyInText1 = val;
  else state.week[di].buyInText2 = val;
};

// ── GENERATE ──────────────────────────────────────────────

window.genDay = async () => {
  const dayData = state.week[state.day];
  const dayName = DAYS[state.day];
  setStatus('⏳ Generating 6 files…', 'loading');
  try {
    for (const studio of STUDIOS) {
      await generateBagsDeck(dayData, dayName, studio, dayData.date, state.assets);
      await generateFloorDeck(dayData, dayName, studio, dayData.date, state.assets);
    }
    setStatus(`✓ ${dayData.date || 'DATE'} ${dayName} — 6 files downloaded (all studios)`, 'success');
  } catch (e) {
    setStatus('✗ Error: ' + e.message, 'error');
    console.error(e);
  }
};

window.genWeek = async () => {
  setStatus('⏳ Generating full week (42 files)…', 'loading');
  try {
    for (let i = 0; i < 7; i++) {
      const dayData = state.week[i];
      const dayName = DAYS[i];
      for (const studio of STUDIOS) {
        await generateBagsDeck(dayData, dayName, studio, dayData.date, state.assets);
        await generateFloorDeck(dayData, dayName, studio, dayData.date, state.assets);
      }
    }
    setStatus(`✓ Full week — 42 files downloaded (all studios)`, 'success');
  } catch (e) {
    setStatus('✗ Error: ' + e.message, 'error');
    console.error(e);
  }
};
