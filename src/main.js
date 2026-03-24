import { loadAssetsFromFolder } from './state.js';
import { renderAll } from './render.js';

document.getElementById('app').innerHTML = `
  <header>
    <div class="logo">BASH<span> GEN</span></div>
    <div class="global-settings">
      <div class="setting-group">
        <span class="setting-label">Studio</span>
        <div class="studio-group" id="studioGroup"></div>
      </div>
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
    </aside>
    <main class="editor" id="editor"></main>
  </div>
`;

loadAssetsFromFolder().then(() => renderAll());
