/* LAST FENCE 2D MINI — original, self-contained equipment catalogue. */
(() => {
  const R = { Gewöhnlich:"GEWÖHNLICH", Ungewöhnlich:"UNGEWÖHNLICH", Selten:"SELTEN", Episch:"EPISCH", Legendär:"LEGENDÄR", Mythisch:"MYTHISCH" };
  const C = { blue:"#66beff", cyan:"#77e5ff", orange:"#ff914d", violet:"#b591ff", gold:"#f4c46b", pink:"#ff69cc", green:"#78dfa8", iron:"#a5b3b7" };
  const make = (slot,id,name,rarity,color,power,stats={}) => ({slot,id,name,rarity:R[rarity],color:C[color],power,description:power,stats:power,category:slot==="weapon"||slot==="manaWeapon"?"WEAPONS":slot==="artifact"?"ARTIFACTS":"ARMOR",...stats});
  const items = [
    make("weapon","arc-reaper","Arc Reaper","Legendär","blue","Rift-Schnitt: jeder dritte Schwerthieb trifft besonders hart.",{damage:42}),
    make("weapon","emberforge-maul","Emberforge Maul","Episch","orange","Aschekrater: wuchtige Treffer entzünden Gegner im Umkreis.",{damage:58}),
    make("weapon","thunderbolt-rifle","Thunderbolt Rifle","Selten","cyan","Leitblitz: die schnelle Salve springt auf ein weiteres Ziel.",{damage:34,crit:.06}),
    make("weapon","voidfang-twins","Twin Voidfangs","Mythisch","pink","Phasenschritt: blitzschnelle Doppelklingen-Hiebe und verkürzter Dash.",{damage:24,speed:.08,crit:.18}),
    make("weapon","glacier-breaker","Glacier Breaker","Legendär","cyan","Permafrost: Eisnova verlangsamt alle getroffenen Gegner.",{damage:64}),
    make("weapon","gravecaller-staff","Gravecaller Staff","Legendär","violet","Seelenernte: gefallene Gegner heilen dich und geben mehr Seelen.",{damage:39,mana:20}),
    make("manaWeapon","riftweaver-wand","Riftweaver Wand","Selten","blue","Suchfunke: ein Riftstern sucht selbstständig das nächste Ziel.",{damage:78,cost:18}),
    make("manaWeapon","stormcaller-staff","Stormcaller Staff","Episch","cyan","Himmelslanze: ein Blitz springt durch mehrere Gegner.",{damage:100,cost:30}),
    make("manaWeapon","pyre-scepter","Pyre Scepter","Legendär","orange","Sternenbrand: Feuerball mit brennender Flächenexplosion.",{damage:96,cost:28}),
    make("manaWeapon","frost-prism","Frost Prism","Legendär","cyan","Kristallsalve: drei auffächernde Frostsplitter frieren Gegner ein.",{damage:42,cost:34}),
    make("manaWeapon","soul-lantern","Soul Lantern","Episch","violet","Spuklicht: eine jagende Seele bringt dir Lebensenergie zurück.",{damage:88,cost:26}),
    make("manaWeapon","void-grimoire","Void Grimoire","Mythisch","pink","Leerezeile: eine wachsende Riftkugel durchdringt vier Feinde.",{damage:135,cost:42}),
    make("boots","pathfinder-boots","Pathfinder Boots","Ungewöhnlich","gold","Fährtenleser: neue Loot-Signale bleiben länger markiert.",{speed:.08}),
    make("boots","stormstep-boots","Stormstep Greaves","Selten","blue","Sturmschritt: der Dash schlägt nahe Feinde mit Blitz.",{speed:.12}),
    make("boots","ironroot-boots","Ironroot Sabatons","Episch","green","Standhaft: stärkere Panzerung gegen Frontangriffe.",{armor:18}),
    make("boots","embertrail-boots","Embertrail Boots","Episch","orange","Brandpfad: der Dash entzündet Verfolger.",{speed:.10}),
    make("boots","frostwalker-boots","Frostwalker Treads","Legendär","cyan","Kälteschritt: nahe Gegner werden regelmäßig gebremst.",{speed:.09,mana:12}),
    make("boots","riftstrider-boots","Riftstrider Boots","Mythisch","pink","Riftsprung: jeder zweite Dash lädt besonders schnell auf.",{speed:.16,mana:15}),
    make("pants","frontier-greaves","Frontier Greaves","Gewöhnlich","gold","Versorger: Zaunreparaturen benötigen weniger Schrott.",{armor:8}),
    make("pants","manaweave-leggings","Manaweave Leggings","Selten","blue","Überladung: volles Mana verstärkt den nächsten Zauber.",{mana:35}),
    make("pants","bastion-cuisses","Bastion Cuisses","Episch","iron","Bollwerk: Reparaturen geben kurz Schadensschutz.",{armor:28,health:20}),
    make("pants","soulbound-chains","Soulbound Chains","Legendär","violet","Seelenfessel: nahe Gegner verlieren Bewegungstempo.",{armor:8,mana:24}),
    make("pants","tempest-tassets","Tempest Tassets","Legendär","cyan","Statische Ladung: bei Treffern entlädt sich ein Gegenblitz.",{armor:18,mana:20}),
    make("pants","riftborne-legguards","Riftborne Legguards","Mythisch","pink","Riftfluss: Mana regeneriert schneller.",{armor:25,mana:30}),
    make("chest","warden-fieldplate","Warden Fieldplate","Selten","blue","Letzte Linie: unter 30 % Leben steigt die Rüstung.",{armor:24,health:25}),
    make("chest","tempest-cuirass","Tempest Cuirass","Episch","cyan","Gewitterkern: Blitztreffer geben etwas Mana zurück.",{armor:22,mana:30}),
    make("chest","emberheart-carapace","Emberheart Carapace","Legendär","orange","Feuerherz: Nahkampftreffer erzeugen eine Hitzeexplosion.",{armor:30,health:35}),
    make("chest","frostguard-plate","Frostguard Plate","Legendär","cyan","Eisschild: blockiert regelmäßig einen Treffer vollständig.",{armor:34,mana:20}),
    make("chest","grave-mantle","Grave Mantle","Episch","violet","Totenwache: beschworene Seelen bleiben länger bestehen.",{armor:18,mana:45}),
    make("chest","rift-titan-armor","Rift Titan Armor","Mythisch","pink","Titanenreaktor: bei Schaden entsteht eine Rift-Druckwelle.",{armor:48,health:55}),
    make("helmet","warden-helm","Warden's Helm","Selten","blue","Zielanalyse: bessere Zielhilfe gegen entfernte Gegner.",{armor:10,crit:.05}),
    make("helmet","seer-hood","Seer's Runed Hood","Episch","violet","Vorahnung: seltene Loot-Signale werden auf der Karte markiert.",{mana:30,crit:.08}),
    make("helmet","ironhorn-greathelm","Ironhorn Greathelm","Episch","gold","Ansturm: dein Dash beschädigt Feinde im Weg.",{armor:24,health:20}),
    make("helmet","frost-crown","Crown of Winter","Legendär","cyan","Winterblick: kritische Treffer setzen Frost frei.",{mana:20,crit:.10}),
    make("helmet","soul-mask","Mask of Echoes","Legendär","violet","Seelenecho: jede fünfte gefangene Seele zählt doppelt.",{armor:18,mana:35}),
    make("helmet","rift-king-crown","Rift King's Crown","Mythisch","pink","Riftbefehl: Elitegegner verursachen weniger Schaden.",{armor:30,crit:.15}),
    make("artifact","fencers-sigil","Fencer's Sigil","Selten","blue","Phantomklinge: auf Tastendruck schlägt ein Geisterschwert zu."),
    make("artifact","storm-core","Storm Core","Episch","cyan","Himmelsurteil: auf Tastendruck springt ein Blitz zwischen Gegnern."),
    make("artifact","sun-core","Sun Core","Legendär","orange","Sonnenhalo: eine große brennende Lichtwelle entsteht um dich."),
    make("artifact","wind-crystal","Wind Crystal","Episch","green","Riftzyklon: ein Wirbel zieht nahe Gegner zusammen."),
    make("artifact","warden-totem","Warden's Totem","Legendär","gold","Geisterwache: ein Runengeschütz schießt selbstständig."),
    make("artifact","necromancer-sigil","Nekromanten-Siegel","Mythisch","violet","Totenruf: nur dieses Artefakt beschwört Seelen mit der Slot-Taste oder G.",{mana:40})
  ];
  const starters = {
    weapon:make("weapon","starter-blade","Rekrutenklinge","Gewöhnlich","iron","Einfacher Schwerthieb aus kurzer Distanz.",{damage:22,starter:true}),
    manaWeapon:make("manaWeapon","starter-wand","Lehrlingsstab","Gewöhnlich","blue","Übungsfunke mit Manakosten.",{damage:48,cost:16,starter:true}),
    boots:make("boots","starter-boots","Rekrutenstiefel","Gewöhnlich","iron","Solide Anfänger-Ausrüstung.",{speed:.02,starter:true}),
    pants:make("pants","starter-pants","Rekrutenhose","Gewöhnlich","iron","Solide Anfänger-Ausrüstung.",{armor:3,starter:true}),
    chest:make("chest","starter-chest","Rekrutenharnisch","Gewöhnlich","iron","Solide Anfänger-Ausrüstung.",{armor:8,health:10,starter:true}),
    helmet:make("helmet","starter-helm","Rekrutenhelm","Gewöhnlich","iron","Solide Anfänger-Ausrüstung.",{armor:4,starter:true}),
    artifact:make("artifact","empty-artifact","Leerer Sockel","Gewöhnlich","iron","Finde eine Artefakt-Kiste, um eine einzigartige Kraft auszurüsten.",{starter:true})
  };
  window.LF_CATALOG = Object.freeze({items,starters,rarities:Object.values(R)});
})();
