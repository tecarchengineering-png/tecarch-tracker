// TecArch input checks — loaded once by lib/shell.js on every page.
// Every form submit is checked first (capture phase); a form with a wrong field is stopped,
// the field is outlined in red with a short message, and nothing is saved.
// Number fields also refuse letters while typing.

const PERSON = 'person', ORG = 'org', IDNO = 'idno', IDTXT = 'idtext', ADDR = 'addr', REL = 'relation',
  PHONE = 'phone', EMAIL = 'email', NUM = 'num', POS = 'pos', PCT = 'pct', INT = 'int', WARD = 'ward', PLOT = 'plot', SHEET = 'sheet', PAN = 'pan', LAST4 = 'last4';

const BY_ID = {
  applicant_name:PERSON, owner_name:PERSON, mName:PERSON,
  client_name:ORG, pName:ORG, ptName:ORG, jClient:ORG, jBill:ORG, sName:ORG, rBy:ORG,
  applicant_id_no:IDNO, owner_id_text:IDTXT,
  relation:REL, applicant_address:ADDR, owner_address:ADDR, land_location:ADDR, building_location:ADDR,
  client_address:ADDR, site_location:ADDR, ptAddr:ADDR, sAddr:ADDR, pLoc:ADDR, jLoc:ADDR, wLoc:ADDR,
  phone:PHONE, client_phone:PHONE, pPhone:PHONE, mPhone:PHONE, jPhone:PHONE, ptPhone:PHONE, sPhone:PHONE,
  client_email:EMAIL, mEmail:EMAIL, ptEmail:EMAIL, sEmail:EMAIL, liEmail:EMAIL,
  land_rate:NUM, building_rate:NUM, fee:NUM, discount:NUM, pFee:NUM, jAmt:NUM, mAmt:POS, iAmt:POS, rAmt:POS, rVat:NUM,
  wAmt:POS, pGross:POS, pTds:NUM, eAmt:POS, eVat:NUM, tAmt:POS, aOpen:NUM, lAmt:POS, lpP:NUM, lpI:NUM, payAmt:POS,
  fx_rate:POS, advance_pct:PCT, lRate:PCT, ptTds:PCT, valid_days:INT, pWard:WARD,
  sPan:PAN, ptPan:PAN, aLast:LAST4,
};
const BY_F = { area:NUM, qty:POS, rate:NUM, ward:WARD, plot:PLOT, map_sheet:SHEET };
const NUMERIC = new Set([NUM, POS, PCT, INT, WARD, LAST4, PAN]);

const letters = s => (s.match(/\p{L}/gu) || []).length;
// a "word" of 5+ letters with no vowel, or the same key 4 times, looks like keyboard mashing
const mashed = s => /(.)\1{3,}/i.test(s) || s.split(/[^\p{L}]+/u).some(w => w.length >= 5 && !/[aeiouyà-ü]/i.test(w));
const num = s => Number(String(s).replace(/,/g, ''));
const isNum = s => /^-?\d[\d,]*(\.\d+)?$|^-?\.\d+$/.test(String(s).trim());

function phoneOk(v){
  return v.split(/[\/,;]| or /i).map(p => p.replace(/[\s\-()]/g, '')).filter(Boolean).every(p => {
    p = p.replace(/^\+?977/, '');
    return /^9[678]\d{8}$/.test(p) || /^0?\d{1,2}\d{5,7}$/.test(p) && !/^9/.test(p);
  });
}

