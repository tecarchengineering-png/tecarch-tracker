// Letterhead documents: opens an on-screen A4 preview (exactly what will print), with
// Print and Download PDF. Every page is a real 210×297 mm sheet with the letterhead behind it,
// so the preview, the printout and the PDF all match — also inside apps that have no print preview.
// Content is split across pages automatically; long tables continue on the next page with their header.

const PAGE_W = 210, PAGE_H = 297;            // mm
const SAFE = { top:56, bottom:44, side:17 }; // mm kept clear of the letterhead artwork

const STYLE = `
#lhPrint{position:fixed;inset:0;z-index:2147483000;background:#3b3f46;display:flex;flex-direction:column;font-family:Inter,Arial,sans-serif}
#lhPrint .lhv-bar{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#22252b;color:#fff;flex:none}
#lhPrint .lhv-bar .t{font-weight:600;font-size:14px;margin-right:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#lhPrint .lhv-bar small{color:#aab1bd;font-weight:400;margin-left:8px}
#lhPrint .lhv-bar button{font:600 13px Inter,Arial,sans-serif;border:0;border-radius:8px;padding:9px 14px;cursor:pointer;background:#3a3f48;color:#fff}
#lhPrint .lhv-bar button.p{background:#2563eb}
#lhPrint .lhv-bar button:disabled{opacity:.6;cursor:wait}
#lhPrint .lhv-scroll{flex:1;overflow:auto;padding:24px 0}
#lhPrint .lhv-pages{width:${PAGE_W}mm;margin:0 auto;transform-origin:top center}
#lhPrint .lhp{position:relative;width:${PAGE_W}mm;height:${PAGE_H}mm;background:#fff;margin:0 0 18px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.35);color:#111}
#lhPrint .lhp > img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:0}
#lhPrint .lhp-body{position:absolute;top:${SAFE.top}mm;bottom:${SAFE.bottom}mm;left:${SAFE.side}mm;right:${SAFE.side}mm;z-index:1;overflow:hidden}
#lhPrint .lhp-body .doc{max-width:none;margin:0}
#lhPrint .lhp-no{position:absolute;top:51mm;right:17mm;text-align:right;font-size:8pt;color:#7a8190;z-index:1}
#lhPrint .lhc-text{position:absolute;left:44%;right:7%;top:59%;z-index:1;font:500 11pt Inter,Arial,sans-serif;color:#1d2128;line-height:1.6}
#lhPrint .lhc-text small{display:block;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;color:#2a9bd8;font-weight:700}
#lhPrint .lhc-text b{display:block;font:700 17pt Montserrat,Inter,Arial,sans-serif;margin:2px 0 8px;line-height:1.25}
#lhPrint .lhc-text span{display:block;font-size:10.5pt;color:#3a414d}
@media print{
  @page{size:A4;margin:0}
  html,body.lhprinting{background:#fff!important;margin:0!important;padding:0!important}
  body.lhprinting::before{display:none!important}
  body.lhprinting > *:not(#lhPrint){display:none!important}
  #lhPrint{position:static;display:block;background:#fff}
  #lhPrint .lhv-bar{display:none}
  #lhPrint .lhv-scroll{overflow:visible;padding:0}
  #lhPrint .lhv-pages{transform:none!important;width:auto;margin:0}
  #lhPrint .lhp{margin:0;box-shadow:none;break-after:page;page-break-after:always}
  #lhPrint .lhp:last-child{break-after:auto;page-break-after:auto}
  #lhPrint *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}`;

const loadImg = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(i); i.src = src; });

// The pages' own document styles were written for print only; show them on screen too.
const unwrapPrint = css => css.replace(/@media\s+print\s*\{([\s\S]*)\}\s*$/m, '$1');

function paginate(pagesEl, html, base){
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  const top = tmp.children.length === 1 ? tmp.firstElementChild : null;
  const wrapper = top && !top.classList.contains('lhpage') ? top : null;
  let sections = [...(wrapper || tmp).querySelectorAll(':scope > .lhpage')];
  if(!sections.length){ const s = document.createElement('section'); [...(wrapper || tmp).childNodes].forEach(n => s.appendChild(n)); sections = [s]; }

  let body, root, placed, made;            // current page body, its section box, items on this page, clones made on this page
  const newPage = sec => {
    const pg = document.createElement('div'); pg.className = 'lhp';
    pg.innerHTML = `<img class="bg" src="${base}brand/letterhead.jpg?v=4" alt="">`;
    body = document.createElement('div'); body.className = 'lhp-body'; pg.appendChild(body);
    const w = wrapper ? wrapper.cloneNode(false) : document.createElement('div');
    root = sec.cloneNode(false); root.classList.remove('lhpage'); w.appendChild(root); body.appendChild(w);
    pagesEl.appendChild(pg); placed = 0; made = new Map();
  };
  const over = () => body.scrollHeight > body.clientHeight + 1;
  // the container for a chain of original ancestors on the current page (shallow clones, made once per page)
  const holder = chain => { let h = root; for(const a of chain){ if(!made.has(a)){ const c = a.cloneNode(false); h.appendChild(c); made.set(a, c); } h = made.get(a); } return h; };
  let sec;
  const leaf = (el, chain) => {            // something that cannot be split
    holder(chain).appendChild(el);
    if(over() && placed > 0){ el.remove(); newPage(sec); holder(chain).appendChild(el); }
    placed++;
  };
  const table = (el, chain) => {
    const rows = [...el.querySelectorAll(':scope > tbody > tr')];
    const head = el.querySelector(':scope > thead'), foot = el.querySelector(':scope > tfoot');
    const shell = () => { const t = el.cloneNode(false); if(head) t.appendChild(head.cloneNode(true)); const tb = document.createElement('tbody'); t.appendChild(tb); holder(chain).appendChild(t); return tb; };
    let tb = shell();
    for(const r of rows){
      tb.appendChild(r);
      if(over()){
        r.remove();
        const empty = !tb.children.length;
        if(empty) tb.parentNode.remove();
        if(placed > 0 || !empty) newPage(sec);
        tb = shell(); tb.appendChild(r);
      }
      placed++;
    }
    if(foot) tb.parentNode.appendChild(foot.cloneNode(true));
  };
  const fill = (nodes, chain) => {
    for(const n of nodes){
      if(n.nodeType !== 1){ if(n.textContent.trim()) holder(chain).appendChild(n); continue; }
      const h = holder(chain); h.appendChild(n);
      if(!over()){ placed++; continue; }
      n.remove();
      if(n.tagName === 'TABLE' && n.querySelectorAll(':scope > tbody > tr').length > 1) table(n, chain);
      else if(n.children.length > 1 && !/^(P|H[1-6]|LI|TR|IMG|svg)$/i.test(n.tagName)) fill([...n.childNodes], [...chain, n]);
      else leaf(n, chain);
    }
  };
  sections.forEach(s => { sec = s; newPage(s); fill([...s.childNodes], []); });
}

