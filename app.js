// app.js — v5 (multilingua + bracci + share + csv + pdf multiplo + salva JSON)
(function () {
  'use strict';

  // -------- util -------
  const $ = (s) => document.querySelector(s);
  const fmt = (x, unit = '') =>
    (x == null ? '-' : x.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'it-IT')) + (unit ? ' ' + unit : '');

  // -------- PDF paths -------
  const PDF = {
    withbase: './docs/scheda_con_pedana.pdf',
    baseless: './docs/scheda_senza_pedana_2022.pdf',
    manuale: './docs/manuale_tecnico_presentazione.pdf',
    fondazioni: './docs/fondazioni_cascos_c4c.pdf'
  };

  // -------- i18n -------
  const I18N = {
    it: {
      title: '🔧 CASCOS — Configuratore Sollevatori 2 Colonne',
      lang: 'Lingua',
      save: 'Salva',
      readme_btn: 'Leggimi',
      install: 'Installa',
      sec1: '1) Vincoli dell’officina',
      h: 'Altezza utile soffitto (mm)',
      w: 'Larghezza baia disponibile (mm)',
      conc: 'Qualità calcestruzzo',
      conc_hint: 'Per i modelli 3.2–5.5 t sono richiesti ancoraggi su calcestruzzo C20/25.',
      th: 'Spessore soletta (mm)',
      pow: 'Alimentazione disponibile',
      base: 'Tipo colonna',
      tip: 'Suggerimento: imposta <em>larghezza baia ≥ 3350 mm</em> per le serie C3.2–C4; per veicoli lunghi valuta le versioni XL / WAGON.',
      sec2: '2) Veicolo tipo da sollevare',
      gvw: 'Peso veicolo (kg)',
      wb: 'Passo (mm) / ingombro',
      use: 'Uso',
      duty: 'Frequenza cicli/h',
      calc: 'Calcola suggerimenti',
      reset: 'Reset',
      sec3: '3) Risultati e modelli consigliati',
      th_model: 'Modello',
      th_cap: 'Portata',
      th_inter: 'Interasse<br>(mm)',
      th_width: 'Larghezza tot.<br>(mm)',
      th_height: 'Altezza utile<br>sotto traversa (mm)',
      th_power: 'Alimentazione',
      th_anchor: 'Anc. / Spessore<br>soletta',
      th_arms: 'Bracci',
      th_notes: 'Note',
      offline: 'Puoi installarla e usarla offline.',
      withbase: 'Con basamento',
      baseless: 'Senza basamento',
      ok: '✓ Compatibile',
      warn_slab: 'Soletta < 170 mm: adeguare prima del montaggio',
      warn_weight: 'Veicolo > 3.5 t: considerare serie C5 / C5.5',
      share: 'Condividi',
      csv: 'CSV',
      pdfmulti: 'PDF multiplo'
    },
    en: {
      title: '🔧 CASCOS — 2-Post Lift Configurator',
      lang: 'Language',
      save: 'Save',
      readme_btn: 'Readme',
      install: 'Install',
      sec1: '1) Workshop constraints',
      h: 'Ceiling height (mm)',
      w: 'Bay width (mm)',
      conc: 'Concrete quality',
      conc_hint: 'For 3.2–5.5 t models use anchors on C20/25 concrete.',
      th: 'Slab thickness (mm)',
      pow: 'Power supply',
      base: 'Column type',
      tip: 'Tip: set <em>bay width ≥ 3350 mm</em> for C3.2–C4; for long wheelbase consider XL/WAGON versions.',
      sec2: '2) Vehicle to lift',
      gvw: 'Vehicle weight (kg)',
      wb: 'Wheelbase (mm) / length',
      use: 'Use',
      duty: 'Cycles/h',
      calc: 'Compute suggestions',
      reset: 'Reset',
      sec3: '3) Results & suggested models',
      th_model: 'Model',
      th_cap: 'Capacity',
      th_inter: 'Interaxis<br>(mm)',
      th_width: 'Total width<br>(mm)',
      th_height: 'Clear height<br>under crossbar (mm)',
      th_power: 'Power',
      th_anchor: 'Anchors / Slab',
      th_arms: 'Arms',
      th_notes: 'Notes',
      offline: 'You can install and use it offline.',
      withbase: 'With base',
      baseless: 'Baseless',
      ok: '✓ Compatible',
      warn_slab: 'Slab < 170 mm: upgrade before installation',
      warn_weight: 'Vehicle > 3.5 t: consider C5 / C5.5',
      share: 'Share',
      csv: 'CSV',
      pdfmulti: 'Multi PDF'
    },
    es: {
      title: '🔧 CASCOS — Configurador de elevadores 2 columnas',
      lang: 'Idioma',
      save: 'Guardar',
      readme_btn: 'Léeme',
      install: 'Instalar',
      sec1: '1) Restricciones del taller',
      h: 'Altura útil del techo (mm)',
      w: 'Ancho de bahía (mm)',
      conc: 'Calidad del hormigón',
      conc_hint: 'Para modelos 3.2–5.5 t usar anclajes en C20/25.',
      th: 'Espesor de losa (mm)',
      pow: 'Alimentación',
      base: 'Tipo de columna',
      tip: 'Sugerencia: fija <em>ancho ≥ 3350 mm</em> para C3.2–C4; para batalla larga considera XL/WAGON.',
      sec2: '2) Vehículo a elevar',
      gvw: 'Peso del vehículo (kg)',
      wb: 'Batalla / longitud (mm)',
      use: 'Uso',
      duty: 'Ciclos/h',
      calc: 'Calcular',
      reset: 'Restablecer',
      sec3: '3) Resultados y modelos sugeridos',
      th_model: 'Modelo',
      th_cap: 'Capacidad',
      th_inter: 'Intereje<br>(mm)',
      th_width: 'Ancho total<br>(mm)',
      th_height: 'Altura útil<br>bajo travesaño (mm)',
      th_power: 'Alimentación',
      th_anchor: 'Anclajes / Losa',
      th_arms: 'Brazos',
      th_notes: 'Notas',
      offline: 'Se puede instalar y usar sin conexión.',
      withbase: 'Con base',
      baseless: 'Sin base',
      ok: '✓ Compatible',
      warn_slab: 'Losa < 170 mm: reforzar antes de la instalación',
      warn_weight: 'Vehículo > 3.5 t: considerar C5 / C5.5',
      share: 'Compartir',
      csv: 'CSV',
      pdfmulti: 'PDF múltiple'
    },
    fr: {
      title: '🔧 CASCOS — Configurateur pont 2 colonnes',
      lang: 'Langue',
      save: 'Enregistrer',
      readme_btn: 'Lisez-moi',
      install: 'Installer',
      sec1: '1) Contraintes de l’atelier',
      h: 'Hauteur sous plafond (mm)',
      w: 'Largeur de baie (mm)',
      conc: 'Qualité du béton',
      conc_hint: 'Pour 3,2–5,5 t utiliser des ancrages sur béton C20/25.',
      th: 'Épaisseur de dalle (mm)',
      pow: 'Alimentation',
      base: 'Type de colonne',
      tip: 'Astuce : largeur de baie ≥ 3350 mm pour C3.2–C4 ; pour empattement long voir XL/WAGON.',
      sec2: '2) Véhicule à lever',
      gvw: 'Poids véhicule (kg)',
      wb: 'Empattement (mm) / longueur',
      use: 'Usage',
      duty: 'Cycles/h',
      calc: 'Calculer',
      reset: 'Réinitialiser',
      sec3: '3) Résultats & modèles suggérés',
      th_model: 'Modèle',
      th_cap: 'Capacité',
      th_inter: 'Entraxe<br>(mm)',
      th_width: 'Largeur totale<br>(mm)',
      th_height: 'Hauteur utile<br>sous traverse (mm)',
      th_power: 'Alimentation',
      th_anchor: 'Ancrages / Dalle',
      th_arms: 'Bras',
      th_notes: 'Remarques',
      offline: 'Peut être installée et utilisée hors-ligne.',
      withbase: 'Avec base',
      baseless: 'Sans base',
      ok: '✓ Compatible',
      warn_slab: 'Dalle < 170 mm : renforcer avant installation',
      warn_weight: 'Véhicule > 3,5 t : voir C5 / C5.5',
      share: 'Partager',
      csv: 'CSV',
      pdfmulti: 'PDF multiple'
    },
    pt: {
      title: '🔧 CASCOS — Configurador elevador 2 colunas',
      lang: 'Idioma',
      save: 'Salvar',
      readme_btn: 'Leia-me',
      install: 'Instalar',
      sec1: '1) Restrições da oficina',
      h: 'Altura do teto (mm)',
      w: 'Largura da baia (mm)',
      conc: 'Qualidade do concreto',
      conc_hint: 'Para modelos 3,2–5,5 t usar chumbadores em C20/25.',
      th: 'Espessura da laje (mm)',
      pow: 'Alimentação',
      base: 'Tipo de coluna',
      tip: 'Dica: defina <em>largura da baia ≥ 3350 mm</em> para C3.2–C4; para entre-eixos longo use XL/WAGON.',
      sec2: '2) Veículo a elevar',
      gvw: 'Peso do veículo (kg)',
      wb: 'Entre-eixos (mm) / comprimento',
      use: 'Uso',
      duty: 'Ciclos/h',
      calc: 'Calcular',
      reset: 'Limpar',
      sec3: '3) Resultados e modelos sugeridos',
      th_model: 'Modelo',
      th_cap: 'Capacidade',
      th_inter: 'Entre-eixos<br>(mm)',
      th_width: 'Largura total<br>(mm)',
      th_height: 'Altura útil<br>sob travessa (mm)',
      th_power: 'Alimentação',
      th_anchor: 'Chumbadores / Laje',
      th_arms: 'Braços',
      th_notes: 'Notas',
      offline: 'Pode ser instalada e usada offline.',
      withbase: 'Com base',
      baseless: 'Sem base',
      ok: '✓ Compatível',
      warn_slab: 'Laje < 170 mm: reforçar antes da instalação',
      warn_weight: 'Veículo > 3,5 t: considerar C5 / C5.5',
      share: 'Compartilhar',
      csv: 'CSV',
      pdfmulti: 'PDF múltiplo'
    }
  };

  const bindings = [
    ['t_title', 'title'], ['t_lang', 'lang'], ['t_save', 'save'], ['t_readme', 'readme_btn'], ['t_install', 'install'],
    ['t_sec1', 'sec1'], ['t_h', 'h'], ['t_w', 'w'], ['t_conc', 'conc'], ['t_conc_hint', 'conc_hint'], ['t_th', 'th'], ['t_pow', 'pow'], ['t_base', 'base'], ['t_tip', 'tip'],
    ['t_sec2', 'sec2'], ['t_gvw', 'gvw'], ['t_wb', 'wb'], ['t_use', 'use'], ['t_duty', 'duty'], ['t_calc', 'calc'], ['t_reset', 'reset'],
    ['t_sec3', 'sec3'], ['t_th_model', 'th_model'], ['t_th_cap', 'th_cap'], ['t_th_inter', 'th_inter'], ['t_th_width', 'th_width'], ['t_th_height', 'th_height'],
    ['t_th_power', 'th_power'], ['t_th_anchor', 'th_anchor'], ['t_th_arms', 'th_arms'], ['t_th_notes', 'th_notes'], ['t_offline', 'offline'],
    ['t_share', 'share'], ['t_csv', 'csv'], ['t_pdfmulti', 'pdfmulti']
  ];

  function applyLang(lang) {
    const L = I18N[lang] || I18N.it;
    bindings.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = L[key];
    });
    document.documentElement.lang = lang;
    render(makeFiltered().slice(0, 40));
  }
  $('#langSel')?.addEventListener('change', (e) => applyLang(e.target.value));

  // -------- dataset -------
  let MODELS = [];
  fetch('./models.json').then(r => r.json()).then(d => { MODELS = d; applyLang('it'); });

  // -------- logic -------
  const rows = $('#rows'), warnings = $('#warnings');

  function issuesFor(m, L) {
    const H = +($('#inpH').value || 0), W = +($('#inpW').value || 0), T = +($('#inpThickness').value || 0);
    const conc = $('#inpConcrete').value, pw = $('#inpPower').value;
    const arr = [];
    if (H && m.h_sotto_traversa && H < (m.h_sotto_traversa - 200)) arr.push({ t: (L === I18N.en ? 'Low ceiling' : 'Soffitto basso') + ` (< ${m.h_sotto_traversa - 200} mm)`, cls: 'warn' });
    if (W && m.larghezza && W < m.larghezza) arr.push({ t: (L === I18N.en ? 'Narrow bay' : 'Baia stretta') + ` (min ${m.larghezza} mm)`, cls: 'bad' });
    if (pw && !(m.power || []).includes(pw)) arr.push({ t: (L === I18N.en ? 'Power not supported' : 'Alimentazione non prevista') + ` (${pw})`, cls: 'warn' });
    if (T && T < (m.anchors?.thickness_min_mm || 170)) arr.push({ t: (I18N[document.documentElement.lang] || I18N.it).warn_slab, cls: 'bad' });
    if (conc && m.anchors && conc !== 'unknown' && conc !== m.anchors.concrete) arr.push({ t: `${m.anchors.concrete}`, cls: 'warn' });
    return arr;
  }

  function fitScore(m) {
    const gvw = +($('#inpGVW').value || 0), wb = +($('#inpWB').value || 0);
    let s = 0;
    if (gvw > 0) { const head = (m.portata - gvw) / m.portata; s += Math.max(-1, Math.min(1, head * 2)); }
    if (wb > 0) { const wantsLong = wb >= 3000; const long = /XL|WAGON/i.test(m.id) || m.interasse >= 3000; s += wantsLong ? (long ? 0.6 : -0.6) : (long ? -0.2 : 0.2); }
    return s;
  }

  function makeFiltered() {
    const gvw = +($('#inpGVW').value || 0), wantBase = $('#inpBase').value, pw = $('#inpPower').value;
    return [...MODELS]
      .filter(m => !wantBase || m.base === wantBase)
      .filter(m => !gvw || m.portata >= Math.max(1000, gvw * 1.25))
      .filter(m => !pw || (m.power || []).includes(pw))
      .sort((a, b) => fitScore(b) - fitScore(a));
  }

  function render(list) {
    const L = I18N[document.documentElement.lang] || I18N.it;
    rows.innerHTML = '';
    list.forEach(m => {
      const issues = issuesFor(m, L);
      const tr = document.createElement('tr');
      const isWithBase = m.base === 'withbase';
      const schedaUrl = isWithBase ? PDF.withbase : PDF.baseless;
      const arms = m.arms ? `${m.arms.type || ''} ${(m.arms.min_mm ?? '–')}–${(m.arms.max_mm ?? '–')} mm` : '–';
      const baseChip = `<div class="tag" style="margin-top:4px">${isWithBase ? L.withbase : L.baseless}</div>`;
      tr.innerHTML = `
        <td>
          <strong>${m.id}</strong>
          <div class="hint">ref. ${m.ref || '-'}</div>
          ${baseChip}
          <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
            <a class="btn" style="padding:2px 8px" href="${schedaUrl}" target="_blank" rel="noopener">📄 ${L.readme_btn==='Readme'?'Sheet':'Scheda'}</a>
            <a class="btn" style="padding:2px 8px" href="${PDF.manuale}" target="_blank" rel="noopener">📘 Manuale</a>
            <a class="btn" style="padding:2px 8px" href="${PDF.fondazioni}" target="_blank" rel="noopener">🏗️ Fondazioni</a>
          </div>
        </td>
        <td>${fmt(m.portata, 'kg')}</td>
        <td>${fmt(m.interasse, 'mm')}</td>
        <td>${fmt(m.larghezza, 'mm')}</td>
        <td>${fmt(m.h_sotto_traversa, 'mm')}</td>
        <td>${(m.power || []).join(', ') || '-'}</td>
        <td>${m.anchors ? `${m.anchors.qty}× ${m.anchors.type}<br>${m.anchors.concrete}, ≥ ${m.anchors.thickness_min_mm} mm` : '-'}</td>
        <td>${arms}</td>
        <td>${issues.map(i => `<span class="tag ${i.cls}">${i.t}</span>`).join(' ') || `<span class="ok">${L.ok}</span>`}</td>
        <td><input type="checkbox" class="pick" data-id="${m.id}" onclick="event.stopPropagation()"></td>`;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openSheet(m, L));
      rows.appendChild(tr);
    });
  }

  // -------- actions -------
  function selectedIds() { return Array.from(document.querySelectorAll('.pick:checked')).map(i => i.dataset.id); }
  function buildQuery(extras) {
    const p = new URLSearchParams(); const set = (k, v) => { if (v != null && v !== '') p.set(k, v); };
    set('H', $('#inpH').value); set('W', $('#inpW').value); set('T', $('#inpThickness').value);
    set('C', $('#inpConcrete').value); set('P', $('#inpPower').value); set('B', $('#inpBase').value);
    set('GVW', $('#inpGVW').value); set('WB', $('#inpWB').value);
    if (extras) Object.keys(extras).forEach(k => set(k, extras[k]));
    return p.toString();
  }

  // Share
  $('#shareBtn')?.addEventListener('click', () => {
    const url = location.origin + location.pathname + '?' + buildQuery({ ids: selectedIds().join(',') });
    if (navigator.share) { navigator.share({ title: 'CASCOS Config', url }); }
    else { navigator.clipboard.writeText(url); alert('Link copiato:\n' + url); }
  });

  // CSV
  function toCSV(list) {
    const head = ['Model', 'Ref', 'Capacity(kg)', 'Interaxis(mm)', 'Width(mm)', 'Clear height(mm)', 'Power', 'Anchors', 'Arms', 'Type'];
    const lines = [head.join(';')];
    list.forEach(m => {
      const anc = m.anchors ? `${m.anchors.qty}x ${m.anchors.type} ${m.anchors.concrete} ≥${m.anchors.thickness_min_mm}mm` : '';
      const arms = m.arms ? `${m.arms.type || ''} ${(m.arms.min_mm ?? '')}-${(m.arms.max_mm ?? '')}` : '';
      lines.push([m.id, m.ref || '', m.portata || '', m.interasse || '', m.larghezza || '', m.h_sotto_traversa || '', (m.power || []).join(','), anc, arms, (m.base || '')].join(';'));
    });
    return lines.join('\n');
  }
  $('#csvBtn')?.addEventListener('click', () => {
    const ids = selectedIds();
    const list = ids.length ? MODELS.filter(m => ids.includes(m.id)) : makeFiltered().slice(0, 40);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(list)], { type: 'text/csv' })); a.download = 'cascos_modelli.csv'; a.click();
  });

  // PDF multiplo (apre una scheda per ogni modello selezionato; se nessuna selezione, usa i primi consigliati)
  $('#pdfMultiBtn')?.addEventListener('click', () => {
    const ids = selectedIds();
    const list = ids.length ? MODELS.filter(m => ids.includes(m.id)) : makeFiltered().slice(0, 10);
    const L = I18N[document.documentElement.lang] || I18N.it;
    list.forEach((m, i) => setTimeout(() => openSheet(m, L, true), i * 200)); // scagliono per evitare blocchi popup
  });

  // Salva configurazione (JSON degli input)
  $('#saveBtn')?.addEventListener('click', () => {
    const payload = {
      timestamp: new Date().toISOString(),
      lang: document.documentElement.lang,
      inputs: {
        altezza_mm: +($('#inpH').value || 0) || null,
        larghezza_mm: +($('#inpW').value || 0) || null,
        calcestruzzo: $('#inpConcrete').value,
        soletta_mm: +($('#inpThickness').value || 0) || null,
        alimentazione: $('#inpPower').value,
        tipo_colonna: $('#inpBase').value,
        peso_veicolo: +($('#inpGVW').value || 0) || null,
        passo_mm: +($('#inpWB').value || 0) || null,
        uso: $('#inpUse')?.value,
        cicli_ora: +($('#inpDuty')?.value || 0) || null
      },
      selected_ids: selectedIds()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cascos_configurazione.json'; a.click();
  });

  // Scheda singola / stampa
  function openSheet(m, L, silent = false) {
    const css = `body{font:13px system-ui,Segoe UI,Roboto,Arial;margin:22px}
h1{font-size:18px;margin:0 0 8px 0}
table{width:100%;border-collapse:collapse;margin-top:6px}
td,th{border:1px solid #ccc;padding:6px;text-align:left}`;
    const arms = m.arms ? `${m.arms.type || ''} ${(m.arms.min_mm ?? '–')}–${(m.arms.max_mm ?? '–')} mm` : '–';
    const schedaUrl = (m.base === 'withbase') ? PDF.withbase : PDF.baseless;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${m.id} — CASCOS</title><style>${css}</style></head><body>
<h1>${m.id} — CASCOS</h1>
<table>
<tr><th>${L.th_cap || 'Portata'}</th><td>${m.portata || '-'} kg</td></tr>
<tr><th>Interasse</th><td>${m.interasse || '-'} mm</td></tr>
<tr><th>Larghezza</th><td>${m.larghezza || '-'} mm</td></tr>
<tr><th>Altezza utile</th><td>${m.h_sotto_traversa || '-'} mm</td></tr>
<tr><th>${L.th_arms || 'Bracci'}</th><td>${arms}</td></tr>
<tr><th>${L.th_power || 'Alimentazione'}</th><td>${(m.power || []).join(', ') || '-'}</td></tr>
<tr><th>${(L.th_anchor || 'Ancoraggi').replace('<br>',' ')}</th><td>${m.anchors ? (m.anchors.qty + '× ' + m.anchors.type + ' — ' + m.anchors.concrete + ', ≥ ' + m.anchors.thickness_min_mm + ' mm') : '-'}</td></tr>
<tr><th>Tipo</th><td>${m.base === 'withbase' ? (L.withbase || 'Con basamento') : (L.baseless || 'Senza basamento')}</td></tr>
<tr><th>Documentazione</th><td>
<a href="${schedaUrl}" target="_blank">${L.readme_btn === 'Readme' ? 'Sheet' : 'Scheda ufficiale'}</a> ·
<a href="${PDF.manuale}" target="_blank">Manuale</a> ·
<a href="${PDF.fondazioni}" target="_blank">Fondazioni</a>
</td></tr>
</table>
<script>window.addEventListener('load',()=>{ ${silent ? '' : 'setTimeout(()=>print(),200);'} });</script>
</body></html>`;
    const w = window.open('', '_blank'); w.document.write(html); w.document.close();
  }

  // -------- events -------
  function calculate() {
    const L = I18N[document.documentElement.lang] || I18N.it;
    warnings.innerHTML = '';
    const lst = [];
    if ((+($('#inpThickness').value || 0)) < 170) lst.push({ t: L.warn_slab, cls: 'bad' });
    if ((+($('#inpGVW').value || 0)) > 3500) lst.push({ t: L.warn_weight, cls: 'warn' });
    lst.forEach(w => { const s = document.createElement('span'); s.className = `tag ${w.cls}`; s.textContent = w.t; warnings.appendChild(s); });
    render(makeFiltered().slice(0, 40));
  }
  $('#calcBtn')?.addEventListener('click', calculate);
  $('#resetBtn')?.addEventListener('click', () => { document.querySelectorAll('input').forEach(i => i.value = ''); calculate(); });

  // -------- PWA install + SW -------
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; const b = $('#installBtn'); if (b) { b.hidden = false; b.onclick = () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; b.hidden = true; } }; }
  });
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }

})();
