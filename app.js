(function(){
'use strict';
const PDF = {
  withbase: './docs/scheda_con_pedana.pdf',
  baseless: './docs/scheda_senza_pedana_2022.pdf',
  manuale: './docs/manuale_tecnico_presentazione.pdf',
  fondazioni: './docs/fondazioni_cascos_c4c.pdf'
};
const $=s=>document.querySelector(s);
let MODELS=[];

fetch('./models.json').then(r=>r.json()).then(d=>{MODELS=d; calculate();});

const rows=$('#rows'), warnings=$('#warnings');
const fmt=(x,u='')=>(x==null?'-':x.toLocaleString('it-IT'))+(u?(' '+u):'');

function issuesFor(m){
  const H=+($('#inpH').value||0), W=+($('#inpW').value||0), T=+($('#inpThickness').value||0);
  const conc=$('#inpConcrete').value, pw=$('#inpPower').value; const arr=[];
  if(H && m.h_sotto_traversa && H<(m.h_sotto_traversa-200)) arr.push({t:`Soffitto basso (< ${m.h_sotto_traversa-200} mm)`,cls:'warn'});
  if(W && m.larghezza && W<m.larghezza) arr.push({t:`Baia stretta (min ${m.larghezza} mm)`,cls:'bad'});
  if(pw && !(m.power||[]).includes(pw)) arr.push({t:`Alimentazione non prevista (${pw})`,cls:'warn'});
  if(T && T<(m.anchors?.thickness_min_mm||170)) arr.push({t:`Soletta < ${m.anchors?.thickness_min_mm||170} mm`,cls:'bad'});
  if(conc && m.anchors && conc!=="unknown" && conc!==m.anchors.concrete) arr.push({t:`Richiesto ${m.anchors.concrete}`,cls:'warn'});
  return arr;
}
function fitScore(m){
  const gvw=+($('#inpGVW').value||0), wb=+($('#inpWB').value||0); let s=0;
  if(gvw>0){const head=(m.portata-gvw)/m.portata; s+=Math.max(-1,Math.min(1,head*2));}
  if(wb>0){const wantsLong=wb>=3000; const long=/XL|WAGON/i.test(m.id)||m.interasse>=3000; s+=(wantsLong?(long?0.6:-0.6):(long?-0.2:0.2));}
  return s;
}
function render(list){
  rows.innerHTML='';
  list.forEach(m=>{
    const issues=issuesFor(m);
    const tr=document.createElement('tr');
    const isWithBase=m.base==='withbase';
    const schedaUrl=isWithBase?PDF.withbase:PDF.baseless;
    const baseChip=`<div class="tag" style="margin-top:4px">${isWithBase?'Con basamento':'Senza basamento'}</div>`;
    tr.innerHTML=`
      <td>
        <strong>${m.id}</strong>
        <div class="hint">rif. ${m.ref||'-'}</div>
        ${baseChip}
        <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
          <a class="btn" style="padding:2px 8px" href="${schedaUrl}" target="_blank" rel="noopener">📄 Scheda</a>
          <a class="btn" style="padding:2px 8px" href="${PDF.manuale}" target="_blank" rel="noopener">📘 Manuale</a>
          <a class="btn" style="padding:2px 8px" href="${PDF.fondazioni}" target="_blank" rel="noopener">🏗️ Fondazioni</a>
        </div>
      </td>
      <td>${fmt(m.portata,'kg')}</td>
      <td>${fmt(m.interasse,'mm')}</td>
      <td>${fmt(m.larghezza,'mm')}</td>
      <td>${fmt(m.h_sotto_traversa,'mm')}</td>
      <td>${(m.power||[]).join(', ')||'-'}</td>
      <td>${m.anchors? `${m.anchors.qty}× ${m.anchors.type}<br>${m.anchors.concrete}, ≥ ${m.anchors.thickness_min_mm} mm` : '-'}</td>
      <td>${issues.map(i=>`<span class="tag ${i.cls}">${i.t}</span>`).join(' ')||'<span class="ok">✓ Compatibile</span>'}</td>
      <td><input type="checkbox" class="pick" data-id="${m.id}" onclick="event.stopPropagation()"></td>`;
    tr.style.cursor='pointer';
    tr.addEventListener('click', ()=>{ openSheet(m); });
    rows.appendChild(tr);
  });
}
function makeFiltered(){
  const gvw=+($('#inpGVW').value||0), wantBase=$('#inpBase').value, pw=$('#inpPower').value;
  return [...MODELS]
    .filter(m=>!wantBase || m.base===wantBase)
    .filter(m=>!gvw || m.portata>=Math.max(1000, gvw*1.25))
    .filter(m=>!pw || (m.power||[]).includes(pw))
    .sort((a,b)=>fitScore(b)-fitScore(a));
}
function calculate(){
  warnings.innerHTML='';
  const lst=[]; if((+($('#inpThickness').value||0))<170) lst.push({t:'Soletta < 170 mm: adeguare',cls:'bad'});
  if((+($('#inpGVW').value||0))>3500) lst.push({t:'Veicolo > 3.5 t: valuta C5 / C5.5',cls:'warn'});
  lst.forEach(w=>{const s=document.createElement('span'); s.className=`tag ${w.cls}`; s.textContent=w.t; warnings.appendChild(s);});
  render(makeFiltered().slice(0,40));
}
document.getElementById('calcBtn').addEventListener('click', calculate);
document.getElementById('resetBtn').addEventListener('click', ()=>{ document.querySelectorAll('input').forEach(i=>i.value=''); calculate(); });

function selectedIds(){ return Array.from(document.querySelectorAll('.pick:checked')).map(i=>i.dataset.id); }
function buildQuery(extras){ const p=new URLSearchParams(); const set=(k,v)=>{if(v!=null&&v!=='')p.set(k,v);};
  set('H',$('#inpH').value); set('W',$('#inpW').value); set('T',$('#inpThickness').value);
  set('C',$('#inpConcrete').value); set('P',$('#inpPower').value); set('B',$('#inpBase').value);
  set('GVW',$('#inpGVW').value); set('WB',$('#inpWB').value);
  if(extras) Object.keys(extras).forEach(k=>set(k,extras[k])); return p.toString(); }

document.getElementById('shareBtn').addEventListener('click', ()=>{
  const url = location.origin + location.pathname + '?' + buildQuery({ids: selectedIds().join(',')});
  if(navigator.share){ navigator.share({title:'CASCOS Config', url}); }
  else { navigator.clipboard.writeText(url); alert('Link copiato:\n'+url); }
});

function toCSV(list){
  const head=['Modello','Rif','Portata(kg)','Interasse(mm)','Larghezza(mm)','Altezza utile(mm)','Alimentazione','Ancoraggi','Tipo'];
  const lines=[head.join(';')];
  list.forEach(m=>{
    const anc=m.anchors? `${m.anchors.qty}x ${m.anchors.type} ${m.anchors.concrete} ≥${m.anchors.thickness_min_mm}mm`: '';
    lines.push([m.id,m.ref||'',m.portata||'',m.interasse||'',m.larghezza||'',m.h_sotto_traversa||'',(m.power||[]).join(','),anc,(m.base||'')].join(';'));
  });
  return lines.join('\n');
}
document.getElementById('csvBtn').addEventListener('click', ()=>{
  const ids=selectedIds();
  const list=ids.length? MODELS.filter(m=>ids.includes(m.id)) : makeFiltered().slice(0,40);
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([toCSV(list)],{type:'text/csv'})); a.download='cascos_modelli.csv'; a.click();
});

function openSheet(m){
  const css=`body{font:13px system-ui,Segoe UI,Roboto,Arial;margin:22px}
    h1{font-size:18px;margin:0 0 8px 0}
    table{width:100%;border-collapse:collapse;margin-top:6px}
    td,th{border:1px solid #ccc;padding:6px;text-align:left}`;
  const schedaUrl = (m.base==='withbase')?PDF.withbase:PDF.baseless;
  const html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+m.id+' — CASCOS</title><style>'+css+'</style></head><body>'+
    '<h1>'+m.id+' — CASCOS</h1>'+
    '<table>'+
    '<tr><th>Portata</th><td>'+(m.portata||'-')+' kg</td></tr>'+
    '<tr><th>Interasse</th><td>'+(m.interasse||'-')+' mm</td></tr>'+
    '<tr><th>Larghezza</th><td>'+(m.larghezza||'-')+' mm</td></tr>'+
    '<tr><th>Altezza utile</th><td>'+(m.h_sotto_traversa||'-')+' mm</td></tr>'+
    '<tr><th>Alimentazione</th><td>'+((m.power||[]).join(', ')||'-')+'</td></tr>'+
    '<tr><th>Ancoraggi</th><td>'+(m.anchors? (m.anchors.qty+'× '+m.anchors.type+' — '+m.anchors.concrete+', ≥ '+m.anchors.thickness_min_mm+' mm') : '-')+'</td></tr>'+
    '<tr><th>Tipo</th><td>'+(m.base==='withbase'?'Con basamento':'Senza basamento')+'</td></tr>'+
    '<tr><th>Documentazione</th><td><a href="'+schedaUrl+'" target="_blank">Scheda ufficiale</a> · <a href="'+PDF.manuale+'" target="_blank">Manuale</a> · <a href="'+PDF.fondazioni+'" target="_blank">Fondazioni</a></td></tr>'+
    '</table><script>window.addEventListener("load",()=>setTimeout(()=>print(),200));</script></body></html>';
  const w=window.open('','_blank'); w.document.write(html); w.document.close();
}

let deferredPrompt; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault(); deferredPrompt=e; const b=$('#installBtn'); b.hidden=false; b.onclick=()=>{if(deferredPrompt){deferredPrompt.prompt(); deferredPrompt=null; b.hidden=true;}}});
if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js'); }
})();