export async function printOnLetterhead({ html, title, base = '../', cover = null, css = '' }){
  document.getElementById('lhPrint')?.remove();
  const root = document.createElement('div'); root.id = 'lhPrint';
  root.innerHTML = `<style>${STYLE}\n${unwrapPrint(css)}</style>
    <div class="lhv-bar"><span class="t"></span>
      <button type="button" class="p" data-a="print">Print</button><button type="button" data-a="pdf">Download PDF</button><button type="button" data-a="close">Close</button></div>
    <div class="lhv-scroll"><div class="lhv-pages"></div></div>`;
  document.body.appendChild(root);
  root.querySelector('.t').textContent = title || 'Document';
  const pagesEl = root.querySelector('.lhv-pages');

  await Promise.all([loadImg(base + 'brand/letterhead.jpg?v=4'), cover ? loadImg(base + 'brand/valuation-cover.jpg') : 0, document.fonts?.ready]);
  if(cover){
    const c = document.createElement('div'); c.className = 'lhp lhp-cover';
    c.innerHTML = `<img class="bg" src="${base}brand/valuation-cover.jpg" alt=""><div class="lhc-text">${cover}</div>`;
    pagesEl.appendChild(c);
  }
  paginate(pagesEl, html, base);
  const pages = [...pagesEl.children];
  const letterPages = pages.filter(p => !p.classList.contains('lhp-cover'));
  if(letterPages.length > 1) letterPages.forEach((p, i) => { const n = document.createElement('div'); n.className = 'lhp-no'; n.textContent = `Page ${i + 1} of ${letterPages.length}`; p.appendChild(n); });
  root.querySelector('.t').innerHTML += `<small>${pages.length} page${pages.length > 1 ? 's' : ''} · A4</small>`;

  // fit the page width to the window
  const fit = () => { const px = pagesEl.offsetWidth, avail = root.querySelector('.lhv-scroll').clientWidth - 32;
    const z = Math.min(1, avail / px); pagesEl.style.transform = z < 1 ? `scale(${z})` : ''; pagesEl.style.marginBottom = z < 1 ? `-${(1 - z) * pagesEl.offsetHeight}px` : ''; };
  fit(); window.addEventListener('resize', fit);

  const oldTitle = document.title;
  const close = () => { window.removeEventListener('resize', fit); document.removeEventListener('keydown', esc); root.remove(); document.body.classList.remove('lhprinting'); document.title = oldTitle; };
  const esc = e => { if(e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);

  const doPrint = () => {
    document.title = title || oldTitle; document.body.classList.add('lhprinting');
    const done = () => { document.body.classList.remove('lhprinting'); document.title = oldTitle; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  };

  const doPdf = async btn => {
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Making PDF…';
    try{
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm'),
        import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm')]);
      const keep = pagesEl.style.transform; pagesEl.style.transform = '';
      const pdf = new jsPDF({ unit:'mm', format:'a4', compress:true });
      for(let i = 0; i < pages.length; i++){
        btn.textContent = `Making PDF… ${i + 1}/${pages.length}`;
        const cv = await html2canvas(pages[i], { scale:2.5, useCORS:true, backgroundColor:'#ffffff', logging:false });
        if(i) pdf.addPage();
        pdf.addImage(cv.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, PAGE_W, PAGE_H);
      }
      pagesEl.style.transform = keep;
      pdf.save(((title || 'document').replace(/[\\/:*?"<>|]+/g, '-').trim()) + '.pdf');
    }catch(err){ alert('Could not make the PDF here (' + (err.message || err) + '). Use Print and choose "Save as PDF".'); }
    btn.disabled = false; btn.textContent = label;
  };

  root.querySelector('.lhv-bar').addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    if(b.dataset.a === 'close') close(); else if(b.dataset.a === 'print') doPrint(); else if(b.dataset.a === 'pdf') doPdf(b);
  });
  return { close, print:doPrint };
}