export function check(rule, raw){
  const v = String(raw ?? '').trim();
  if(!v) return '';
  switch(rule){
    case PERSON:
      if(/\d/.test(v)) return 'A name cannot contain numbers.';
      if(letters(v) < 2 || !/^[\p{L}\s.'\-]+$/u.test(v)) return 'Use letters only, e.g. Ram Bahadur Thapa.';
      if(mashed(v)) return 'This does not look like a real name.';
      return '';
    case ORG:
      if(letters(v) < 2) return 'Write the name in letters (numbers alone are not a name).';
      if(mashed(v)) return 'This does not look like a real name.';
      return '';
    case IDNO:
      if(!/\d/.test(v)) return 'An ID number must contain numbers, e.g. PA1234567 or 27-01-75-12345.';
      if(!/^[\p{L}\d\s\-\/.]+$/u.test(v)) return 'Use only letters, numbers, - and /.';
      return '';
    case IDTXT:
      return /\d/.test(v) ? '' : 'Include the ID number, e.g. Citizenship No: 513040/200.';
    case ADDR:
      if(letters(v) < 3) return 'Write the place name in letters, e.g. Pokhara-8, Kaski.';
      if(mashed(v)) return 'This does not look like a real address.';
      if(!/[\s,\-\d]/.test(v)) return 'Give the full address, e.g. Pokhara-8, Kaski (add the ward or district).';
      return '';
    case REL:
      if(/\d/.test(v) && letters(v) < 3) return 'Write the relation in words, e.g. son of Mr. Hari Nepali.';
      if(mashed(v) || v.split(/\s+/).length < 3) return 'Write it in full, e.g. "daughter of Mr. Bhai Kaji Gurung" — or leave it empty.';
      return '';
    case PHONE:
      if(/\p{L}/u.test(v.replace(/\bor\b/gi, ''))) return 'A phone number cannot contain letters.';
      return phoneOk(v) ? '' : 'Enter a valid number: mobile 98XXXXXXXX (10 digits) or landline 061-XXXXXX.';
    case EMAIL:
      return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? '' : 'Enter a valid email, e.g. name@gmail.com.';
    case NUM: case POS: case PCT: case INT: case WARD: {
      if(!isNum(v)) return 'Numbers only (no letters).';
      const n = num(v);
      if(n < 0) return 'Cannot be negative.';
      if(rule === POS && n <= 0) return 'Must be more than 0.';
      if(rule === PCT && n > 100) return 'Must be between 0 and 100.';
      if(rule === INT && (!Number.isInteger(n) || n < 1 || n > 365)) return 'Whole days between 1 and 365.';
      if(rule === WARD && (!Number.isInteger(n) || n < 1 || n > 40)) return 'Ward is a whole number (1–40).';
      return '';
    }
    case PLOT:
      return /\d/.test(v) && /^[\d\s\-\/,a-z]+$/i.test(v) ? '' : 'Plot (kitta) number must be numbers, e.g. 112 or 112/1.';
    case SHEET:
      return /\d/.test(v) && /^[\p{L}\d\s\-\/.]+$/u.test(v) ? '' : 'Map sheet number must contain numbers, e.g. 4092209.';
    case PAN:
      return /^\d{9}$/.test(v.replace(/\s/g, '')) ? '' : 'PAN/VAT number is 9 digits.';
    case LAST4:
      return /^\d{4}$/.test(v) ? '' : 'Last 4 digits only.';
  }
  return '';
}

/** Password rule for new passwords: at least 8 characters with both letters and numbers. */
export function passwordProblem(pw){
  pw = String(pw || '');
  if(pw.length < 8) return 'Password must be at least 8 characters.';
  if(!/\p{L}/u.test(pw)) return 'Password must contain letters as well as numbers.';
  if(!/\d/.test(pw)) return 'Password must contain numbers as well as letters.';
  if(/^(.)\1+$/.test(pw) || /^(12345678|password\d*|tecarch\d*)$/i.test(pw)) return 'This password is too easy to guess.';
  return '';
}

function ruleFor(el){
  if(!el || !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return null;
  if(el.dataset.v === 'off' || el.type === 'search' || el.type === 'date' || el.type === 'checkbox' || el.type === 'file' || el.type === 'password') return null;
  return el.dataset.v || BY_ID[el.id] || BY_F[el.dataset.f] || (el.type === 'email' ? EMAIL : el.type === 'tel' ? PHONE : el.type === 'number' ? NUM : null);
}

const css = document.createElement('style');
css.textContent = `.vbad{border-color:#e24b4a!important;box-shadow:0 0 0 3px rgba(226,75,74,.18)!important}
.verr{color:#c0392b;font-size:12px;margin-top:4px;line-height:1.35}
@media print{.verr{display:none}}`;
document.head.appendChild(css);

function mark(el, msg){
  let box = el.nextElementSibling?.classList?.contains('verr') ? el.nextElementSibling : null;
  if(msg){
    el.classList.add('vbad'); el.setAttribute('aria-invalid', 'true');
    if(!box){ box = document.createElement('div'); box.className = 'verr'; el.after(box); }
    box.textContent = msg;
  } else {
    el.classList.remove('vbad'); el.removeAttribute('aria-invalid'); box?.remove();
  }
}

/** Check every field inside root; returns the first wrong field (or null). */
export function validate(root){
  let first = null;
  root.querySelectorAll('input, textarea').forEach(el => {
    if(el.disabled || el.offsetParent === null) return;          // hidden fields are not checked
    const r = ruleFor(el); if(!r) return;
    const msg = check(r, el.value); mark(el, msg);
    if(!msg && NUMERIC.has(r) && el.value.includes(',')) el.value = el.value.replace(/,/g, '');   // 1,25,000 → 125000 before saving
    if(msg && !first) first = el;
  });
  return first;
}

// Stop a form from saving while something is wrong.
document.addEventListener('submit', e => {
  const bad = validate(e.target);
  if(bad){
    e.preventDefault(); e.stopImmediatePropagation();
    bad.scrollIntoView({ behavior:'smooth', block:'center' }); bad.focus({ preventScroll:true });
    const n = e.target.querySelectorAll('.vbad').length;
    const t = document.createElement('div'); t.className = 'toast';
    t.textContent = '⚠ ' + (n > 1 ? `Please fix the ${n} fields marked in red` : 'Please fix the field marked in red');
    document.body.appendChild(t); setTimeout(() => t.remove(), 3000);
  }
}, true);

// Numbers: drop letters as they are typed; clear the message as soon as the field is fixed.
document.addEventListener('input', e => {
  const el = e.target, r = ruleFor(el); if(!r) return;
  if(NUMERIC.has(r)){ const c = el.value.replace(r === PAN || r === LAST4 || r === WARD || r === INT ? /[^\d]/g : /[^\d.,]/g, ''); if(c !== el.value) el.value = c; }
  if(r === PHONE){ const c = el.value.replace(/[^\d\s+\-\/(),]/g, ''); if(c !== el.value) el.value = c; }
  if(el.classList.contains('vbad')) mark(el, check(r, el.value));
});
// Check a field when leaving it.
document.addEventListener('focusout', e => { const el = e.target, r = ruleFor(el); if(r && el.value.trim()) mark(el, check(r, el.value)); });
