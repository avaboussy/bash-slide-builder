import { loadAssetsFromFolder } from './state.js';
import { renderAll } from './render.js';

document.getElementById('app').innerHTML = `
  <header>
    <div class="logo">BASH<span> GEN</span></div>
    <div class="global-settings">
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
