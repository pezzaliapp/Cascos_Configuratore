// app.js — v6.3 (Vehicle filter + auto-fill + per-model PDFs "Misure bracci" + page map + i18n + share/csv/pdf/save + PWA)
(function () {
  'use strict';

  // ------------------ helpers ------------------
  const $ = (s) => document.querySelector(s);
  const fmt = (x, unit = '') =>
    (x == null ? '-' : x.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'it-IT')) +
    (unit ? ' ' + unit : '');

  // ------------------ PDF paths ------------------
  const PDF = {
    // Globali (fallback)
    withbase: './docs/scheda_con_pedana.pdf',
    baseless: './docs/scheda_senza_pedana_2022.pdf',
    manuale: './docs/manuale_tecnico_presentazione.pdf',
    fondazioni: './docs/fondazioni_cascos_c4c.pdf'
  };

  // 📐 PDF “Misure bracci” per singolo modello (metti i file in ./docs/misure/)
  // Se un modello manca qui, l’app usa il manuale in fallback.
  const ARMS_FILES = {
    // Con basamento / pedana
    "C3.2": "./docs/misure/misure_C3_2.pdf",
    "C3.2 Comfort": "./docs/misure/misure_C3_2_Comfort.pdf",
    "C3.5": "./docs/misure/misure_C3_5.pdf",
    "C3.5XL": "./docs/misure/misure_C3_5XL.pdf",         // TODO: aggiungere file
    "C4": "./docs/misure/misure_C4.pdf",                 // TODO: aggiungere file
    "C4XL": "./docs/misure/misure_C4XL.pdf",             // TODO: aggiungere file
    "C5": "./docs/misure/misure_C5.pdf",                 // TODO: aggiungere file
    "C5.5": "./docs/misure/misure_C5_5.pdf",             // TODO: aggiungere file
    "C5 WAGON": "./docs/misure/misure_C5_WAGON.pdf",     // TODO: aggiungere file
    "C5.5 WAGON": "./docs/misure/misure_C5_5_WAGON.pdf", // TODO: aggiungere file
    // Senza basamento / sbalzo libero
    "C3.2S": "./docs/misure/misure_C3_2S.pdf",           // TODO: aggiungere file
    "C3.5S": "./docs/misure/misure_C3_5S.pdf",           // TODO: aggiungere file
    "C4S": "./docs/misure/misure_C4S.pdf",               // TODO: aggiungere file
    "C5.5S": "./docs/misure/misure_C5_5S.pdf"            // TODO: aggiungere file
  };

  // 📖 Pagine nel Manuale per le tavole “bracci” (fallback se non c’è il PDF singolo).
  // Certe: C3.2 = 7, C3.2 Comfort = 13, C3.5 = 19. Le altre rimangono a ricerca (#search).
  const ARMS_PAGES = {
    "C3.2": 7,
    "C3.2 Comfort": 13,
    "C3.5": 19,
    "C3.5XL": null,
    "C4": null,
    "C4XL": null,
    "C5": null,
    "C5.5": null,
    "C5 WAGON": null,
    "C5.5 WAGON": null,
    "C3.2S": null,
    "C3.5S": null,
    "C4S": null,
    "C5.5S": null
  };

  // 🔗 Scheda “modello → PDF singolo” (schede commerciali) — opzionale; manteniamo i PDF consolidati come fallback
  const SHEET_FILES = {
    withbase: {
      "C3.2": "./docs/scheda_C3.2_con_pedana.pdf",
      "C3.5": "./docs/scheda_C3.5_con_pedana.pdf",
      "C4": "./docs/scheda_C4_con_pedana.pdf",
      "C4XL": "./docs/scheda_C4XL_con_pedana.pdf",
      "C5": "./docs/scheda_C5_con_pedana.pdf",
      "C5.5": "./docs/scheda_C5.5_con_pedana.pdf",
      "C5 WAGON": "./docs/scheda_C5_WAGON_con_pedana.pdf"
    },
    baseless: {
      "C3.2S": "./docs/scheda_C3.2S_senza_pedana.pdf",
      "C3.5S": "./docs/scheda_C3.5S_senza_pedana.pdf",
      "C4S": "./docs/scheda_C4S_senza_pedana.pdf",
      "C5.5S": "./docs/scheda_C5.5S_senza_pedana.pdf"
    }
  };

  // 📖 Mappa “modello → pagina” nel Manuale (fallback per Scheda commerciale)
  const MANUAL_PAGES = {
    "C3.2": 5, "C3.5": 12, "C4": 16, "C4XL": 18, "C5": 20, "C5.5": 22, "C5 WAGON": 25,
    "C3.2S": 32, "C3.5S": 36, "C4S": 40, "C5.5S": 44
  };

  // ------------------ helpers URL ------------------
  function buildSheetUrl(modelId, baseKind /* 'withbase' | 'baseless' */) {
    const file = SHEET_FILES[baseKind] && SHEET_FILES[baseKind][modelId];
    if (file) return file;
    const pdf = baseKind === 'withbase' ? PDF.withbase : PDF.baseless;
    return `${pdf}#search=${encodeURIComponent(modelId)}`;
  }
  function buildManualUrl(modelId) {
    const p = MANUAL_PAGES[modelId];
    return p ? `${PDF.manuale}#page=${p}` : `${PDF.manuale}#search=${encodeURIComponent(modelId)}`;
  }
  function buildArmsUrl(modelId) {
    const file = ARMS_FILES[modelId];
    if (file) return file;
    const p = ARMS_PAGES[modelId];
    return p ? `${PDF.manuale}#page=${p}` : `${PDF.manuale}#search=${encodeURIComponent(modelId)}`;
  }

  // ------------------ i18n ------------------
  const I18N = {
    it: {
      title: '🔧 CASCOS — Configuratore Sollevatori 2 Colonne',
      lang: 'Lingua', save: 'Salva', readme_btn: 'Leggimi', install: 'Installa',
      sec1: '1) Vincoli dell’officina',
      h: 'Altezza utile soffitto (mm)', w: 'Larghezza baia disponibile (mm)',
      conc: 'Qualità calcestruzzo', conc_hint: 'Per i modelli 3.2–5.5 t sono richiesti ancoraggi su calcestruzzo C20/25.',
      th: 'Spessore soletta (mm)', pow: 'Alimentazione disponibile', base: 'Tipo colonna',
      tip: 'Suggerimento: imposta <em>larghezza baia ≥ 3350 mm</em> per le serie C3.2–C4; per veicoli lunghi valuta le versioni XL / WAGON.',
      secVeh: 'Tipo di veicolo',
      sec2: '2) Veicolo tipo da sollevare', gvw: 'Peso veicolo (kg)', wb: 'Passo (mm) / ingombro',
      use: 'Uso', duty: 'Frequenza cicli/h', calc: 'Calcola suggerimenti', reset: 'Reset',
      sec3: '3) Risultati e modelli consigliati',
      th_model: 'Modello', th_cap: 'Portata', th_inter: 'Interasse<br>(mm)', th_width: 'Larghezza tot.<br>(mm)',
      th_height: 'Altezza utile<br>sotto traversa (mm)', th_power: 'Alimentazione',
      th_anchor: 'Anc. / Spessore<br>soletta', th_arms: 'Bracci', th_notes: 'Note',
      offline: 'Puoi installarla e usarla offline.',
      withbase: 'Con basamento', baseless: 'Senza basamento',
      ok: '✓ Compatibile', warn_slab: 'Soletta < 170 mm: adeguare prima del montaggio', warn_weight: 'Veicolo > 3.5 t: considerare serie C5 / C5.5',
      share: 'Condividi', csv: 'CSV', pdfmulti: 'PDF multiplo',
      arms_btn: '📐 Misure bracci', sheet_btn: '📄 Scheda', manual_btn: '📘 Manuale', fond_btn: '🏗️ Fondazioni'
    },
    en: {
      title: '🔧 CASCOS — 2-Post Lift Configurator',
      lang: 'Language', save: 'Save', readme_btn: 'Readme', install: 'Install',
      sec1: '1) Workshop constraints',
      h: 'Ceiling height (mm)', w: 'Bay width (mm)',
      conc: 'Concrete quality', conc_hint: 'For 3.2–5.5 t models use anchors on C20/25 concrete.',
      th: 'Slab thickness (mm)', pow: 'Power supply', base: 'Column type',
      tip: 'Tip: set <em>bay width ≥ 3350 mm</em> for C3.2–C4; for long wheelbase consider XL/WAGON.',
      secVeh: 'Vehicle type',
      sec2: '2) Vehicle to lift', gvw: 'Vehicle weight (kg)', wb: 'Wheelbase (mm) / length',
      use: 'Use', duty: 'Cycles/h', calc: 'Compute suggestions', reset: 'Reset',
      sec3: '3) Results & suggested models',
      th_model: 'Model', th_cap: 'Capacity', th_inter: 'Interaxis<br>(mm)', th_width: 'Total width<br>(mm)',
      th_height: 'Clear height<br>under crossbar (mm)', th_power: 'Power',
      th_anchor: 'Anchors / Slab', th_arms: 'Arms', th_notes: 'Notes',
      offline: 'You can install and use it offline.',
      withbase: 'With base', baseless: 'Baseless',
      ok: '✓ Compatible', warn_slab: 'Slab < 170 mm: upgrade before installation', warn_weight: 'Vehicle > 3.5 t: consider C5 / C5.5',
      share: 'Share', csv: 'CSV', pdfmulti: 'Multi PDF',
      arms_btn: '📐 Arms sizes', sheet_btn: '📄 Sheet', manual_btn: '📘 Manual', fond_btn: '🏗️ Foundations'
    },
    es: {
      title: '🔧 CASCOS — Configurador de elevadores 2 columnas',
      lang: 'Idioma', save: 'Guardar', readme_btn: 'Léeme', install: 'Instalar',
      sec1: '1) Restricciones del taller',
      h: 'Altura útil del techo (mm)', w: 'Ancho de bahía (mm)',
      conc: 'Calidad del hormigón', conc_hint: 'Para modelos 3.2–5.5 t usar anclajes en C20/25.',
      th: 'Espesor de losa (mm)', pow: 'Alimentación', base: 'Tipo de columna',
      tip: 'Sugerencia: ancho ≥ 3350 mm para C3.2–C4; para batalla larga considera XL/WAGON.',
      secVeh: 'Tipo de vehículo',
      sec2: '2) Vehículo a elevar', gvw: 'Peso del vehículo (kg)', wb: 'Batalla / longitud (mm)',
      use: 'Uso', duty: 'Ciclos/h', calc: 'Calcular', reset: 'Restablecer',
      sec3: '3) Resultados y modelos sugeridos',
      th_model: 'Modelo', th_cap: 'Capacidad', th_inter: 'Intereje<br>(mm)', th_width: 'Ancho total<br>(mm)',
      th_height: 'Altura útil<br>bajo travesaño (mm)', th_power: 'Alimentación',
      th_anchor: 'Anclajes / Losa', th_arms: 'Brazos', th_notes: 'Notas',
      offline: 'Se puede instalar y usar sin conexión.',
      withbase: 'Con base', baseless: 'Sin base',
      ok: '✓ Compatible', warn_slab: 'Losa < 170 mm: reforzar antes de la instalación', warn_weight: 'Vehículo > 3.5 t: considerar C5 / C5.5',
      share: 'Compartir', csv: 'CSV', pdfmulti: 'PDF múltiple',
      arms_btn: '📐 Medidas brazos', sheet_btn: '📄 Ficha', manual_btn: '📘 Manual', fond_btn: '🏗️ Cimientos'
    },
    fr: {
      title: '🔧 CASCOS — Configurateur pont 2 colonnes',
      lang: 'Langue', save: 'Enregistrer', readme_btn: 'Lisez-moi', install: 'Installer',
      sec1: '1) Contraintes de l’atelier',
      h: 'Hauteur sous plafond (mm)', w: 'Largeur de baie (mm)',
      conc: 'Qualité du béton', conc_hint: 'Pour 3,2–5,5 t utiliser des ancrages sur béton C20/25.',
      th: 'Épaisseur de dalle (mm)', pow: 'Alimentation', base: 'Type de colonne',
      tip: 'Astuce : largeur de baie ≥ 3350 mm pour C3.2–C4 ; pour empattement long voir XL/WAGON.',
      secVeh: 'Type de véhicule',
      sec2: '2) Véhicule à lever', gvw: 'Poids véhicule (kg)', wb: 'Empattement (mm) / longueur',
      use: 'Usage', duty: 'Cycles/h', calc: 'Calculer', reset: 'Réinitialiser',
      sec3: '3) Résultats & modèles suggérés',
      th_model: 'Modèle', th_cap: 'Capacité', th_inter: 'Entraxe<br>(mm)', th_width: 'Largeur totale<br>(mm)',
      th_height: 'Hauteur utile<br>sous traverse (mm)', th_power: 'Alimentation',
      th_anchor: 'Ancrages / Dalle', th_arms: 'Bras', th_notes: 'Remarques',
      offline: 'Peut être installée et utilisée hors-ligne.',
      withbase: 'Avec base', baseless: 'Sans base',
      ok: '✓ Compatible', warn_slab: 'Dalle < 170 mm : renforcer avant installation', warn_weight: 'Véhicule > 3,5 t : voir C5 / C5.5',
      share: 'Partager', csv: 'CSV', pdfmulti: 'PDF multiple',
      arms_btn: '📐 Bras (cotes)', sheet_btn: '📄 Fiche', manual_btn: '📘 Manuel', fond_btn: '🏗️ Fondations'
    },
    pt: {
      title: '🔧 CASCOS — Configurador elevador 2 colunas',
      lang: 'Idioma', save: 'Salvar', readme_btn: 'Leia-me', install: 'Instalar',
      sec1: '1) Restrições da oficina',
      h: 'Altura do teto (mm)', w: 'Largura da baia (mm)',
      conc: 'Qualidade do concreto', conc_hint: 'Para 3,2–5,5 t usar chumbadores em C20/25.',
      th: 'Espessura da laje (mm)', pow: 'Alimentação', base: 'Tipo de coluna',
      tip: 'Dica: largura da baia ≥ 3350 mm para C3.2–C4; para entre-eixos longo use XL/WAGON.',
      secVeh: 'Tipo de veículo',
      sec2: '2) Veículo a elevar', gvw: 'Peso do veículo (kg)', wb: 'Entre-eixos (mm) / comprimento',
      use: 'Uso', duty: 'Ciclos/h', calc: 'Calcular', reset: 'Limpar',
      sec3: '3) Resultados e modelos sugeridos',
      th_model: 'Modelo', th_cap: 'Capacidade', th_inter: 'Entre-eixos<br>(mm)', th_width: 'Largura total<br>(mm)',
      th_height: 'Altura útil<br>sob travessa (mm)', th_power: 'Alimentação',
      th_anchor: 'Chumbadores / Laje', th_arms: 'Braços', th_notes: 'Notas',
      offline: 'Pode ser instalada e usada offline.',
      withbase: 'Com base', baseless: 'Sem base',
      ok: '✓ Compatível', warn_slab: 'Laje < 170 mm: reforçar antes da instalação', warn_weight: 'Veículo > 3,5 t: considerar C5 / C5.5',
      share: 'Compartilhar', csv: 'CSV', pdfmulti: 'PDF múltiplo',
      arms_btn: '📐 Medidas braços', sheet_btn: '📄 Ficha', manual_btn: '📘 Manual', fond_btn: '🏗️ Fundação'
    }
  };

  const bindings = [
    ['t_title', 'title'], ['t_lang', 'lang'], ['t_save', 'save'], ['t_readme', 'readme_btn'], ['t_install', 'install'],
    ['t_sec1', 'sec1'], ['t_h', 'h'], ['t_w', 'w'], ['t_conc', 'conc'], ['t_conc_hint', 'conc_hint'], ['t_th', 'th'], ['t_pow', 'pow'], ['t_base', 'base'], ['t_tip', 'tip'],
    ['t_sec2', 'sec2'], ['t_gvw', 'gvw'], ['t_wb', 'wb'], ['t_use', 'use'], ['t_duty', 'duty'], ['t_calc', 'calc'], ['t_reset', 'reset'],
    ['t_sec3', 'sec3'], ['t_th_model', 'th_model'], ['t_th_cap', 'th_cap'], ['t_th_inter', 'th_inter'], ['t_th_width', 'th_width'], ['t_th_height', 'th_height'],
    ['t_th_power', 'th_power'], ['t_th_anchor', 'th_anchor'], ['t_th_arms', 'th_arms'], ['t_th_notes', 'th_notes'],
    ['t_share', 'share'], ['t_csv', 'csv'], ['t_pdfmulti', 'pdfmulti']
  ];

  function applyLang(lang) {
    const L = I18N[lang] || I18N.it;
    bindings.forEach(([id, key]) => { const el = document.getElementById(id); if (el) el.innerHTML = L[key]; });
    // popola il selettore veicoli
    const vSel = $('#vehicleSel');
    if (vSel) {
      const cur = vSel.value || 'any';
      vSel.innerHTML = '';
      Object.entries(VEHICLE_TYPES).forEach(([k, labels]) => {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = labels[lang] || labels.it;
        vSel.appendChild(opt);
      });
      vSel.value = cur;
    }
    document.documentElement.lang = lang;
    render(makeFiltered().slice(0, 40));
  }
  $('#langSel')?.addEventListener('change', (e) => applyLang(e.target.value));

  // ------------------ dataset ------------------
  let MODELS = [];
  fetch('./models.json').then(r => r.json()).then(d => { MODELS = d; initVehicleFilter(); applyLang('it'); });

  // ------------------ Vehicle types + defaults + compat ------------------
  const VEHICLE_TYPES = {
    any:{ it:'Qualsiasi', en:'Any', es:'Cualquiera', fr:'Toutes', pt:'Qualquer' },
    city:{ it:'City / Utilitaria', en:'City / Small', es:'Ciudad / utilitario', fr:'Citadine', pt:'Citadino' },
    sedan:{ it:'Berlina / Crossover', en:'Sedan / Crossover', es:'Berlina / Crossover', fr:'Berline / Crossover', pt:'Sedan / Crossover' },
    suv:{ it:'SUV / Pickup', en:'SUV / Pickup', es:'SUV / Pickup', fr:'SUV / Pickup', pt:'SUV / Pickup' },
    mpv:{ it:'MPV / Monovolume', en:'MPV / Minivan', es:'Monovolumen', fr:'Monospace', pt:'Minivan' },
    van:{ it:'Van / Furgoni', en:'Van / LCV', es:'Furgón', fr:'Fourgon', pt:'Furgão' },
    lcv:{ it:'Veicoli lunghi / WAGON', en:'Long vehicles / WAGON', es:'Vehículos largos / WAGON', fr:'Véhicules longs / WAGON', pt:'Veículos longos / WAGON' }
  };

  const VEHICLE_DEFAULTS = {
    any:null,
    city:{kg:1200, wb:2400, use:'auto', duty:6},
    sedan:{kg:1650, wb:2700, use:'auto', duty:6},
    suv:{kg:2300, wb:2900, use:'auto', duty:6},
    mpv:{kg:2000, wb:2800, use:'mpv',  duty:6},
    van:{kg:2800, wb:3100, use:'van',  duty:10},
    lcv:{kg:3200, wb:3300, use:'auto', duty:10}
  };

  const VEHICLE_COMPAT = {
    city:['C3.2','C3.2 Comfort','C3.5','C3.2S','C3.5S','C4','C4S'],
    sedan:['C3.2','C3.2 Comfort','C3.5','C3.2S','C3.5S','C4','C4S','C4XL'],
    suv:['C3.5','C4','C4XL','C5','C5.5','C5.5S'],
    mpv:['C3.5','C4','C4XL'],
    van:['C4XL','C5','C5.5','C5 WAGON'],
    lcv:['C5','C5.5','C5 WAGON']
  };

  function initVehicleFilter() {
    const vSel = $('#vehicleSel');
    if (!vSel) return;
    const lang = document.documentElement.lang || 'it';
    vSel.innerHTML = '';
    Object.entries(VEHICLE_TYPES).forEach(([k, labels]) => {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = labels[lang] || labels.it;
      vSel.appendChild(opt);
    });
    vSel.value = 'any';

    // Auto-compila i campi quando cambi tipo veicolo
    vSel.addEventListener('change', () => {
      const d = VEHICLE_DEFAULTS[vSel.value];
      if (d) {
        $('#inpGVW').value = d.kg;
        $('#inpWB').value = d.wb;
        if ($('#inpUse')) $('#inpUse').value = d.use;
        if ($('#inpDuty')) $('#inpDuty').value = String(d.duty);
      }
      render(makeFiltered().slice(0, 40));
    });
    const lbl = $('#t_secVeh'); if (lbl) lbl.textContent = (I18N[lang]||I18N.it).secVeh;
  }

  // ------------------ logic ------------------
  const rows = $('#rows'), warnings = $('#warnings');

  function issuesFor(m) {
    const L = I18N[document.documentElement.lang] || I18N.it;
    const H = +($('#inpH').value || 0), W = +($('#inpW').value || 0), T = +($('#inpThickness').value || 0);
    const conc = $('#inpConcrete').value, pw = $('#inpPower').value;
    const arr = [];
    if (H && m.h_sotto_traversa && H < (m.h_sotto_traversa - 200)) arr.push({ t: 'Soffitto basso', cls: 'warn' });
    if (W && m.larghezza && W < m.larghezza) arr.push({ t: 'Baia stretta', cls: 'bad' });
    if (pw && !(m.power || []).includes(pw)) arr.push({ t: 'Alimentazione non prevista', cls: 'warn' });
    if (T && T < (m.anchors?.thickness_min_mm || 170)) arr.push({ t: L.warn_slab, cls: 'bad' });
    if (conc && m.anchors && conc !== 'unknown' && conc !== m.anchors.concrete) arr.push({ t: `${m.anchors.concrete}`, cls: 'warn' });
    return arr;
  }

  function fitScore(m) {
    const gvw = +($('#inpGVW').value || 0), wb = +($('#inpWB').value || 0);
    let s = 0;
    if (gvw > 0) { const head = (m.portata - gvw) / m.portata; s += Math.max(-1, Math.min(1, head * 2)); }
    if (wb > 0) {
      const wantsLong = wb >= 3000;
      const long = /XL|WAGON/i.test(m.id) || m.interasse >= 3000;
      s += wantsLong ? (long ? 0.6 : -0.6) : (long ? -0.2 : 0.2);
    }
    return s;
  }

  function makeFiltered() {
    const gvw = +($('#inpGVW').value || 0), wantBase = $('#inpBase').value, pw = $('#inpPower').value;
    const vehSel = $('#vehicleSel') ? $('#vehicleSel').value : 'any';
    let list = [...MODELS]
      .filter(m => !wantBase || m.base === wantBase)
      .filter(m => !gvw || m.portata >= Math.max(1000, gvw * 1.25))
      .filter(m => !pw || (m.power || []).includes(pw));

    if (vehSel && vehSel !== 'any') {
      const allowed = new Set(VEHICLE_COMPAT[vehSel] || []);
      list = list.filter(m => allowed.has(m.id));
    }
    return list.sort((a, b) => fitScore(b) - fitScore(a));
  }

  function render(list) {
    const L = I18N[document.documentElement.lang] || I18N.it;
    rows.innerHTML = '';
    list.forEach(m => {
      const issues = issuesFor(m);
      const tr = document.createElement('tr');
      const isWithBase = m.base === 'withbase';
      const schedaUrl = buildSheetUrl(m.id, isWithBase ? 'withbase' : 'baseless');
      const manualUrl = buildManualUrl(m.id);
      const armsUrl = buildArmsUrl(m.id);
      const armsStr = m.arms ? `${m.arms.type || ''} ${(m.arms.min_mm ?? '–')}–${(m.arms.max_mm ?? '–')} mm` : '–';
      const baseChip = `<div class="tag" style="margin-top:4px">${isWithBase ? L.withbase : L.baseless}</div>`;
      tr.innerHTML = `
        <td>
          <strong>${m.id}</strong>
          <div class="hint">ref. ${m.ref || '-'}</div>
          ${baseChip}
          <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
            <a class="btn" style="padding:2px 8px" href="${schedaUrl}" target="_blank" rel="noopener">${L.sheet_btn}</a>
            <a class="btn" style="padding:2px 8px" href="${manualUrl}" target="_blank" rel="noopener">${L.manual_btn}</a>
            <a class="btn" style="padding:2px 8px" href="${armsUrl}" target="_blank" rel="noopener">${L.arms_btn}</a>
            <a class="btn" style="padding:2px 8px" href="${PDF.fondazioni}" target="_blank" rel="noopener">${L.fond_btn}</a>
          </div>
        </td>
        <td>${fmt(m.portata, 'kg')}</td>
        <td>${fmt(m.interasse, 'mm')}</td>
        <td>${fmt(m.larghezza, 'mm')}</td>
        <td>${fmt(m.h_sotto_traversa, 'mm')}</td>
        <td>${(m.power || []).join(', ') || '-'}</td>
        <td>${m.anchors ? `${m.anchors.qty}× ${m.anchors.type}<br>${m.anchors.concrete}, ≥ ${m.anchors.thickness_min_mm} mm` : '-'}</td>
        <td>${armsStr}</td>
        <td>${issues.map(i => `<span class="tag ${i.cls}">${i.t}</span>`).join(' ') || `<span class="ok">${L.ok}</span>`}</td>
        <td><input type="checkbox" class="pick" data-id="${m.id}" onclick="event.stopPropagation()"></td>`;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openSheet(m, L));
      rows.appendChild(tr);
    });
  }

  // ------------------ actions ------------------
  function selectedIds() { return Array.from(document.querySelectorAll('.pick:checked')).map(i => i.dataset.id); }
  function buildQuery(extras) {
    const p = new URLSearchParams(); const set = (k, v) => { if (v != null && v !== '') p.set(k, v); };
    set('H', $('#inpH').value); set('W', $('#inpW').value); set('T', $('#inpThickness').value);
    set('C', $('#inpConcrete').value); set('P', $('#inpPower').value); set('B', $('#inpBase').value);
    set('GVW', $('#inpGVW').value); set('WB', $('#inpWB').value);
    if ($('#vehicleSel')) set('V', $('#vehicleSel').value);
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
    const head = ['Model','Ref','Capacity(kg)','Interaxis(mm)','Width(mm)','Clear height(mm)','Power','Anchors','Arms','Type'];
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

  // PDF multiplo
  $('#pdfMultiBtn')?.addEventListener('click', () => {
    const ids = selectedIds();
    const list = ids.length ? MODELS.filter(m => ids.includes(m.id)) : makeFiltered().slice(0, 10);
    const L = I18N[document.documentElement.lang] || I18N.it;
    list.forEach((m, i) => setTimeout(() => openSheet(m, L, true), i * 200));
  });

  // Salva configurazione
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
        tipo_veicolo: $('#vehicleSel') ? $('#vehicleSel').value : 'any',
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
    const armsStr = m.arms ? `${m.arms.type || ''} ${(m.arms.min_mm ?? '–')}–${(m.arms.max_mm ?? '–')} mm` : '–';
    const schedaUrl = buildSheetUrl(m.id, m.base === 'withbase' ? 'withbase' : 'baseless');
    const manualUrl = buildManualUrl(m.id);
    const armsUrl = buildArmsUrl(m.id);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${m.id} — CASCOS</title><style>${css}</style></head><body>
<h1>${m.id} — CASCOS</h1>
<table>
<tr><th>${L.th_cap || 'Portata'}</th><td>${m.portata || '-'} kg</td></tr>
<tr><th>Interasse</th><td>${m.interasse || '-'} mm</td></tr>
<tr><th>Larghezza</th><td>${m.larghezza || '-'} mm</td></tr>
<tr><th>Altezza utile</th><td>${m.h_sotto_traversa || '-'} mm</td></tr>
<tr><th>${L.th_arms || 'Bracci'}</th><td>${armsStr} — <a href="${armsUrl}" target="_blank">${L.arms_btn || '📐 Misure bracci'}</a></td></tr>
<tr><th>${L.th_power || 'Alimentazione'}</th><td>${(m.power || []).join(', ') || '-'}</td></tr>
<tr><th>${(L.th_anchor || 'Ancoraggi').replace('<br>',' ')}</th><td>${m.anchors ? (m.anchors.qty + '× ' + m.anchors.type + ' — ' + m.anchors.concrete + ', ≥ ' + m.anchors.thickness_min_mm + ' mm') : '-'}</td></tr>
<tr><th>Tipo</th><td>${m.base === 'withbase' ? (L.withbase || 'Con basamento') : (L.baseless || 'Senza basamento')}</td></tr>
<tr><th>Documentazione</th><td>
<a href="${schedaUrl}" target="_blank">${L.sheet_btn || 'Scheda'}</a> ·
<a href="${manualUrl}" target="_blank">${L.manual_btn || 'Manuale'}</a> ·
<a href="${PDF.fondazioni}" target="_blank">${L.fond_btn || 'Fondazioni'}</a>
</td></tr>
</table>
<script>window.addEventListener('load',()=>{ ${silent ? '' : 'setTimeout(()=>print(),200);'} });</script>
</body></html>`;
    const w = window.open('', '_blank'); w.document.write(html); w.document.close();
  }

  // ------------------ events ------------------
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
  $('#resetBtn')?.addEventListener('click', () => {
    document.querySelectorAll('input').forEach(i => i.value = '');
    if ($('#vehicleSel')) $('#vehicleSel').value='any';
    calculate();
  });

  // ------------------ PWA ------------------
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    const b = $('#installBtn'); if (b) { b.hidden = false; b.onclick = () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; b.hidden = true; } }; }
  });
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }
})();
