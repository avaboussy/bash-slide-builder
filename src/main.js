import { loadAssetsFromFolder } from './state.js';
import { renderAll } from './render.js';

document.getElementById('app').innerHTML = `
  <header>
    <div class="logo">BASH<span> GEN</span></div>
    <div class="global-settings">
      <div class="setting-group">
        <span class="setting-label">Date</span>
        <input type="text" id="dateInput" placeholder="3.22" oninput="setDateVal(this.value)">
      </div>
      <div class="asset-status" id="assetDots" title="Asset load status — hover each dot"></div>
    </div>
  </header>

  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Days</div>
        <div id="dayList"></div>
      </div>
      <div class="divider"></div>
      <div class="sidebar-section">
        <div class="sidebar-label">Abbreviations</div>
        <div class="cheatsheet">
          <div class="cheat-row"><span class="cheat-abbrev">DKF</span><span class="cheat-full">Duck Front</span></div>
          <div class="cheat-row"><span class="cheat-abbrev">DKB</span><span class="cheat-full">Duck Back</span></div>
          <div class="cheat-row"><span class="cheat-abbrev">DKD</span><span class="cheat-full">Duck Down</span></div>
          <div class="cheat-row"><span class="cheat-abbrev">RF</span><span class="cheat-full">Roll Front</span></div>
          <div class="cheat-row"><span class="cheat-abbrev">RB</span><span class="cheat-full">Roll Back</span></div>
          <div class="cheat-row"><span class="cheat-abbrev">DO</span><span class="cheat-full">Dash Out</span></div>
          <div class="cheat-row"><span class="cheat-abbrev">DI</span><span class="cheat-full">Dash In</span></div>
        </div>
      </div>
    </aside>
    <main class="editor" id="editor"></main>
  </div>
`;

loadAssetsFromFolder().then(() => renderAll());
