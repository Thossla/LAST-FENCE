(() => {
  "use strict";

  const canvas = document.querySelector("#world");
  const ctx = canvas.getContext("2d", { alpha: false });
  const app = document.querySelector("#app");
  const nav = document.querySelector("#showcase-nav");
  const toast = document.querySelector("#toast");

  const scenes = {
    "1": { label: "Menu", screen: "menu", focus: [0, 3], zoom: 7.2, yaw: -0.68, anchor: [.67, .56], base: 5 },
    "2": { label: "Character", screen: "character", focus: [0, -2], zoom: 16.5, yaw: -0.48, anchor: [.51, .6], base: 5 },
    "3": { label: "Inventory", screen: "inventory", focus: [0, -2], zoom: 8.8, yaw: -0.55, anchor: [.46, .56], base: 5 },
    "4": { label: "Enchant", screen: "enchant", focus: [6, 5], zoom: 13.2, yaw: -0.72, anchor: [.5, .58], base: 5 },
    "5": { label: "Arena", screen: "hud", focus: [0, 4], zoom: 6.1, yaw: -0.68, anchor: [.5, .52], base: 5 },
    "6": { label: "Base L1", screen: "hud", focus: [0, 0], zoom: 11.8, yaw: -0.7, anchor: [.52, .56], base: 1 },
    "7": { label: "Base L5", screen: "hud", focus: [0, 0], zoom: 10.2, yaw: -0.7, anchor: [.52, .56], base: 5 },
    "8": { label: "Loot", screen: "hud", focus: [30, -18], zoom: 11.5, yaw: -0.74, anchor: [.52, .56], base: 5 },
    "9": { label: "Boss", screen: "hud", focus: [-32, -22], zoom: 10.7, yaw: -0.58, anchor: [.52, .58], base: 5 },
    "0": { label: "Soul Army", screen: "hud", focus: [17, 2], zoom: 10.2, yaw: -0.66, anchor: [.5, .57], base: 5 }
  };

  const loadouts = {
    "Storm Soldier": {
      accent: "blue", classIcon: "⚡", weapon: "Thunderbolt Rifle", secondary: "Arc Reaper", staff: "Stormcaller Staff",
      armor: ["Tempest Hood", "Stormguard Plate", "Riftwalker Pants", "Windstep Boots"],
      stats: { HP: "1,842", Armor: "257", Damage: "684", "Crit Chance": "22%", "Move Speed": "108%", Lightning: "+48%", "Soul Capacity": "35 / 50" },
      perk: "CHAIN REACTION — Critical hits arc lightning to three nearby enemies."
    },
    "Fire Mage": {
      accent: "orange", classIcon: "🔥", weapon: "Ember Wand", secondary: "Ashen Dagger", staff: "Pyrekeeper Staff",
      armor: ["Cinder Cowl", "Flameweave Robe", "Ashwalker Pants", "Ember Boots"],
      stats: { HP: "1,310", Armor: "144", Damage: "812", "Crit Chance": "18%", "Move Speed": "102%", Fire: "+62%", "Soul Capacity": "20 / 30" },
      perk: "WILDFIRE — Burning enemies spread embers when defeated."
    },
    Tank: {
      accent: "gold", classIcon: "◆", weapon: "Bulwark Hammer", secondary: "Citadel Shield", staff: "Ward Totem",
      armor: ["Ironkeep Helm", "Breaker Plate", "Fortress Greaves", "Anchor Boots"],
      stats: { HP: "3,480", Armor: "512", Damage: "431", "Crit Chance": "8%", "Move Speed": "82%", Block: "+44%", "Soul Capacity": "15 / 20" },
      perk: "LAST STAND — Damage taken is reduced while standing near the fence."
    },
    Necromancer: {
      accent: "violet", classIcon: "☠", weapon: "Soul Reaper", secondary: "Grave Needle", staff: "Soul Staff",
      armor: ["Crown of the Fallen", "Gravetide Mantle", "Wraithbind Pants", "Silent Steps"],
      stats: { HP: "1,520", Armor: "176", Damage: "544", "Crit Chance": "16%", "Move Speed": "99%", Summons: "+38%", "Soul Capacity": "50 / 50" },
      perk: "FALLEN CROWN — Captured boss souls may be summoned as allied units."
    },
    "Speed Assassin": {
      accent: "green", classIcon: "✦", weapon: "Rift Katana", secondary: "Twin Fangs", staff: "Wind Crystal",
      armor: ["Veiled Hood", "Dusk Leather", "Runner Wraps", "Windstep Boots"],
      stats: { HP: "1,245", Armor: "121", Damage: "735", "Crit Chance": "41%", "Move Speed": "138%", Dash: "+2", "Soul Capacity": "18 / 25" },
      perk: "AFTERIMAGE — Dashing through an enemy marks it for a critical strike."
    }
  };

  const items = [
    { name: "Arc Reaper", type: "Weapons", rarity: "Legendary", color: "orange", icon: "⚔", power: 82, desc: "A heavy energy blade forged around a captive Rift spark.", damage: "684", enchant: "Shock III" },
    { name: "Thunderbolt Rifle", type: "Weapons", rarity: "Rare", color: "blue", icon: "⌁", power: 73, desc: "A salvaged coil rifle that charges every third shot.", damage: "442", enchant: "Overcharge II" },
    { name: "Rift Katana", type: "Weapons", rarity: "Epic", color: "violet", icon: "†", power: 79, desc: "A light blade that cuts a violet trail through the Rift.", damage: "518", enchant: "Critical III" },
    { name: "Stormcaller Staff", type: "Staffs", rarity: "Epic", color: "violet", icon: "⚡", power: 74, desc: "Focuses storm energy into chained bolts.", damage: "596", enchant: "Shock II" },
    { name: "Pyrekeeper Staff", type: "Staffs", rarity: "Rare", color: "blue", icon: "🔥", power: 68, desc: "An ember-fed catalyst built for area denial.", damage: "575", enchant: "Burning II" },
    { name: "Stormguard Plate", type: "Armor", rarity: "Legendary", color: "orange", icon: "▰", power: 81, desc: "Reinforced plate threaded with storm conductors.", damage: "Armor 126", enchant: "Ward III" },
    { name: "Tempest Hood", type: "Armor", rarity: "Epic", color: "violet", icon: "◒", power: 76, desc: "A plated hood worn by Rift scouts.", damage: "Armor 42", enchant: "Focus II" },
    { name: "Windstep Boots", type: "Armor", rarity: "Rare", color: "blue", icon: "⌁", power: 70, desc: "Light boots with compressed air cells.", damage: "Armor 31", enchant: "Swiftness II" },
    { name: "Crown of the Fallen", type: "Artifacts", rarity: "Mythic", color: "violet", icon: "♛", power: 91, desc: "Unlocks the Soul Army and permits boss souls to be bound.", damage: "Capacity +25", enchant: "Soul Bond" },
    { name: "Soul Core", type: "Artifacts", rarity: "Epic", color: "violet", icon: "◉", power: 77, desc: "Stores residual will collected from defeated enemies.", damage: "Summons +18%", enchant: "Siphon II" },
    { name: "Wind Crystal", type: "Artifacts", rarity: "Rare", color: "blue", icon: "♦", power: 69, desc: "A humming shard that shortens dash recovery.", damage: "Speed +12%", enchant: "Gust II" },
    { name: "Rift Crystal ×18", type: "Materials", rarity: "Rare", color: "blue", icon: "◆", power: 0, desc: "Used to unlock and improve magical enchantments.", damage: "Material", enchant: "—" },
    { name: "Breaker Soul", type: "Souls", rarity: "Mythic", color: "orange", icon: "☠", power: 95, desc: "The bound siege instinct of THE BREAKER.", damage: "Capacity 15", enchant: "Summonable" },
    { name: "Rift Mage Soul ×3", type: "Souls", rarity: "Epic", color: "violet", icon: "◌", power: 72, desc: "Summons a ranged allied caster.", damage: "Capacity 4", enchant: "Summonable" }
  ];

  const state = {
    scene: "1",
    screen: "menu",
    loadout: "Storm Soldier",
    inventoryTab: "All",
    selectedItem: 0,
    selectedEnchant: "Shock III",
    enchanted: false,
    settings: { bloom: true, particles: true, camera: true },
    camera: { x: 0, y: 3, zoom: 7.2, yaw: -.68, ax: .67, ay: .56 }
  };

  const colorClass = value => value ? value.toLowerCase().replace(/\s+/g, "-") : "blue";
  const gearIcon = name => {
    if (/hood|helm|crown|cowl/i.test(name)) return "◒";
    if (/plate|robe|mantle|leather/i.test(name)) return "▰";
    if (/pants|greaves|wraps/i.test(name)) return "▥";
    if (/boots|steps/i.test(name)) return "⌁";
    if (/staff|totem/i.test(name)) return "⚡";
    if (/rifle/i.test(name)) return "⌐";
    return "⚔";
  };

  function sceneNav() {
    nav.innerHTML = Object.entries(scenes).map(([key, scene]) => `
      <button class="scene-button ${state.scene === key ? "active" : ""}" data-scene="${key}" aria-label="Szene ${key}: ${scene.label}">
        <b>${key}</b>${scene.label}
      </button>`).join("");
  }

  function topbar(title, eyebrow = "SHOWCASE PROTOTYPE") {
    return `<header class="topbar">
      <div class="screen-heading panel"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1></div>
      <button class="back-button" data-action="back">← BACK</button>
    </header>`;
  }

  function renderMenu() {
    return `
      <section class="main-menu panel">
        <div class="brand-mark"><div class="brand-rune"></div><div class="eyebrow">A RIFT-BORN SURVIVAL GAME</div></div>
        <h1 class="title">LAST<br>FENCE</h1>
        <p class="tagline">HOLD THE LINE. CLAIM THE FALLEN.</p>
        <div class="menu-list">
          <button class="menu-button primary" data-scene="5">PLAY</button>
          <button class="menu-button" data-scene="2">CHARACTER</button>
          <button class="menu-button" data-action="loadouts">LOADOUTS</button>
          <button class="menu-button" data-scene="3">ARMORY</button>
          <button class="menu-button" data-action="collection">COLLECTION</button>
          <button class="menu-button" data-action="multiplayer">MULTIPLAYER</button>
          <button class="menu-button" data-action="settings">SETTINGS</button>
          <button class="menu-button danger" data-action="quit">QUIT</button>
        </div>
        <div class="menu-foot"><span>OFFLINE SHOWCASE</span><span>BUILD 0.1</span></div>
      </section>
      <aside class="world-card panel">
        <div class="eyebrow orange">THE FORGOTTEN KEEP</div>
        <h2>SURVIVAL • NIGHTFALL</h2>
        <p>A fractured Rift is drawing the dead toward the last fortified outpost. Upgrade the fence, take the loot and bind your enemies.</p>
      </aside>`;
  }

  function slot(name, label, rarity, power) {
    const tint = rarity === "Legendary" ? "orange" : rarity === "Epic" ? "violet" : "blue";
    return `<div class="gear-slot ${tint}">
      <div class="gear-icon ${tint}">${gearIcon(name)}</div>
      <div><strong>${name}</strong><small>${label} • ${rarity}</small></div>
      <span class="power-tag">${power}</span>
    </div>`;
  }

  function renderCharacter() {
    const build = loadouts[state.loadout];
    const armor = build.armor;
    return `${topbar("CHARACTER", `LEVEL 27 • ${state.loadout.toUpperCase()}`)}
      <section class="equipment-layout">
        <div class="equipment-column panel">
          <div class="column-label">ARMOR</div>
          ${slot(armor[0], "HELMET", armor[0].includes("Crown") ? "Mythic" : "Epic", 76)}
          ${slot(armor[1], "CHESTPLATE", "Legendary", 81)}
          ${slot(armor[2], "PANTS", "Rare", 70)}
          ${slot(armor[3], "BOOTS", "Epic", 74)}
          <div class="column-label" style="margin-top:20px">ARTIFACTS</div>
          ${slot("Soul Core", "ARTIFACT 1", "Epic", 77)}
          ${slot("Wind Crystal", "ARTIFACT 2", "Rare", 69)}
        </div>
        <div class="character-stage" aria-label="3D character stage"></div>
        <div class="stats-column panel">
          <div class="eyebrow ${build.accent}">${build.classIcon} ACTIVE BUILD</div>
          <h2>${state.loadout}</h2>
          <div class="rarity ${build.accent}">POWER 82 • READY</div>
          ${slot(build.weapon, "PRIMARY", "Rare", 73)}
          ${slot(build.secondary, "SECONDARY", "Legendary", 82)}
          ${slot(build.staff, "MAGIC STAFF", "Epic", 74)}
          <div class="stat-list">${Object.entries(build.stats).map(([k, v]) => `<div class="stat-row"><span>${k}</span><strong>${v}</strong></div>`).join("")}</div>
          <div class="perk">${build.perk}</div>
        </div>
        <div class="build-bar panel">
          ${Object.keys(loadouts).map(name => `<button class="chip-button ${name === state.loadout ? "active" : ""}" data-loadout="${name}">${loadouts[name].classIcon} ${name}</button>`).join("")}
        </div>
      </section>`;
  }

  function filteredItems() {
    return state.inventoryTab === "All" ? items : items.filter(item => item.type === state.inventoryTab);
  }

  function renderInventory() {
    const visible = filteredItems();
    if (!visible.includes(items[state.selectedItem])) state.selectedItem = items.indexOf(visible[0]);
    const selected = items[state.selectedItem] || items[0];
    const tabs = ["All", "Weapons", "Armor", "Staffs", "Artifacts", "Materials", "Souls"];
    return `${topbar("INVENTORY", "18 / 30 SLOTS")}
      <section class="inventory-layout">
        <div class="inventory-main panel">
          <div class="tabs">${tabs.map(tab => `<button class="tab-button ${tab === state.inventoryTab ? "active" : ""}" data-tab="${tab}">${tab}</button>`).join("")}</div>
          <div class="item-grid">${visible.map(item => {
            const index = items.indexOf(item);
            return `<button class="item-card ${item.color} ${index === state.selectedItem ? "active" : ""}" data-item="${index}">
              <span class="item-icon ${item.color}">${item.icon}</span><strong>${item.name}</strong><small>${item.rarity}${item.power ? ` • ${item.power}` : ""}</small>
            </button>`;
          }).join("")}</div>
        </div>
        <aside class="detail-panel panel">
          <div class="eyebrow ${selected.color}">${selected.rarity} • ${selected.type}</div>
          <h2>${selected.name}</h2>
          <div class="detail-hero ${selected.color}">${selected.icon}</div>
          <p class="muted">${selected.desc}</p>
          <div class="stat-list">
            <div class="stat-row"><span>POWER</span><strong>${selected.power || "—"}</strong></div>
            <div class="stat-row"><span>PRIMARY STAT</span><strong>${selected.damage}</strong></div>
            <div class="stat-row"><span>ENCHANTMENT</span><strong class="${selected.color}">${selected.enchant}</strong></div>
          </div>
          <button class="action-button" data-action="equip">EQUIP</button>
          ${["Weapons", "Armor", "Staffs"].includes(selected.type) ? `<button class="action-button violet-action" style="margin-top:8px" data-scene="4">ENCHANT</button>` : ""}
        </aside>
      </section>`;
  }

  function renderEnchant() {
    const options = [
      { name: "Shock III", icon: "⚡", color: "violet", text: "Hits have a 30% chance to chain lightning to three targets." },
      { name: "Burning II", icon: "🔥", color: "orange", text: "Targets burn for 160 damage over four seconds." },
      { name: "Frozen II", icon: "❄", color: "blue", text: "Magic hits slow enemies by 35% for three seconds." }
    ];
    return `${topbar("ENCHANT", "RIFT CRYSTALS • 18")}
      <section class="enchant-layout">
        <aside class="enchant-panel panel">
          <div class="column-label">SELECTED ITEM</div>
          <div class="selected-item-card">
            <div class="big-icon violet">⚡</div>
            <h2>Stormcaller Staff</h2>
            <div class="rarity violet">EPIC • POWER ${state.enchanted ? 82 : 74}</div>
            <p class="muted">A storm focus ready to bind one simulated enchantment.</p>
          </div>
        </aside>
        <div class="enchant-panel panel">
          <div class="eyebrow">CHOOSE ONE</div>
          <h2>AVAILABLE ENCHANTMENTS</h2>
          <div class="enchant-options">${options.map(option => `<button class="enchant-card ${option.color} ${option.name === state.selectedEnchant ? "active" : ""}" data-enchant="${option.name}">
            <strong>${option.icon} ${option.name}</strong><p>${option.text}</p>
          </button>`).join("")}</div>
          <button class="action-button violet-action" style="margin-top:14px" data-action="apply-enchant">ENCHANT • COST 6</button>
        </div>
        <aside class="enchant-panel panel">
          <div class="column-label">POWER PREVIEW</div>
          <div class="stat-row"><span>BEFORE</span><strong>74</strong></div>
          <div class="preview-arrow">↓</div>
          <div class="stat-row"><span>AFTER</span><strong class="violet">${state.enchanted ? 82 : "82"}</strong></div>
          <div class="stat-row"><span>MAGIC DAMAGE</span><strong>+28%</strong></div>
          <div class="stat-row"><span>ITEM GLOW</span><strong class="blue">BLUE / VIOLET</strong></div>
          ${state.enchanted ? `<div class="perk green">ENCHANTMENT APPLIED — Visual simulation active.</div>` : ""}
        </aside>
      </section>`;
  }

  function renderCollection() {
    const entries = [
      ["Arc Reaper", "⚔", true], ["Thunderbolt Rifle", "⌐", true], ["Stormcaller Staff", "⚡", true],
      ["Crown of the Fallen", "♛", true], ["THE BREAKER", "◆", true], ["Unknown Boss", "?", false],
      ["Rift Katana", "†", true], ["Undiscovered", "?", false]
    ];
    return `${topbar("COLLECTION", "DISCOVERY CODEX")}
      <section class="collection-layout">
        <aside class="collection-panel panel">
          <div class="collection-categories">
            ${[["Weapons", "18 / 40"], ["Armor", "23 / 60"], ["Staffs", "8 / 20"], ["Artifacts", "11 / 24"], ["Enemies", "14 / 32"], ["Bosses", "1 / 8"], ["Souls", "9 / 32"]].map(row => `<div class="collection-category"><strong>${row[0]}</strong><span>${row[1]}</span></div>`).join("")}
          </div>
        </aside>
        <div class="collection-panel panel"><div class="codex-grid">
          ${entries.map(([name, icon, found]) => `<div class="codex-entry ${found ? "discovered" : ""}"><div class="silhouette">${icon}</div><strong>${name}</strong><div class="rarity ${found ? "blue" : "muted"}">${found ? "DISCOVERED" : "LOCKED"}</div></div>`).join("")}
        </div></div>
      </section>`;
  }

  function renderMultiplayer() {
    const players = [
      ["Player 1", "Storm Soldier", "⚡", false], ["Player 2", "Fire Mage", "🔥", false],
      ["Player 3", "OPEN SLOT", "+", true], ["Player 4", "OPEN SLOT", "+", true]
    ];
    return `${topbar("MULTIPLAYER", "LOCAL LOBBY MOCKUP")}
      <section class="lobby-layout">
        <div class="lobby-panel panel"><div class="player-slots">
          ${players.map(([player, build, icon, empty]) => `<div class="player-slot ${empty ? "empty" : ""}"><div class="eyebrow">${player}</div><div class="player-avatar">${icon}</div><h3>${build}</h3><p>${empty ? "Waiting for player…" : "READY"}</p></div>`).join("")}
        </div></div>
        <aside class="lobby-panel panel">
          <div class="eyebrow blue">HOST GAME</div><h2>THE FORGOTTEN KEEP</h2>
          <div class="stat-list">
            <div class="stat-row"><span>MODE</span><strong>Survival</strong></div>
            <div class="stat-row"><span>DIFFICULTY</span><strong>Normal</strong></div>
            <div class="stat-row"><span>PLAYERS</span><strong>1–4</strong></div>
            <div class="stat-row"><span>FRIENDLY FIRE</span><strong>Off</strong></div>
          </div>
          <button class="action-button" data-action="mock-start">START GAME</button>
          <p class="muted" style="font-size:11px;line-height:1.5">Presentation mockup only. No network connection is created.</p>
        </aside>
      </section>`;
  }

  function renderSettings() {
    return `${topbar("SETTINGS", "OFFLINE SHOWCASE")}
      <section class="settings-layout" style="grid-template-columns:1fr">
        <div class="settings-panel panel" style="max-width:760px;margin:auto;width:100%">
          <div class="eyebrow">PRESENTATION</div><h2>VISUAL SETTINGS</h2>
          ${Object.entries(state.settings).map(([key, on]) => `<div class="setting-row"><div><strong>${key.toUpperCase()}</strong><div class="muted" style="font-size:11px">${key === "camera" ? "Subtle automatic camera drift" : key === "particles" ? "Soul, Rift and ember particles" : "Magical glow intensity"}</div></div><button class="toggle" data-setting="${key}">${on ? "ON" : "OFF"}</button></div>`).join("")}
          <div class="perk" style="margin-top:20px">Keyboard: keys 1–0 switch scenes. Escape returns to the main menu.</div>
        </div>
      </section>`;
  }

  const hudMeta = {
    "5": ["ARENA OVERVIEW", "THE FORGOTTEN KEEP • WAVE 12"],
    "6": ["BASE LEVEL 1", "WOODEN PERIMETER • STARTING OUTPOST"],
    "7": ["BASE LEVEL 5", "ARCANE TOWERS • REINFORCED FENCE"],
    "8": ["LEGENDARY DROP", "GUARDED CACHE • POWER 80+"],
    "9": ["THE BREAKER", "SIEGE GOLEM • BOSS SOUL AVAILABLE"],
    "0": ["SOUL ARMY", "35 / 50 CAPACITY • FOLLOW MODE"]
  };

  function renderHud() {
    const [title, subtitle] = hudMeta[state.scene] || hudMeta["5"];
    return `<section class="hud">
      <div class="hud-block hud-left">
        <div class="resource-row"><span>HP</span><strong>1842 / 1842</strong></div><div class="bar"><span style="width:100%"></span></div>
        <div class="resource-row"><span>ARMOR</span><strong>257</strong></div><div class="bar blue-bar"><span style="width:76%"></span></div>
      </div>
      <div class="hud-block hud-center"><div class="hud-title">WAVE 12</div><div class="hud-subtitle orange">37 ENEMIES REMAINING</div></div>
      <div class="hud-block hud-right">
        <div class="resource-row"><span>SOULS</span><strong class="blue">35 / 50</strong></div>
        <div class="resource-row"><span>SCRAP</span><strong>426</strong></div>
        <div class="resource-row"><span>RIFT CRYSTALS</span><strong class="violet">18</strong></div>
      </div>
      <div class="hud-block hud-bottom-left"><div class="hud-title">${title}</div><div class="hud-subtitle">${subtitle}</div><div class="muted" style="font-size:10px;margin-top:7px">[1–0] SWITCH SCENE • [ESC] MAIN MENU</div></div>
      <div class="hud-block hud-bottom-right">
        <div class="resource-row"><span>BASE HP</span><strong class="orange">76%</strong></div><div class="bar orange-bar"><span style="width:76%"></span></div>
        <div class="resource-row"><span>ARC REAPER</span><strong>READY</strong></div>
        <div class="ability-row"><div class="ability">⚡</div><div class="ability">◉</div><div class="ability">➤</div></div>
      </div>
    </section>`;
  }

  function renderUI() {
    if (state.screen === "menu") app.innerHTML = renderMenu();
    else if (state.screen === "character") app.innerHTML = renderCharacter();
    else if (state.screen === "inventory") app.innerHTML = renderInventory();
    else if (state.screen === "enchant") app.innerHTML = renderEnchant();
    else if (state.screen === "collection") app.innerHTML = renderCollection();
    else if (state.screen === "multiplayer") app.innerHTML = renderMultiplayer();
    else if (state.screen === "settings") app.innerHTML = renderSettings();
    else app.innerHTML = renderHud();
    sceneNav();
  }

  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function setScene(key) {
    if (!scenes[key]) return;
    state.scene = key;
    state.screen = scenes[key].screen;
    renderUI();
  }

  document.addEventListener("click", event => {
    const sceneButton = event.target.closest("[data-scene]");
    if (sceneButton) { setScene(sceneButton.dataset.scene); return; }

    const loadoutButton = event.target.closest("[data-loadout]");
    if (loadoutButton) {
      state.loadout = loadoutButton.dataset.loadout;
      notify(`${state.loadout.toUpperCase()} LOADOUT EQUIPPED`);
      renderUI();
      return;
    }

    const itemButton = event.target.closest("[data-item]");
    if (itemButton) { state.selectedItem = Number(itemButton.dataset.item); renderUI(); return; }
    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) { state.inventoryTab = tabButton.dataset.tab; renderUI(); return; }
    const enchantButton = event.target.closest("[data-enchant]");
    if (enchantButton) { state.selectedEnchant = enchantButton.dataset.enchant; renderUI(); return; }
    const settingButton = event.target.closest("[data-setting]");
    if (settingButton) { const key = settingButton.dataset.setting; state.settings[key] = !state.settings[key]; renderUI(); return; }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === "back") setScene("1");
    else if (action === "loadouts") { setScene("2"); notify("SELECT A BUILD AT THE BOTTOM"); }
    else if (action === "collection") { state.screen = "collection"; renderUI(); }
    else if (action === "multiplayer") { state.screen = "multiplayer"; renderUI(); }
    else if (action === "settings") { state.screen = "settings"; renderUI(); }
    else if (action === "quit") notify("CLOSE THE BROWSER TAB TO EXIT THE OFFLINE SHOWCASE");
    else if (action === "equip") notify(`${items[state.selectedItem].name.toUpperCase()} EQUIPPED`);
    else if (action === "apply-enchant") { state.enchanted = true; notify(`${state.selectedEnchant.toUpperCase()} APPLIED • POWER 82`); renderUI(); }
    else if (action === "mock-start") { setScene("5"); notify("LOCAL SHOWCASE STARTED"); }
  });

  document.addEventListener("keydown", event => {
    if (Object.hasOwn(scenes, event.key)) setScene(event.key);
    else if (event.key === "Escape") setScene("1");
  });

  // --- Lightweight isometric world renderer ---------------------------------

  const palette = {
    ground: "#101c1b", moss: "#17352a", stone: "#3a4650", darkStone: "#1b252c",
    wood: "#5a3018", lightWood: "#8b5028", iron: "#56646c", blue: "#268bea",
    violet: "#7840d4", orange: "#e75824", gold: "#df9d35", bone: "#859078",
    skin: "#8c6248", green: "#173f2d", red: "#7b2931", black: "#11171c"
  };

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    const n = parseInt(value.length === 3 ? value.split("").map(c => c + c).join("") : value, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function shade(hex, factor) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.round(Math.min(255, r * factor))},${Math.round(Math.min(255, g * factor))},${Math.round(Math.min(255, b * factor))})`;
  }

  const objects = [];
  const box = (x, y, z, w, d, h, color, glow = false, group = "world") => objects.push({ kind: "box", x, y, z, w, d, h, color, glow, group });
  const cone = (x, y, z, w, d, h, color, group = "world") => objects.push({ kind: "cone", x, y, z, w, d, h, color, group });
  const orb = (x, y, z, r, color, glow = true, group = "world") => objects.push({ kind: "orb", x, y, z, r, color, glow, group });
  const ring = (x, y, z, r, color, group = "world") => objects.push({ kind: "ring", x, y, z, r, color, group });

  function character(x, y, scale, main, undead = false, group = "world") {
    const skin = undead ? palette.bone : palette.skin;
    box(x, y, .5 * scale, 1.15 * scale, .62 * scale, 2.4 * scale, main, false, group);
    box(x, y, 2.9 * scale, 1.05 * scale, .9 * scale, 1.0 * scale, skin, false, group);
    box(x, y - .54 * scale, .05 * scale, .48 * scale, .44 * scale, 1.25 * scale, palette.darkStone, false, group);
    box(x, y + .54 * scale, .05 * scale, .48 * scale, .44 * scale, 1.25 * scale, palette.darkStone, false, group);
    box(x, y - .85 * scale, 1.0 * scale, .54 * scale, .5 * scale, 1.65 * scale, shade(main, .82), false, group);
    box(x, y + .85 * scale, 1.0 * scale, .54 * scale, .5 * scale, 1.65 * scale, shade(main, .82), false, group);
    if (undead) {
      orb(x - .52 * scale, y - .22 * scale, 3.35 * scale, .08 * scale, palette.blue, true, group);
      orb(x - .52 * scale, y + .22 * scale, 3.35 * scale, .08 * scale, palette.blue, true, group);
    }
  }

  function fence(x, y, alongY, reinforced = false, group = "base") {
    const c = reinforced ? palette.iron : palette.wood;
    const p = reinforced ? palette.darkStone : palette.lightWood;
    if (alongY) {
      box(x, y - 1.25, .05, .34, .34, 2.3, p, false, group); box(x, y + 1.25, .05, .34, .34, 2.3, p, false, group);
      box(x, y, .75, .28, 2.75, .32, c, false, group); box(x, y, 1.55, .28, 2.75, .32, c, false, group);
    } else {
      box(x - 1.25, y, .05, .34, .34, 2.3, p, false, group); box(x + 1.25, y, .05, .34, .34, 2.3, p, false, group);
      box(x, y, .75, 2.75, .28, .32, c, false, group); box(x, y, 1.55, 2.75, .28, .32, c, false, group);
    }
  }

  function tree(x, y, scale = 1) {
    box(x, y, 0, 1.1 * scale, 1.1 * scale, 4.1 * scale, palette.wood);
    cone(x, y, 3.2 * scale, 5.1 * scale, 5.1 * scale, 5.8 * scale, palette.green);
    cone(x, y, 6.3 * scale, 3.8 * scale, 3.8 * scale, 4.4 * scale, shade(palette.green, .78));
  }

  function crystal(x, y, scale, color) {
    box(x, y, 0, .9 * scale, .9 * scale, 3.5 * scale, color, true);
    box(x + 1.1 * scale, y + .2 * scale, 0, .65 * scale, .65 * scale, 2.4 * scale, shade(color, .75), true);
    box(x - .9 * scale, y - .4 * scale, 0, .55 * scale, .55 * scale, 1.9 * scale, shade(color, .62), true);
  }

  function buildWorld() {
    objects.length = 0;
    objects.push({ kind: "ground", x: 0, y: 0, z: -1, w: 120, d: 120, color: palette.ground, group: "world" });
    objects.push({ kind: "ground", x: 0, y: 0, z: -.5, w: 42, d: 42, color: palette.moss, group: "world" });

    // Outer ruins and paths.
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * Math.PI * 2;
      const r = 57;
      box(Math.cos(a) * r, Math.sin(a) * r, 0, 3.2, 4.5, 2.2 + i % 4, i % 3 ? palette.darkStone : palette.stone);
    }
    for (let i = 0; i < 25; i++) {
      const a = i * 2.399;
      const r = 18 + (i % 5) * 4;
      box(Math.cos(a) * r, Math.sin(a) * r, -.35, 2.5, 1.6, .35, i % 3 ? palette.darkStone : palette.stone);
    }

    [[-38,-27,.8],[-44,-18,1],[-41,10,.85],[-35,21,.9],[34,-34,.9],[43,-25,.8],[39,12,.9],[45,23,.78],[19,43,.9],[-18,44,.8],[-31,34,.95]].forEach(p => tree(...p));
    box(-28, 17, 0, 10, 2.1, 6.2, palette.stone); box(-32, 21, 0, 2.1, 8, 4.8, palette.darkStone); box(-26, 17, 6.2, 4.5, 2.3, 1.2, palette.stone);
    crystal(26, 26, 1, palette.blue); crystal(-17, -35, .85, palette.violet);

    // Central outpost.
    objects.push({ kind: "ground", x: 0, y: 0, z: 0, w: 22, d: 22, color: "#202c29", group: "base" });
    for (let i = -4; i <= 4; i++) {
      if (i !== 0) { fence(-11, i * 2.5, true); fence(11, i * 2.5, true); }
      fence(i * 2.5, -11, false); fence(i * 2.5, 11, false);
    }
    // Hero and sword.
    character(0, -2, 1.1, "#225c84", false, "hero");
    box(.3, -3.15, 2.0, .24, .32, 3.3, palette.blue, true, "hero"); box(.3, -3.15, 1.78, 1.3, .3, .22, palette.iron, false, "hero");
    // Base props.
    box(-4.4, 2.2, .1, 2.5, .42, .42, palette.wood); box(-4.4, 2.2, .1, .42, 2.5, .42, palette.wood);
    cone(-4.4, 2.2, .4, 1.5, 1.5, 2.5, palette.orange); orb(-4.4, 2.2, 1.6, .8, palette.orange, true);
    box(-6.2, -5.3, 0, 4.3, 1.7, .55, palette.lightWood); box(-7.6, -5.3, 0, .55, 1.1, 1.3, palette.wood); box(-4.8, -5.3, 0, .55, 1.1, 1.3, palette.wood);
    box(5.8, -5.6, 0, 3.3, 2.2, 1.7, palette.wood); box(5.8, -5.6, 1.4, 3.5, .28, 1.9, palette.iron);
    box(5.8, 4.5, 0, 2.6, 2.6, 1.8, palette.darkStone); crystal(5.8, 4.5, .65, palette.violet);

    // Fortified level-five layer.
    [[-12.5,-12.5],[-12.5,12.5],[12.5,-12.5],[12.5,12.5]].forEach(([x,y]) => {
      box(x, y, 0, 3.4, 3.4, 5.5, palette.darkStone, false, "upgrade");
      box(x, y, 5.2, 4.2, 4.2, .9, palette.iron, false, "upgrade");
      orb(x, y, 6.8, .58, palette.blue, true, "upgrade");
    });
    for (let i = -3; i <= 3; i++) { fence(-12.1, i * 3.1, true, true, "upgrade"); fence(12.1, i * 3.1, true, true, "upgrade"); }

    // Legendary loot site.
    objects.push({ kind: "ground", x: 30, y: -18, z: 0, w: 13, d: 13, color: palette.darkStone, group: "loot" });
    box(30, -18, 0, 5, 3.3, 2.7, palette.wood, false, "loot"); box(30, -18, 2.5, 5.4, 3.6, .8, palette.gold, true, "loot");
    box(28.9, -18, 0, .35, 3.6, 3.1, palette.iron, false, "loot"); box(31.1, -18, 0, .35, 3.6, 3.1, palette.iron, false, "loot");
    orb(30, -18, 3.8, 1.2, palette.gold, true, "loot");
    [[24,-22,.95],[24,-14,.95],[35,-23,1],[36,-13,1.25]].forEach((p,i) => character(p[0],p[1],p[2],i === 3 ? palette.red : palette.wood,false,"loot"));

    // Rift portal.
    box(-5, 38, 0, 2.7, 2.7, 9.5, palette.darkStone, false, "rift"); box(-5, 46, 0, 2.7, 2.7, 9.5, palette.darkStone, false, "rift");
    box(-5, 42, 8.8, 2.7, 10, 2.3, palette.stone, false, "rift");
    for (let i = 0; i < 6; i++) orb(-5.2, 42, 1.7 + i * 1.25, 2.5 - i * .08, i % 2 ? palette.blue : palette.violet, true, "rift");
    ring(-5.1, 42, 5, 4.2, palette.violet, "rift");

    // THE BREAKER.
    const bx = -32, by = -22;
    box(bx, by - 1.7, 0, 3, 2.7, 4.8, palette.darkStone, false, "boss"); box(bx, by + 1.7, 0, 3, 2.7, 4.8, palette.darkStone, false, "boss");
    box(bx, by, 4.2, 6.3, 7.6, 5.2, palette.stone, false, "boss"); box(bx - 1.1, by, 9.2, 3.8, 4.3, 3, palette.iron, false, "boss");
    box(bx, by - 5.1, 3.6, 3.7, 3.5, 7.6, palette.stone, false, "boss"); box(bx, by + 5.1, 3.6, 3.7, 3.5, 7.6, palette.stone, false, "boss");
    orb(bx - 3.2, by, 6.8, 1.45, palette.orange, true, "boss"); box(bx - 3.1, by, 10, .22, 2.2, .5, palette.orange, true, "boss");

    // Necromancer army and souls.
    [[15,4,.9],[16,0,.92],[15,-4,.9],[20,6,1.05],[21,1,1.25],[21,-4,1.15]].forEach((p,i) => character(p[0],p[1],p[2],i%2 ? "#39245b" : "#1c3956",true,"army"));
    for (let i=0;i<6;i++) orb(14+i*1.8,10,2.2+(i%2)*1.1,.42,i%2?palette.violet:palette.blue,true,"army");
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function visibleObject(object) {
    if (object.group === "upgrade") return scenes[state.scene].base === 5;
    if (object.group === "army") return state.scene === "0" || state.scene === "1";
    return true;
  }

  function projection(x, y, z) {
    const cam = state.camera;
    const dx = x - cam.x, dy = y - cam.y;
    const c = Math.cos(cam.yaw), s = Math.sin(cam.yaw);
    const rx = dx * c - dy * s;
    const ry = dx * s + dy * c;
    return [innerWidth * cam.ax + rx * cam.zoom, innerHeight * cam.ay + (ry * .52 - z) * cam.zoom];
  }

  function polygon(points, fill, stroke = null, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(...points[0]);
    for (let i=1;i<points.length;i++) ctx.lineTo(...points[i]);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
  }

  function drawGround(o) {
    const p = [projection(o.x-o.w/2,o.y-o.d/2,o.z),projection(o.x+o.w/2,o.y-o.d/2,o.z),projection(o.x+o.w/2,o.y+o.d/2,o.z),projection(o.x-o.w/2,o.y+o.d/2,o.z)];
    polygon(p, o.color, shade(o.color, 1.2), 1);
  }

  function drawBox(o) {
    const x1=o.x-o.w/2,x2=o.x+o.w/2,y1=o.y-o.d/2,y2=o.y+o.d/2,z1=o.z,z2=o.z+o.h;
    const a=projection(x1,y1,z1),b=projection(x2,y1,z1),c=projection(x2,y2,z1),d=projection(x1,y2,z1);
    const A=projection(x1,y1,z2),B=projection(x2,y1,z2),C=projection(x2,y2,z2),D=projection(x1,y2,z2);
    if (o.glow && state.settings.bloom) {
      const center=projection(o.x,o.y,o.z+o.h/2); ctx.save(); ctx.globalAlpha=.2; ctx.shadowBlur=32; ctx.shadowColor=o.color; ctx.fillStyle=o.color; ctx.beginPath(); ctx.arc(center[0],center[1],Math.max(2,o.w*state.camera.zoom*.55),0,Math.PI*2);ctx.fill();ctx.restore();
    }
    polygon([d,c,C,D], shade(o.color,.70), shade(o.color,.46));
    polygon([b,c,C,B], shade(o.color,.86), shade(o.color,.52));
    polygon([a,d,D,A], shade(o.color,.60), shade(o.color,.42));
    polygon([A,B,C,D], shade(o.color,1.18), shade(o.color,.72));
  }

  function drawCone(o) {
    const z=o.z, top=projection(o.x,o.y,z+o.h);
    const points=[projection(o.x-o.w/2,o.y,z),projection(o.x,o.y-o.d/2,z),projection(o.x+o.w/2,o.y,z),projection(o.x,o.y+o.d/2,z)];
    polygon([points[0],points[1],top],shade(o.color,.72),shade(o.color,.45));
    polygon([points[1],points[2],top],shade(o.color,.92),shade(o.color,.5));
    polygon([points[2],points[3],top],shade(o.color,.62),shade(o.color,.42));
    polygon([points[3],points[0],top],shade(o.color,.78),shade(o.color,.45));
  }

  function drawOrb(o, time) {
    const bob = o.group === "army" ? Math.sin(time*.002 + o.x)*.3 : 0;
    const [x,y]=projection(o.x,o.y,o.z+bob); const r=Math.max(2,o.r*state.camera.zoom);
    ctx.save(); const grad=ctx.createRadialGradient(x-r*.25,y-r*.3,1,x,y,r);
    grad.addColorStop(0,"#ffffff");grad.addColorStop(.18,shade(o.color,1.45));grad.addColorStop(.68,o.color);grad.addColorStop(1,"rgba(0,0,0,0)");
    ctx.globalAlpha=.88;ctx.fillStyle=grad;if(o.glow&&state.settings.bloom){ctx.shadowBlur=r*2.5;ctx.shadowColor=o.color;}ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function drawRing(o, time) {
    const [x,y]=projection(o.x,o.y,o.z); const pulse=1+Math.sin(time*.002)*.08;
    ctx.save();ctx.strokeStyle=o.color;ctx.globalAlpha=.64;ctx.lineWidth=Math.max(2,state.camera.zoom*.22);ctx.shadowBlur=state.settings.bloom?20:0;ctx.shadowColor=o.color;
    ctx.beginPath();ctx.ellipse(x,y,o.r*state.camera.zoom*.48*pulse,o.r*state.camera.zoom*pulse,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  function drawParticles(time) {
    if (!state.settings.particles) return;
    const sources = [[-4.4,2.2,2,palette.orange],[-5,42,5,palette.violet],[30,-18,4,palette.gold]];
    if (state.scene === "0" || state.scene === "1") sources.push([18,5,3,palette.blue]);
    sources.forEach((source, si) => {
      for (let i=0;i<14;i++) {
        const phase=time*.00035+i*1.73+si*5;
        const radius=1.1+(i%5)*.42;
        const px=source[0]+Math.cos(phase*1.7)*radius, py=source[1]+Math.sin(phase*1.3)*radius, pz=source[2]+((phase*2+i)%5);
        const [x,y]=projection(px,py,pz);ctx.save();ctx.globalAlpha=.25+(i%4)*.12;ctx.fillStyle=source[3];ctx.shadowBlur=state.settings.bloom?10:0;ctx.shadowColor=source[3];ctx.beginPath();ctx.arc(x,y,1.2+(i%3),0,Math.PI*2);ctx.fill();ctx.restore();
      }
    });
  }

  function frame(time) {
    const scene=scenes[state.scene];
    const drift=state.settings.camera?Math.sin(time*.00016)*.025:0;
    state.camera.x += (scene.focus[0]-state.camera.x)*.045;
    state.camera.y += (scene.focus[1]-state.camera.y)*.045;
    state.camera.zoom += (scene.zoom-state.camera.zoom)*.045;
    state.camera.yaw += (scene.yaw+drift-state.camera.yaw)*.035;
    state.camera.ax += (scene.anchor[0]-state.camera.ax)*.045;
    state.camera.ay += (scene.anchor[1]-state.camera.ay)*.045;

    const bg=ctx.createLinearGradient(0,0,0,innerHeight);bg.addColorStop(0,"#0d1b29");bg.addColorStop(.55,"#071019");bg.addColorStop(1,"#03070b");ctx.fillStyle=bg;ctx.fillRect(0,0,innerWidth,innerHeight);
    const ground=objects.filter(o=>o.kind==="ground"&&visibleObject(o));ground.forEach(drawGround);
    const rest=objects.filter(o=>o.kind!=="ground"&&visibleObject(o));
    const c=Math.cos(state.camera.yaw),s=Math.sin(state.camera.yaw);
    rest.sort((a,b)=>((a.x-state.camera.x)*s+(a.y-state.camera.y)*c+a.z*.035)-((b.x-state.camera.x)*s+(b.y-state.camera.y)*c+b.z*.035));
    rest.forEach(o=>{if(o.kind==="box")drawBox(o);else if(o.kind==="cone")drawCone(o);else if(o.kind==="orb")drawOrb(o,time);else if(o.kind==="ring")drawRing(o,time);});
    drawParticles(time);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  buildWorld(); resize(); renderUI(); requestAnimationFrame(frame);
})();
