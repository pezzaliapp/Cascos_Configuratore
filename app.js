// app.js — Cascos_Configuratore
(function(){
  'use strict';

  // Dataset minimo (estendibile): modelli principali 2 colonne
  // Valori indicativi tratti da documentazione PDF; integrare nel tempo ogni variante con bracci min/max.
  const MODELS = [
    { id:"C3.2", ref:"13120E", portata:3200, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C3.2 Comfort", ref:"13120C", portata:3200, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~","230/1~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C3.5", ref:"13168", portata:3500, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C3.5XL", ref:"13168-4", portata:3500, interasse:3000, larghezza:3340, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C4", ref:"13194", portata:4000, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C4XL", ref:"13194-4", portata:4000, interasse:3000, larghezza:3340, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C5", ref:"13176", portata:5000, interasse:2810, larghezza:3590, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:16, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C5 WAGON", ref:"13176-W", portata:5000, interasse:3130, larghezza:3590, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:16, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C5.5", ref:"13998", portata:5500, interasse:2810, larghezza:3590, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:16, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C5.5 WAGON", ref:"13988", portata:5500, interasse:2810, larghezza:3590, h_sotto_traversa:4248, base:"withbase", power:["400/3~","230/3~"], anchors:{qty:16, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    // Serie S (senza basamento)
    { id:"C3.2S", ref:"13120SE", portata:3200, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"baseless", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C3.5S", ref:"13169",   portata:3500, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"baseless", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C4S",   ref:"13194S",  portata:4000, interasse:2700, larghezza:3350, h_sotto_traversa:4248, base:"baseless", power:["400/3~","230/3~"], anchors:{qty:12, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
    { id:"C5.5S", ref:"13998S",  portata:5500, interasse:2810, larghezza:3590, h_sotto_traversa:4248, base:"baseless", power:["400/3~","230/3~"], anchors:{qty:16, type:"M16x145", concrete:"C20/25", thickness_min_mm:170} },
  ];

  const $ = sel=>document.querySelector(sel);
  const rows = $('#rows');
  const warnings = $('#warnings');

  const fmt = (x, unit='') => (x==null?'-':x.toLocaleString('it-IT')) + (unit?(' '+unit):'');

  function checkConstraints(m){
    const H = +$('#inpH').value || 0;
    const W = +$('#inpW').value || 0;
    const T = +($('#inpThickness').value||0);
    const conc = $('#inpConcrete').value;
    const pw = $('#inpPower').value;

    const issues = [];
    if (H && m.h_sotto_traversa && H < (m.h_sotto_traversa - 200)) issues.push({t:`Soffitto basso (< ${m.h_sotto_traversa-200} mm)`, cls:'warn'});
    if (W && m.larghezza && W < m.larghezza) issues.push({t:`Baia stretta (min ${m.larghezza} mm)`, cls:'bad'});
    if (pw && !m.power.includes(pw)) issues.push({t:`Alimentazione non prevista (${pw})`, cls:'warn'});
    if (T && T < (m.anchors?.thickness_min_mm||170)) issues.push({t:`Soletta insufficiente (≥ ${m.anchors.thickness_min_mm} mm)`, cls:'bad'});
    if (conc && m.anchors && conc!=="unknown" && conc!==m.anchors.concrete) issues.push({t:`Calcestruzzo consigliato ${m.anchors.concrete}`, cls:'warn'});
    return issues;
  }

  function vehicleFitScore(m){
    const gvw = +$('#inpGVW').value || 0;
    const wb  = +$('#inpWB').value || 0;
    let score = 0;
    if (gvw>0){
      const headroom = (m.portata - gvw)/m.portata;
      score += Math.max(-1, Math.min(1, headroom*2));
    }
    if (wb>0){
      const wantsLong = wb>=3000;
      const longModel = /XL|WAGON/i.test(m.id) || m.interasse>=3000;
      score += (wantsLong? (longModel?0.6:-0.6) : (longModel? -0.2:0.2));
    }
    const H = +$('#inpH').value || 0;
    if (H && H<4200 && m.base==='withbase') score += 0.1;
    return score;
  }

  function render(models){
    rows.innerHTML = '';
    models.forEach(m=>{
      const issues = checkConstraints(m);
      const tr = document.createElement('tr');
      const tdModel = `<strong>${m.id}</strong>
        <div class="hint">rif. ${m.ref||'-'}</div>
        <div class="tag" style="margin-top:4px">${m.base==='withbase'?'Con basamento':'Senza basamento'}</div>`;
      tr.innerHTML = `
        <td>${tdModel}</td>
        <td>${fmt(m.portata,'kg')}</td>
        <td>${fmt(m.interasse,'mm')}</td>
        <td>${fmt(m.larghezza,'mm')}</td>
        <td>${fmt(m.h_sotto_traversa,'mm')}</td>
        <td>${(m.power||[]).join(', ')||'-'}</td>
        <td>${m.anchors? `${m.anchors.qty}× ${m.anchors.type}<br>${m.anchors.concrete}, ≥ ${m.anchors.thickness_min_mm} mm` : '-'}</td>
        <td>${issues.map(i=>`<span class="tag ${i.cls}">${i.t}</span>`).join(' ')||'<span class="ok">✓ Compatibile</span>'}</td>`;
      rows.appendChild(tr);
    });
  }

  function calculate(){
    const gvw = +$('#inpGVW').value || 0;
    const wantBase = $('#inpBase').value;
    const pw = $('#inpPower').value;

    const filtered = [...MODELS]
      .filter(m => !wantBase || m.base === wantBase)
      .filter(m => !gvw || m.portata >= Math.max(1000, gvw * 1.25)) // 25% margine
      .filter(m => !pw || (m.power || []).includes(pw))
      .sort((a,b)=> vehicleFitScore(b)-vehicleFitScore(a));

    warnings.innerHTML='';
    const list = [];
    if ((+$('#inpThickness').value||0) < 170) list.push({t:'Soletta < 170 mm: adeguare prima del montaggio',cls:'bad'});
    if ((+$('#inpGVW').value||0) > 3500) list.push({t:'Veicolo > 3.5 t: considerare serie C5 / C5.5',cls:'warn'});
    list.forEach(w=>{
      const s = document.createElement('span');
      s.className = `tag ${w.cls}`; s.textContent = w.t; warnings.appendChild(s);
    });

    render(filtered.slice(0, 12));
  }

  $('#calcBtn').addEventListener('click', calculate);
  $('#resetBtn').addEventListener('click', ()=>{ document.querySelectorAll('input').forEach(i=>i.value=''); calculate(); });

  $('#saveBtn').addEventListener('click', ()=>{
    const payload = {
      timestamp: new Date().toISOString(),
      inputs: {
        altezza_mm: +$('#inpH').value||null,
        larghezza_mm: +$('#inpW').value||null,
        calcestruzzo: $('#inpConcrete').value,
        soletta_mm: +$('#inpThickness').value||null,
        alimentazione: $('#inpPower').value,
        tipo_colonna: $('#inpBase').value,
        peso_veicolo: +$('#inpGVW').value||null,
        passo_mm: +$('#inpWB').value||null,
        uso: $('#inpUse').value,
        cicli_ora: +$('#inpDuty').value
      }
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cascos_configurazione.json';
    a.click();
  });

  // PWA install flow
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installBtn');
    btn.hidden = false;
    btn.onclick = async ()=>{ if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt=null; btn.hidden=true; } };
  });
  if ('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js'); }

  // initial
  render(MODELS.slice(0,6));
})();
