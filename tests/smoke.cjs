const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const id of ['avatar-preview','loadout-grid','inventory-grid','enchant-inventory','enchant-weapon','enchant-grid','attackModeLabel'])assert.ok(page.includes(`id="${id}"`),`Missing UI element ${id}`);
assert.ok(page.indexOf('gear-art.js')<page.indexOf('beta.js'),'Item art must load before game logic');
const listeners = new Map();
const elements = new Map();
const saved = new Map();
function element(selector = '') {
  if (!elements.has(selector)) {
    const handlers = {};
    const node = {
      textContent: '', innerHTML: '', value: '', style: { setProperty() {} }, dataset: {}, children: [],
      classList: { add() {}, remove() {}, toggle() {} },
      handlers, addEventListener(type, handler) { handlers[type] = handler; },
      querySelector() { return element(`${selector} child`); },
      querySelectorAll() { return []; },
      appendChild(child) { this.children.push(child); },
      click() { handlers.click?.({target:this}); },
      getContext() { return canvasContext; }
    };
    elements.set(selector, node);
  }
  return elements.get(selector);
}
const gradient = {addColorStop() {}};
const canvasContext = new Proxy({}, {
  get(target, key) { return key.startsWith('create') ? () => gradient : () => {}; },
  set(target, key, value) { target[key] = value; return true; }
});
const document = {
  querySelector: element,
  createElement: () => element(`created-${elements.size}`)
};
const sandbox = {
  document, innerWidth: 1440, innerHeight: 900, devicePixelRatio: 1,
  performance: {now: () => 1000}, requestAnimationFrame() {},
  localStorage: { getItem(key) {return saved.get(key)||null;}, setItem(key,value) {saved.set(key,value);} },
  addEventListener(type, handler) { listeners.set(type, handler); },
  console
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'catalog.js'), 'utf8'), sandbox, {filename:'catalog.js'});
vm.runInContext(fs.readFileSync(path.join(root, 'gear-art.js'), 'utf8'), sandbox, {filename:'gear-art.js'});
let gameSource = fs.readFileSync(path.join(root, 'beta.js'), 'utf8');
gameSource = gameSource.replace(/\}\)\(\);\s*$/, 'globalThis.__lfTest={state,supplyCaches,play,update,render,updateCaches,updateEnemies,interactCache,spawnEnemy,startWave,fire,fireManaWeapon,updateArtifact,activateArtifact,equipItem,renderEnchant,applyEnchant,stats,damageFence,project,toWorld,toScreen};\n})();');
vm.runInContext(gameSource, sandbox, {filename:'beta.js'});
const game = sandbox.__lfTest;
assert.equal(sandbox.LF_CATALOG.items.length, 42);
assert.equal(new Set(sandbox.LF_CATALOG.items.map(item=>sandbox.LF_ART.icon(item))).size,42);
for (const slot of ['weapon','manaWeapon','helmet','chest','pants','boots','artifact']) {
  assert.equal(sandbox.LF_CATALOG.items.filter(item => item.slot === slot).length, 6);
}
game.play(false);
assert.equal(game.state.inventory.length, 6);
assert.equal(game.state.admin, false);
game.update(.016); game.render();
const cache = game.supplyCaches[0];
for (const guardian of game.state.enemies.filter(enemy => enemy.cacheId === cache.id)) guardian.hp = 0;
game.updateEnemies(.016);
game.state.hero.x = cache.x; game.state.hero.y = cache.y;
game.updateCaches(); game.interactCache();
assert.equal(cache.opened, true);
assert.equal(game.state.lootOpen, true);
assert.equal(elements.get('#loot-name').textContent, 'Thunderbolt Rifle');
assert.equal(game.state.inventory.some(item => item.catalogueId === 'thunderbolt-rifle'), true);
game.play(false);
assert.equal(game.state.inventory.some(item => item.catalogueId === 'thunderbolt-rifle'), true);
game.play(true);
assert.equal(game.state.admin, true);
assert.equal(game.state.inventory.length, 48);
listeners.get('keydown')({key:'f',repeat:false,preventDefault(){}});
assert.equal(game.state.attackMode,'manaWeapon');
listeners.get('keydown')({key:'f',repeat:false,preventDefault(){}});
assert.equal(game.state.attackMode,'weapon');
assert.equal(Object.keys(game.state.equipment).length,9);
const arc=game.state.inventory.find(item=>item.catalogueId==='arc-reaper');
assert.equal(game.equipItem(arc,'weapon'),true);
const helmet=game.state.inventory.find(item=>item.catalogueId==='warden-helm');
elements.get('#loadout-grid').handlers.drop({target:{closest(selector){return selector==='[data-slot]'?{dataset:{slot:'helmet'}}:null;}},preventDefault(){},dataTransfer:{getData(){return `item:${helmet.id}`;}}});
assert.equal(game.state.equipment.helmet,helmet.equip.index);
elements.get('#inventory-grid').handlers.drop({preventDefault(){},dataTransfer:{getData(){return 'slot:helmet';}}});
assert.equal(game.state.equipment.helmet,0);
game.state.fireTimer=0;const shots=game.state.bullets.length;game.fire();
assert.equal(game.state.bullets.length,shots,'Sword creates a melee arc, not a projectile');
const wand=game.state.inventory.find(item=>item.catalogueId==='pyre-scepter');
assert.equal(game.equipItem(wand,'manaWeapon'),true);
game.state.hero.mana=game.state.hero.maxMana;game.state.manaFireTimer=0;game.fireManaWeapon();
assert.equal(game.state.bullets.at(-1).manaId,'pyre-scepter');
const relic=game.state.inventory.find(item=>item.catalogueId==='necromancer-sigil');
assert.equal(game.equipItem(relic,'artifact3'),true);assert.equal(game.stats().canSummon,true);
game.state.souls=100;listeners.get('keydown')({key:'3',repeat:false,preventDefault(){}});assert.ok(game.state.allies.length>=3);
assert.ok(game.state.artifactTimers[2]>0);
game.state.enchantItemId=arc.catalogueId;game.renderEnchant();game.applyEnchant('shock');assert.equal(game.state.enchantByWeapon[arc.catalogueId],'shock');
assert.equal(game.state.souls,65);
elements.get('#enchant-weapon').handlers.drop({preventDefault(){},dataTransfer:{getData(){return 'enchant:pyre-scepter';}}});
assert.equal(game.state.enchantItemId,'pyre-scepter');
const p=game.project(1380,750),cam={zoom:1,x:0,y:0},screen=game.toScreen(1380,750,cam);
assert.equal(p.x,screen.x);assert.equal(p.y,screen.y);
for (const slot of Object.keys(game.state.equipment)) {
  for (let index = 0; index <= 6; index++) {
    game.state.equipment[slot] = index;
    game.state.artifactTimer = 0;
    game.fire(); game.fireManaWeapon(); game.updateArtifact(.016); game.render();
  }
  game.state.equipment[slot] = 0;
}
game.state.mapOpen = true; game.render(); game.state.mapOpen = false;
game.state.wave = 3; game.state.spawnLeft = 1; game.spawnEnemy();
assert.equal(game.state.enemies.at(-1).kind, 'breaker');
const fence = game.state.fences[0];
assert.equal(fence.breached, false);
game.damageFence(fence, fence.maxHp);
assert.equal(fence.breached, true);
console.log('LAST FENCE smoke test: 42 images, loot, melee, mana, artifact, enchant, map, boss and fence OK');
