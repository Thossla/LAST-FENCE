(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const ui = {
    start: document.querySelector("#start"), help: document.querySelector("#instructions"), over: document.querySelector("#gameover"), hud: document.querySelector("#hud"),
    heroHealth: document.querySelector("#heroHealth"), heroMeter: document.querySelector("#heroMeter"), manaValue: document.querySelector("#manaValue"), manaMeter: document.querySelector("#manaMeter"), keepHealth: document.querySelector("#keepHealth"), keepMeter: document.querySelector("#keepMeter"),
    wave: document.querySelector("#wave"), objective: document.querySelector("#objective"), enemyCount: document.querySelector("#enemyCount"), souls: document.querySelector("#souls"), scrap: document.querySelector("#scrap"), levelValue: document.querySelector("#levelValue"), xpMeter: document.querySelector("#xpMeter"), xpValue: document.querySelector("#xpValue"),
    fenceHealth: document.querySelector("#fenceHealth"), fenceMeter: document.querySelector("#fenceMeter"), fenceStatus: document.querySelector("#fenceStatus"), toast: document.querySelector("#toast"), summary: document.querySelector("#summary"), loadout: document.querySelector("#loadout-screen"), loadoutGrid: document.querySelector("#loadout-grid"), loadoutStats: document.querySelector("#loadout-stats"),
    inventory: document.querySelector("#inventory-screen"), inventoryGrid: document.querySelector("#inventory-grid"), inventoryDetail: document.querySelector("#inventory-detail"), inventoryTabs: document.querySelector("#inventory-tabs"),
    enchant: document.querySelector("#enchant-screen"), enchantGrid: document.querySelector("#enchant-grid"), enchantWeapon: document.querySelector("#enchant-weapon"), lootReveal: document.querySelector("#loot-reveal"), interaction: document.querySelector("#interaction")
  };

  const palette = { ground: "#10251f", groundAlt: "#17332a", grid: "#4c7b67", wood: "#73401f", woodLight: "#b96f35", iron: "#839292", stone: "#344b47", dark: "#071219", green: "#79dca9", orange: "#f48a4c", red: "#ee5e59", blue: "#66beff", violet: "#b399ff", gold: "#f4ca72", white: "#eaf5ef" };
  const world = { width: 4600, height: 3300, keep: { x: 1740, y: 1260, w: 1120, h: 780 }, artifact: { x: 2300, y: 1650 } };
  const keys = Object.create(null);
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, down: false };
  let previousTime = performance.now();

  const state = {
    mode: "menu", hero: null, enemies: [], bullets: [], particles: [], drops: [], fences: [],
    artifactHp: 250, artifactMaxHp: 250, artifactFlash: 0, scrap: 0, souls: 0, kills: 0, wave: 0, spawnLeft: 0, spawnTimer: 0, nextWaveTimer: 0,
    elapsed: 0, fireTimer: 0, manaFireTimer: 0, dashTimer: 0, summonTimer: 0, toastTimer: 0, bannerTimer: 0, nextEnemy: 1, mapOpen: false, loadoutOpen: false,
    level: 1, xp: 0, xpToLevel: 100, levelDamage: 0, camera: { x: 0, y: 0, ready: false }, equipment: { boots: 0, pants: 0, chest: 0, helmet: 0, artifact1: 0, artifact2: 0, artifact3: 0, weapon: 0, manaWeapon: 0 },
    inventory: [], inventoryFilter: "ALL", selectedInventory: 0, nextInventoryId: 1, inventoryOpen: false, enchantOpen: false, lootOpen: false, activeCache: null,
    riftDust: 30, weaponLevel: 1, armorLevel: 1, weaponEnchant: "none", allies: []
  };

  const enemyKinds = {
    scavenger: { name: "SCAVENGER", hp: 48, speed: 55, damage: 8, attack: .82, radius: 17, color: "#b35c49", reward: 5 },
    raider: { name: "RAIDER", hp: 34, speed: 84, damage: 6, attack: .68, radius: 14, color: "#d58945", reward: 6 },
    mauler: { name: "MAULER", hp: 122, speed: 31, damage: 19, attack: 1.1, radius: 29, color: "#8a3f46", reward: 16 },
    hexer: { name: "RIFT HEXER", hp: 78, speed: 43, damage: 12, attack: 1.28, radius: 21, color: "#7049a4", reward: 14 },
    guardian: { name: "CACHE GUARDIAN", hp: 210, speed: 38, damage: 17, attack: .92, radius: 32, color: "#916a35", reward: 25 },
    breaker: { name: "THE BREAKER", hp: 680, speed: 23, damage: 34, attack: 1.05, radius: 52, color: "#6c3a46", reward: 55 }
  };

  const gearSlots = {
    boots: { label: "SCHUHE", options: [{ name: "Wanderstiefel", bonus: "Geschwindigkeit +0" }, { name: "Rift-Läufer", bonus: "Tempo +24" }, { name: "Kriegsstiefel", bonus: "Leben +12" }] },
    pants: { label: "HOSE", options: [{ name: "Feldhose", bonus: "Keine Werte" }, { name: "Nebelgamaschen", bonus: "Mana +18" }, { name: "Bollwerk-Beinschutz", bonus: "Leben +20" }] },
    chest: { label: "BRUSTPLATTE", options: [{ name: "Jägerweste", bonus: "Leben +10" }, { name: "Arkane Platten", bonus: "Mana +25" }, { name: "Titanenpanzer", bonus: "Leben +38" }] },
    helmet: { label: "HELM", options: [{ name: "Aufklärerhelm", bonus: "Keine Werte" }, { name: "Warden's Helm", bonus: "Aim Assist +" }, { name: "Rift-Krone", bonus: "Schaden +7" }] },
    artifact1: { label: "ARTEFAKT I", options: [{ name: "Leerer Sockel", bonus: "Seelen verbessern Ausrüstung" }, { name: "Sonnenkern", bonus: "Leben +18" }, { name: "Nekromanten-Siegel", bonus: "G: Seelen beschwören" }] },
    artifact2: { label: "ARTEFAKT II", options: [{ name: "Leerer Sockel", bonus: "—" }, { name: "Mondsplitter", bonus: "Mana-Regen +3" }, { name: "Kriegsrune", bonus: "Schaden +5" }] },
    artifact3: { label: "ARTEFAKT III", options: [{ name: "Leerer Sockel", bonus: "—" }, { name: "Bollwerksamulett", bonus: "Artefakt-HP +50" }, { name: "Glücksmünze", bonus: "Loot +" }] },
    weapon: { label: "WAFFE", options: [{ name: "Arc Reaper", bonus: "Schaden 25" }, { name: "Sonnenklinge", bonus: "Schaden +9" }, { name: "Rift-Kanone", bonus: "Schaden +16" }] },
    manaWeapon: { label: "MANA-WAFFE", options: [{ name: "Blauer Stab", bonus: "F: 60 Schaden" }, { name: "Void-Katalysator", bonus: "F: 80 Schaden" }, { name: "Sturmfokus", bonus: "F: Kette +" }] }
  };

  const supplyCaches = [
    { id: "northwest", x: 690, y: 620, rarity: "SELTEN", color: "#63aaff", label: "RARE SUPPLY DROP", reward: { name: "Thunderbolt Rifle", category: "WEAPONS", description: "Schnelle Rift-Fernwaffe mit präzisem Dreifachkern.", stats: "+9 Primärschaden", equip: { slot: "weapon", index: 1 }, icon: "➤" } },
    { id: "northeast", x: 3920, y: 650, rarity: "EPISCH", color: "#c48cff", label: "EPIC ARCANE DROP", reward: { name: "Stormcaller Staff", category: "WEAPONS", description: "Ein Blitzstab, dessen Entladung zwischen Zielen springt.", stats: "F: Kettenblitz · 30 Mana", equip: { slot: "manaWeapon", index: 2 }, icon: "ϟ" } },
    { id: "southwest", x: 720, y: 2670, rarity: "LEGENDÄR", color: "#ffad46", label: "LEGENDARY WARDEN CACHE", reward: { name: "Tempest Cuirass", category: "ARMOR", description: "Schwere Wächterplatte mit eingebrannten Sturmrunen.", stats: "+25 Mana · hohe Rüstung", equip: { slot: "chest", index: 1 }, icon: "♜" } },
    { id: "southeast", x: 3900, y: 2670, rarity: "MYTHISCH", color: "#ff5dbb", label: "SOULBOUND RELIC", reward: { name: "Nekromanten-Siegel", category: "ARTIFACTS", description: "Nur dieses Artefakt kann gefallene Seelen als Verbündete binden.", stats: "G: 3 Seelen beschwören", equip: { slot: "artifact1", index: 2 }, icon: "☠" } },
    { id: "north", x: 2300, y: 360, rarity: "UNGEWÖHNLICH", color: "#71dc9e", label: "RIFT MATERIAL CACHE", reward: { name: "Runenstaub-Kassette", category: "MATERIALS", description: "Verdichteter Staub für die Verzauberungsschmiede.", stats: "+45 Riftstaub", dust: 45, icon: "✦" } }
  ];

  const enchantments = {
    none: { name: "UNVERZAUBERT", color: "#91a3aa", cost: 0, icon: "◇", description: "Reiner Waffenschaden ohne zusätzlichen Effekt." },
    burning: { name: "GLUTSCHLAG", color: "#ff7a3d", cost: 24, icon: "♨", description: "Treffer entzünden Gegner für anhaltenden Feuerschaden." },
    shock: { name: "STURMKETTE", color: "#55c8ff", cost: 32, icon: "ϟ", description: "Treffer leiten Blitzschaden auf einen zweiten Gegner weiter." },
    frost: { name: "FROSTBISS", color: "#9de8ff", cost: 28, icon: "❄", description: "Getroffene Gegner werden mehrere Sekunden verlangsamt." },
    vampiric: { name: "SEELENDURST", color: "#e75b87", cost: 38, icon: "♥", description: "Ein Teil des verursachten Schadens heilt den Wächter." }
  };
  const decorations = buildDecorations();

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function random(min, max) { return min + Math.random() * (max - min); }
  function buildDecorations() {
    let seed = 84731; const rand = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646, result = { trees: [], ruins: [], rocks: [], crystals: [], fires: [], banners: [] };
    const free = (x, y) => !(x > world.keep.x - 190 && x < world.keep.x + world.keep.w + 190 && y > world.keep.y - 190 && y < world.keep.y + world.keep.h + 190) && !supplyCaches.some(cache => Math.hypot(cache.x - x, cache.y - y) < 190);
    for (let i = 0; i < 170; i++) { const x = 80 + rand() * (world.width - 160), y = 80 + rand() * (world.height - 160); if (free(x, y)) result.trees.push([x, y, .45 + rand() * .8]); }
    for (let i = 0; i < 54; i++) { const x = 100 + rand() * (world.width - 200), y = 100 + rand() * (world.height - 200); if (free(x, y)) result.rocks.push([x, y, .45 + rand() * .9]); }
    for (let i = 0; i < 29; i++) { const x = 160 + rand() * (world.width - 320), y = 160 + rand() * (world.height - 320); if (free(x, y)) result.crystals.push([x, y, .5 + rand() * .65, i % 3 ? "#6b62ff" : "#c058ff"]); }
    for (let i = 0; i < 24; i++) { const x = 190 + rand() * (world.width - 380), y = 170 + rand() * (world.height - 340); if (free(x, y)) result.ruins.push([x, y, .55 + rand() * .85]); }
    for (let i = 0; i < 18; i++) { const x = 190 + rand() * (world.width - 380), y = 170 + rand() * (world.height - 340); if (free(x, y)) result.fires.push([x, y]); }
    return result;
  }
  function shade(hex, amount) {
    const value = parseInt(hex.slice(1), 16);
    const r = clamp(((value >> 16) & 255) * amount, 0, 255) | 0;
    const g = clamp(((value >> 8) & 255) * amount, 0, 255) | 0;
    const b = clamp((value & 255) * amount, 0, 255) | 0;
    return `rgb(${r}, ${g}, ${b})`;
  }

  function stats() {
    const gear = state.equipment;
    const health = (gear.boots === 2 ? 12 : 0) + (gear.pants === 2 ? 20 : 0) + (gear.chest === 0 ? 10 : gear.chest === 2 ? 38 : 0) + (gear.artifact1 === 1 ? 18 : 0);
    const mana = (gear.pants === 1 ? 18 : 0) + (gear.chest === 1 ? 25 : 0);
    const damage = state.levelDamage + (gear.helmet === 2 ? 7 : 0) + (gear.artifact2 === 2 ? 5 : 0) + [25, 34, 41][gear.weapon] + (state.weaponLevel - 1) * 5;
    const manaCosts = [24, 35, 30];
    return { maxHp: 100 + (state.level - 1) * 15 + health + (state.armorLevel - 1) * 12, maxMana: 60 + (state.level - 1) * 12 + mana, speed: 230 + (gear.boots === 1 ? 24 : 0), manaRegen: 8 + (gear.artifact2 === 1 ? 3 : 0), damage, manaDamage: [60, 92, 74][gear.manaWeapon] + (state.weaponLevel - 1) * 4, manaCost: manaCosts[gear.manaWeapon], aimAssist: .16 + (gear.helmet === 1 ? .10 : 0), xpMultiplier: 1, lootLuck: gear.artifact3 === 2 ? .14 : 0, artifactMaxHp: 250 + (gear.artifact3 === 1 ? 50 : 0), canSummon: gear.artifact1 === 2 };
  }

  function applyStats() {
    const values = stats(), oldArtifactMaxHp = state.artifactMaxHp || values.artifactMaxHp;
    state.artifactMaxHp = values.artifactMaxHp; state.artifactHp = Math.min(state.artifactMaxHp, state.artifactHp + Math.max(0, values.artifactMaxHp - oldArtifactMaxHp));
    if (!state.hero) return;
    const hero = state.hero, oldMaxHp = hero.maxHp || values.maxHp, oldMaxMana = hero.maxMana || values.maxMana;
    hero.maxHp = values.maxHp; hero.maxMana = values.maxMana; hero.hp = Math.min(hero.maxHp, hero.hp + Math.max(0, hero.maxHp - oldMaxHp)); hero.mana = Math.min(hero.maxMana, (hero.mana || 0) + Math.max(0, hero.maxMana - oldMaxMana));
  }

  function renderLoadout() {
    ui.loadoutGrid.innerHTML = "";
    Object.entries(gearSlots).forEach(([key, slot]) => {
      const option = slot.options[state.equipment[key]], button = document.createElement("button");
      button.className = "loadout-slot"; button.type = "button"; button.dataset.slot = key;
      button.innerHTML = `<small>${slot.label}</small><strong>${option.name}</strong><small>${option.bonus} · klicken zum Wechseln</small>`; ui.loadoutGrid.appendChild(button);
    });
    const value = stats(); ui.loadoutStats.innerHTML = [["LEBEN", value.maxHp], ["RÜSTUNG", `STUFE ${state.armorLevel}`], ["SCHADEN", value.damage], ["WAFFE", `STUFE ${state.weaponLevel}`], ["MANA", value.maxMana], ["MANA-REGEN", `${value.manaRegen}/s`], ["RIFT-ARTEFAKT", `${value.artifactMaxHp} HP`], ["SEELENKRAFT", value.canSummon ? "BESCHWÖRUNG" : "UPGRADES"]].map(([label, number]) => `<div><span>${label}</span><b>${number}</b></div>`).join("");
  }

  function openLoadout() { closePanels(); state.loadoutOpen = true; renderLoadout(); ui.loadout.classList.remove("hidden"); if (state.mode === "menu") ui.start.classList.add("hidden"); }
  function closeLoadout() { state.loadoutOpen = false; ui.loadout.classList.add("hidden"); if (state.mode === "menu") ui.start.classList.remove("hidden"); }

  function rarityColor(rarity) { return ({ "GEWÖHNLICH": "#d9e2df", "UNGEWÖHNLICH": "#71dc9e", "SELTEN": "#63aaff", "EPISCH": "#c48cff", "LEGENDÄR": "#ffad46", "MYTHISCH": "#ff5dbb" })[rarity] || "#63aaff"; }

  function addInventory(item) { state.inventory.push({ id: state.nextInventoryId++, color: rarityColor(item.rarity), ...item }); if (!state.selectedInventory) state.selectedInventory = state.inventory[state.inventory.length - 1].id; }

  function seedInventory() {
    state.inventory = []; state.nextInventoryId = 1; state.selectedInventory = 0;
    [
      { name: "Arc Reaper", rarity: "LEGENDÄR", category: "WEAPONS", description: "Energieschwert der letzten Wächter.", stats: "+25 Schaden · Aim Assist", equip: { slot: "weapon", index: 0 } },
      { name: "Warden's Helm", rarity: "SELTEN", category: "ARMOR", description: "Helm mit Rift-Visor.", stats: "+Aim Assist", equip: { slot: "helmet", index: 1 } },
      { name: "Sonnenkern", rarity: "UNGEWÖHNLICH", category: "ARTIFACTS", description: "Ein defensiver Kern für längere Belagerungen.", stats: "+18 Leben", equip: { slot: "artifact1", index: 1 }, icon: "☀" },
      { name: "Rift Crystal", rarity: "UNGEWÖHNLICH", category: "MATERIALS", description: "Magisches Upgrade-Material.", stats: "Verzauberungs-Material" },
      { name: "Grunt Soul", rarity: "GEWÖHNLICH", category: "SOULS", description: "Eine gebundene Rifts Seele.", stats: "Beschwörbar" }
    ].forEach(addInventory);
  }

  function renderInventory() {
    const items = state.inventory.filter(item => state.inventoryFilter === "ALL" || item.category === state.inventoryFilter);
    if (!items.some(item => item.id === state.selectedInventory)) state.selectedInventory = items[0]?.id || 0;
    ui.inventoryGrid.innerHTML = "";
    if (!items.length) ui.inventoryGrid.innerHTML = "<p class=\"empty-inventory\">Keine Gegenstände in dieser Kategorie.</p>";
    items.forEach(item => { const button = document.createElement("button"); button.className = `inventory-item${item.id === state.selectedInventory ? " selected" : ""}`; button.type = "button"; button.dataset.itemId = item.id; button.style.setProperty("--rarity", item.color); button.innerHTML = `<i>${item.icon || (item.category === "WEAPONS" ? "⚔" : item.category === "ARMOR" ? "♜" : item.category === "ARTIFACTS" ? "◆" : "✦")}</i><span><small>${item.rarity}</small><b>${item.name}</b><small>${item.category}</small></span>`; ui.inventoryGrid.appendChild(button); });
    const selected = state.inventory.find(item => item.id === state.selectedInventory); if (!selected) { ui.inventoryDetail.innerHTML = "<p>Wähle einen Gegenstand aus.</p>"; return; }
    const equipped = selected.equip && state.equipment[selected.equip.slot] === selected.equip.index;
    const action = selected.equip ? `<button class=\"secondary inventory-equip\" type=\"button\" data-equip-slot=\"${selected.equip.slot}\" data-equip-index=\"${selected.equip.index}\">${equipped ? "AUSGERÜSTET" : "AUSRÜSTEN"}</button>` : `<p class=\"collection-note\">SAMMLUNGSGEGENSTAND</p>`;
    const upgradable = selected.category === "WEAPONS" || selected.category === "ARMOR", upgradeLevel = selected.category === "WEAPONS" ? state.weaponLevel : state.armorLevel, soulCost = 4 + upgradeLevel * 3, canUpgrade = upgradable && !stats().canSummon;
    const upgrade = upgradable ? `<button class=\"soul-upgrade\" type=\"button\" data-soul-upgrade=\"${selected.category}\" ${canUpgrade ? "" : "disabled"}>${canUpgrade ? `MIT ${soulCost} SEELEN AUF STUFE ${upgradeLevel + 1}` : "SEELEN SIND AN DAS NEKROMANTEN-SIEGEL GEBUNDEN"}</button>` : "";
    ui.inventoryDetail.style.setProperty("--rarity", selected.color); ui.inventoryDetail.innerHTML = `<div class=\"detail-rune\">${selected.icon || "◆"}</div><p class=\"rarity-label\">${selected.rarity}</p><h3>${selected.name}</h3><p>${selected.description}</p><p class=\"item-statline\"><b>WERTE</b><br>${selected.stats}${upgradable ? ` · Upgrade-Stufe ${upgradeLevel}` : ""}</p>${action}${upgrade}`;
    const vaultSouls = document.querySelector("#vault-souls"), vaultScrap = document.querySelector("#vault-scrap"), vaultDust = document.querySelector("#vault-dust"); if (vaultSouls) vaultSouls.textContent = state.souls; if (vaultScrap) vaultScrap.textContent = state.scrap; if (vaultDust) vaultDust.textContent = state.riftDust;
  }

  function closePanels() { state.loadoutOpen = false; state.inventoryOpen = false; state.enchantOpen = false; ui.loadout.classList.add("hidden"); ui.inventory.classList.add("hidden"); ui.enchant.classList.add("hidden"); }
  function openInventory() { closePanels(); state.inventoryOpen = true; renderInventory(); ui.inventory.classList.remove("hidden"); if (state.mode === "menu") ui.start.classList.add("hidden"); }
  function closeInventory() { state.inventoryOpen = false; ui.inventory.classList.add("hidden"); if (state.mode === "menu") ui.start.classList.remove("hidden"); }

  function renderEnchant() {
    const weapon = gearSlots.weapon.options[state.equipment.weapon], active = enchantments[state.weaponEnchant];
    ui.enchantWeapon.style.setProperty("--enchant", active.color); ui.enchantWeapon.innerHTML = `<span>${active.icon}</span><small>AKTIVE WAFFE · STUFE ${state.weaponLevel}</small><h3>${weapon.name}</h3><b>${active.name}</b><p>${active.description}</p><em>${state.riftDust} RIFTSTAUB VERFÜGBAR</em>`;
    ui.enchantGrid.innerHTML = Object.entries(enchantments).filter(([id]) => id !== "none").map(([id, enchant]) => `<button class=\"enchant-option${state.weaponEnchant === id ? " active" : ""}\" style=\"--enchant:${enchant.color}\" data-enchant-id=\"${id}\" ${state.weaponEnchant === id ? "disabled" : ""}><i>${enchant.icon}</i><span><b>${enchant.name}</b><small>${enchant.description}</small></span><strong>${state.weaponEnchant === id ? "AKTIV" : `${enchant.cost} STAUB`}</strong></button>`).join("");
  }
  function openEnchant() { closePanels(); state.enchantOpen = true; renderEnchant(); ui.enchant.classList.remove("hidden"); if (state.mode === "menu") ui.start.classList.add("hidden"); }
  function closeEnchant() { state.enchantOpen = false; ui.enchant.classList.add("hidden"); if (state.mode === "menu") ui.start.classList.remove("hidden"); }
  function applyEnchant(id) { const enchant = enchantments[id]; if (!enchant || state.weaponEnchant === id) return; if (state.riftDust < enchant.cost) { showToast(`ZU WENIG RIFTSTAUB — ${enchant.cost} BENÖTIGT`); return; } state.riftDust -= enchant.cost; state.weaponEnchant = id; renderEnchant(); renderInventory(); particle(state.hero?.x || world.artifact.x, state.hero?.y || world.artifact.y, enchant.color, 30, 150, .9); showToast(`${enchant.name} AUF WAFFE GEBUNDEN`); }

  function camera() {
    const zoom = clamp(Math.min(innerWidth / 1080, innerHeight / 720), .52, 1.02);
    const viewW = innerWidth / zoom, viewH = innerHeight / zoom;
    const focus = state.hero || world.artifact; const x = clamp(focus.x - viewW / 2, 0, world.width - viewW), y = clamp(focus.y - viewH / 2, 0, world.height - viewH);
    return { zoom, x: state.camera.ready ? state.camera.x : x, y: state.camera.ready ? state.camera.y : y };
  }
  function updateCamera(dt, snap = false) { const zoom = clamp(Math.min(innerWidth / 1080, innerHeight / 720), .52, 1.02), viewW = innerWidth / zoom, viewH = innerHeight / zoom, focus = state.hero || world.artifact, x = clamp(focus.x - viewW / 2, 0, world.width - viewW), y = clamp(focus.y - viewH / 2, 0, world.height - viewH); if (snap || !state.camera.ready) { state.camera.x = x; state.camera.y = y; state.camera.ready = true; return; } const smoothing = Math.min(1, dt * 7); state.camera.x += (x - state.camera.x) * smoothing; state.camera.y += (y - state.camera.y) * smoothing; }
  function toScreen(x, y, cam) { return { x: (x - cam.x) * cam.zoom, y: (y - cam.y) * cam.zoom }; }
  function toWorld(x, y) { const cam = camera(); return { x: x / cam.zoom + cam.x, y: y / cam.zoom + cam.y }; }
  function visibleWorld(x, y, cam, pad = 150) { const p = toScreen(x, y, cam); return p.x > -pad && p.y > -pad && p.x < innerWidth + pad && p.y < innerHeight + pad; }
  function showToast(message) { ui.toast.textContent = message; state.toastTimer = 2.2; ui.toast.classList.add("toast-visible"); }

  function makeFence() {
    const { x, y, w, h } = world.keep;
    const fences = [];
    const add = (x, y, side, normalX, normalY) => fences.push({ id: fences.length, x, y, side, normalX, normalY, hp: 100, maxHp: 100, breached: false, flash: 0 });
    for (let xPos = x + 40; xPos < x + w - 30; xPos += 72) { add(xPos, y, "NORD", 0, -1); add(xPos, y + h, "SÜD", 0, 1); }
    for (let yPos = y + 46; yPos < y + h - 35; yPos += 72) { add(x, yPos, "WEST", -1, 0); add(x + w, yPos, "OST", 1, 0); }
    return fences;
  }

  function reset() {
    state.level = 1; state.xp = 0; state.xpToLevel = 100; state.levelDamage = 0; state.mapOpen = false; state.loadoutOpen = false; state.inventoryOpen = false; state.enchantOpen = false; state.lootOpen = false; state.activeCache = null; state.riftDust = 30; state.weaponLevel = 1; state.armorLevel = 1; state.weaponEnchant = "none"; seedInventory();
    const value = stats(); state.hero = { x: world.artifact.x, y: world.artifact.y + 105, hp: value.maxHp, maxHp: value.maxHp, mana: value.maxMana, maxMana: value.maxMana, angle: -Math.PI / 2, invulnerable: 0 };
    state.enemies.length = 0; state.bullets.length = 0; state.particles.length = 0; state.drops.length = 0; state.allies.length = 0;
    state.fences = makeFence(); state.artifactMaxHp = value.artifactMaxHp; state.artifactHp = state.artifactMaxHp; state.artifactFlash = 0; state.scrap = 12; state.souls = 0; state.kills = 0; state.wave = 0;
    state.spawnLeft = 0; state.spawnTimer = 0; state.nextWaveTimer = 0; state.elapsed = 0; state.fireTimer = 0; state.manaFireTimer = 0; state.dashTimer = 0; state.summonTimer = 0; state.nextEnemy = 1; supplyCaches.forEach(cache => { cache.opened = false; cache.unlocked = false; cache.guardIds = []; }); updateCamera(0, true);
    supplyCaches.forEach((cache, index) => spawnCacheGuardians(cache, 3 + (index % 3)));
    startWave();
  }

  function startWave() {
    state.wave += 1; state.spawnLeft = 5 + state.wave * 3; state.spawnTimer = .5; state.nextWaveTimer = 0; state.bannerTimer = 2.1;
    if (state.wave % 3 === 0) { state.spawnLeft += 1; showToast("THE BREAKER FÜHRT DIE BELAGERUNG"); }
    else showToast(`WELLE ${state.wave} BEGINNT — VERTEIDIGE DEN ZAUN`);
  }

  function chooseKind() {
    if (state.wave % 3 === 0 && state.spawnLeft === 1) return "breaker";
    const roll = Math.random();
    if (state.wave >= 4 && roll < .16) return "hexer";
    if (state.wave >= 3 && roll < .34) return "mauler";
    return roll < .56 ? "raider" : "scavenger";
  }

  function nearestFence(point) {
    return state.fences.reduce((best, fence) => distance(point, fence) < distance(point, best) ? fence : best, state.fences[0]);
  }

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = random(50, world.width - 50); y = 28; }
    if (side === 1) { x = world.width - 28; y = random(50, world.height - 50); }
    if (side === 2) { x = random(50, world.width - 50); y = world.height - 28; }
    if (side === 3) { x = 28; y = random(50, world.height - 50); }
    const kind = chooseKind(); const config = enemyKinds[kind]; const scaling = 1 + Math.max(0, state.wave - 2) * .12;
    const enemy = { id: state.nextEnemy++, kind, x, y, hp: config.hp * scaling, maxHp: config.hp * scaling, angle: 0, fence: null, phase: "siege", attackTimer: random(.2, .8), hitFlash: 0, crossProgress: 0, dot: 0, dotDamage: 0, slow: 0, cacheId: null };
    enemy.fence = nearestFence(enemy); state.enemies.push(enemy);
  }

  function spawnCacheGuardians(cache, count) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + .35, kind = i === 0 ? "guardian" : i % 3 === 0 ? "hexer" : i % 2 ? "raider" : "mauler", config = enemyKinds[kind];
      const enemy = { id: state.nextEnemy++, kind, x: cache.x + Math.cos(angle) * (125 + i * 9), y: cache.y + Math.sin(angle) * (125 + i * 9), hp: config.hp, maxHp: config.hp, angle: angle + Math.PI, fence: null, phase: "guard", attackTimer: random(.2, .8), hitFlash: 0, crossProgress: 0, dot: 0, dotDamage: 0, slow: 0, cacheId: cache.id, guardAngle: angle };
      state.enemies.push(enemy); cache.guardIds.push(enemy.id);
    }
  }

  function particle(x, y, color, count = 5, speed = 80, life = .55) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, velocity = random(speed * .3, speed);
      state.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: random(life * .55, life), maxLife: life, size: random(2, 5), color });
    }
  }

  function damageFence(fence, damage) {
    if (fence.breached) return;
    fence.hp = Math.max(0, fence.hp - damage); fence.flash = .13; particle(fence.x, fence.y, palette.orange, 7, 90, .42);
    if (fence.hp === 0) {
      fence.breached = true; particle(fence.x, fence.y, palette.orange, 26, 180, 1.1);
      showToast(`BRESCHE AM ZAUN — ${fence.side}`);
    }
  }

  function damageHero(damage, source) {
    const hero = state.hero;
    if (hero.invulnerable > 0) return;
    hero.hp = Math.max(0, hero.hp - damage); hero.invulnerable = .32; particle(source.x, source.y, palette.red, 8, 95, .45);
  }

  function damageArtifact(damage) {
    state.artifactHp = Math.max(0, state.artifactHp - damage); state.artifactFlash = .18;
    particle(world.artifact.x, world.artifact.y, palette.orange, 11, 105, .5);
  }

  function gainXp(amount) {
    state.xp += Math.round(amount * stats().xpMultiplier);
    while (state.xp >= state.xpToLevel) {
      state.xp -= state.xpToLevel; state.level += 1; state.levelDamage += 4; state.xpToLevel = Math.round(state.xpToLevel * 1.25); applyStats();
      state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + 35); state.hero.mana = state.hero.maxMana; particle(state.hero.x, state.hero.y, palette.violet, 28, 155, .85); showToast(`LEVEL ${state.level} — LEBEN, MANA UND SCHADEN ERHÖHT`);
    }
  }

  function spawnXpOrbs(enemy, config) {
    const count = enemy.kind === "breaker" ? 8 : enemy.kind === "mauler" ? 3 : 2, total = enemy.kind === "breaker" ? 150 : Math.round(config.reward * 2.6);
    for (let i = 0; i < count; i++) state.drops.push({ type: "xp", x: enemy.x + random(-24, 24), y: enemy.y + random(-24, 24), xp: Math.max(1, Math.round(total / count)), color: "#63aaff", rarity: "RIFT XP", name: "Rift Essence", bob: Math.random() * Math.PI * 2 });
  }

  function rollLoot(enemy, config) {
    const luck = stats().lootLuck, roll = Math.random() + luck;
    let rarity = "GEWÖHNLICH", color = "#d9e2df", multiplier = 1;
    if (enemy.kind === "breaker" || roll > 1.07) { rarity = "LEGENDÄR"; color = "#ffad46"; multiplier = 5; }
    else if (roll > .88) { rarity = "EPISCH"; color = "#c48cff"; multiplier = 3.3; }
    else if (roll > .65) { rarity = "SELTEN"; color = "#63aaff"; multiplier = 2.2; }
    else if (roll > .38) { rarity = "UNGEWÖHNLICH"; color = "#71dc9e"; multiplier = 1.45; }
    const names = { "GEWÖHNLICH": "Verlorener Schrott", "UNGEWÖHNLICH": "Runenfragment", "SELTEN": "Sternensplitter", "EPISCH": "Rift-Relikt", "LEGENDÄR": "Kern der Dämmerung" };
    const category = rarity === "LEGENDÄR" || rarity === "EPISCH" ? "ARTIFACTS" : rarity === "SELTEN" ? "WEAPONS" : "MATERIALS";
    state.drops.push({ type: "loot", x: enemy.x, y: enemy.y, value: Math.round(config.reward * multiplier), rarity, color, name: names[rarity], category, description: `${rarity}e Beute aus der Rift-Belagerung.`, stats: `+${Math.round(config.reward * multiplier)} Schrott`, bob: Math.random() * Math.PI * 2 });
    if (enemy.kind === "breaker") state.drops.push({ type: "loot", x: enemy.x + 35, y: enemy.y - 22, value: 80, rarity: "LEGENDÄR", color: "#ffad46", name: "Herz des Brechers", category: "ARTIFACTS", description: "Der lebende Kern eines besiegten Belagerungsgolems.", stats: "+80 Schrott · Boss-Artefakt", bob: Math.random() * Math.PI * 2 });
  }

  function soulUpgrade(category) {
    if (stats().canSummon) { showToast("NEKROMANTEN-SIEGEL AKTIV — SEELEN SIND FÜR BESCHWÖRUNGEN GEBUNDEN"); return; }
    const current = category === "WEAPONS" ? state.weaponLevel : state.armorLevel, cost = 4 + current * 3;
    if (state.souls < cost) { showToast(`ZU WENIG SEELEN — ${cost} BENÖTIGT`); return; }
    state.souls -= cost; if (category === "WEAPONS") state.weaponLevel += 1; else state.armorLevel += 1; applyStats(); renderInventory(); renderLoadout(); showToast(`${category === "WEAPONS" ? "WAFFE" : "RÜSTUNG"} MIT SEELEN VERSTÄRKT`);
  }

  function updateCaches() {
    state.activeCache = null;
    for (const cache of supplyCaches) {
      cache.unlocked = !state.enemies.some(enemy => enemy.cacheId === cache.id);
      if (!cache.opened && state.hero && distance(cache, state.hero) < 145) state.activeCache = cache;
    }
    if (!ui.interaction) return;
    if (!state.activeCache) ui.interaction.classList.add("hidden");
    else { const remaining = state.enemies.filter(enemy => enemy.cacheId === state.activeCache.id).length; ui.interaction.textContent = state.activeCache.unlocked ? `E · ${state.activeCache.label} ÖFFNEN` : `${remaining} WÄCHTER VERBLEIBEN`; ui.interaction.classList.remove("hidden"); }
  }

  function interactCache() {
    if (state.mode !== "playing" || !state.activeCache || state.lootOpen) return;
    const cache = state.activeCache;
    if (!cache.unlocked) { showToast("BESIEGE ZUERST DIE LOOT-WÄCHTER"); return; }
    cache.opened = true; const reward = { ...cache.reward, rarity: cache.rarity, color: cache.color, value: cache.rarity === "MYTHISCH" ? 90 : cache.rarity === "LEGENDÄR" ? 70 : cache.rarity === "EPISCH" ? 50 : 30 };
    if (reward.dust) state.riftDust += reward.dust; else addInventory(reward); state.scrap += reward.value; state.lootOpen = true; pointer.down = false;
    document.querySelector("#loot-icon").textContent = reward.icon || "◆"; document.querySelector("#loot-rarity").textContent = cache.rarity; document.querySelector("#loot-name").textContent = reward.name; document.querySelector("#loot-description").textContent = reward.description; document.querySelector("#loot-stats").textContent = `${reward.stats} · +${reward.value} Schrott`; document.querySelector("#loot-beam").style.setProperty("--loot", cache.color); ui.lootReveal.style.setProperty("--loot", cache.color); ui.lootReveal.classList.remove("hidden"); particle(cache.x, cache.y, cache.color, 42, 190, 1.15);
  }
  function closeLootReveal() { state.lootOpen = false; ui.lootReveal.classList.add("hidden"); showToast("BEUTE IM INVENTAR GESPEICHERT"); renderInventory(); }

  function reviveHero() {
    const hero = state.hero;
    hero.x = world.artifact.x; hero.y = world.artifact.y + 105; hero.hp = hero.maxHp; hero.mana = hero.maxMana; hero.invulnerable = 1.5; hero.angle = -Math.PI / 2;
    particle(world.artifact.x, world.artifact.y, palette.violet, 34, 165, 1.05); showToast("DAS RIFT-ARTEFAKT ERWECKT DICH WIEDER");
  }

  function move(entity, target, speed, dt) {
    const dx = target.x - entity.x, dy = target.y - entity.y, d = Math.hypot(dx, dy) || 1;
    entity.angle = Math.atan2(dy, dx);
    if (d > 1) { entity.x += dx / d * speed * dt; entity.y += dy / d * speed * dt; }
    return d;
  }

  function angleDifference(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }

  function assistedAngle(rawAngle) {
    const hero = state.hero, value = stats(); let target = null, bestScore = Infinity;
    for (const enemy of state.enemies) {
      const dx = enemy.x - hero.x, dy = enemy.y - hero.y, range = Math.hypot(dx, dy);
      if (range > 760) continue;
      const angle = Math.atan2(dy, dx), difference = Math.abs(angleDifference(angle, rawAngle));
      if (difference > value.aimAssist) continue;
      const score = range * (1 + difference * 2.8);
      if (score < bestScore) { bestScore = score; target = angle; }
    }
    return target === null ? rawAngle : rawAngle + angleDifference(target, rawAngle) * .72;
  }

  function fire() {
    const hero = state.hero;
    if (state.fireTimer > 0) return;
    const start = { x: hero.x + Math.cos(hero.angle) * 24, y: hero.y + Math.sin(hero.angle) * 24 }, enchant = enchantments[state.weaponEnchant], weapon = state.equipment.weapon;
    const projectiles = weapon === 2 ? 3 : 1;
    for (let i = 0; i < projectiles; i++) { const spread = (i - (projectiles - 1) / 2) * .09; state.bullets.push({ ...start, vx: Math.cos(hero.angle + spread) * (weapon === 2 ? 650 : 760), vy: Math.sin(hero.angle + spread) * (weapon === 2 ? 650 : 760), life: 1.05, damage: stats().damage * (weapon === 2 ? .76 : 1), radius: weapon === 2 ? 6 : 4, color: state.weaponEnchant === "none" ? palette.blue : enchant.color, enchant: state.weaponEnchant, owner: "hero" }); }
    state.fireTimer = weapon === 1 ? .11 : weapon === 2 ? .32 : .16; particle(start.x, start.y, enchant.color, 5, 55, .25);
  }

  function fireManaWeapon() {
    const hero = state.hero, value = stats(), cost = value.manaCost, manaWeapon = state.equipment.manaWeapon;
    if (state.mode !== "playing" || state.manaFireTimer > 0 || state.mapOpen || state.loadoutOpen || state.inventoryOpen || state.enchantOpen || state.lootOpen) return;
    if (hero.mana < cost) { showToast("ZU WENIG MANA FÜR DIE MANA-WAFFE"); return; }
    hero.mana -= cost; state.manaFireTimer = manaWeapon === 1 ? 1.05 : .72;
    const start = { x: hero.x + Math.cos(hero.angle) * 27, y: hero.y + Math.sin(hero.angle) * 27 };
    const color = [palette.blue, palette.violet, "#66ddff"][manaWeapon], amount = manaWeapon === 0 ? 3 : 1;
    for (let i = 0; i < amount; i++) { const spread = (i - (amount - 1) / 2) * .14; state.bullets.push({ ...start, vx: Math.cos(hero.angle + spread) * (manaWeapon === 1 ? 480 : 640), vy: Math.sin(hero.angle + spread) * (manaWeapon === 1 ? 480 : 640), life: manaWeapon === 1 ? 1.7 : 1.25, damage: value.manaDamage * (amount > 1 ? .58 : 1), radius: manaWeapon === 1 ? 15 : 9, color, mana: true, manaWeapon, enchant: manaWeapon === 2 ? "shock" : manaWeapon === 1 ? "vampiric" : "frost", owner: "hero" }); }
    particle(start.x, start.y, color, 18, 115, .55);
  }

  function summonSouls() {
    if (state.mode !== "playing" || state.summonTimer > 0 || state.lootOpen) return;
    if (!stats().canSummon) { showToast("DU BRAUCHST DAS NEKROMANTEN-SIEGEL"); return; }
    if (state.souls < 3) { showToast("ZU WENIG SEELEN — 3 BENÖTIGT"); return; }
    if (state.hero.mana < 12) { showToast("ZU WENIG MANA FÜR DIE BESCHWÖRUNG"); return; }
    state.souls -= 3; state.hero.mana -= 12; state.summonTimer = 4.5;
    for (let i = 0; i < 3; i++) state.allies.push({ x: state.hero.x + random(-55, 55), y: state.hero.y + random(-55, 55), angle: 0, life: 24, fireTimer: random(0, .5), type: i === 2 ? "mage" : "skeleton" });
    particle(state.hero.x, state.hero.y, "#9d6cff", 28, 150, .9); showToast("DREI GEFALLENE SEELEN BESCHWOREN");
  }

  function updateAllies(dt) {
    for (let i = state.allies.length - 1; i >= 0; i--) { const ally = state.allies[i]; ally.life -= dt; ally.fireTimer -= dt; if (ally.life <= 0) { particle(ally.x, ally.y, palette.violet, 10, 75, .5); state.allies.splice(i, 1); continue; }
      let target = null, best = 650; for (const enemy of state.enemies) { const d = distance(ally, enemy); if (d < best) { best = d; target = enemy; } }
      if (!target) { if (distance(ally, state.hero) > 90) move(ally, state.hero, 92, dt); continue; }
      ally.angle = Math.atan2(target.y - ally.y, target.x - ally.x); if (best > 150) move(ally, target, 88, dt); if (ally.fireTimer <= 0) { state.bullets.push({ x: ally.x, y: ally.y, vx: Math.cos(ally.angle) * 510, vy: Math.sin(ally.angle) * 510, life: 1.2, damage: ally.type === "mage" ? 28 : 18, radius: 5, color: "#9d6cff", enchant: ally.type === "mage" ? "shock" : "none", owner: "ally" }); ally.fireTimer = ally.type === "mage" ? .85 : .58; }
    }
  }

  function repairFence() {
    if (state.mode !== "playing") return;
    const fence = nearestFence(state.hero);
    if (distance(fence, state.hero) > 155) { showToast("ZUM ZAUN GEHEN, UM IHN ZU REPARIEREN"); return; }
    if (state.scrap < 10) { showToast("ZU WENIG SCHROTT — BENÖTIGT 10"); return; }
    if (fence.hp >= fence.maxHp) { showToast("DIESES SEGMENT IST BEREITS INTAKT"); return; }
    state.scrap -= 10; fence.hp = Math.min(fence.maxHp, fence.hp + 48); fence.breached = false;
    state.enemies.forEach(enemy => { if (enemy.fence === fence && enemy.phase !== "inside") enemy.phase = "siege"; });
    particle(fence.x, fence.y, palette.green, 20, 130, .8); showToast("ZAUNSEGMENT REPARIERT");
  }

  function dash() {
    if (state.mode !== "playing" || state.dashTimer > 0) return;
    const hero = state.hero; hero.x = clamp(hero.x + Math.cos(hero.angle) * 145, 35, world.width - 35); hero.y = clamp(hero.y + Math.sin(hero.angle) * 145, 35, world.height - 35);
    hero.invulnerable = .36; state.dashTimer = 1.8; particle(hero.x, hero.y, palette.blue, 18, 170, .5);
  }

  function updateHero(dt) {
    const hero = state.hero; let dx = 0, dy = 0;
    if (keys.w || keys.ArrowUp) dy -= 1; if (keys.s || keys.ArrowDown) dy += 1; if (keys.a || keys.ArrowLeft) dx -= 1; if (keys.d || keys.ArrowRight) dx += 1;
    const length = Math.hypot(dx, dy) || 1;
    if (dx || dy) { hero.x += dx / length * stats().speed * dt; hero.y += dy / length * stats().speed * dt; }
    hero.x = clamp(hero.x, 28, world.width - 28); hero.y = clamp(hero.y, 28, world.height - 28);
    const pointerWorld = toWorld(pointer.x, pointer.y), rawAngle = Math.atan2(pointerWorld.y - hero.y, pointerWorld.x - hero.x);
    hero.angle = assistedAngle(rawAngle); hero.invulnerable = Math.max(0, hero.invulnerable - dt); hero.mana = Math.min(hero.maxMana, hero.mana + stats().manaRegen * dt); state.fireTimer -= dt; state.manaFireTimer = Math.max(0, state.manaFireTimer - dt); state.dashTimer = Math.max(0, state.dashTimer - dt); state.summonTimer = Math.max(0, state.summonTimer - dt);
    if (pointer.down || keys.Space) fire();
  }

  function defeatEnemy(enemy) {
    const index = state.enemies.indexOf(enemy); if (index < 0) return; const config = enemyKinds[enemy.kind]; state.kills++; state.souls += enemy.kind === "breaker" ? 8 : enemy.kind === "guardian" ? 3 : 1;
    particle(enemy.x, enemy.y, config.color, enemy.kind === "breaker" ? 35 : 12, enemy.kind === "breaker" ? 190 : 100, enemy.kind === "breaker" ? 1.2 : .7); rollLoot(enemy, config); spawnXpOrbs(enemy, config); state.enemies.splice(index, 1); if (enemy.kind === "breaker") showToast("THE BREAKER IST GEFALLEN");
  }

  function updateEnemies(dt) {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i], config = enemyKinds[enemy.kind]; enemy.attackTimer -= dt; enemy.hitFlash = Math.max(0, enemy.hitFlash - dt); enemy.slow = Math.max(0, (enemy.slow || 0) - dt);
      if (enemy.dot > 0) { enemy.dot -= dt; enemy.hp -= enemy.dotDamage * dt; if (Math.random() < .12) particle(enemy.x, enemy.y, "#ff7a3d", 1, 24, .24); }
      if (enemy.hp <= 0) { defeatEnemy(enemy); continue; }
      const speed = config.speed * (enemy.slow > 0 ? .5 : 1);
      if (enemy.phase === "guard") {
        const cache = supplyCaches.find(item => item.id === enemy.cacheId); if (!cache || cache.opened) { enemy.cacheId = null; enemy.phase = "siege"; enemy.fence = nearestFence(enemy); continue; }
        const heroDistance = distance(enemy, state.hero); if (heroDistance < 510) { const d = move(enemy, state.hero, speed, dt); if (d < config.radius + 27 && enemy.attackTimer <= 0) { damageHero(config.damage, enemy); enemy.attackTimer = config.attack; } }
        else { enemy.guardAngle += dt * .22; move(enemy, { x: cache.x + Math.cos(enemy.guardAngle) * 135, y: cache.y + Math.sin(enemy.guardAngle) * 135 }, speed * .65, dt); }
        continue;
      }
      const fence = enemy.fence || nearestFence(enemy); enemy.fence = fence;
      if (enemy.phase === "siege") {
        if (fence.breached) { enemy.phase = "breach"; continue; }
        const target = { x: fence.x + fence.normalX * 48, y: fence.y + fence.normalY * 48 }, d = move(enemy, target, speed, dt);
        if (d < config.radius + 32 && enemy.attackTimer <= 0) { damageFence(fence, config.damage); enemy.attackTimer = config.attack * (enemy.slow > 0 ? 1.5 : 1); }
        continue;
      }
      if (enemy.phase === "breach") { if (!fence.breached) { enemy.phase = "siege"; continue; } const target = { x: fence.x - fence.normalX * 68, y: fence.y - fence.normalY * 68 }; if (move(enemy, target, speed * 1.08, dt) < 14) enemy.phase = "inside"; continue; }
      const artifactDistance = move(enemy, world.artifact, speed, dt), heroDistance = distance(enemy, state.hero);
      if (heroDistance < config.radius + 26 && enemy.attackTimer <= 0) { damageHero(config.damage, enemy); enemy.attackTimer = config.attack; }
      else if (artifactDistance < config.radius + 35 && enemy.attackTimer <= 0) { damageArtifact(config.damage); enemy.attackTimer = config.attack; }
    }
  }

  function applyEnchantHit(bullet, hit) {
    if (bullet.enchant === "burning") { hit.dot = Math.max(hit.dot || 0, 3.5); hit.dotDamage = 8; }
    if (bullet.enchant === "frost") hit.slow = Math.max(hit.slow || 0, 3);
    if (bullet.enchant === "vampiric") state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + bullet.damage * .12);
    if (bullet.enchant === "shock") { let target = null, best = 175; for (const enemy of state.enemies) { if (enemy === hit) continue; const d = distance(hit, enemy); if (d < best) { best = d; target = enemy; } } if (target) { target.hp -= bullet.damage * .45; target.hitFlash = .12; particle(target.x, target.y, "#55c8ff", 7, 75, .4); } }
  }

  function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i]; bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt;
      if (bullet.life <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > world.width || bullet.y > world.height) { state.bullets.splice(i, 1); continue; }
      let hit = null; for (const enemy of state.enemies) if (distance(bullet, enemy) < bullet.radius + enemyKinds[enemy.kind].radius) { hit = enemy; break; } if (!hit) continue;
      hit.hp -= bullet.damage; hit.hitFlash = .1; particle(bullet.x, bullet.y, bullet.color || palette.blue, bullet.mana ? 9 : 4, bullet.mana ? 90 : 55, .32); applyEnchantHit(bullet, hit); state.bullets.splice(i, 1); if (hit.hp <= 0) defeatEnemy(hit);
    }
  }

  function updateDrops(dt) {
    for (let i = state.drops.length - 1; i >= 0; i--) {
      const drop = state.drops[i]; drop.bob += dt * 4;
      if (distance(drop, state.hero) < 46) {
        if (drop.type === "xp") { gainXp(drop.xp); particle(drop.x, drop.y, drop.color, 10, 80, .45); }
        else { state.scrap += drop.value; const dust = drop.rarity === "LEGENDÄR" ? 8 : drop.rarity === "EPISCH" ? 5 : drop.rarity === "SELTEN" ? 2 : 0; state.riftDust += dust; addInventory(drop); particle(drop.x, drop.y, drop.color, 14, 95, .55); showToast(`${drop.rarity}: ${drop.name} — +${drop.value} SCHROTT${dust ? ` · +${dust} STAUB` : ""}`); }
        state.drops.splice(i, 1);
      }
    }
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) { const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .94; p.vy *= .94; p.life -= dt; if (p.life <= 0) state.particles.splice(i, 1); }
    state.fences.forEach(fence => fence.flash = Math.max(0, fence.flash - dt)); state.artifactFlash = Math.max(0, state.artifactFlash - dt);
  }

  function updateWave(dt) {
    if (state.spawnLeft > 0) { state.spawnTimer -= dt; if (state.spawnTimer <= 0) { spawnEnemy(); state.spawnLeft--; state.spawnTimer = .5; } return; }
    if (state.enemies.some(enemy => !enemy.cacheId)) return;
    if (!state.nextWaveTimer) { state.nextWaveTimer = 3.2; showToast(`WELLE ${state.wave} GESÄUBERT — ATME DURCH`); }
    state.nextWaveTimer -= dt; if (state.nextWaveTimer <= 0) startWave();
  }

  function gameOver() {
    state.mode = "over"; ui.hud.classList.add("hidden"); ui.over.classList.remove("hidden");
    ui.summary.textContent = `Du hast Welle ${state.wave} erreicht, ${state.kills} Gegner besiegt und ${state.souls} Seelen gebunden.`;
  }

  function updateUi() {
    const fence = nearestFence(state.hero); const fencePercent = fence.hp / fence.maxHp * 100;
    ui.heroHealth.textContent = `${Math.ceil(state.hero.hp)} / ${state.hero.maxHp}`; ui.heroMeter.style.width = `${state.hero.hp / state.hero.maxHp * 100}%`;
    ui.manaValue.textContent = `${Math.ceil(state.hero.mana)} / ${state.hero.maxMana}`; ui.manaMeter.style.width = `${state.hero.mana / state.hero.maxMana * 100}%`;
    ui.keepHealth.textContent = `${Math.ceil(state.artifactHp)} / ${state.artifactMaxHp}`; ui.keepMeter.style.width = `${state.artifactHp / state.artifactMaxHp * 100}%`;
    ui.wave.textContent = state.wave; ui.objective.textContent = state.spawnLeft ? "BELAGERUNG LÄUFT" : state.enemies.length ? "BRESCHEN VERTEIDIGEN" : "NÄCHSTE WELLE";
    ui.enemyCount.textContent = `${state.enemies.length + state.spawnLeft} Gegner`; ui.souls.textContent = state.souls; ui.scrap.textContent = state.scrap; document.querySelector("#dust").textContent = state.riftDust;
    ui.levelValue.textContent = state.level; ui.xpMeter.style.width = `${state.xp / state.xpToLevel * 100}%`; ui.xpValue.textContent = `${state.xp} / ${state.xpToLevel} XP`;
    ui.fenceHealth.textContent = `${Math.ceil(fence.hp)} / ${fence.maxHp}`; ui.fenceMeter.style.width = `${fencePercent}%`; ui.fenceStatus.textContent = fence.breached ? `BRESCHE — ${fence.side}` : `${fence.side}-ZAUN INTAKT`;
    const weapon = gearSlots.weapon.options[state.equipment.weapon], manaWeapon = gearSlots.manaWeapon.options[state.equipment.manaWeapon], enchant = enchantments[state.weaponEnchant]; document.querySelector("#activeWeapon").textContent = `${weapon.name.toUpperCase()} · ${state.weaponLevel}`; document.querySelector("#activeEnchant").textContent = enchant.name; document.querySelector("#activeEnchant").style.color = enchant.color; document.querySelector("#activeManaWeapon").textContent = manaWeapon.name.toUpperCase(); document.querySelector("#manaCost").textContent = `F · ${stats().manaCost} MANA`;
  }

  function update(dt) {
    if (state.toastTimer > 0) { state.toastTimer -= dt; if (state.toastTimer <= 0) ui.toast.classList.remove("toast-visible"); }
    if (state.mode !== "playing" || state.mapOpen || state.loadoutOpen || state.inventoryOpen || state.enchantOpen || state.lootOpen) return;
    state.elapsed += dt; state.bannerTimer = Math.max(0, state.bannerTimer - dt); updateHero(dt); updateCamera(dt); updateWave(dt); updateEnemies(dt); updateAllies(dt); updateBullets(dt); updateDrops(dt); updateParticles(dt); updateCaches();
    if (state.artifactHp <= 0) { gameOver(); return; }
    if (state.hero.hp <= 0) reviveHero();
    updateUi();
  }

  function rect(x, y, w, h, color, cam, stroke) { const p = toScreen(x, y, cam); ctx.fillStyle = color; ctx.fillRect(p.x, p.y, w * cam.zoom, h * cam.zoom); if (stroke) { ctx.strokeStyle = stroke; ctx.strokeRect(p.x, p.y, w * cam.zoom, h * cam.zoom); } }
  function circle(x, y, radius, color, cam, alpha = 1) { const p = toScreen(x, y, cam); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, radius * cam.zoom, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }

  function drawBackground(cam) {
    const gradient = ctx.createLinearGradient(0, 0, 0, innerHeight); gradient.addColorStop(0, "#0b1930"); gradient.addColorStop(.55, "#07131d"); gradient.addColorStop(1, "#03090d"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight);
    rect(0, 0, world.width, world.height, "#14231f", cam); const biomes = [[620,620,520,"#17382d"],[3980,650,560,"#24203c"],[720,2680,560,"#303126"],[3900,2670,580,"#44241f"],[2300,380,410,"#1b3140"]]; biomes.forEach(([x,y,r,color]) => { circle(x,y,r,color,cam,.6); circle(x-r*.2,y-r*.12,r*.68,shade(color,1.16),cam,.26); });
    supplyCaches.forEach(cache => drawRoad(cache, world.artifact, cam));
    const origin = toScreen(0, 0, cam); ctx.save(); ctx.strokeStyle = "rgba(113,178,143,.065)"; ctx.lineWidth = 1; for (let x = Math.floor(cam.x / 92) * 92; x < cam.x + innerWidth / cam.zoom + 92; x += 92) { const p = toScreen(x, 0, cam); ctx.beginPath(); ctx.moveTo(p.x, origin.y); ctx.lineTo(p.x, origin.y + world.height * cam.zoom); ctx.stroke(); } for (let y = Math.floor(cam.y / 92) * 92; y < cam.y + innerHeight / cam.zoom + 92; y += 92) { const p = toScreen(0, y, cam); ctx.beginPath(); ctx.moveTo(origin.x, p.y); ctx.lineTo(origin.x + world.width * cam.zoom, p.y); ctx.stroke(); } ctx.restore();
    decorations.rocks.forEach(v => visibleWorld(v[0],v[1],cam) && drawRock(v[0],v[1],v[2],cam)); decorations.ruins.forEach(v => visibleWorld(v[0],v[1],cam,220) && drawRuin(v[0],v[1],v[2],cam)); decorations.trees.forEach(v => visibleWorld(v[0],v[1],cam,190) && drawTree(v[0],v[1],v[2],cam)); decorations.crystals.forEach(v => visibleWorld(v[0],v[1],cam) && drawCrystalCluster(v[0],v[1],v[2],v[3],cam)); decorations.fires.forEach(v => visibleWorld(v[0],v[1],cam) && drawCampfire(v[0],v[1],cam));
    supplyCaches.forEach(cache => drawSupplyCache(cache, cam)); drawWorldBoundary(cam);
  }

  function drawRoad(a, b, cam) { const p1 = toScreen(a.x,a.y,cam), p2 = toScreen(b.x,b.y,cam); ctx.save(); ctx.lineCap="round"; ctx.strokeStyle="rgba(7,12,14,.45)"; ctx.lineWidth=58*cam.zoom; ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); ctx.setLineDash([25*cam.zoom,18*cam.zoom]); ctx.strokeStyle="rgba(149,123,76,.18)"; ctx.lineWidth=4*cam.zoom; ctx.stroke(); ctx.restore(); }
  function drawTree(x, y, size, cam) { circle(x+7*size,y+31*size,65*size,"#071610",cam,.38); rect(x-11*size,y+8*size,22*size,72*size,"#542d1b",cam); rect(x-6*size,y+8*size,9*size,66*size,"#8a542a",cam); [[0,0,58,"#174b34"],[31,-31,42,"#123c2c"],[-34,-27,45,"#1d5a3a"],[4,-60,36,"#153f31"]].forEach(v=>circle(x+v[0]*size,y+v[1]*size,v[2]*size,v[3],cam)); }
  function drawRuin(x, y, size, cam) { circle(x+30*size,y+25*size,82*size,"#101719",cam,.45); rect(x-58*size,y+10*size,130*size,28*size,"#252f34",cam); rect(x-48*size,y-62*size,33*size,74*size,"#4b5659",cam); rect(x+39*size,y-92*size,34*size,104*size,"#566064",cam); rect(x-9*size,y-19*size,52*size,31*size,"#364146",cam); rect(x-43*size,y-54*size,23*size,12*size,"#758084",cam); }
  function drawRock(x,y,size,cam){ circle(x,y+16*size,44*size,"#081010",cam,.42); rect(x-34*size,y-22*size,68*size,45*size,"#283438",cam); rect(x-23*size,y-39*size,43*size,22*size,"#526066",cam); rect(x+16*size,y-14*size,15*size,30*size,"#172329",cam); }
  function drawCrystalCluster(x,y,size,color,cam){ circle(x,y,48*size,color,cam,.09); rect(x-9*size,y-61*size,18*size,78*size,color,cam); rect(x+16*size,y-39*size,13*size,54*size,shade(color,.74),cam); rect(x-27*size,y-31*size,12*size,46*size,shade(color,.84),cam); }
  function drawCampfire(x,y,cam){ circle(x,y,52,"#ff6d32",cam,.08); rect(x-30,y+9,60,9,"#40261b",cam); rect(x-7,y-16,14,31,"#ff7438",cam); rect(x-3,y-29,7,21,"#ffd26a",cam); }
  function drawWorldBoundary(cam){ const p=toScreen(38,38,cam), q=toScreen(world.width-38,world.height-38,cam); ctx.save(); ctx.strokeStyle="#3f4a51"; ctx.lineWidth=42*cam.zoom; ctx.strokeRect(p.x,p.y,q.x-p.x,q.y-p.y); ctx.strokeStyle="#a77945"; ctx.lineWidth=4*cam.zoom; ctx.setLineDash([30*cam.zoom,18*cam.zoom]); ctx.strokeRect(p.x,p.y,q.x-p.x,q.y-p.y); ctx.restore(); }
  function drawSupplyCache(cache, cam) { if (!visibleWorld(cache.x,cache.y,cam,240)) return; const p = toScreen(cache.x, cache.y, cam), s = cam.zoom, pulse = .7 + Math.sin(state.elapsed * 2 + cache.x) * .2, guards = state.enemies.filter(enemy=>enemy.cacheId===cache.id).length; ctx.save(); if (!cache.opened) { ctx.globalAlpha = .14; ctx.fillStyle = cache.color; ctx.fillRect(p.x - 17 * s, p.y - 160 * s, 34 * s, 162 * s); } ctx.globalAlpha = 1; ctx.shadowBlur = cache.opened ? 0 : 28 * s; ctx.shadowColor = cache.color; ctx.fillStyle = cache.opened ? "#293236" : cache.color; ctx.fillRect(p.x - 39 * s, p.y - 29 * s, 78 * s, 58 * s); ctx.fillStyle = "#171d22"; ctx.fillRect(p.x - 31 * s, p.y - 20 * s, 62 * s, 39 * s); ctx.fillStyle = cache.opened ? "#4a5559" : cache.color; ctx.fillRect(p.x - 6 * s, p.y - 27 * s, 12 * s, 54 * s); ctx.globalAlpha = cache.opened ? .25 : pulse; ctx.strokeStyle = cache.color; ctx.lineWidth = 3 * s; ctx.strokeRect(p.x-52*s,p.y-42*s,104*s,84*s); ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.textAlign="center"; ctx.fillStyle=cache.opened?"#77858b":cache.color; ctx.font=`900 ${Math.max(9,11*s)}px Georgia`; ctx.fillText(cache.opened?"GEPLÜNDERT":cache.label,p.x,p.y-64*s); ctx.font=`800 ${Math.max(8,9*s)}px system-ui`; ctx.fillText(cache.opened?"CACHE LEER":guards?`${guards} WÄCHTER · DEFEND TO CLAIM`:"E · ÖFFNEN",p.x,p.y-48*s); ctx.restore(); }

  function drawKeep(cam) {
    const keep = world.keep; rect(keep.x - 54, keep.y - 54, keep.w + 108, keep.h + 108, "#111a1c", cam, "rgba(194,157,85,.62)"); rect(keep.x - 34, keep.y - 34, keep.w + 68, keep.h + 68, "#354039", cam); rect(keep.x, keep.y, keep.w, keep.h, "#1b2928", cam);
    for (let x = keep.x + 18; x < keep.x + keep.w; x += 46) for (let y = keep.y + 18; y < keep.y + keep.h; y += 46) rect(x, y, 42, 42, (Math.floor(x / 46) + Math.floor(y / 46)) % 2 ? "#223733" : "#192d2c", cam);
    rect(keep.x+keep.w/2-165,keep.y+keep.h/2-125,330,250,"#243235",cam,"rgba(102,191,255,.35)"); rect(keep.x+keep.w/2-128,keep.y+keep.h/2-91,256,182,"#18272a",cam); for(let i=-2;i<=2;i++){rect(keep.x+keep.w/2+i*50-17,keep.y+keep.h/2-118,34,22,"#657278",cam);}
    drawArtifact(cam);
    const artifact = world.artifact; rect(artifact.x - 214, artifact.y + 142, 112, 20, palette.wood, cam); rect(artifact.x + 102, artifact.y + 142, 112, 20, palette.woodLight, cam); drawStation(keep.x + 155, keep.y + 145, "#b46cff", cam); drawStation(keep.x + keep.w - 155, keep.y + 145, "#4fa8ff", cam); drawStation(keep.x + 155, keep.y + keep.h - 145, "#ff8a45", cam); drawStation(keep.x + keep.w - 155, keep.y + keep.h - 145, "#69dfac", cam); drawTower(keep.x + 96, keep.y + keep.h/2, cam); drawTower(keep.x + keep.w - 96, keep.y + keep.h/2, cam); circle(artifact.x - 148, artifact.y + 32, 30, palette.orange, cam, .45); circle(artifact.x - 148, artifact.y + 22, 14, palette.gold, cam, .8);
    [[keep.x+38,keep.y+38],[keep.x+keep.w-38,keep.y+38],[keep.x+38,keep.y+keep.h-38],[keep.x+keep.w-38,keep.y+keep.h-38]].forEach(([x,y])=>{rect(x-28,y-28,56,56,"#263238",cam);rect(x-34,y-35,68,12,"#7f755f",cam);circle(x,y-41,13,palette.blue,cam,.5);});
    state.fences.forEach(fence => drawFence(fence, cam));
  }

  function drawStation(x, y, color, cam) { rect(x - 35, y - 16, 70, 32, "#26363b", cam); rect(x - 22, y - 48, 44, 35, "#435058", cam); circle(x, y - 52, 16, color, cam, .58); }
  function drawTower(x, y, cam) { rect(x - 16, y - 46, 32, 70, "#3d494e", cam); rect(x - 31, y - 56, 62, 15, "#697378", cam); circle(x, y - 64, 12, palette.blue, cam, .75); const p = toScreen(x, y - 64, cam); ctx.save(); ctx.strokeStyle = palette.blue; ctx.globalAlpha = .45; ctx.lineWidth = 2 * cam.zoom; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 62 * cam.zoom, p.y - 22 * cam.zoom); ctx.stroke(); ctx.restore(); }

  function drawArtifact(cam) {
    const artifact = world.artifact, pulse = 1 + Math.sin(state.elapsed * 3.1) * .08, p = toScreen(artifact.x, artifact.y, cam), radius = 76 * cam.zoom * pulse;
    circle(artifact.x, artifact.y, 150, palette.violet, cam, .12); circle(artifact.x, artifact.y, 100, palette.blue, cam, .08);
    rect(artifact.x - 45, artifact.y + 24, 90, 42, "#2c4542", cam); rect(artifact.x - 31, artifact.y + 8, 62, 24, "#49615a", cam);
    ctx.save(); ctx.translate(p.x, p.y - 26 * cam.zoom); ctx.globalAlpha = state.artifactFlash > 0 ? .96 : .76; ctx.shadowBlur = 26 * cam.zoom; ctx.shadowColor = state.artifactFlash > 0 ? palette.orange : palette.violet; ctx.fillStyle = state.artifactFlash > 0 ? palette.orange : palette.violet;
    ctx.beginPath(); ctx.moveTo(0, -radius); ctx.lineTo(radius * .62, 0); ctx.lineTo(0, radius); ctx.lineTo(-radius * .62, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = palette.white; ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(0, -radius * .74); ctx.lineTo(radius * .42, 0); ctx.lineTo(0, radius * .3); ctx.closePath(); ctx.fill(); ctx.restore();
    const width = 112 * cam.zoom, hp = state.artifactHp / state.artifactMaxHp; ctx.fillStyle = "rgba(0,0,0,.72)"; ctx.fillRect(p.x - width / 2, p.y - 105 * cam.zoom, width, 6 * cam.zoom); ctx.fillStyle = hp > .35 ? palette.violet : palette.red; ctx.fillRect(p.x - width / 2, p.y - 105 * cam.zoom, width * hp, 6 * cam.zoom);
  }

  function drawFence(fence, cam) {
    const vertical = fence.side === "WEST" || fence.side === "OST";
    if (fence.breached) {
      circle(fence.x, fence.y, 43, palette.orange, cam, .13); rect(fence.x - (vertical ? 8 : 33), fence.y - (vertical ? 33 : 8), vertical ? 16 : 66, vertical ? 66 : 16, "#0d1716", cam); return;
    }
    const damaged = fence.hp < 55, color = fence.flash > 0 ? palette.white : damaged ? palette.orange : palette.woodLight;
    if (vertical) { rect(fence.x - 9, fence.y - 35, 18, 70, color, cam); rect(fence.x - 14, fence.y - 27, 28, 12, palette.wood, cam); rect(fence.x - 14, fence.y + 17, 28, 12, palette.wood, cam); }
    else { rect(fence.x - 35, fence.y - 9, 70, 18, color, cam); rect(fence.x - 27, fence.y - 14, 12, 28, palette.wood, cam); rect(fence.x + 17, fence.y - 14, 12, 28, palette.wood, cam); }
    const p = toScreen(fence.x, fence.y, cam), length = 43 * cam.zoom; ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillRect(p.x - length / 2, p.y - 41 * cam.zoom, length, 4); ctx.fillStyle = damaged ? palette.orange : palette.green; ctx.fillRect(p.x - length / 2, p.y - 41 * cam.zoom, length * fence.hp / fence.maxHp, 4);
  }

  function drawEnemy(enemy, cam) {
    const config = enemyKinds[enemy.kind], p = toScreen(enemy.x, enemy.y, cam), r = config.radius * cam.zoom, color = enemy.hitFlash > 0 ? palette.white : config.color, glow = enemy.kind === "hexer" ? palette.violet : enemy.kind === "guardian" ? palette.gold : enemy.kind === "breaker" ? palette.orange : palette.red;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(enemy.angle); ctx.fillStyle = "rgba(0,0,0,.36)"; ctx.beginPath(); ctx.ellipse(0, r * .34, r * 1.05, r * .42, 0, 0, Math.PI * 2); ctx.fill();
    if (enemy.kind === "breaker") {
      ctx.fillStyle="#252d31"; ctx.fillRect(-r*.78,-r*.66,r*1.56,r*1.45); ctx.fillStyle="#596166"; ctx.fillRect(-r*.68,-r*1.08,r*1.36,r*.48); ctx.fillStyle="#171d20"; ctx.fillRect(-r*1.24,-r*.48,r*.42,r*1.22); ctx.fillRect(r*.82,-r*.48,r*.42,r*1.22); ctx.fillStyle=palette.orange; ctx.shadowBlur=20;ctx.shadowColor=palette.orange;ctx.fillRect(-r*.25,-r*.18,r*.5,r*.42);ctx.fillRect(-r*.56,-r*.93,r*1.12,r*.12);ctx.fillStyle="#ffbf63";ctx.fillRect(-r*.27,-r*.85,r*.18,r*.12);ctx.fillRect(r*.09,-r*.85,r*.18,r*.12);
    } else if (enemy.kind === "guardian") {
      ctx.fillStyle="#4c3a2a";ctx.fillRect(-r*.66,-r*.6,r*1.32,r*1.24);ctx.fillStyle="#8f7c58";ctx.fillRect(-r*.58,-r*1.04,r*1.16,r*.48);ctx.fillStyle="#242b30";ctx.fillRect(-r*.84,-r*.45,r*.28,r*.92);ctx.fillStyle=palette.gold;ctx.fillRect(-r*.72,-r*.54,r*1.44,r*.12);ctx.fillRect(-r*.12,-r*1.31,r*.24,r*.28);ctx.fillStyle="#1e2427";ctx.fillRect(-r*.42,-r*.82,r*.25,r*.12);ctx.fillRect(r*.17,-r*.82,r*.25,r*.12);ctx.fillStyle=palette.gold;ctx.fillRect(r*.78,-r*.67,r*.16,r*1.08);ctx.fillRect(r*.67,-r*.73,r*.38,r*.16);
    } else if (enemy.kind === "hexer") {
      ctx.fillStyle="#39234f";ctx.fillRect(-r*.61,-r*.48,r*1.22,r*1.2);ctx.fillStyle="#69458f";ctx.fillRect(-r*.48,-r*.94,r*.96,r*.5);ctx.fillStyle="#1c1826";ctx.fillRect(-r*.58,-r*1.23,r*1.16,r*.24);ctx.fillStyle=palette.violet;ctx.shadowBlur=15;ctx.shadowColor=palette.violet;ctx.fillRect(-r*.31,-r*.76,r*.18,r*.12);ctx.fillRect(r*.13,-r*.76,r*.18,r*.12);ctx.fillRect(r*.76,-r*.66,r*.12,r*1.16);ctx.beginPath();ctx.arc(r*.82,-r*.72,r*.25,0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillStyle=color;ctx.fillRect(-r*.66,-r*.57,r*1.32,r*1.22);ctx.fillStyle=shade(color,1.3);ctx.fillRect(-r*.52,-r*1.02,r*1.04,r*.5);ctx.fillStyle="#32252a";ctx.fillRect(-r*.77,-r*.42,r*.22,r*.82);ctx.fillStyle=palette.dark;ctx.fillRect(-r*.38,-r*.78,r*.18,r*.12);ctx.fillRect(r*.2,-r*.78,r*.18,r*.12); if(enemy.kind==="mauler"){ctx.fillStyle="#788086";ctx.fillRect(r*.74,-r*.54,r*.22,r*1.08);ctx.fillRect(r*.58,-r*.62,r*.54,r*.2);} else {ctx.fillStyle="#bc8d58";ctx.fillRect(r*.73,-r*.4,r*.6,r*.11);ctx.fillStyle="#d5c4a3";ctx.fillRect(r*1.18,-r*.49,r*.32,r*.28);}
    }
    if(enemy.cacheId){ctx.strokeStyle=palette.gold;ctx.lineWidth=Math.max(2,3*cam.zoom);ctx.globalAlpha=.7;ctx.strokeRect(-r*.92,-r*1.28,r*1.84,r*2.05);} ctx.restore();
    const width = Math.max(28, r * 2.2); ctx.fillStyle = "#080d0d"; ctx.fillRect(p.x - width / 2, p.y - r * 1.36, width, 4); ctx.fillStyle = enemy.kind === "breaker" ? palette.orange : palette.red; ctx.fillRect(p.x - width / 2, p.y - r * 1.36, width * enemy.hp / enemy.maxHp, 4);
  }

  function drawHero(hero, cam) {
    const p = toScreen(hero.x, hero.y, cam); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(hero.angle); const scale = cam.zoom;
    if (hero.invulnerable > 0 && Math.floor(hero.invulnerable * 24) % 2 === 0) ctx.globalAlpha = .38;
    ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(0, 7 * scale, 25 * scale, 11 * scale, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    const gear = state.equipment, chestColor = ["#2a6b86", "#594d92", "#59645b"][gear.chest], helmetColor = ["#8db1bf", "#b399ff", "#edc15c"][gear.helmet], bootColor = ["#1b2c38", "#386a73", "#423d34"][gear.boots], weaponColor = [palette.blue, palette.gold, palette.violet][gear.weapon];
    ctx.fillStyle="#142231";ctx.fillRect(-22*scale,-11*scale,8*scale,39*scale);ctx.fillStyle = bootColor; ctx.fillRect(-17 * scale, 17 * scale, 12 * scale, 11 * scale); ctx.fillRect(5 * scale, 17 * scale, 12 * scale, 11 * scale); ctx.fillStyle = chestColor; ctx.fillRect(-17 * scale, -14 * scale, 34 * scale, 37 * scale); ctx.fillStyle=shade(chestColor,1.35);ctx.fillRect(-17*scale,-13*scale,34*scale,6*scale);ctx.fillStyle="#657984";ctx.fillRect(-4*scale,-14*scale,8*scale,37*scale); ctx.fillStyle = helmetColor; ctx.fillRect(-14 * scale, -31 * scale, 28 * scale, 19 * scale); ctx.fillStyle = "#a66e4e"; ctx.fillRect(-11 * scale, -47 * scale, 22 * scale, 17 * scale);ctx.fillStyle="#17222a";ctx.fillRect(-14*scale,-49*scale,28*scale,7*scale);ctx.fillStyle=palette.blue;ctx.shadowBlur=12;ctx.shadowColor=palette.blue;ctx.fillRect(-2*scale,-43*scale,4*scale,12*scale);
    ctx.fillStyle = weaponColor; ctx.shadowBlur=14;ctx.shadowColor=weaponColor;ctx.fillRect(13 * scale, -5 * scale, 38 * scale, 8 * scale); ctx.fillStyle = palette.white; ctx.fillRect(47 * scale, -4 * scale, 10 * scale, 6 * scale); ctx.restore();
  }

  function drawAlly(ally,cam){const p=toScreen(ally.x,ally.y,cam),s=cam.zoom;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ally.angle);ctx.globalAlpha=.28;ctx.fillStyle="#8e67ff";ctx.beginPath();ctx.arc(0,0,28*s,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.82;ctx.fillStyle=ally.type==="mage"?"#47366f":"#273a57";ctx.fillRect(-13*s,-14*s,26*s,31*s);ctx.fillStyle="#d7d0bd";ctx.fillRect(-11*s,-33*s,22*s,18*s);ctx.fillStyle="#6fc9ff";ctx.shadowBlur=12;ctx.shadowColor="#6fc9ff";ctx.fillRect(-7*s,-28*s,5*s,4*s);ctx.fillRect(2*s,-28*s,5*s,4*s);ctx.fillRect(14*s,-4*s,28*s,5*s);ctx.restore();}

  function drawEffects(cam) {
    state.drops.forEach(drop => { const p = toScreen(drop.x, drop.y - Math.sin(drop.bob) * 5, cam), size = drop.type === "xp" ? 6 : 10; ctx.save(); ctx.shadowBlur = drop.type === "xp" ? 14 : 24; ctx.shadowColor = drop.color; ctx.fillStyle = drop.color; ctx.beginPath(); ctx.moveTo(p.x, p.y - size * cam.zoom); ctx.lineTo(p.x + size * cam.zoom, p.y); ctx.lineTo(p.x, p.y + (size + 2) * cam.zoom); ctx.lineTo(p.x - size * cam.zoom, p.y); ctx.closePath(); ctx.fill(); if (drop.type === "loot" && (drop.rarity === "EPISCH" || drop.rarity === "LEGENDÄR")) { ctx.font = `800 ${Math.max(9, 10 * cam.zoom)}px Georgia`; ctx.textAlign = "center"; ctx.fillText(drop.rarity, p.x, p.y - 20 * cam.zoom); } ctx.restore(); });
    state.bullets.forEach(bullet => { const p = toScreen(bullet.x, bullet.y, cam), color = bullet.color || palette.blue; ctx.save(); ctx.strokeStyle = color; ctx.shadowBlur = bullet.mana ? 22 : 12; ctx.shadowColor = color; ctx.lineWidth = (bullet.mana ? 6 : 3) * cam.zoom; ctx.beginPath(); ctx.moveTo(p.x - bullet.vx * .012 * cam.zoom, p.y - bullet.vy * .012 * cam.zoom); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore(); });
    state.particles.forEach(item => { const p = toScreen(item.x, item.y, cam); ctx.save(); ctx.globalAlpha = item.life / item.maxLife; ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(p.x, p.y, item.size * cam.zoom, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
  }

  function drawArenaMap() {
    const margin = 72, sideWidth = Math.min(250, innerWidth * .22), maxW = innerWidth - margin * 2 - sideWidth, maxH = innerHeight - margin * 2, scale = Math.min(maxW / world.width, maxH / world.height), width = world.width * scale, height = world.height * scale, x = (innerWidth - sideWidth - width) / 2, y = (innerHeight - height) / 2, panelX = x + width + 18;
    const point = item => ({ x: x + item.x * scale, y: y + item.y * scale });
    ctx.save(); const shade = ctx.createRadialGradient(innerWidth * .5, innerHeight * .45, 0, innerWidth * .5, innerHeight * .45, innerWidth * .75); shade.addColorStop(0, "rgba(19,31,45,.98)"); shade.addColorStop(1, "rgba(2,6,10,.98)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, innerWidth, innerHeight); ctx.fillStyle = "#0c1519"; ctx.fillRect(x - 10, y - 10, width + 20, height + 20); ctx.strokeStyle = "#c49a55"; ctx.lineWidth = 2; ctx.strokeRect(x - 10, y - 10, width + 20, height + 20); ctx.strokeStyle = "#3a6182"; ctx.lineWidth = 1; ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
    const terrain = ctx.createLinearGradient(x, y, x + width, y + height); terrain.addColorStop(0, "#142134"); terrain.addColorStop(.48, "#26332b"); terrain.addColorStop(1, "#1e1729"); ctx.fillStyle = terrain; ctx.fillRect(x, y, width, height);
    [[320,420,250,"#214936"],[520,1550,310,"#183e35"],[2750,400,330,"#26213e"],[2740,1690,300,"#4a2921"],[1080,1930,260,"#3c3321"]].forEach(([cx,cy,r,color]) => { const p = point({x:cx,y:cy}); ctx.fillStyle = color; ctx.globalAlpha = .45; ctx.beginPath(); ctx.arc(p.x,p.y,r*scale,0,Math.PI*2); ctx.fill(); }); ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(123,163,198,.18)"; ctx.lineWidth = 1; for (let gx = 0; gx < world.width; gx += 260) { const p = point({x:gx,y:0}); ctx.beginPath(); ctx.moveTo(p.x,y); ctx.lineTo(p.x,y+height); ctx.stroke(); } for (let gy = 0; gy < world.height; gy += 260) { const p = point({x:0,y:gy}); ctx.beginPath(); ctx.moveTo(x,p.y); ctx.lineTo(x+width,p.y); ctx.stroke(); }
    const keep = world.keep; ctx.fillStyle = "rgba(100,191,162,.2)"; ctx.fillRect(x + keep.x * scale, y + keep.y * scale, keep.w * scale, keep.h * scale); ctx.strokeStyle = "#d3b272"; ctx.lineWidth = 2; ctx.strokeRect(x + keep.x * scale, y + keep.y * scale, keep.w * scale, keep.h * scale);
    state.fences.forEach(fence => { const p = point(fence); ctx.fillStyle = fence.breached ? palette.orange : "#b9814a"; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
    supplyCaches.forEach(cache => { const p = point(cache); ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = cache.color; ctx.fillStyle = cache.color; ctx.fillRect(p.x - 6, p.y - 6, 12, 12); ctx.globalAlpha = .35; ctx.fillRect(p.x - 2, p.y - 38, 4, 32); ctx.globalAlpha = 1; ctx.font = "800 10px Georgia"; ctx.fillText(cache.rarity, p.x + 10, p.y - 10); ctx.restore(); });
    state.enemies.forEach(enemy => { const p = point(enemy); ctx.fillStyle = enemy.kind === "breaker" ? palette.orange : palette.red; ctx.beginPath(); ctx.arc(p.x, p.y, enemy.kind === "breaker" ? 6 : 3, 0, Math.PI * 2); ctx.fill(); });
    state.drops.forEach(drop => { const p = point(drop); ctx.fillStyle = drop.color; ctx.shadowBlur = 9; ctx.shadowColor = drop.color; ctx.beginPath(); ctx.arc(p.x, p.y, drop.type === "xp" ? 2 : 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; if (drop.type === "loot") { ctx.fillStyle = drop.color; ctx.font = "700 9px Georgia"; ctx.fillText(drop.rarity, p.x + 7, p.y - 5); } });
    const artifact = point(world.artifact), hero = point(state.hero); ctx.shadowBlur = 16; ctx.shadowColor = palette.violet; ctx.fillStyle = palette.violet; ctx.beginPath(); ctx.arc(artifact.x, artifact.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 12; ctx.shadowColor = palette.blue; ctx.fillStyle = palette.blue; ctx.beginPath(); ctx.arc(hero.x, hero.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#0b1015"; ctx.fillRect(panelX, y - 10, sideWidth - 12, height + 20); ctx.strokeStyle = "#856c45"; ctx.strokeRect(panelX, y - 10, sideWidth - 12, height + 20); ctx.fillStyle = "#e1c58c"; ctx.font = "900 18px Georgia"; ctx.fillText("ARENAKARTE", x, y - 24); ctx.font = "900 14px Georgia"; ctx.fillText("RIFT INTEL", panelX + 18, y + 28); const legend = [[palette.blue,"HELD"],[palette.violet,"RIFT-ARTEFAKT"],[palette.red,"HORDEN"],["#63aaff","SELTEN"],["#c48cff","EPISCH"],["#ffad46","LEGENDÄR"]]; legend.forEach(([color,label], index) => { const ly = y + 66 + index * 36; ctx.fillStyle = color; ctx.fillRect(panelX + 19, ly - 9, 13, 13); ctx.fillStyle = "#d9d0bd"; ctx.font = "700 11px Georgia"; ctx.fillText(label, panelX + 43, ly + 2); }); ctx.fillStyle = "#7696ae"; ctx.font = "700 10px system-ui"; ctx.fillText(`${state.enemies.length} SIGNALE ERKANNT`, panelX + 18, y + height - 58); ctx.fillText(`${state.drops.filter(drop => drop.type === "loot").length + supplyCaches.length} LOOT-SIGNALE`, panelX + 18, y + height - 38); ctx.fillStyle = "#d5b66d"; ctx.fillText("[M] SCHLIESSEN", panelX + 18, y + height - 16); ctx.restore();
  }

  function render() {
    const cam = camera(); drawBackground(cam); drawKeep(cam); state.allies.forEach(ally=>drawAlly(ally,cam)); state.enemies.forEach(enemy => drawEnemy(enemy, cam)); drawEffects(cam); if (state.hero) drawHero(state.hero, cam);
    if (state.mode === "playing" && state.bannerTimer > 0) { ctx.save(); ctx.globalAlpha = clamp(state.bannerTimer, 0, 1); ctx.textAlign = "center"; ctx.fillStyle = palette.white; ctx.font = `900 ${Math.max(24, 33 * cam.zoom)}px system-ui`; ctx.fillText(`WELLE ${state.wave}`, innerWidth / 2, innerHeight * .21); ctx.fillStyle = palette.orange; ctx.font = `800 ${Math.max(10, 12 * cam.zoom)}px system-ui`; ctx.fillText(state.wave % 3 === 0 ? "BOSS-BELAGERUNG" : "DIE HORDE KOMMT", innerWidth / 2, innerHeight * .21 + 25 * cam.zoom); ctx.restore(); }
    if (state.mapOpen && state.hero) drawArenaMap();
  }

  function loop(time) { const dt = Math.min(.033, (time - previousTime) / 1000); previousTime = time; update(dt); render(); requestAnimationFrame(loop); }
  function resize() { const dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr); canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function play() { reset(); state.mode = "playing"; ui.start.classList.add("hidden"); ui.help.classList.add("hidden"); ui.over.classList.add("hidden"); closePanels(); ui.lootReveal.classList.add("hidden"); ui.hud.classList.remove("hidden"); previousTime = performance.now(); updateCaches(); updateUi(); }
  function menu() { state.mode = "menu"; state.mapOpen = false; state.lootOpen = false; closePanels(); ui.lootReveal.classList.add("hidden"); ui.hud.classList.add("hidden"); ui.over.classList.add("hidden"); ui.help.classList.add("hidden"); ui.start.classList.remove("hidden"); }

  document.querySelector("#play").addEventListener("click", play); document.querySelector("#startFromHelp").addEventListener("click", play); document.querySelector("#restart").addEventListener("click", play); document.querySelector("#menu").addEventListener("click", menu);
  document.querySelector("#help").addEventListener("click", () => { ui.start.classList.add("hidden"); ui.help.classList.remove("hidden"); }); document.querySelector("[data-close]").addEventListener("click", () => { ui.help.classList.add("hidden"); ui.start.classList.remove("hidden"); });
  document.querySelector("#loadout").addEventListener("click", openLoadout); document.querySelector("#close-loadout").addEventListener("click", closeLoadout); document.querySelector("#loadout-back").addEventListener("click", closeLoadout);
  ui.loadoutGrid.addEventListener("click", event => { const button = event.target.closest("[data-slot]"); if (!button) return; const slot = button.dataset.slot, options = gearSlots[slot].options; state.equipment[slot] = (state.equipment[slot] + 1) % options.length; applyStats(); renderLoadout(); });
  document.querySelector("#inventory").addEventListener("click", openInventory); document.querySelector("#close-inventory").addEventListener("click", closeInventory); document.querySelector("#inventory-back").addEventListener("click", closeInventory);
  ui.inventoryTabs.addEventListener("click", event => { const button = event.target.closest("[data-filter]"); if (!button) return; state.inventoryFilter = button.dataset.filter; ui.inventoryTabs.querySelectorAll("button").forEach(tab => tab.classList.toggle("active", tab === button)); renderInventory(); });
  ui.inventoryGrid.addEventListener("click", event => { const button = event.target.closest("[data-item-id]"); if (!button) return; state.selectedInventory = Number(button.dataset.itemId); renderInventory(); });
  ui.inventoryDetail.addEventListener("click", event => { const equip = event.target.closest("[data-equip-slot]"), upgrade = event.target.closest("[data-soul-upgrade]"); if (equip) { state.equipment[equip.dataset.equipSlot] = Number(equip.dataset.equipIndex); applyStats(); renderLoadout(); renderInventory(); showToast("GEGENSTAND AUSGERÜSTET"); } else if (upgrade) soulUpgrade(upgrade.dataset.soulUpgrade); });
  document.querySelector("#enchant").addEventListener("click", openEnchant); document.querySelector("#close-enchant").addEventListener("click", closeEnchant); document.querySelector("#enchant-back").addEventListener("click", closeEnchant); ui.enchantGrid.addEventListener("click", event => { const button = event.target.closest("[data-enchant-id]"); if (button) applyEnchant(button.dataset.enchantId); }); document.querySelector("#loot-continue").addEventListener("click", closeLootReveal);
  canvas.addEventListener("pointermove", event => { pointer.x = event.clientX; pointer.y = event.clientY; }); canvas.addEventListener("pointerdown", event => { pointer.down = true; pointer.x = event.clientX; pointer.y = event.clientY; }); window.addEventListener("pointerup", () => pointer.down = false);
  window.addEventListener("keydown", event => {
    keys[event.key] = true; if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault(); if (event.repeat) return;
    const key = event.key.toLowerCase(); if (key === "q") dash(); if (key === "r") repairFence(); if (key === "f") fireManaWeapon(); if (key === "e") interactCache(); if (key === "g") summonSouls();
    if (key === "m" && state.mode === "playing" && !state.loadoutOpen && !state.inventoryOpen && !state.enchantOpen && !state.lootOpen) { state.mapOpen = !state.mapOpen; pointer.down = false; showToast(state.mapOpen ? "ARENAKARTE — LOOT-RARITÄTEN SICHTBAR" : "ARENAKARTE GESCHLOSSEN"); }
    if (key === "c" && state.mode === "playing" && !state.mapOpen && !state.inventoryOpen && !state.enchantOpen) { if (state.loadoutOpen) closeLoadout(); else openLoadout(); }
    if (key === "i" && state.mode === "playing" && !state.mapOpen && !state.loadoutOpen && !state.enchantOpen) { if (state.inventoryOpen) closeInventory(); else openInventory(); }
    if (event.key === "Escape") { if (state.lootOpen) closeLootReveal(); else if (state.mapOpen) state.mapOpen = false; else if (state.loadoutOpen) closeLoadout(); else if (state.inventoryOpen) closeInventory(); else if (state.enchantOpen) closeEnchant(); }
  }); window.addEventListener("keyup", event => keys[event.key] = false); window.addEventListener("blur", () => pointer.down = false); window.addEventListener("resize", () => { resize(); updateCamera(0, true); });
  seedInventory(); resize(); renderLoadout(); renderEnchant(); updateCamera(0, true); requestAnimationFrame(loop);
})();
