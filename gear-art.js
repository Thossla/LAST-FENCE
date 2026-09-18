/* Original LAST FENCE item portraits: one scalable, deterministic image per item. */
(() => {
  const cache = new Map();
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const ink = '#07121d', steel = '#d9e5e4';
  function emblem(item, variant) {
    const color = escape(item.color || '#8fa3aa');
    const dark = '#293a45';
    if (item.slot === 'weapon') {
      if (/rifle/.test(item.id)) return `<path d="M14 49h56v10H14zM49 43h25v5H49zM22 59h14l-5 18H20z" fill="${steel}" stroke="${ink}" stroke-width="3"/><path d="M35 46h18v17H35zM51 49h26v7H51z" fill="${color}"/><path d="M65 44h12v4H65z" fill="#fff"/>`;
      if (/maul|breaker/.test(item.id)) return `<path d="M18 77 70 26" stroke="${steel}" stroke-width="9"/><path d="m49 18 25 4 8 24-11 11-27-23z" fill="${color}" stroke="${steel}" stroke-width="4"/><path d="m52 25 15 3 6 14-4 4-13-14z" fill="${dark}"/>`;
      if (/twins/.test(item.id)) return `<path d="m19 72 42-54 12 5-37 56zM58 72 22 17l-9 7 29 55z" fill="${color}" stroke="${steel}" stroke-width="4"/>`;
      if (/staff/.test(item.id)) return `<path d="M22 80 72 17" stroke="${steel}" stroke-width="8"/><path d="m63 17 16 4-5 18-19-2-3-11z" fill="${color}" stroke="${ink}" stroke-width="4"/><circle cx="67" cy="27" r="5" fill="#fff"/>`;
      return `<path d="M25 78 67 17l11-4-5 16-38 52z" fill="${color}" stroke="${steel}" stroke-width="4"/><path d="M17 63 49 78" stroke="${dark}" stroke-width="9"/><path d="M45 72 37 83" stroke="${steel}" stroke-width="8"/>`;
    }
    if (item.slot === 'manaWeapon') {
      if (/grimoire/.test(item.id)) return `<path d="M20 22h49l11 8v50H28l-8-8z" fill="${dark}" stroke="${color}" stroke-width="4"/><path d="M28 27v46M48 34l9 10-9 10-9-10zM58 65h14" stroke="${steel}" stroke-width="4" fill="none"/>`;
      if (/lantern/.test(item.id)) return `<path d="M34 28h30l7 12-8 34H35l-8-34z" fill="${dark}" stroke="${steel}" stroke-width="4"/><path d="M38 22c0-16 20-16 20 0" fill="none" stroke="${color}" stroke-width="5"/><circle cx="49" cy="50" r="14" fill="${color}"/><circle cx="49" cy="50" r="6" fill="#fff"/>`;
      if (/prism/.test(item.id)) return `<path d="M48 13 78 47 49 82 18 47z" fill="${color}" stroke="${steel}" stroke-width="4"/><path d="M48 13 49 82M18 47h60" stroke="${ink}" stroke-width="4"/>`;
      return `<path d="M21 78 69 23" stroke="${steel}" stroke-width="8"/><path d="M27 72 62 32" stroke="${dark}" stroke-width="3"/><circle cx="69" cy="24" r="${variant % 2 ? 16 : 13}" fill="${color}" stroke="${steel}" stroke-width="4"/><path d="m69 8 4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff"/>`;
    }
    if (item.slot === 'helmet') return `<path d="M21 38q2-25 27-28 27 3 28 28l-7 38-20 12-22-12z" fill="${dark}" stroke="${color}" stroke-width="5"/><path d="M26 39h46v19H26z" fill="${ink}"/><path d="M32 45h33l-6 7H39z" fill="${color}"/><path d="M35 31h28M48 19v12" stroke="${steel}" stroke-width="4"/>${variant > 2 ? `<path d="M26 23 17 8l3 26M70 23 79 8l-3 26" fill="${color}"/>` : ''}`;
    if (item.slot === 'chest') return `<path d="m18 25 21-12 19 0 21 12-8 24-4 32H29l-4-32z" fill="${dark}" stroke="${color}" stroke-width="5"/><path d="M39 17 29 36l20 20 20-20-11-19M49 56v24" fill="none" stroke="${steel}" stroke-width="4"/><path d="m43 35 6-8 6 8-6 12z" fill="${color}"/>`;
    if (item.slot === 'pants') return `<path d="M24 15h49l-5 29-8 38H45l-2-25-6 25H22l-2-38z" fill="${dark}" stroke="${color}" stroke-width="5"/><path d="M26 25h43M31 43h12M54 43h12M25 70h13M51 70h13" stroke="${steel}" stroke-width="4"/>`;
    if (item.slot === 'boots') return `<path d="M17 21h25v35l11 16v11H12V69l10-16zM57 21h22v38l9 14v10H51V68l6-12z" fill="${dark}" stroke="${color}" stroke-width="5"/><path d="M17 34h25M57 34h22M13 75h39M53 75h35" stroke="${steel}" stroke-width="4"/>`;
    const motif = ['M48 20v55M22 48h52','M48 17 73 47 48 78 23 47z','M48 17v62M18 48h60M27 27l42 42M69 27 27 69','M20 58q30-50 57 0','M48 17 70 32 66 68 48 79 30 68 26 32z','M48 17 64 35 48 76 32 35z'][variant % 6];
    return `<circle cx="48" cy="48" r="34" fill="${dark}" stroke="${color}" stroke-width="6"/><circle cx="48" cy="48" r="24" fill="${ink}" stroke="${steel}" stroke-width="2"/><path d="${motif}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><circle cx="48" cy="48" r="6" fill="#fff"/>`;
  }
  function icon(item) {
    if (cache.has(item.id)) return cache.get(item.id);
    const collection = window.LF_CATALOG?.items.filter(entry => entry.slot === item.slot) || [];
    const variant = Math.max(0, collection.findIndex(entry => entry.id === item.id));
    const seed = [...item.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    const color = escape(item.color || '#8fa3aa');
    const facets = Array.from({length: 6}, (_,i) => `<path d="M${(seed+i*29)%90} 0v96" stroke="${color}" opacity="${.035+i*.01}" stroke-width="${i%2?8:3}"/>`).join('');
    const runes=['M12 52v-11l8-5','M11 38h9l-5 8 6 8','M13 34v22m-5-11h10','M10 36l11 9-11 9','M10 37h12l-6 16','M11 54l6-17 6 17'][variant%6];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><radialGradient id="g"><stop stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="#07121d"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="3"/></filter></defs><path fill="#07121d" d="M0 0h96v96H0z"/><path fill="url(#g)" d="M4 4h88v88H4z"/>${facets}<path d="M8 8h80v80H8z" fill="none" stroke="${color}" stroke-opacity=".65" stroke-width="2"/><path d="${runes}" fill="none" stroke="${color}" stroke-opacity=".9" stroke-width="2"/><g opacity=".45" filter="url(#glow)">${emblem(item,variant)}</g><g>${emblem(item,variant)}</g><path d="M8 21V8h13M75 8h13v13M8 75v13h13M75 88h13V75" fill="none" stroke="${color}" stroke-width="3"/></svg>`;
    const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    cache.set(item.id, url);
    return url;
  }
  window.LF_ART = Object.freeze({icon});
})();
