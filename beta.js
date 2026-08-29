(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const ui = {
    start: document.querySelector("#start"), help: document.querySelector("#instructions"), over: document.querySelector("#gameover"), hud: document.querySelector("#hud"),
    heroHealth: document.querySelector("#heroHealth"), heroMeter: document.querySelector("#heroMeter"), manaValue: document.querySelector("#manaValue"), manaMeter: document.querySelector("#manaMeter"), keepHealth: document.querySelector("#keepHealth"), keepMeter: document.querySelector("#keepMeter"),
    wave: document.querySelector("#wave"), objective: document.querySelector("#objective"), enemyCount: document.querySelector("#enemyCount"), souls: document.querySelector("#souls"), scrap: document.querySelector("#scrap"), levelValue: document.querySelector("#levelValue"), xpMeter: document.querySelector("#xpMeter"), xpValue: document.querySelector("#xpValue"),
    fenceHealth: document.querySelector("#fenceHealth"), fenceMeter: document.querySelector("#fenceMeter"), fenceStatus: document.querySelector("#fenceStatus"), toast: document.querySelector("#toast"), summary: document.querySelector("#summary"), loadout: document.querySelector("#loadout-screen"), loadoutGrid: document.querySelector("#loadout-grid"), loadoutStats: document.querySelector("#loadout-stats")
  };

  const palette = { ground: "#10251f", groundAlt: "#17332a", grid: "#4c7b67", wood: "#73401f", woodLight: "#b96f35", iron: "#839292", stone: "#344b47", dark: "#071219", green: "#79dca9", orange: "#f48a4c", red: "#ee5e59", blue: "#66beff", violet: "#b399ff", gold: "#f4ca72", white: "#eaf5ef" };
  const world = { width: 3400, height: 2300, keep: { x: 1260, y: 885, w: 880, h: 630 }, artifact: { x: 1700, y: 1200 } };
  const keys = Object.create(null);
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, down: false };
  let previousTime = performance.now();

  const state = {
    mode: "menu", hero: null, enemies: [], bullets: [], particles: [], drops: [], fences: [],
    artifactHp: 250, artifactMaxHp: 250, artifactFlash: 0, scrap: 0, souls: 0, kills: 0, wave: 0, spawnLeft: 0, spawnTimer: 0, nextWaveTimer: 0,
    elapsed: 0, fireTimer: 0, manaFireTimer: 0, dashTimer: 0, toastTimer: 0, bannerTimer: 0, nextEnemy: 1, mapOpen: false, loadoutOpen: false,
    level: 1, xp: 0, xpToLevel: 100, levelDamage: 0, camera: { x: 0, y: 0, ready: false }, equipment: { boots: 0, pants: 0, chest: 0, helmet: 0, artifact1: 0, artifact2: 0, artifact3: 0, weapon: 0, manaWeapon: 0 }
  };

  const enemyKinds = {
    scavenger: { name: "SCAVENGER", hp: 48, speed: 55, damage: 8, attack: .82, radius: 17, color: "#b35c49", reward: 5 },
    raider: { name: "RAIDER", hp: 34, speed: 84, damage: 6, attack: .68, radius: 14, color: "#d58945", reward: 6 },
    mauler: { name: "MAULER", hp: 122, speed: 31, damage: 19, attack: 1.1, radius: 29, color: "#8a3f46", reward: 16 },
    breaker: { name: "THE BREAKER", hp: 580, speed: 23, damage: 34, attack: 1.05, radius: 48, color: "#6c3a46", reward: 45 }
  };

  const gearSlots = {
    boots: { label: "SCHUHE", options: [{ name: "Wanderstiefel", bonus: "Geschwindigkeit +0" }, { name: "Rift-Läufer", bonus: "Tempo +24" }, { name: "Kriegsstiefel", bonus: "Leben +12" }] },
    pants: { label: "HOSE", options: [{ name: "Feldhose", bonus: "Keine Werte" }, { name: "Nebelgamaschen", bonus: "Mana +18" }, { name: "Bollwerk-Beinschutz", bonus: "Leben +20" }] },
    chest: { label: "BRUSTPLATTE", options: [{ name: "Jägerweste", bonus: "Leben +10" }, { name: "Arkane Platten", bonus: "Mana +25" }, { name: "Titanenpanzer", bonus: "Leben +38" }] },
    helmet: { label: "HELM", options: [{ name: "Aufklärerhelm", bonus: "Keine Werte" }, { name: "Sehermaske", bonus: "Aim Assist +" }, { name: "Rift-Krone", bonus: "Schaden +7" }] },
    artifact1: { label: "ARTEFAKT I", options: [{ name: "Leerer Sockel", bonus: "—" }, { name: "Sonnenkern", bonus: "Leben +18" }, { name: "Seelenlinse", bonus: "XP +20%" }] },
    artifact2: { label: "ARTEFAKT II", options: [{ name: "Leerer Sockel", bonus: "—" }, { name: "Mondsplitter", bonus: "Mana-Regen +3" }, { name: "Kriegsrune", bonus: "Schaden +5" }] },
    artifact3: { label: "ARTEFAKT III", options: [{ name: "Leerer Sockel", bonus: "—" }, { name: "Bollwerksamulett", bonus: "Artefakt-HP +50" }, { name: "Glücksmünze", bonus: "Loot +" }] },
    weapon: { label: "WAFFE", options: [{ name: "Arc Reaper", bonus: "Schaden 25" }, { name: "Sonnenklinge", bonus: "Schaden +9" }, { name: "Rift-Kanone", bonus: "Schaden +16" }] },
    manaWeapon: { label: "MANA-WAFFE", options: [{ name: "Blauer Stab", bonus: "F: 60 Schaden" }, { name: "Void-Katalysator", bonus: "F: 80 Schaden" }, { name: "Sturmfokus", bonus: "F: Kette +" }] }
  };

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function random(min, max) { return min + Math.random() * (max - min); }
  function shade(hex, amount) {
    const value = parseInt(hex.slice(1), 16);
    const r = clamp(((value >> 16) & 255) * amount, 0, 255) | 0;
    const g = clamp(((value >> 8) & 255) * amount, 0, 255) | 0;
    const b = clamp((value & 255) * amount, 0, 255) | 0;
    return `rgb(${r}, ${g}, ${b})`;
  }

  function stats() {
    const gear = state.equipment;
    const health = (gear.boots === 2 ? 12 : 0) + (gear.pants === 2 ? 20 : 0) + (gear.chest === 2 ? 38 : 0) + (gear.artifact1 === 1 ? 18 : 0);
    const mana = (gear.pants === 1 ? 18 : 0) + (gear.chest === 1 ? 25 : 0);
    const damage = state.levelDamage + (gear.helmet === 2 ? 7 : 0) + (gear.artifact2 === 2 ? 5 : 0) + [25, 34, 41][gear.weapon];
    return { maxHp: 100 + (state.level - 1) * 15 + health, maxMana: 60 + (state.level - 1) * 12 + mana, speed: 230 + (gear.boots === 1 ? 24 : 0), manaRegen: 8 + (gear.artifact2 === 1 ? 3 : 0), damage, manaDamage: [60, 80, 70][gear.manaWeapon], aimAssist: .16 + (gear.helmet === 1 ? .10 : 0), xpMultiplier: gear.artifact1 === 2 ? 1.2 : 1, lootLuck: gear.artifact3 === 2 ? .14 : 0, artifactMaxHp: 250 + (gear.artifact3 === 1 ? 50 : 0) };
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
    const value = stats(); ui.loadoutStats.textContent = `Leben ${value.maxHp} · Mana ${value.maxMana} · Schaden ${value.damage} · Mana-Regen ${value.manaRegen}/s · Artefakt ${value.artifactMaxHp} HP`;
  }

  function openLoadout() { state.loadoutOpen = true; renderLoadout(); ui.loadout.classList.remove("hidden"); if (state.mode === "menu") ui.start.classList.add("hidden"); }
  function closeLoadout() { state.loadoutOpen = false; ui.loadout.classList.add("hidden"); if (state.mode === "menu") ui.start.classList.remove("hidden"); }

  function camera() {
    const zoom = clamp(Math.min(innerWidth / 1080, innerHeight / 720), .52, 1.02);
    const viewW = innerWidth / zoom, viewH = innerHeight / zoom;
    const focus = state.hero || world.artifact; const x = clamp(focus.x - viewW / 2, 0, world.width - viewW), y = clamp(focus.y - viewH / 2, 0, world.height - viewH);
    return { zoom, x: state.camera.ready ? state.camera.x : x, y: state.camera.ready ? state.camera.y : y };
  }
  function updateCamera(dt, snap = false) { const zoom = clamp(Math.min(innerWidth / 1080, innerHeight / 720), .52, 1.02), viewW = innerWidth / zoom, viewH = innerHeight / zoom, focus = state.hero || world.artifact, x = clamp(focus.x - viewW / 2, 0, world.width - viewW), y = clamp(focus.y - viewH / 2, 0, world.height - viewH); if (snap || !state.camera.ready) { state.camera.x = x; state.camera.y = y; state.camera.ready = true; return; } const smoothing = Math.min(1, dt * 7); state.camera.x += (x - state.camera.x) * smoothing; state.camera.y += (y - state.camera.y) * smoothing; }
  function toScreen(x, y, cam) { return { x: (x - cam.x) * cam.zoom, y: (y - cam.y) * cam.zoom }; }
  function toWorld(x, y) { const cam = camera(); return { x: x / cam.zoom + cam.x, y: y / cam.zoom + cam.y }; }
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
    state.level = 1; state.xp = 0; state.xpToLevel = 100; state.levelDamage = 0; state.mapOpen = false; state.loadoutOpen = false;
    const value = stats(); state.hero = { x: world.artifact.x, y: world.artifact.y + 105, hp: value.maxHp, maxHp: value.maxHp, mana: value.maxMana, maxMana: value.maxMana, angle: -Math.PI / 2, invulnerable: 0 };
    state.enemies.length = 0; state.bullets.length = 0; state.particles.length = 0; state.drops.length = 0;
    state.fences = makeFence(); state.artifactMaxHp = value.artifactMaxHp; state.artifactHp = state.artifactMaxHp; state.artifactFlash = 0; state.scrap = 12; state.souls = 0; state.kills = 0; state.wave = 0;
    state.spawnLeft = 0; state.spawnTimer = 0; state.nextWaveTimer = 0; state.elapsed = 0; state.fireTimer = 0; state.manaFireTimer = 0; state.dashTimer = 0; state.nextEnemy = 1; updateCamera(0, true);
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
    if (state.wave >= 3 && roll < .2) return "mauler";
    return roll < .42 ? "raider" : "scavenger";
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
    const enemy = { id: state.nextEnemy++, kind, x, y, hp: config.hp * scaling, maxHp: config.hp * scaling, angle: 0, fence: null, phase: "siege", attackTimer: random(.2, .8), hitFlash: 0, crossProgress: 0 };
    enemy.fence = nearestFence(enemy); state.enemies.push(enemy);
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

  function rollLoot(enemy, config) {
    const luck = stats().lootLuck, roll = Math.random() + luck;
    let rarity = "GEWÖHNLICH", color = "#d9e2df", multiplier = 1;
    if (enemy.kind === "breaker" || roll > 1.07) { rarity = "LEGENDÄR"; color = "#ffad46"; multiplier = 5; }
    else if (roll > .88) { rarity = "EPISCH"; color = "#c48cff"; multiplier = 3.3; }
    else if (roll > .65) { rarity = "SELTEN"; color = "#63aaff"; multiplier = 2.2; }
    else if (roll > .38) { rarity = "UNGEWÖHNLICH"; color = "#71dc9e"; multiplier = 1.45; }
    const names = { "GEWÖHNLICH": "Verlorener Schrott", "UNGEWÖHNLICH": "Runenfragment", "SELTEN": "Sternensplitter", "EPISCH": "Rift-Relikt", "LEGENDÄR": "Kern der Dämmerung" };
    state.drops.push({ x: enemy.x, y: enemy.y, value: Math.round(config.reward * multiplier), xp: Math.round(config.reward * 1.7 * multiplier), rarity, color, name: names[rarity], bob: Math.random() * Math.PI * 2 });
    if (enemy.kind === "breaker") state.drops.push({ x: enemy.x + 35, y: enemy.y - 22, value: 80, xp: 120, rarity: "LEGENDÄR", color: "#ffad46", name: "Herz des Brechers", bob: Math.random() * Math.PI * 2 });
  }

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
    const start = { x: hero.x + Math.cos(hero.angle) * 24, y: hero.y + Math.sin(hero.angle) * 24 };
    state.bullets.push({ ...start, vx: Math.cos(hero.angle) * 760, vy: Math.sin(hero.angle) * 760, life: 1.05, damage: stats().damage, radius: 4, color: palette.blue });
    state.fireTimer = .16; particle(start.x, start.y, palette.blue, 4, 45, .22);
  }

  function fireManaWeapon() {
    const hero = state.hero, value = stats(), cost = 26;
    if (state.mode !== "playing" || state.manaFireTimer > 0 || state.mapOpen || state.loadoutOpen) return;
    if (hero.mana < cost) { showToast("ZU WENIG MANA FÜR DIE MANA-WAFFE"); return; }
    hero.mana -= cost; state.manaFireTimer = .7;
    const start = { x: hero.x + Math.cos(hero.angle) * 27, y: hero.y + Math.sin(hero.angle) * 27 };
    state.bullets.push({ ...start, vx: Math.cos(hero.angle) * 640, vy: Math.sin(hero.angle) * 640, life: 1.25, damage: value.manaDamage, radius: 9, color: palette.violet, mana: true });
    particle(start.x, start.y, palette.violet, 16, 100, .48);
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
    hero.angle = assistedAngle(rawAngle); hero.invulnerable = Math.max(0, hero.invulnerable - dt); hero.mana = Math.min(hero.maxMana, hero.mana + stats().manaRegen * dt); state.fireTimer -= dt; state.manaFireTimer = Math.max(0, state.manaFireTimer - dt); state.dashTimer = Math.max(0, state.dashTimer - dt);
    if (pointer.down || keys.Space) fire();
  }

  function updateEnemies(dt) {
    for (const enemy of state.enemies) {
      const config = enemyKinds[enemy.kind], fence = enemy.fence;
      enemy.attackTimer -= dt; enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      if (enemy.phase === "siege") {
        if (fence.breached) { enemy.phase = "breach"; continue; }
        const target = { x: fence.x + fence.normalX * 48, y: fence.y + fence.normalY * 48 };
        const d = move(enemy, target, config.speed, dt);
        if (d < config.radius + 32 && enemy.attackTimer <= 0) { damageFence(fence, config.damage); enemy.attackTimer = config.attack; }
        continue;
      }
      if (enemy.phase === "breach") {
        if (!fence.breached) { enemy.phase = "siege"; continue; }
        const target = { x: fence.x - fence.normalX * 68, y: fence.y - fence.normalY * 68 };
        if (move(enemy, target, config.speed * 1.08, dt) < 14) enemy.phase = "inside";
        continue;
      }
      const artifactDistance = move(enemy, world.artifact, config.speed, dt);
      const heroDistance = distance(enemy, state.hero);
      if (heroDistance < config.radius + 26 && enemy.attackTimer <= 0) { damageHero(config.damage, enemy); enemy.attackTimer = config.attack; }
      else if (artifactDistance < config.radius + 35 && enemy.attackTimer <= 0) { damageArtifact(config.damage); enemy.attackTimer = config.attack; }
    }
  }

  function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i]; bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt;
      if (bullet.life <= 0 || bullet.x < 0 || bullet.y < 0 || bullet.x > world.width || bullet.y > world.height) { state.bullets.splice(i, 1); continue; }
      let hit = null;
      for (const enemy of state.enemies) if (distance(bullet, enemy) < bullet.radius + enemyKinds[enemy.kind].radius) { hit = enemy; break; }
      if (!hit) continue;
      hit.hp -= bullet.damage; hit.hitFlash = .1; particle(bullet.x, bullet.y, palette.blue, 4, 55, .28); state.bullets.splice(i, 1);
      if (hit.hp <= 0) {
        const config = enemyKinds[hit.kind]; state.kills++; state.souls += hit.kind === "breaker" ? 8 : 1; particle(hit.x, hit.y, config.color, hit.kind === "breaker" ? 35 : 12, hit.kind === "breaker" ? 190 : 100, hit.kind === "breaker" ? 1.2 : .7);
        rollLoot(hit, config); state.enemies.splice(state.enemies.indexOf(hit), 1);
        if (hit.kind === "breaker") showToast("THE BREAKER IST GEFALLEN");
      }
    }
  }

  function updateDrops(dt) {
    for (let i = state.drops.length - 1; i >= 0; i--) {
      const drop = state.drops[i]; drop.bob += dt * 4;
      if (distance(drop, state.hero) < 46) { state.scrap += drop.value; gainXp(drop.xp); particle(drop.x, drop.y, drop.color, 14, 95, .55); showToast(`${drop.rarity}: ${drop.name} — +${drop.value} SCHROTT`); state.drops.splice(i, 1); }
    }
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) { const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .94; p.vy *= .94; p.life -= dt; if (p.life <= 0) state.particles.splice(i, 1); }
    state.fences.forEach(fence => fence.flash = Math.max(0, fence.flash - dt)); state.artifactFlash = Math.max(0, state.artifactFlash - dt);
  }

  function updateWave(dt) {
    if (state.spawnLeft > 0) { state.spawnTimer -= dt; if (state.spawnTimer <= 0) { spawnEnemy(); state.spawnLeft--; state.spawnTimer = .5; } return; }
    if (state.enemies.length) return;
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
    ui.enemyCount.textContent = `${state.enemies.length + state.spawnLeft} Gegner`; ui.souls.textContent = state.souls; ui.scrap.textContent = state.scrap;
    ui.levelValue.textContent = state.level; ui.xpMeter.style.width = `${state.xp / state.xpToLevel * 100}%`; ui.xpValue.textContent = `${state.xp} / ${state.xpToLevel} XP`;
    ui.fenceHealth.textContent = `${Math.ceil(fence.hp)} / ${fence.maxHp}`; ui.fenceMeter.style.width = `${fencePercent}%`; ui.fenceStatus.textContent = fence.breached ? `BRESCHE — ${fence.side}` : `${fence.side}-ZAUN INTAKT`;
  }

  function update(dt) {
    if (state.toastTimer > 0) { state.toastTimer -= dt; if (state.toastTimer <= 0) ui.toast.classList.remove("toast-visible"); }
    if (state.mode !== "playing" || state.mapOpen || state.loadoutOpen) return;
    state.elapsed += dt; state.bannerTimer = Math.max(0, state.bannerTimer - dt); updateHero(dt); updateCamera(dt); updateWave(dt); updateEnemies(dt); updateBullets(dt); updateDrops(dt); updateParticles(dt);
    if (state.artifactHp <= 0) { gameOver(); return; }
    if (state.hero.hp <= 0) reviveHero();
    updateUi();
  }

  function rect(x, y, w, h, color, cam, stroke) { const p = toScreen(x, y, cam); ctx.fillStyle = color; ctx.fillRect(p.x, p.y, w * cam.zoom, h * cam.zoom); if (stroke) { ctx.strokeStyle = stroke; ctx.strokeRect(p.x, p.y, w * cam.zoom, h * cam.zoom); } }
  function circle(x, y, radius, color, cam, alpha = 1) { const p = toScreen(x, y, cam); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, radius * cam.zoom, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }

  function drawBackground(cam) {
    const gradient = ctx.createLinearGradient(0, 0, 0, innerHeight); gradient.addColorStop(0, "#0a1b28"); gradient.addColorStop(1, "#061014"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight);
    const origin = toScreen(0, 0, cam); rect(0, 0, world.width, world.height, palette.ground, cam);
    ctx.save(); ctx.strokeStyle = "rgba(113, 178, 143, .09)"; ctx.lineWidth = 1;
    for (let x = Math.floor(cam.x / 70) * 70; x < cam.x + innerWidth / cam.zoom + 70; x += 70) { const p = toScreen(x, 0, cam); ctx.beginPath(); ctx.moveTo(p.x, origin.y); ctx.lineTo(p.x, origin.y + world.height * cam.zoom); ctx.stroke(); }
    for (let y = Math.floor(cam.y / 70) * 70; y < cam.y + innerHeight / cam.zoom + 70; y += 70) { const p = toScreen(0, y, cam); ctx.beginPath(); ctx.moveTo(origin.x, p.y); ctx.lineTo(origin.x + world.width * cam.zoom, p.y); ctx.stroke(); }
    ctx.restore();
    [[180,190,1],[280,870,.8],[1435,150,.9],[1510,880,1.15],[240,530,.65],[1450,550,.72],[3100,210,.9],[2860,570,1.1],[2400,1800,.82],[300,1900,1.2],[550,1600,.78],[2920,1900,.9],[2110,350,.85],[980,2050,1.05],[1820,2050,.72]].forEach(([x,y,s]) => drawTree(x,y,s,cam));
    [[340,330,.8],[1300,770,.7],[1320,280,1],[3000,430,1],[2550,1700,.9],[410,1700,1.1],[2200,500,.76],[980,1900,.8]].forEach(([x,y,s]) => drawRuin(x,y,s,cam));
  }

  function drawTree(x, y, size, cam) { rect(x - 10 * size, y + 12 * size, 20 * size, 54 * size, palette.wood, cam); circle(x, y, 57 * size, "#1e5138", cam); circle(x + 25 * size, y - 22 * size, 43 * size, "#17452f", cam); circle(x - 27 * size, y - 19 * size, 38 * size, "#245d3e", cam); }
  function drawRuin(x, y, size, cam) { rect(x, y, 90 * size, 25 * size, "#344541", cam); rect(x + 10 * size, y - 32 * size, 26 * size, 33 * size, "#3e524e", cam); rect(x + 55 * size, y - 55 * size, 25 * size, 55 * size, "#3e524e", cam); }

  function drawKeep(cam) {
    const keep = world.keep; rect(keep.x - 28, keep.y - 28, keep.w + 56, keep.h + 56, "#203a33", cam, "rgba(129, 214, 166, .3)"); rect(keep.x, keep.y, keep.w, keep.h, "#173028", cam);
    drawArtifact(cam);
    const artifact = world.artifact; rect(artifact.x - 102, artifact.y + 78, 55, 14, palette.wood, cam); rect(artifact.x + 60, artifact.y + 84, 56, 14, palette.woodLight, cam);
    state.fences.forEach(fence => drawFence(fence, cam));
  }

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
    const config = enemyKinds[enemy.kind], p = toScreen(enemy.x, enemy.y, cam), r = config.radius * cam.zoom, color = enemy.hitFlash > 0 ? palette.white : config.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(enemy.angle); ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(0, r * .25, r * .83, r * .32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.fillRect(-r * .64, -r * .55, r * 1.28, r * 1.2); ctx.fillStyle = shade(color, 1.3); ctx.fillRect(-r * .5, -r, r, r * .48); ctx.fillStyle = palette.dark; ctx.fillRect(-r * .38, -r * .26, r * .17, r * .12); ctx.fillRect(r * .21, -r * .26, r * .17, r * .12);
    if (enemy.kind === "breaker") { ctx.fillStyle = palette.orange; ctx.fillRect(-r * .18, -r * .02, r * .36, r * .26); ctx.fillStyle = palette.stone; ctx.fillRect(-r, -r * .4, r * .22, r); ctx.fillRect(r * .78, -r * .4, r * .22, r); }
    ctx.restore();
    const width = Math.max(28, r * 2.2); ctx.fillStyle = "#080d0d"; ctx.fillRect(p.x - width / 2, p.y - r * 1.36, width, 4); ctx.fillStyle = enemy.kind === "breaker" ? palette.orange : palette.red; ctx.fillRect(p.x - width / 2, p.y - r * 1.36, width * enemy.hp / enemy.maxHp, 4);
  }

  function drawHero(hero, cam) {
    const p = toScreen(hero.x, hero.y, cam); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(hero.angle); const scale = cam.zoom;
    if (hero.invulnerable > 0 && Math.floor(hero.invulnerable * 24) % 2 === 0) ctx.globalAlpha = .38;
    ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(0, 7 * scale, 25 * scale, 11 * scale, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    const gear = state.equipment, chestColor = ["#2a6b86", "#594d92", "#59645b"][gear.chest], helmetColor = ["#8db1bf", "#b399ff", "#edc15c"][gear.helmet], bootColor = ["#1b2c38", "#386a73", "#423d34"][gear.boots], weaponColor = [palette.blue, palette.gold, palette.violet][gear.weapon];
    ctx.fillStyle = bootColor; ctx.fillRect(-15 * scale, 17 * scale, 11 * scale, 9 * scale); ctx.fillRect(4 * scale, 17 * scale, 11 * scale, 9 * scale); ctx.fillStyle = chestColor; ctx.fillRect(-15 * scale, -13 * scale, 30 * scale, 35 * scale); ctx.fillStyle = helmetColor; ctx.fillRect(-12 * scale, -27 * scale, 24 * scale, 16 * scale); ctx.fillStyle = "#a66e4e"; ctx.fillRect(-10 * scale, -42 * scale, 20 * scale, 17 * scale);
    ctx.fillStyle = weaponColor; ctx.fillRect(12 * scale, -4 * scale, 34 * scale, 7 * scale); ctx.fillStyle = palette.white; ctx.fillRect(43 * scale, -3 * scale, 8 * scale, 5 * scale); ctx.restore();
  }

  function drawEffects(cam) {
    state.drops.forEach(drop => { const p = toScreen(drop.x, drop.y - Math.sin(drop.bob) * 5, cam); ctx.save(); ctx.shadowBlur = 18; ctx.shadowColor = drop.color; ctx.fillStyle = drop.color; ctx.beginPath(); ctx.moveTo(p.x, p.y - 9 * cam.zoom); ctx.lineTo(p.x + 9 * cam.zoom, p.y); ctx.lineTo(p.x, p.y + 11 * cam.zoom); ctx.lineTo(p.x - 9 * cam.zoom, p.y); ctx.closePath(); ctx.fill(); ctx.restore(); });
    state.bullets.forEach(bullet => { const p = toScreen(bullet.x, bullet.y, cam), color = bullet.color || palette.blue; ctx.save(); ctx.strokeStyle = color; ctx.shadowBlur = bullet.mana ? 22 : 12; ctx.shadowColor = color; ctx.lineWidth = (bullet.mana ? 6 : 3) * cam.zoom; ctx.beginPath(); ctx.moveTo(p.x - bullet.vx * .012 * cam.zoom, p.y - bullet.vy * .012 * cam.zoom); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore(); });
    state.particles.forEach(item => { const p = toScreen(item.x, item.y, cam); ctx.save(); ctx.globalAlpha = item.life / item.maxLife; ctx.fillStyle = item.color; ctx.beginPath(); ctx.arc(p.x, p.y, item.size * cam.zoom, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
  }

  function drawArenaMap() {
    const margin = 52, maxW = innerWidth - margin * 2, maxH = innerHeight - margin * 2, scale = Math.min(maxW / world.width, maxH / world.height), width = world.width * scale, height = world.height * scale, x = (innerWidth - width) / 2, y = (innerHeight - height) / 2;
    const point = item => ({ x: x + item.x * scale, y: y + item.y * scale });
    ctx.save(); ctx.fillStyle = "rgba(3, 10, 14, .9)"; ctx.fillRect(0, 0, innerWidth, innerHeight); ctx.fillStyle = "#102922"; ctx.fillRect(x, y, width, height); ctx.strokeStyle = "#8be1b1"; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, height);
    const keep = world.keep; ctx.fillStyle = "rgba(93, 219, 157, .17)"; ctx.fillRect(x + keep.x * scale, y + keep.y * scale, keep.w * scale, keep.h * scale); ctx.strokeStyle = "rgba(164, 237, 194, .8)"; ctx.strokeRect(x + keep.x * scale, y + keep.y * scale, keep.w * scale, keep.h * scale);
    state.fences.forEach(fence => { const p = point(fence); ctx.fillStyle = fence.breached ? palette.orange : "#b9814a"; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
    state.enemies.forEach(enemy => { const p = point(enemy); ctx.fillStyle = enemy.kind === "breaker" ? palette.orange : palette.red; ctx.beginPath(); ctx.arc(p.x, p.y, enemy.kind === "breaker" ? 6 : 3, 0, Math.PI * 2); ctx.fill(); });
    state.drops.forEach(drop => { const p = point(drop); ctx.fillStyle = drop.color; ctx.shadowBlur = 9; ctx.shadowColor = drop.color; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = drop.color; ctx.font = "700 10px system-ui"; ctx.fillText(drop.rarity, p.x + 8, p.y - 6); });
    const artifact = point(world.artifact), hero = point(state.hero); ctx.fillStyle = palette.violet; ctx.beginPath(); ctx.arc(artifact.x, artifact.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = palette.blue; ctx.beginPath(); ctx.arc(hero.x, hero.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette.white; ctx.font = "900 18px system-ui"; ctx.fillText("ARENAKARTE", x, y - 17); ctx.font = "700 11px system-ui"; ctx.fillStyle = "#bbd7cb"; ctx.fillText("Blau: Held  ·  Violett: Rift-Artefakt  ·  Rot: Gegner  ·  Farbig: Loot-Rarität", x, y + height + 21); ctx.fillText("[M] Karte schließen", x + width - 120, y - 17); ctx.restore();
  }

  function render() {
    const cam = camera(); drawBackground(cam); drawKeep(cam); state.drops.forEach(() => {}); state.enemies.forEach(enemy => drawEnemy(enemy, cam)); drawEffects(cam); if (state.hero) drawHero(state.hero, cam);
    if (state.mode === "playing" && state.bannerTimer > 0) { ctx.save(); ctx.globalAlpha = clamp(state.bannerTimer, 0, 1); ctx.textAlign = "center"; ctx.fillStyle = palette.white; ctx.font = `900 ${Math.max(24, 33 * cam.zoom)}px system-ui`; ctx.fillText(`WELLE ${state.wave}`, innerWidth / 2, innerHeight * .21); ctx.fillStyle = palette.orange; ctx.font = `800 ${Math.max(10, 12 * cam.zoom)}px system-ui`; ctx.fillText(state.wave % 3 === 0 ? "BOSS-BELAGERUNG" : "DIE HORDE KOMMT", innerWidth / 2, innerHeight * .21 + 25 * cam.zoom); ctx.restore(); }
    if (state.mapOpen && state.hero) drawArenaMap();
  }

  function loop(time) { const dt = Math.min(.033, (time - previousTime) / 1000); previousTime = time; update(dt); render(); requestAnimationFrame(loop); }
  function resize() { const dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr); canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function play() { reset(); state.mode = "playing"; ui.start.classList.add("hidden"); ui.help.classList.add("hidden"); ui.over.classList.add("hidden"); ui.loadout.classList.add("hidden"); ui.hud.classList.remove("hidden"); previousTime = performance.now(); updateUi(); }
  function menu() { state.mode = "menu"; state.mapOpen = false; closeLoadout(); ui.hud.classList.add("hidden"); ui.over.classList.add("hidden"); ui.help.classList.add("hidden"); ui.start.classList.remove("hidden"); }

  document.querySelector("#play").addEventListener("click", play); document.querySelector("#startFromHelp").addEventListener("click", play); document.querySelector("#restart").addEventListener("click", play); document.querySelector("#menu").addEventListener("click", menu);
  document.querySelector("#help").addEventListener("click", () => { ui.start.classList.add("hidden"); ui.help.classList.remove("hidden"); }); document.querySelector("[data-close]").addEventListener("click", () => { ui.help.classList.add("hidden"); ui.start.classList.remove("hidden"); });
  document.querySelector("#loadout").addEventListener("click", openLoadout); document.querySelector("#close-loadout").addEventListener("click", closeLoadout); document.querySelector("#loadout-back").addEventListener("click", closeLoadout);
  ui.loadoutGrid.addEventListener("click", event => { const button = event.target.closest("[data-slot]"); if (!button) return; const slot = button.dataset.slot, options = gearSlots[slot].options; state.equipment[slot] = (state.equipment[slot] + 1) % options.length; applyStats(); renderLoadout(); });
  canvas.addEventListener("pointermove", event => { pointer.x = event.clientX; pointer.y = event.clientY; }); canvas.addEventListener("pointerdown", event => { pointer.down = true; pointer.x = event.clientX; pointer.y = event.clientY; }); window.addEventListener("pointerup", () => pointer.down = false);
  window.addEventListener("keydown", event => {
    keys[event.key] = true; if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault(); if (event.repeat) return;
    const key = event.key.toLowerCase(); if (key === "q") dash(); if (key === "r") repairFence(); if (key === "f") fireManaWeapon();
    if (key === "m" && state.mode === "playing" && !state.loadoutOpen) { state.mapOpen = !state.mapOpen; pointer.down = false; showToast(state.mapOpen ? "ARENAKARTE — LOOT-RARITÄTEN SICHTBAR" : "ARENAKARTE GESCHLOSSEN"); }
    if (key === "c" && state.mode === "playing" && !state.mapOpen) { if (state.loadoutOpen) closeLoadout(); else openLoadout(); }
    if (event.key === "Escape") { if (state.mapOpen) state.mapOpen = false; else if (state.loadoutOpen) closeLoadout(); }
  }); window.addEventListener("keyup", event => keys[event.key] = false); window.addEventListener("blur", () => pointer.down = false); window.addEventListener("resize", () => { resize(); updateCamera(0, true); });
  resize(); renderLoadout(); updateCamera(0, true); requestAnimationFrame(loop);
})();
