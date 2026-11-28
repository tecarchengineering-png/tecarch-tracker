// Delete = move to Trash (admin). Everything deleted together can be restored for 30 days from the Trash page.
// If other records hang from the item (e.g. receipts under a job), the person is told exactly what and asked once.

const nice = e => String(e?.message || e || '').replace(/^(NOT_ALLOWED|NOT_FOUND|IN_USE|BLOCKED|LOCKED|FY_CLOSED):\s*/, '');

function undoToast(sb, batch, text, onUndo, base){
  document.querySelectorAll('.trash-toast').forEach(x => x.remove());
  const el = document.createElement('div');
  el.className = 'toast trash-toast';
  el.style.cssText = 'display:flex;gap:12px;align-items:center;z-index:2147483001';
  el.innerHTML = `<span></span><button type="button" style="background:none;border:0;color:#7fb2ff;font-weight:700;cursor:pointer;padding:0">Undo</button><a href="${base}trash/" style="color:#c8d3ee;font-size:12px">Trash</a>`;
  el.querySelector('span').textContent = text;
  el.querySelector('button').onclick = async () => {
    el.remove();
    const { error } = await sb.rpc('restore_from_trash', { p_batch:batch });
    if(error) return alert('Could not undo: ' + nice(error));
    onUndo && onUndo();
  };
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 9000);
}

/**
 * trashDelete(sb, 'quotes', 12, 'quotation Q-83/84-002', { base:'../', onUndo, ask:true })
 * returns { batch, items } or null when cancelled / refused.
 */
export async function trashDelete(sb, table, id, what = 'this record', { base = '../', onUndo, ask = true } = {}){
  if(ask && !confirm(`Move ${what} to the Trash?\n\nYou can restore it from the Trash for 30 days.`)) return null;
  let r = await sb.rpc('move_to_trash', { p_table:table, p_id:id, p_with_linked:false });
  const m = String(r.error?.message || '');
  if(r.error && m.startsWith('LINKED:')){
    let list = '';
    try { list = JSON.parse(m.slice(7)).map(x => `  • ${x.n} ${String(x.kind).toLowerCase()}`).join('\n'); } catch(e){}
    if(!confirm(`${what[0].toUpperCase() + what.slice(1)} has records linked to it:\n${list}\n\nMove all of them to the Trash together?\nYou can restore everything at once for 30 days.`)) return null;
    r = await sb.rpc('move_to_trash', { p_table:table, p_id:id, p_with_linked:true });
  }
  if(r.error){ alert('Not deleted: ' + nice(r.error)); return null; }
  const n = r.data?.items || 1;
  undoToast(sb, r.data.batch, n > 1 ? `Moved to Trash with ${n - 1} linked item${n > 2 ? 's' : ''}` : 'Moved to Trash', onUndo, base);
  return r.data;
}
