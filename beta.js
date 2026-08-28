(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const menuScreen = document.querySelector("#menu-screen");
  const howtoScreen = document.querySelector("#howto-screen");
  const pauseScreen = document.querySelector("#pause-screen");
  const gameoverScreen = document.querySelector("#gameover-screen");
  const hud = document.querySelector("#hud");
  const toast = document.createElement("div");
  toast.className = "game-toast";
  document.querySelector("#game-ui").appendChild(toast);

  const palette = {
    sky: "#0a1723", ground: "#12221f", groundAlt: "#152a26", moss: "#1d4430", stone: "#394751", darkStone: "#1b272f",
    wood: "#603119", lightWood: "#a15b2c", iron: "#697b84", blue: "#2d9cff", violet: "#9b56ff", orange: "#fa6930", gold: "#ffc253",
    red: "#ff4f65", green: "#5ede98", skin: "#986948", white: "#eaf2f7", muted: "#78909e", black: "#070c11"
  };

  const world = { width: 2200, height: 1450, baseX: 1100, baseY: 735 };
  const keys = Object.create(null);
  const pointer = { x: innerWidth * .5, y: innerHeight * .5, down: false };
  const state = {
    mode: "menu", wave: 0, waveState: "READY", waveBanner: 0, intermission: 0,
    hero: null, enemies: [], bullets: [], particles: [], drops: [], allies: [],
    spawnQueue: 0, spawnClock: 0, baseHp: 100, souls: 0, scrap: 0,
    elapsed: 0, kills: 0, fireClock: 0, dashClock: 0, summonClock: 0, toastClock: 0,
    nextEnemyId: 1, lastTime: performance.now()
  };

  const enemyTypes = {
    grunt: { name: "GRUNT", hp: 42, speed: 62, radius: 18, damage: 8, color: "#7a3039", soul: 1, score: 10 },
    runner: { name: "RUNNER", hp: 26, speed: 108, radius: 14, damage: 5, color: "#bf6336", soul: 1, score: 14 },
    archer: { name: "ARCHER", hp: 34, speed: 46, radius: 16, damage: 5, color: "#5e426f", soul: 2, score: 18, ranged: true },
    brute: { name: "BRUTE", hp: 155, speed: 30, radius: 30, damage: 21, color: "#5e2930", soul: 4, score: 35 },
    mage: { name: "RIFT MAGE", hp: 68, speed: 38, radius: 20, damage: 10, color: "#6f3baf", soul: 3, score: 30, ranged: true }
  };

  function resetRun() {
    state.wave = 0; state.waveState = "INCOMING"; state.waveBanner = 0; state.intermission = 0; state.spawnQueue = 0; state.spawnClock = 0;
    state.enemies.length = 0; state.bullets.length = 0; state.particles.length = 0; state.drops.length = 0; state.allies.length = 0;
    state.baseHp = 100; state.souls = 4; state.scrap = 0; state.kills = 0; state.elapsed = 0; state.fireClock = 0; state.dashClock = 0; state.summonClock = 0;
    state.hero = { x: world.baseX, y: world.baseY + 160, hp: 100, maxHp: 100, speed: 245, angle: -Math.PI / 2, invuln: 0 };
    beginWave();
  }

  function beginWave() {
    state.wave += 1;
    state.waveState = "INCOMING";
    state.waveBanner = 2.2;
    state.spawnQueue = 4 + state.wave * 2;
    if (state.wave % 4 === 0) state.spawnQueue += 1;
    state.spawnClock = .15;
  }

  function startRun() {
    resetRun(); state.mode = "playing"; hideAllScreens(); hud.classList.remove("hidden");
    notify(`WAVE ${state.wave} INCOMING`);
  }

  function showMenu() { state.mode = "menu"; hideAllScreens(); menuScreen.classList.remove("hidden"); }
  function showHowto() { hideAllScreens(); howtoScreen.classList.remove("hidden"); }
  function pauseRun() { if (state.mode === "playing") { state.mode = "paused"; pauseScreen.classList.remove("hidden"); } }
  function resumeRun() { if (state.mode === "paused") { state.mode = "playing"; pauseScreen.classList.add("hidden"); state.lastTime = performance.now(); } }
  function hideAllScreens() { menuScreen.classList.add("hidden"); howtoScreen.classList.add("hidden"); pauseScreen.classList.add("hidden"); gameoverScreen.classList.add("hidden"); }

  function gameOver() {
    state.mode = "gameover"; hud.classList.add("hidden"); gameoverScreen.classList.remove("hidden");
    document.querySelector("#gameover-copy").textContent = `You reached wave ${state.wave} and defeated ${state.kills} enemies.`;
  }

  function notify(message) {
    toast.textContent = message; toast.classList.add("show"); state.toastClock = 2.6;
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false;
  }

  function scale() { return Math.min(1.12, Math.max(.56, Math.min(innerWidth / 1180, innerHeight / 770))); }
  function camera() {
    const s = scale();
    const viewW = innerWidth / s, viewH = innerHeight / s;
    const focus = state.hero || { x: world.baseX, y: world.baseY };
    return { s, x: Math.max(0, Math.min(world.width - viewW, focus.x - viewW / 2)), y: Math.max(0, Math.min(world.height - viewH, focus.y - viewH / 2)) };
  }
  function screenToWorld(sx, sy) { const cam = camera(); return { x: sx / cam.s + cam.x, y: sy / cam.s + cam.y }; }
  function point(x, y, cam) { return [(x - cam.x) * cam.s, (y - cam.y) * cam.s]; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function angleTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
  function randomRange(min, max) { return min + Math.random() * (max - min); }

  function spawnEnemy(typeName) {
    const type = enemyTypes[typeName];
    const edge = Math.floor(Math.random() * 4); let x, y;
    if (edge === 0) { x = randomRange(80, world.width - 80); y = 45; }
    else if (edge === 1) { x = world.width - 45; y = randomRange(80, world.height - 80); }
    else if (edge === 2) { x = randomRange(80, world.width - 80); y = world.height - 45; }
    else { x = 45; y = randomRange(80, world.height - 80); }
    const scaleHp = 1 + Math.max(0, state.wave - 3) * .16;
    state.enemies.push({ id: state.nextEnemyId++, type: typeName, x, y, hp: type.hp * scaleHp, maxHp: type.hp * scaleHp, attackClock: randomRange(.2, .9), shotClock: randomRange(.4, 1.8), hitFlash: 0, angle: 0 });
  }

  function chooseEnemyType() {
    const roll = Math.random();
    if (state.wave >= 4 && roll < .09) return "mage";
    if (state.wave >= 3 && roll < .20) return "brute";
    if (roll < .35) return "runner";
    if (roll < .53) return "archer";
    return "grunt";
  }

  function spawnBoss() {
    state.enemies.push({ id: state.nextEnemyId++, type: "boss", x: world.baseX - 620, y: world.baseY - 420, hp: 900 + state.wave * 90, maxHp: 900 + state.wave * 90, attackClock: 1.3, shotClock: 2, hitFlash: 0, angle: 0 });
    notify("THE BREAKER HAS ENTERED THE KEEP");
  }

  function addParticle(x, y, color, count = 5, speed = 70, life = .55) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, velocity = randomRange(speed * .35, speed);
      state.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: randomRange(life * .55, life), maxLife: life, size: randomRange(2, 5), color });
    }
  }

  function addDrop(x, y, type) { state.drops.push({ x, y, type, bob: Math.random() * Math.PI * 2 }); }

  function killEnemy(enemy) {
    const type = enemy.type === "boss" ? { soul: 15, score: 250, color: palette.orange } : enemyTypes[enemy.type];
    state.kills += 1; addParticle(enemy.x, enemy.y, type.color, enemy.type === "boss" ? 36 : 10, enemy.type === "boss" ? 180 : 90, enemy.type === "boss" ? 1.2 : .7);
    if (enemy.type === "boss") { addDrop(enemy.x, enemy.y, "bossSoul"); addDrop(enemy.x + 28, enemy.y + 20, "scrap"); notify("BREAKER SOUL RECOVERED"); }
    else { if (Math.random() < .72) addDrop(enemy.x, enemy.y, "soul"); if (Math.random() < .48) addDrop(enemy.x + randomRange(-16,16), enemy.y + randomRange(-16,16), "scrap"); }
  }

  function shoot(x, y, angle, owner = "hero", damage = 24, color = palette.blue, speed = 720) {
    state.bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1.2, owner, damage, color, radius: owner === "enemy" ? 7 : 5 });
    addParticle(x, y, color, 3, 35, .24);
  }

  function updateHero(dt) {
    const hero = state.hero; let dx = 0, dy = 0;
    if (keys.w || keys.ArrowUp) dy -= 1; if (keys.s || keys.ArrowDown) dy += 1; if (keys.a || keys.ArrowLeft) dx -= 1; if (keys.d || keys.ArrowRight) dx += 1;
    const length = Math.hypot(dx, dy) || 1; if (dx || dy) { hero.x += dx / length * hero.speed * dt; hero.y += dy / length * hero.speed * dt; }
    hero.x = clamp(hero.x, 45, world.width - 45); hero.y = clamp(hero.y, 45, world.height - 45);
    const aim = screenToWorld(pointer.x, pointer.y); hero.angle = angleTo(hero, aim); hero.invuln = Math.max(0, hero.invuln - dt);
    state.fireClock -= dt;
    if ((pointer.down || keys.Space) && state.fireClock <= 0) { shoot(hero.x + Math.cos(hero.angle) * 28, hero.y + Math.sin(hero.angle) * 28, hero.angle, "hero", 31, palette.blue, 840); state.fireClock = .18; }
    state.dashClock = Math.max(0, state.dashClock - dt); state.summonClock = Math.max(0, state.summonClock - dt);
    if (state.hero.hp <= 0) { state.hero.hp = 0; gameOver(); }
  }

  function dash() {
    if (state.mode !== "playing" || state.dashClock > 0) return;
    const hero = state.hero; hero.x = clamp(hero.x + Math.cos(hero.angle) * 155, 45, world.width - 45); hero.y = clamp(hero.y + Math.sin(hero.angle) * 155, 45, world.height - 45); hero.invuln = .38; state.dashClock = 2.1; addParticle(hero.x, hero.y, palette.blue, 16, 150, .48);
  }

  function summon() {
    if (state.mode !== "playing" || state.summonClock > 0) return;
    if (state.souls < 5) { notify("NOT ENOUGH SOULS — NEED 5"); return; }
    state.souls -= 5; state.summonClock = 8;
    state.allies.push({ x: state.hero.x + randomRange(-35,35), y: state.hero.y + randomRange(-35,35), hp: 80, life: 35, shotClock: 0, angle: 0 });
    addParticle(state.hero.x, state.hero.y, palette.violet, 20, 110, .7); notify("SOUL ALLY SUMMONED");
  }

  function updateSpawning(dt) {
    if (state.spawnQueue > 0) {
      state.spawnClock -= dt;
      if (state.spawnClock <= 0) { spawnEnemy(chooseEnemyType()); state.spawnQueue -= 1; state.spawnClock = .28; }
      if (state.wave % 4 === 0 && state.spawnQueue === 0 && !state.enemies.some(e => e.type === "boss")) spawnBoss();
      return;
    }
    if (!state.enemies.length) {
      if (state.intermission <= 0) { state.intermission = 3.0; state.waveState = "CLEAR"; notify(`WAVE ${state.wave} CLEAR — NEXT WAVE SOON`); }
      else { state.intermission -= dt; if (state.intermission <= 0) beginWave(); }
    }
  }

  function updateEnemies(dt) {
    const base = { x: world.baseX, y: world.baseY };
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i]; const type = enemy.type === "boss" ? { speed: 24, radius: 56, damage: 30, ranged: false, color: palette.orange } : enemyTypes[enemy.type];
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt); enemy.attackClock -= dt; enemy.shotClock -= dt;
      const target = distance(enemy, state.hero) < 190 && enemy.type !== "boss" ? state.hero : base;
      const dist = distance(enemy, target); enemy.angle = angleTo(enemy, target);
      const stopDistance = enemy.type === "boss" ? 155 : type.ranged ? 280 : 135;
      if (dist > stopDistance) { enemy.x += Math.cos(enemy.angle) * type.speed * dt; enemy.y += Math.sin(enemy.angle) * type.speed * dt; }
      if (type.ranged && dist < 440 && enemy.shotClock <= 0) { shoot(enemy.x, enemy.y, enemy.angle, "enemy", enemy.type === "mage" ? 13 : 9, enemy.type === "mage" ? palette.violet : palette.orange, 260); enemy.shotClock = enemy.type === "mage" ? 2.0 : 1.55; }
      if (!type.ranged && dist < stopDistance + 18 && enemy.attackClock <= 0) {
        if (target === state.hero) { if (state.hero.invuln <= 0) { state.hero.hp -= type.damage; state.hero.invuln = .22; addParticle(state.hero.x, state.hero.y, palette.red, 5, 70, .35); } }
        else { state.baseHp = Math.max(0, state.baseHp - type.damage); addParticle(world.baseX, world.baseY, palette.orange, 4, 55, .35); }
        enemy.attackClock = enemy.type === "boss" ? 1.1 : .85;
      }
      enemy.x = clamp(enemy.x, 30, world.width - 30); enemy.y = clamp(enemy.y, 30, world.height - 30);
    }
    if (state.baseHp <= 0) gameOver();
  }

  function nearestEnemy(x, y, max = Infinity) {
    let result = null, best = max;
    state.enemies.forEach(enemy => { const d = Math.hypot(enemy.x - x, enemy.y - y); if (d < best) { best = d; result = enemy; } });
    return result;
  }

  function updateAllies(dt) {
    for (let i = state.allies.length - 1; i >= 0; i--) {
      const ally = state.allies[i]; ally.life -= dt; ally.shotClock -= dt;
      if (ally.life <= 0) { addParticle(ally.x, ally.y, palette.violet, 8, 60, .5); state.allies.splice(i, 1); continue; }
      const target = nearestEnemy(ally.x, ally.y, 520);
      if (target) { ally.angle = angleTo(ally, target); if (distance(ally, target) > 170) { ally.x += Math.cos(ally.angle) * 58 * dt; ally.y += Math.sin(ally.angle) * 58 * dt; } if (ally.shotClock <= 0) { shoot(ally.x, ally.y, ally.angle, "ally", 18, palette.violet, 390); ally.shotClock = .72; } }
      else { ally.x += Math.cos(state.elapsed + i) * 12 * dt; ally.y += Math.sin(state.elapsed * .8 + i) * 12 * dt; }
    }
  }

  function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i]; bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt;
      if (bullet.life <= 0 || bullet.x < 0 || bullet.x > world.width || bullet.y < 0 || bullet.y > world.height) { state.bullets.splice(i, 1); continue; }
      if (bullet.owner === "hero" || bullet.owner === "ally") {
        let hit = false;
        for (const enemy of state.enemies) {
          const radius = enemy.type === "boss" ? 58 : enemyTypes[enemy.type].radius;
          if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < radius + bullet.radius) { enemy.hp -= bullet.damage; enemy.hitFlash = .12; addParticle(bullet.x, bullet.y, bullet.color, 3, 45, .25); hit = true; if (enemy.hp <= 0) { killEnemy(enemy); state.enemies.splice(state.enemies.indexOf(enemy), 1); } break; }
        }
        if (hit) state.bullets.splice(i, 1);
      } else if (state.hero && Math.hypot(state.hero.x - bullet.x, state.hero.y - bullet.y) < 20) {
        if (state.hero.invuln <= 0) { state.hero.hp -= bullet.damage; state.hero.invuln = .18; addParticle(state.hero.x, state.hero.y, bullet.color, 5, 60, .3); } state.bullets.splice(i, 1);
      }
    }
  }

  function collectDrops() {
    if (!state.hero) return;
    for (let i = state.drops.length - 1; i >= 0; i--) {
      const drop = state.drops[i]; if (distance(state.hero, drop) > 52) continue;
      if (drop.type === "soul") { state.souls = Math.min(50, state.souls + 1); notify("SOUL COLLECTED +1"); addParticle(drop.x, drop.y, palette.blue, 8, 70, .45); }
      else if (drop.type === "bossSoul") { state.souls = Math.min(50, state.souls + 15); notify("BREAKER SOUL +15"); addParticle(drop.x, drop.y, palette.orange, 18, 100, .65); }
      else { state.scrap += 25; notify("SCRAP RECOVERED +25"); addParticle(drop.x, drop.y, palette.gold, 7, 70, .4); }
      state.drops.splice(i, 1);
    }
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) { const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.life -= dt; if (p.life <= 0) state.particles.splice(i, 1); }
  }

  function update(dt) {
    if (state.toastClock > 0) { state.toastClock -= dt; if (state.toastClock <= 0) toast.classList.remove("show"); }
    if (state.mode !== "playing") return;
    state.elapsed += dt; updateHero(dt); if (state.mode !== "playing") return;
    updateSpawning(dt); updateEnemies(dt); updateAllies(dt); updateBullets(dt); collectDrops(); updateParticles(dt); updateHud();
  }

  function updateHud() {
    const hero = state.hero; if (!hero) return;
    document.querySelector("#hp-value").textContent = `${Math.ceil(hero.hp)} / ${hero.maxHp}`;
    document.querySelector("#hp-meter").style.width = `${clamp(hero.hp / hero.maxHp * 100, 0, 100)}%`;
    document.querySelector("#base-value").textContent = `${Math.ceil(state.baseHp)}%`;
    document.querySelector("#base-meter").style.width = `${clamp(state.baseHp, 0, 100)}%`;
    document.querySelector("#wave-value").textContent = state.wave;
    document.querySelector("#wave-state").textContent = state.waveState;
    document.querySelector("#enemy-value").textContent = `${state.enemies.length + state.spawnQueue} ENEMIES`;
    document.querySelector("#soul-value").textContent = `${state.souls} / 50`;
    document.querySelector("#scrap-value").textContent = state.scrap;
    document.querySelector("#dash-icon").classList.toggle("ready", state.dashClock <= 0);
    document.querySelector("#summon-icon").classList.toggle("ready", state.summonClock <= 0 && state.souls >= 5);
  }

  function drawBackground(cam) {
    const gradient = ctx.createLinearGradient(0, 0, 0, innerHeight); gradient.addColorStop(0, "#0c1b2a"); gradient.addColorStop(.55, "#07131d"); gradient.addColorStop(1, "#03080d"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, innerWidth, innerHeight);
    const topLeft = point(0, 0, cam), bottomRight = point(world.width, world.height, cam); ctx.save(); ctx.beginPath(); ctx.rect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]); ctx.clip();
    ctx.fillStyle = palette.ground; ctx.fillRect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);
    const grid = 70 * cam.s; ctx.lineWidth = 1; ctx.strokeStyle = "rgba(91,142,126,.10)";
    for (let x = Math.floor(cam.x / 70) * 70; x < cam.x + innerWidth / cam.s + 70; x += 70) { const sx = point(x, 0, cam)[0]; ctx.beginPath(); ctx.moveTo(sx, topLeft[1]); ctx.lineTo(sx, bottomRight[1]); ctx.stroke(); }
    for (let y = Math.floor(cam.y / 70) * 70; y < cam.y + innerHeight / cam.s + 70; y += 70) { const sy = point(0, y, cam)[1]; ctx.beginPath(); ctx.moveTo(topLeft[0], sy); ctx.lineTo(bottomRight[0], sy); ctx.stroke(); }
    // Distant ruins, trees and crystals.
    [[170,170,.8],[380,112,.95],[1880,180,.78],[2040,360,1],[210,1110,1.05],[1940,1190,.9],[460,1290,.75],[1760,1300,.85]].forEach(([x,y,s]) => drawTree(x,y,s,cam));
    [[280,520,1],[1900,820,.9],[470,320,.7],[1730,1080,.8]].forEach(([x,y,s]) => drawRuin(x,y,s,cam));
    drawCrystal(1960, 570, .9, palette.blue, cam); drawCrystal(330, 1000, .72, palette.violet, cam);
    ctx.restore();
  }

  function rect(x, y, w, h, fill, cam, stroke = null) { const p = point(x, y, cam); ctx.fillStyle = fill; ctx.fillRect(p[0], p[1], w * cam.s, h * cam.s); if (stroke) { ctx.strokeStyle = stroke; ctx.strokeRect(p[0]+.5, p[1]+.5, w*cam.s-1, h*cam.s-1); } }
  function circle(x, y, r, fill, cam, alpha = 1) { const p = point(x,y,cam); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(p[0],p[1],r*cam.s,0,Math.PI*2);ctx.fill();ctx.restore(); }
  function drawTree(x, y, s, cam) { rect(x-15*s,y+12*s,30*s,68*s,palette.wood,cam); circle(x,y,78*s,palette.green,cam,.96); circle(x+22*s,y-42*s,58*s,"#153c2b",cam,.95); circle(x-34*s,y-28*s,48*s,"#1a4a31",cam,.9); }
  function drawRuin(x,y,s,cam) { rect(x,y,120*s,46*s,palette.darkStone,cam); rect(x+12*s,y-44*s,34*s,44*s,palette.stone,cam); rect(x+76*s,y-74*s,33*s,74*s,palette.stone,cam); rect(x+40*s,y-24*s,40*s,24*s,palette.black,cam); }
  function drawCrystal(x,y,s,color,cam) { rect(x-12*s,y-70*s,24*s,92*s,color,cam); rect(x+19*s,y-48*s,17*s,68*s,shade(color,.72),cam); circle(x,y-72*s,21*s,color,cam,.23); }
  function shade(hex, factor) { const n = parseInt(hex.slice(1),16); const r=(n>>16)&255,g=(n>>8)&255,b=n&255; return `rgb(${Math.min(255,Math.round(r*factor))},${Math.min(255,Math.round(g*factor))},${Math.min(255,Math.round(b*factor))})`; }

  function drawBase(cam) {
    rect(world.baseX-245, world.baseY-205, 490, 410, "#24352f", cam, "rgba(117,171,137,.3)");
    rect(world.baseX-220, world.baseY-180, 440, 360, "#1a2928", cam);
    const x=world.baseX,y=world.baseY;
    for (let i=-3;i<=3;i++) { if(i!==0){ drawFenceSegment(x-220,y+i*54,true,false,cam); drawFenceSegment(x+220,y+i*54,true,false,cam); } drawFenceSegment(x+i*54,y-180,false,false,cam); drawFenceSegment(x+i*54,y+180,false,false,cam); }
    // Reinforced corner pylons and damaged plank.
    [[x-248,y-208],[x-248,y+208],[x+248,y-208],[x+248,y+208]].forEach(([px,py]) => { rect(px-20,py-20,40,40,palette.darkStone,cam); rect(px-14,py-27,28,8,palette.iron,cam); });
    rect(x-83,y-127,18,84,palette.wood,cam); rect(x-18,y-127,18,84,palette.lightWood,cam); rect(x-48,y-130,30,12,palette.iron,cam);
    // Campfire, workbench and altar.
    rect(x-157,y+52,72,18,palette.wood,cam); rect(x-157,y+73,72,18,palette.lightWood,cam); circle(x-121,y+42,25,palette.orange,cam,.42); circle(x-121,y+33,14,palette.gold,cam,.7);
    rect(x+80,y+70,95,25,palette.lightWood,cam); rect(x+93,y+95,12,46,palette.wood,cam); rect(x+150,y+95,12,46,palette.wood,cam);
    rect(x+92,y-88,75,45,palette.darkStone,cam); drawCrystal(x+129,y-111,.48,palette.violet,cam);
    circle(x,y,250,"rgba(56,167,255,.035)",cam,1);
  }

  function drawFenceSegment(x,y,alongY,reinforced,cam) { const post=reinforced?palette.iron:palette.lightWood, rail=reinforced?palette.iron:palette.wood; if(alongY){rect(x-8,y-30,16,60,post,cam);rect(x-8,y+30,16,60,post,cam);rect(x-12,y-22,24,108,rail,cam);}else{rect(x-30,y-8,60,16,post,cam);rect(x+30,y-8,60,16,post,cam);rect(x-22,y-12,108,24,rail,cam);} }

  function drawPlayer(hero,cam) {
    const p=point(hero.x,hero.y,cam), flash=hero.invuln>0&&Math.floor(hero.invuln*20)%2===0; if(flash) return;
    ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(hero.angle);ctx.globalAlpha=.28;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(0,8*cam.s,30*cam.s,13*cam.s,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle="#225c84";ctx.fillRect(-17*cam.s,-16*cam.s,34*cam.s,38*cam.s);ctx.fillStyle="#6e9cb5";ctx.fillRect(-14*cam.s,-28*cam.s,28*cam.s,18*cam.s);ctx.fillStyle="#a06d4d";ctx.fillRect(-12*cam.s,-44*cam.s,24*cam.s,18*cam.s);
    ctx.fillStyle=palette.blue;ctx.fillRect(-20*cam.s,-48*cam.s,40*cam.s,7*cam.s);ctx.fillStyle=palette.iron;ctx.fillRect(6*cam.s,-7*cam.s,8*cam.s,10*cam.s);ctx.fillStyle=palette.blue;ctx.fillRect(16*cam.s,-5*cam.s,35*cam.s,7*cam.s);ctx.fillStyle=palette.iron;ctx.fillRect(17*cam.s,-10*cam.s,6*cam.s,17*cam.s);ctx.restore();
  }

  function drawEnemy(enemy,cam) {
    const p=point(enemy.x,enemy.y,cam), boss=enemy.type==="boss", type=enemyTypes[enemy.type]; const color=enemy.hitFlash>0?palette.white:(boss?palette.darkStone:type.color); const radius=(boss?58:type.radius)*cam.s;
    ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(enemy.angle);ctx.globalAlpha=.27;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(0,radius*.16,radius*.8,radius*.33,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(boss){ctx.fillStyle=color;ctx.fillRect(-radius*.72,-radius*.72,radius*1.44,radius*1.35);ctx.fillStyle=shade(color,1.35);ctx.fillRect(-radius*.58,-radius*1.05,radius*1.16,radius*.45);ctx.fillStyle=palette.stone;ctx.fillRect(-radius*1.18,-radius*.55,radius*.42,radius*1.25);ctx.fillRect(radius*.76,-radius*.55,radius*.42,radius*1.25);ctx.fillStyle=palette.orange;ctx.fillRect(-radius*.18,-radius*.02,radius*.36,radius*.3);ctx.fillRect(-radius*.7,-radius*.75,radius*1.4,radius*.1);}
    else {ctx.fillStyle=color;ctx.fillRect(-radius*.62,-radius*.58,radius*1.24,radius*1.12);ctx.fillStyle=shade(color,1.3);ctx.fillRect(-radius*.5,-radius*1.0,radius,radius*.48);ctx.fillStyle=palette.bone; if(enemy.type==="archer"){ctx.strokeStyle=palette.gold;ctx.lineWidth=Math.max(2,2*cam.s);ctx.beginPath();ctx.arc(radius*.6,0,radius*.58,-1.1,1.1);ctx.stroke();} else if(enemy.type==="mage"){ctx.fillStyle=palette.violet;ctx.beginPath();ctx.arc(0,-radius*.9,radius*.35,0,Math.PI*2);ctx.fill();} else {ctx.fillRect(-radius*.43,-radius*.18,radius*.17,radius*.12);ctx.fillRect(radius*.26,-radius*.18,radius*.17,radius*.12);} }
    ctx.restore();
    const barW=(boss?130:type.radius*2.7)*cam.s, barX=p[0]-barW/2, barY=p[1]-(boss?radius*1.22:radius*1.32);ctx.fillStyle="rgba(0,0,0,.62)";ctx.fillRect(barX,barY,barW,4);ctx.fillStyle=boss?palette.orange:palette.red;ctx.fillRect(barX,barY,barW*clamp(enemy.hp/enemy.maxHp,0,1),4);
  }

  function drawAlly(ally,cam) { const p=point(ally.x,ally.y,cam);ctx.save();ctx.translate(p[0],p[1]);ctx.globalAlpha=.26;ctx.strokeStyle=palette.blue;ctx.lineWidth=6*cam.s;ctx.beginPath();ctx.arc(0,0,25*cam.s,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle="#223b62";ctx.fillRect(-13*cam.s,-13*cam.s,26*cam.s,28*cam.s);ctx.fillStyle=palette.bone;ctx.fillRect(-10*cam.s,-31*cam.s,20*cam.s,18*cam.s);ctx.fillStyle=palette.blue;ctx.fillRect(-7*cam.s,-26*cam.s,5*cam.s,4*cam.s);ctx.fillRect(2*cam.s,-26*cam.s,5*cam.s,4*cam.s);ctx.restore(); }
  function drawDrop(drop,cam,time) { const bob=Math.sin(time*.004+drop.bob)*5;const p=point(drop.x,drop.y-bob,cam);const color=drop.type==="scrap"?palette.gold:drop.type==="bossSoul"?palette.orange:palette.blue;ctx.save();ctx.globalAlpha=.25;ctx.shadowBlur=18;ctx.shadowColor=color;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p[0],p[1],18*cam.s,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(p[0],p[1]-10*cam.s);ctx.lineTo(p[0]+10*cam.s,p[1]);ctx.lineTo(p[0],p[1]+12*cam.s);ctx.lineTo(p[0]-10*cam.s,p[1]);ctx.closePath();ctx.fill();ctx.restore(); }
  function drawBullet(bullet,cam) { const p=point(bullet.x,bullet.y,cam);ctx.save();ctx.strokeStyle=bullet.color;ctx.shadowBlur=12;ctx.shadowColor=bullet.color;ctx.lineWidth=3*cam.s;ctx.beginPath();ctx.moveTo(p[0]-bullet.vx*.012*cam.s,p[1]-bullet.vy*.012*cam.s);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.restore(); }
  function drawParticles(cam) { state.particles.forEach(p=>{const q=point(p.x,p.y,cam);ctx.save();ctx.globalAlpha=clamp(p.life/p.maxLife,0,1);ctx.fillStyle=p.color;ctx.shadowBlur=8;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(q[0],q[1],p.size*cam.s,0,Math.PI*2);ctx.fill();ctx.restore();}); }

  function render(time) {
    const cam=camera(); drawBackground(cam); drawBase(cam);
    state.drops.forEach(drop=>drawDrop(drop,cam,time)); state.allies.forEach(ally=>drawAlly(ally,cam)); state.enemies.forEach(enemy=>drawEnemy(enemy,cam)); state.bullets.forEach(bullet=>drawBullet(bullet,cam)); if(state.hero) drawPlayer(state.hero,cam); drawParticles(cam);
    if(state.waveBanner>0 && state.mode==="playing"){state.waveBanner-=.016;ctx.save();ctx.globalAlpha=clamp(state.waveBanner,0,1);ctx.fillStyle=palette.white;ctx.textAlign="center";ctx.font=`900 ${Math.max(22,28*cam.s)}px system-ui`;ctx.fillText(`WAVE ${state.wave}`,innerWidth*.5,innerHeight*.22);ctx.fillStyle=palette.orange;ctx.font=`800 ${Math.max(10,12*cam.s)}px system-ui`;ctx.fillText(state.wave%4===0?"BOSS WAVE":"INCOMING",innerWidth*.5,innerHeight*.22+24*cam.s);ctx.restore();}
  }

  function loop(time) { const dt=Math.min(.033,(time-state.lastTime)/1000);state.lastTime=time;update(dt);render(time);requestAnimationFrame(loop); }

  document.addEventListener("click", event => {
    const action=event.target.closest("[data-action]")?.dataset.action; if(!action)return;
    if(action==="play"||action==="restart"){startRun();return;} if(action==="howto"){showHowto();return;} if(action==="showcase"){window.location.href="showcase.html";return;} if(action==="back"){showMenu();return;} if(action==="pause"){pauseRun();return;} if(action==="resume"){resumeRun();return;} if(action==="menu"){showMenu();return;}
  });
  canvas.addEventListener("pointermove", event=>{pointer.x=event.clientX;pointer.y=event.clientY;});
  canvas.addEventListener("pointerdown", event=>{pointer.down=true;pointer.x=event.clientX;pointer.y=event.clientY;canvas.setPointerCapture?.(event.pointerId);});
  window.addEventListener("pointerup", ()=>{pointer.down=false;});
  window.addEventListener("keydown", event=>{keys[event.key]=true;if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key))event.preventDefault();if(event.key.toLowerCase()==="q")dash();if(event.key.toLowerCase()==="e")summon();if(event.key==="Escape"){if(state.mode==="playing")pauseRun();else if(state.mode==="paused")resumeRun();else if(state.mode!=="menu")showMenu();}});
  window.addEventListener("keyup", event=>{keys[event.key]=false;});
  window.addEventListener("blur",()=>{pointer.down=false;if(state.mode==="playing")pauseRun();});
  window.addEventListener("resize",resize);
  resize(); showMenu(); requestAnimationFrame(loop);
})();
