// Print helper: documents on the TecArch letterhead (every page), optional full-page cover first.
// Uses @page margins for the letterhead's writing area and a fixed full-bleed image, which Chrome repeats on each printed page.
export function printOnLetterhead({ html, title, base = '../', cover = null, css = '' }){
  let root = document.getElementById('lhPrint');
  if(!root){ root = document.createElement('div'); root.id = 'lhPrint'; document.body.appendChild(root); }
  root.innerHTML = `<style>
    #lhPrint{display:none}
    @media print{
      @page{size:A4;margin:0}
      body.lhprinting > *:not(#lhPrint){display:none!important}
      body.lhprinting{background:#fff!important}
      body.lhprinting #lhPrint{display:block}
      #lhPrint .lhbg{position:fixed;top:0;left:0;width:210mm;height:297mm;z-index:0}
      html,body.lhprinting{background:#fff!important}
      #lhPrint table.lhflow{position:relative;z-index:1;width:100%;border-collapse:collapse;border:0!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}
      #lhPrint table.lhflow > thead > tr > td,#lhPrint table.lhflow > tfoot > tr > td,#lhPrint table.lhflow > tbody > tr > td{background:transparent!important}
      #lhPrint table.lhflow > thead > tr > td{height:56mm;padding:0;border:0}
      #lhPrint table.lhflow > tfoot > tr > td{height:44mm;padding:0;border:0}
      #lhPrint table.lhflow > tbody > tr > td{padding:0 17mm;border:0;vertical-align:top}
      #lhPrint .lhcover{break-after:page;position:relative;z-index:2;background:#fff;width:210mm;height:297mm;margin:0}
      #lhPrint .lhcover img{position:absolute;inset:0;width:100%;height:100%}
      #lhPrint .lhcover .lhc-text{position:absolute;left:25%;top:41%;right:12%;font:500 11pt Inter,Arial,sans-serif;color:#1d2128;line-height:1.55}
      #lhPrint .lhcover .lhc-text b{font-size:15pt;display:block;margin-bottom:2px}
      #lhPrint .lhpage{break-after:page}
      #lhPrint .lhpage:last-child{break-after:auto}
      #lhPrint *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
    ${css}</style>
    ${cover ? `<section class="lhcover"><img src="${base}brand/valuation-cover.jpg" alt=""><div class="lhc-text">${cover}</div></section>` : ''}
    <img class="lhbg" src="${base}brand/letterhead.jpg" alt="">
    <table class="lhflow"><thead><tr><td></td></tr></thead><tfoot><tr><td></td></tr></tfoot><tbody><tr><td>${html}</td></tr></tbody></table>`;
  const old = document.title; document.title = title || old;
  document.body.classList.add('lhprinting');
  const done = () => { document.body.classList.remove('lhprinting'); document.title = old; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  const imgs = [...root.querySelectorAll('img')];
  return Promise.all(imgs.map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => new Promise(r => setTimeout(() => { window.print(); r(); }, 60)));
}
