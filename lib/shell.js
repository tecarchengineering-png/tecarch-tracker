// TecArch Workspace shell: sidebar, top bar, Ctrl/⌘K command palette. Shared by every page.
import * as BS from './bs.js?v=20261128h';
import './validate.js?v=20261128h';

const I = {
  hq:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
  projects:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>',
  tasks:'<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
  team:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 4.8"/>',
  quotes:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  finance:'<path d="M3 7h18v12H3z"/><path d="M3 7l3-4h12l3 4"/><circle cx="12" cy="13" r="2.5"/>',
  valuation:'<path d="M12 3 3 8v13h18V8z"/><path d="M9 21v-6h6v6"/><path d="M8.5 11h7"/>',
  clients:'<path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M17 3.13a4 4 0 0 1 0 7.75"/>',
  watermark:'<path d="M12 3c3 4 6 7.2 6 10.5A6 6 0 0 1 6 13.5C6 10.2 9 7 12 3z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  wa:'<path d="M20.5 3.5A11 11 0 0 0 3.2 17L2 22l5.1-1.2A11 11 0 0 0 20.5 3.5z"/><path d="M8.5 7.5c.3 2.6 1.6 5.3 4.3 6.9 1 .6 2 .9 2.7 1l1.4-1.4-2.2-1.3-1 1c-1.4-.6-2.6-1.8-3.2-3.2l1-1-1.3-2.2z"/>',
};
export const icon = (k, cls='') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${I[k] || ''}</svg>`;
export const ROLE_LABEL = { admin:'Super admin', accountant:'Accountant', architect:'Architect', engineer:'Engineer', site_supervisor:'Site supervisor', staff:'Staff' };
const OFFICE = ['admin','accountant','architect','engineer'], FIN = ['admin','accountant'], VAL = ['admin','accountant','engineer','architect'];

const NAV = [
  { sec:'Workspace' },
  { k:'hq', label:'HQ', href:'hq/', icon:'hq' },
  { k:'projects', label:'Projects', href:'#projects', root:true, icon:'projects' },
  { k:'tasks', label:'Tasks', href:'#tasks', root:true, icon:'tasks' },
  { sec:'Business' },
  { k:'quotes', label:'Quotations', href:'quotes/', icon:'quotes', roles:OFFICE },
  { k:'clients', label:'Clients & greetings', href:'hq/#clients', icon:'clients', roles:FIN },
  { k:'finance', label:'Finance', href:'finance/', icon:'finance', roles:FIN },
  { k:'valuation', label:'Valuation', href:'valuation/', icon:'valuation', roles:VAL },
  { sec:'Company' },
  { k:'team', label:'Team', href:'#team', root:true, icon:'team' },
  { k:'watermark', label:'Watermark Studio', href:'watermark/', icon:'watermark' },
];
const initials = n => String(n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
export { greet, initials };

/**
 * mountShell({ base:'../', active:'finance', me:{full_name, role}, content:['main'], badges:{tasks:3}, onSignOut, search:(q)=>[{label,sub,href|run}] })
 */
export function mountShell(o){
  const base = o.base ?? '../';
  const role = o.me?.role || 'staff';
  const href = it => it.root ? (base === '' ? it.href : base + it.href) : base + it.href;
  const items = NAV.filter(it => it.sec || !it.roles || it.roles.includes(role));
  // drop section headers with nothing under them
  const navItems = items.filter((it, i) => !it.sec || (items[i + 1] && !items[i + 1].sec));
  const side = document.createElement('aside'); side.className = 'sx-side'; side.setAttribute('aria-label', 'TecArch navigation');
  side.innerHTML = `<a class="sx-brand" href="${base}hq/"><span class="sx-logo"><svg viewBox="0 0 24 24"><path d="M12 3 4 21h4l4-9 4 9h4z"/><path d="M9 15h6"/></svg></span><span><b>TecArch HQ</b><small>Engineering &amp; Construction</small></span></a>
    ${navItems.map(it => it.sec ? `<div class="sx-sec">${it.sec}</div>` : `<a class="sx-link ${it.k === o.active ? 'on' : ''}" href="${href(it)}" data-k="${it.k}" ${it.k === o.active ? 'aria-current="page"' : ''}>${icon(it.icon)}<span>${it.label}</span><span class="sx-b hidden" data-badge="${it.k}"></span></a>`).join('')}
    <div class="sx-sp"></div>
    <div class="sx-user"><span class="sx-av">${initials(o.me?.full_name)}</span><span style="min-width:0"><b>${esc(o.me?.full_name || '')}</b><small>${ROLE_LABEL[role] || 'Team'}</small></span><button class="sx-out" title="Sign out" aria-label="Sign out">${icon('out')}</button></div>`;
  const today = new Date(); const fy = BS.fyOf(today);
  const top = document.createElement('div'); top.className = 'sx-top';
  top.innerHTML = `<button class="sx-ib sx-menu" aria-label="Open menu">${icon('menu')}</button>
    <button class="sx-search" type="button" aria-label="Search">${icon('search')}<span>Search clients, jobs, quotes, pages…</span><kbd>Ctrl K</kbd></button>
    <span class="sx-tsp"></span>
    <span class="sx-chip"><i></i>${BS.bsLong(today)}${fy ? ` · FY ${fy.label}` : ''}</span>
    ${o.quick !== false ? `<a class="sx-ib pri" href="${base}hq/#new" title="Quick add" aria-label="Quick add">${icon('plus')}</a>` : ''}
    <span class="sx-av" title="${esc(o.me?.full_name || '')}">${initials(o.me?.full_name)}</span>`;
  const main = document.createElement('div'); main.className = 'sx-main';
  const body = document.createElement('div'); body.className = 'sx-body';
  main.append(top, body);
  const content = (o.content || ['main']).flatMap(sel => [...document.querySelectorAll(sel)]);
  if(o.panel){ const p = document.createElement('div'); p.className = 'sx-panel'; content.forEach(el => p.appendChild(el)); body.appendChild(p); }
  else content.forEach(el => body.appendChild(el));
  document.body.prepend(side, main);
  document.body.classList.add('sx');
  side.querySelector('.sx-out').onclick = o.onSignOut;
  top.querySelector('.sx-menu').onclick = () => document.body.classList.toggle('sx-open');
  document.addEventListener('click', e => { if(document.body.classList.contains('sx-open') && !e.target.closest('.sx-side,.sx-menu')) document.body.classList.remove('sx-open'); });
  side.querySelectorAll('.sx-link').forEach(a => a.addEventListener('click', () => document.body.classList.remove('sx-open')));
  // palette
  const openK = () => palette(o, navItems.filter(i => !i.sec), href);
  top.querySelector('.sx-search').onclick = openK;
  document.addEventListener('keydown', e => { if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openK(); } });
  setBadges(o.badges || {});
  return { setBadges, setActive:k => side.querySelectorAll('.sx-link').forEach(a => { a.classList.toggle('on', a.dataset.k === k); }) };
}
export function setBadges(b){
  Object.entries(b).forEach(([k, v]) => { const el = document.querySelector(`.sx-side [data-badge="${k}"]`); if(!el) return; const n = typeof v === 'object' ? v.n : v; el.textContent = n; el.classList.toggle('hidden', !n); el.classList.toggle('hot', !!(typeof v === 'object' && v.hot)); });
}
function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function palette(o, nav, href){
  if(document.querySelector('.sx-k')) return;
  const wrap = document.createElement('div'); wrap.className = 'sx-k';
  wrap.innerHTML = `<div class="sx-kbox" role="dialog" aria-label="Search"><input placeholder="Type a client, job code, quote no., or page…" aria-label="Search"><div class="sx-kl"></div></div>`;
  document.body.appendChild(wrap);
  const inp = wrap.querySelector('input'), list = wrap.querySelector('.sx-kl'); let sel = 0, rows = [];
  const close = () => wrap.remove();
  wrap.onclick = e => { if(e.target === wrap) close(); };
  const draw = async () => {
    const q = inp.value.trim().toLowerCase();
    const pages = nav.filter(n => !q || n.label.toLowerCase().includes(q)).map(n => ({ label:n.label, sub:'Page', href:href(n), icon:n.icon }));
    let found = [];
    if(q && o.search){ try { found = (await o.search(q)) || []; } catch(e){ found = []; } }
    rows = [...found.slice(0, 12), ...pages];
    sel = Math.min(sel, rows.length - 1); if(sel < 0) sel = 0;
    list.innerHTML = (found.length ? '<div class="sx-kh">Results</div>' : '') + found.slice(0, 12).map((r, i) => item(r, i)).join('') + (pages.length ? '<div class="sx-kh">Go to</div>' : '') + pages.map((r, i) => item(r, i + Math.min(found.length, 12))).join('') || '<div class="sx-kh">Nothing found</div>';
    list.querySelectorAll('.sx-ki').forEach(el => el.onclick = () => go(rows[Number(el.dataset.i)]));
  };
  const item = (r, i) => `<a class="sx-ki ${i === sel ? 'on' : ''}" data-i="${i}">${icon(r.icon || 'search')}<span>${esc(r.label)}</span><small>${esc(r.sub || '')}</small></a>`;
  const go = r => { if(!r) return; close(); if(r.run) r.run(); else location.href = r.href; };
  inp.oninput = () => { sel = 0; clearTimeout(inp._t); inp._t = setTimeout(draw, 120); };
  inp.onkeydown = e => {
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(sel + 1, rows.length - 1); draw(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); }
    else if(e.key === 'Enter'){ e.preventDefault(); go(rows[sel]); }
  };
  draw(); inp.focus();
}
