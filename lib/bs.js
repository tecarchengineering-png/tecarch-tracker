// Bikram Sambat (BS) calendar for TecArch Workspace. Month lengths 2070–2089 BS,
// cross-checked against two independent libraries (nepali-date-converter, bikram-sambat).
// Fiscal year runs from 1 Shrawan to the end of Ashadh.
const START = 2070, ANCHOR = Date.UTC(2013, 3, 14); // 2070-01-01 BS = 2013-04-14 AD
const DAYS = [[31,31,31,32,31,31,29,30,30,29,30,30],[31,31,32,31,31,31,30,29,30,29,30,30],[31,32,31,32,31,30,30,29,30,29,30,30],[31,32,31,32,31,30,30,30,29,29,30,31],[31,31,31,32,31,31,30,29,30,29,30,30],[31,31,32,31,31,31,30,29,30,29,30,30],[31,32,31,32,31,30,30,30,29,29,30,30],[31,32,31,32,31,30,30,30,29,30,29,31],[31,31,31,32,31,31,30,29,30,29,30,30],[31,31,32,31,31,31,30,29,30,29,30,30],[31,32,31,32,31,30,30,30,29,29,30,30],[31,32,31,32,31,30,30,30,29,30,29,31],[31,31,32,31,31,31,30,29,30,29,30,30],[31,31,32,31,31,31,30,29,30,29,30,30],[31,31,32,31,31,30,30,30,29,30,30,30],[31,32,31,32,30,31,30,30,29,30,30,30],[30,32,31,32,31,30,30,30,29,30,30,30],[31,31,32,31,31,31,30,30,29,30,30,30],[30,31,32,32,30,31,30,30,29,30,30,30],[30,32,31,32,31,30,30,30,29,30,30,30]];
export const MONTHS = ["Baishakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"];
const p2 = n => String(n).padStart(2, "0");
const toUTC = ad => { if (ad instanceof Date) return Date.UTC(ad.getFullYear(), ad.getMonth(), ad.getDate()); const [y, m, d] = String(ad).slice(0, 10).split("-").map(Number); return Date.UTC(y, m - 1, d); };
const isoOf = ms => new Date(ms).toISOString().slice(0, 10);
export function inRange(ad) { if (!ad) return false; const t = toUTC(ad); return t >= ANCHOR && t < bsToUTC(START + DAYS.length, 1, 1); }
export function adToBs(ad) {
  if (!ad) return null;
  let days = Math.round((toUTC(ad) - ANCHOR) / 864e5);
  if (days < 0) return null;
  for (let yi = 0; yi < DAYS.length; yi++) for (let m = 0; m < 12; m++) {
    if (days < DAYS[yi][m]) return { y: START + yi, m: m + 1, d: days + 1 };
    days -= DAYS[yi][m];
  }
  return null;
}
function bsToUTC(y, m, d) {
  let days = 0;
  for (let yi = 0; yi < y - START; yi++) days += DAYS[yi].reduce((a, b) => a + b, 0);
  for (let mi = 0; mi < m - 1; mi++) days += DAYS[y - START][mi];
  return ANCHOR + (days + d - 1) * 864e5;
}
export function bsToAd(y, m, d) {
  y = Number(y); m = Number(m); d = Number(d);
  if (!(y >= START && y < START + DAYS.length) || !(m >= 1 && m <= 12) || !(d >= 1 && d <= DAYS[y - START][m - 1])) return null;
  return isoOf(bsToUTC(y, m, d));
}
export const daysInMonth = (y, m) => DAYS[y - START]?.[m - 1] || 0;
export function bsIso(ad) { const b = adToBs(ad); return b ? b.y + "-" + p2(b.m) + "-" + p2(b.d) : ""; }
export function bsLong(ad) { const b = adToBs(ad); return b ? b.d + " " + MONTHS[b.m - 1] + " " + b.y : ""; }
export function parseBs(s) { const m = String(s || "").trim().match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/); return m ? bsToAd(m[1], m[2], m[3]) : null; }
export function fyStartYear(ad) { const b = adToBs(ad); return b ? (b.m >= 4 ? b.y : b.y - 1) : null; }
export function fy(startYear) {
  const y = Number(startYear);
  return { start: y, label: y + "/" + String(y + 1).slice(2), short: String(y).slice(2) + "/" + String(y + 1).slice(2),
    from: bsToAd(y, 4, 1), to: isoOf(bsToUTC(y + 1, 4, 1) - 864e5) };
}
export const fyOf = ad => { const y = fyStartYear(ad); return y ? fy(y) : null; };
export const TABLE = { START, DAYS };
