// app.js — v6.1 FULL
// - per-model PDFs (schede) + fallback #search
// - Manuale con mappa pagine
// - PDF singoli “📐 Misure bracci” + fallback
// - Vehicle type + auto-precompilazione (peso/passo/uso/frequenza) + filtro
// - i18n IT/EN/ES/FR/PT
// - Share / CSV / PDF multiplo / Salva JSON / PWA / Restore da URL

(function () {
  'use strict';

  // ------------------ helpers ------------------
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const num = (v) => (v == null || v === '' ? null : Number(v));
  const fmt = (x, unit = '') =>
    (x == null || x === '' ? '-' :
      Number(x).toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'it-IT')) +
    (unit ? ' ' + unit : '');

  // ------------------ PDF paths ------------------
  const PDF = {
    withbase: './docs/scheda_con_pedana.pdf',
    baseless: './docs/scheda_senza_pedana_2022.pdf',
    manuale: './docs/manuale_tecnico_presentazione.pdf',
    fondazioni: './docs/fondazioni_cascos_c4c.pdf'
  };

  // 🔗 Schede tecniche **dedicate** (iPhone friendly). Se assenti → fallback ai PDF globali
  const SHEET_FILES = {
    withbase: {
      "C3.2": "./docs/scheda_C3.2_con_pedana.pdf",
      "C3.2 Comfort": "./docs/scheda_C3.2_Comfort_con_pedana.pdf",
      "C3.5": "./docs/scheda_C3.5_con_pedana.pdf",
      "C3.5XL": "./docs/scheda_C3.5XL_con_pedana.pdf",
      "C4": "./docs/scheda_C4_con_pedana.pdf",
      "C4XL": "./docs/scheda_C4XL_con_pedana.pdf",
      "C5": "./docs/scheda_C5_con_pedana.pdf",
      "C5.5": "./docs/scheda_C5.5_con_pedana.pdf",
      "C5 WAGON": "./docs/scheda_C5_WAGON_con_pedana.pdf"
    },
    baseless: {
      "C3.2S": "./docs/scheda_C3.2S_senza_pedana.pdf",
      "C3.2S Comfort": "./docs/scheda_C3.2S_Comfort_senza_pedana.pdf",
      "C3.5S": "./docs/scheda_C3.5S_senza_pedana.pdf",
      "C3.5SXL": "./docs/scheda_C3.5SXL_senza_pedana.pdf",
      "C4S": "./docs/scheda_C4S_senza_pedana.pdf",
      "C4SXL": "./docs/scheda_C4SXL_senza_pedana.pdf",
      "C5.5S": "./docs/scheda_C5.5S_senza_pedana.pdf",
      "C5S WAGON": "./docs/scheda_C5S_WAGON_senza_pedana.pdf",
      "C5.5S WAGON": "./docs/scheda_C5.5S_WAGON_senza_pedana.pdf"
    }
  };

  // 📖 Manuale tecnico: mappa pagine (compila progressivamente; fallback → #search)
  const MANUAL_PAGES = {
    "C3.2": 7, "C3.2 Comfort": 13, "C3.5": 19, "C3.5XL": null,
    "C4": null, "C4XL": null, "C5": null, "C5.5": null, "C5 WAGON": null,
    "C3.2S": null, "C3.2S Comfort": null, "C3.5S": null, "C3.5SXL": null,
    "C4S": null, "C4SXL": null, "C5.5S": null, "C5S WAGON": null, "C5.5S WAGON": null
  };

  // 📐 Misure/Bracci (PDF singoli opzionali in ./docs/misure/). Se assenti → manuale
  const ARMS_FILES = {
    "C3.2": "./docs/misure/misure_C3.2.pdf",
    "C3.2 Comfort": "./docs/misure/misure_C3.2_Comfort.pdf",
    "C3.5": "./docs/misure/misure_C3.5.pdf",
    // aggiungi gli altri quando li estrai…
  };
  const ARMS_PAGES = { "C3.2": 7, "C3.2 Comfort": 13, "C3.5": 19 };

  function buildSheetUrl(modelId, baseKind) {
    const file = SHEET_FILES[baseKind]?.[modelId];
    if (file) return file;
    const pdf = baseKind === 'withbase' ? PDF.withbase : PDF.baseless;
    return `${pdf}#search=${encodeURIComponent(modelId)}`;
  }
  function buildManualUrl(modelId) {
    const p = MANUAL_PAGES[modelId];
    return Number.isInteger(p) && p > 0
      ? `${PDF.manuale}#page=${p}`
      : `${PDF.manuale}#search=${encodeURIComponent(modelId)}`;
  }
  function buildArmsUrl(modelId) {
    if (ARMS_FILES[modelId]) return ARMS_FILES[modelId];
    const p = ARMS_PAGES[modelId];
    return Number.isInteger(p) && p > 0
      ? `${PDF.manuale}#page=${p}`
      : `${PDF.manuale}#search=${encodeURIComponent(modelId)}`;
  }

  // ------------------ i18n ------------------
  const I18N = {
    it: {
      title:'🔧 CASCOS — Configuratore Sollevatori 2 Colonne', lang:'Lingua',
      share:'Condividi', csv:'CSV', pdfmulti:'PDF multiplo', save:'Salva',
      readme_btn:'Leggimi', install:'Installa',
      sec1:'1) Vincoli dell’officina',
      h:'Altezza utile soffitto (mm)', w:'Larghezza baia disponibile (mm)',
      conc:'Qualità calcestruzzo',
      conc_hint:'Per i modelli 3.2–5.5 t sono richiesti ancoraggi su calcestruzzo C20/25.',
      th:'Spessore soletta (mm)', pow:'Alimentazione disponibile',
      base:'Tipo colonna',
      tip:'Suggerimento: imposta <em>larghezza baia ≥ 3350 mm</em> per le serie C3.2–C4; per veicoli lunghi valuta le versioni XL / WAGON.',
      sec2:'2) Veicolo tipo da sollevare', secVeh:'Tipo di veicolo',
      gvw:'Peso veicolo (kg)', wb:'Passo (mm) / ingombro',
      use:'Uso', duty:'Frequenza cicli/h',
      calc:'Calcola suggerimenti', reset:'Reset',
      sec3:'3) Risultati e modelli consigliati',
      th_model:'Modello', th_cap:'Portata', th_inter:'Interasse<br>(mm)',
      th_width:'Larghezza tot.<br>(mm)', th_height:'Altezza utile<br>sotto traversa (mm)',
      th_power:'Alimentazione', th_anchor:'Anc. / Spessore<br>soletta', th_arms:'Bracci', th_notes:'Note',
      offline:'Puoi installarla e usarla offline.',
      withbase:'Con basamento', baseless:'Senza basamento',
      ok:'✓ Compatibile', warn_slab:'Soletta < 170 mm: adeguare prima del montaggio',
      warn_weight:'Veicolo > 3.5 t: considerare serie C5 / C5.5',
      btn_sheet:'📄 Scheda', btn_manual:'📘 Manuale', btn_found:'🏗️ Fondazioni', btn_arms:'📐 Misure bracci'
    },
    en: {
      title:'🔧 CASCOS — 2-Post Lift Configurator', lang:'Language',
      share:'Share', csv:'CSV', pdfmulti:'Multi PDF', save:'Save',
      readme_btn:'Readme', install:'Install',
      sec1:'1) Workshop constraints',
      h:'Ceiling height (mm)', w:'Bay width (mm)',
      conc:'Concrete quality',
      conc_hint:'For 3.2–5.5 t models anchors on C20/25 concrete are required.',
      th:'Slab thickness (mm)', pow:'Power supply',
      base:'Column type',
      tip:'Tip: set <em>bay width ≥ 3350 mm</em> for C3.2–C4; for long vehicles consider XL/WAGON.',
      sec2:'2) Vehicle to lift', secVeh:'Vehicle type',
      gvw:'Vehicle weight (kg)', wb:'Wheelbase / length (mm)',
      use:'Use', duty:'Cycles/h',
      calc:'Compute suggestions', reset:'Reset',
      sec3:'3) Results & suggested models',
      th_model:'Model', th_cap:'Capacity', th_inter:'Bay<br>(mm)',
      th_width:'Total width<br>(mm)', th_height:'Clear height<br>under crossbeam (mm)',
      th_power:'Power', th_anchor:'Anch. / Slab', th_arms:'Arms', th_notes:'Notes',
      offline:'You can install and use it offline.',
      withbase:'With base', baseless:'Baseless',
      ok:'✓ Compatible', warn_slab:'Slab < 170 mm: fix before installation',
      warn_weight:'Vehicle > 3.5 t: consider C5 / C5.5',
      btn_sheet:'📄 Datasheet', btn_manual:'📘 Manual', btn_found:'🏗️ Foundations', btn_arms:'📐 Arms / dimensions'
    },
    es: {
      title:'🔧 CASCOS — Configurador 2 Columnas', lang:'Idioma',
      share:'Compartir', csv:'CSV', pdfmulti:'PDF múltiple', save:'Guardar',
      readme_btn:'Léeme', install:'Instalar',
      sec1:'1) Restricciones del taller',
      h:'Altura útil techo (mm)', w:'Ancho bahía (mm)',
      conc:'Calidad del hormigón',
      conc_hint:'Para 3.2–5.5 t se requieren anclajes en C20/25.',
      th:'Espesor losa (mm)', pow:'Alimentación', base:'Tipo de columna',
      tip:'Sugerencia: ancho ≥ 3350 mm para C3.2–C4; vehículos largos: XL / WAGON.',
      sec2:'2) Vehículo a elevar', secVeh:'Tipo de vehículo',
      gvw:'Peso vehículo (kg)', wb:'Batalla / largo (mm)',
      use:'Uso', duty:'Ciclos/h',
      calc:'Calcular', reset:'Reset',
      sec3:'3) Resultados y modelos sugeridos',
      th_model:'Modelo', th_cap:'Capacidad', th_inter:'Intereje<br>(mm)',
      th_width:'Ancho total<br>(mm)', th_height:'Altura libre<br>bajo travesaño (mm)',
      th_power:'Alimentación', th_anchor:'Ancl. / Losa', th_arms:'Brazos', th_notes:'Notas',
      offline:'Se puede instalar y usar offline.',
      withbase:'Con base', baseless:'Sin base',
      ok:'✓ Compatible', warn_slab:'Losa < 170 mm: adecuar antes del montaje',
      warn_weight:'Vehículo > 3.5 t: considerar C5 / C5.5',
      btn_sheet:'📄 Ficha', btn_manual:'📘 Manual', btn_found:'🏗️ Cimentaciones', btn_arms:'📐 Medidas brazos'
    },
    fr: {
      title:'🔧 CASCOS — Configurateur 2 colonnes', lang:'Langue',
      share:'Partager', csv:'CSV', pdfmulti:'PDF multiple', save:'Enregistrer',
      readme_btn:'Lisez-moi', install:'Installer',
      sec1:'1) Contraintes de l’atelier',
      h:'Hauteur utile sous plafond (mm)', w:'Largeur de baie (mm)',
      conc:'Qualité béton',
      conc_hint:'Pour 3.2–5.5 t ancrages sur béton C20/25 requis.',
      th:'Épaisseur dalle (mm)', pow:'Alimentation', base:'Type de colonne',
      tip:'Astuce : largeur baie ≥ 3350 mm pour C3.2–C4 ; pour véhicules longs versions XL / WAGON.',
      sec2:'2) Véhicule à lever', secVeh:'Type de véhicule',
      gvw:'Poids véhicule (kg)', wb:'Empattement / longueur (mm)',
      use:'Usage', duty:'Cycles/heure',
      calc:'Calculer', reset:'Réinitialiser',
      sec3:'3) Résultats et modèles conseillés',
      th_model:'Modèle', th_cap:'Capacité', th_inter:'Entraxe<br>(mm)',
      th_width:'Largeur tot.<br>(mm)', th_height:'Hauteur utile<br>sous traverse (mm)',
      th_power:'Alimentation', th_anchor:'Ancr. / Dalle', th_arms:'Bras', th_notes:'Notes',
      offline:'Peut être installée et utilisée hors-ligne.',
      withbase:'Avec châssis', baseless:'Sans châssis',
      ok:'✓ Compatible', warn_slab:'Dalle < 170 mm : corriger avant pose',
      warn_weight:'Véhicule > 3.5 t : considérer C5 / C5.5',
      btn_sheet:'📄 Fiche', btn_manual:'📘 Manuel', btn_found:'🏗️ Fondations', btn_arms:'📐 Cotes des bras'
    },
    pt: {
      title:'🔧 CASCOS — Configurador 2 colunas', lang:'Idioma',
      share:'Partilhar', csv:'CSV', pdfmulti:'PDF múltiplo', save:'Guardar',
      readme_btn:'Leia-me', install:'Instalar',
      sec1:'1) Restrições da oficina',
      h:'Altura útil do teto (mm)', w:'Largura da baía (mm)',
      conc:'Qualidade do betão',
      conc_hint:'Para 3.2–5.5 t exigem-se ancoragens em C20/25.',
      th:'Espessura da laje (mm)', pow:'Alimentação', base:'Tipo de coluna',
      tip:'Sugestão: largura ≥ 3350 mm para C3.2–C4; veículos longos XL / WAGON.',
      sec2:'2) Veículo a elevar', secVeh:'Tipo de veículo',
      gvw:'Peso do veículo (kg)', wb:'Entre-eixos / comprimento (mm)',
      use:'Uso', duty:'Ciclos/h',
      calc:'Calcular', reset:'Repor',
      sec3:'3) Resultados e modelos sugeridos',
      th_model:'Modelo', th_cap:'Capacidade', th_inter:'Entre-eixos<br>(mm)',
      th_width:'Largura total<br>(mm)', th_height:'Altura livre<br>sob travessa (mm)',
      th_power:'Alimentação', th_anchor:'Ancr. / Laje', th_arms:'Braços', th_notes:'Notas',
      offline:'Pode ser instalada e usada offline.',
      withbase:'Com base', baseless:'Sem base',
      ok:'✓ Compatível', warn_slab:'Laje < 170 mm: adequar antes da montagem',
      warn_weight:'Veículo > 3.5 t: considerar C5 / C5.5',
      btn_sheet:'📄 Ficha', btn_manual:'📘 Manual', btn_found:'🏗️ Fundações', btn_arms:'📐 Medidas dos braços'
    }
  };

  const bindings = [
    ['t_title','title'],['t_lang','lang'],['t_share','share'],['t_csv','csv'],['t_pdfmulti','pdfmulti'],['t_save','save'],
    ['t_readme','readme_btn'],['t_install','install'],['t_sec1','sec1'],['t_h','h'],['t_w','w'],['t_conc','conc'],
    ['t_conc_hint','conc_hint'],['t_th','th'],['t_pow','pow'],['t_base','base'],['t_tip','tip'],
    ['t_sec2','sec2'],['t_secVeh','secVeh'],['t_gvw','gvw'],['t_wb','wb'],['t_use','use'],['t_duty','duty'],
    ['t_calc','calc'],['t_reset','reset'],['t_sec3','sec3']
  ];

  function applyLang(lang) {
    const L = I18N[lang] || I18N.it;
    bindings.forEach(([id,key]) => { const el = document.getElementById(id); if (el) el.innerHTML = L[key]; });

    // Ritraduci selettore vehicle mantenendo la scelta
    const vSel = $('#vehicleSel');
    const prev = vSel ? vSel.value : 'any';
    if (vSel) {
      vSel.innerHTML = '';
      Object.entries(VEHICLE_TYPES).forEach(([k, labels]) => {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = labels[lang] || labels.it;
        vSel.appendChild(opt);
      });
      vSel.value = prev;
    }

    document.documentElement.lang = lang;
    render(makeFiltered().slice(0, 40));
  }

  $('#langSel')?.addEventListener('change', (e) => applyLang(e.target.value));

  // ------------------ tipologie veicolo + preset valori ------------------
  const VEHICLE_TYPES = {
    any:{it:'Qualsiasi',en:'Any',es:'Cualquiera',fr:'Toutes',pt:'Qualquer'},
    city:{it:'City / Utilitaria',en:'City / Small',es:'Ciudad / utilitario',fr:'Citadine',pt:'Citadino'},
    sedan:{it:'Berlina / Crossover',en:'Sedan / Crossover',es:'Berlina / Crossover',fr:'Berline / Crossover',pt:'Sedan / Crossover'},
    suv:{it:'SUV / Pickup',en:'SUV / Pickup',es:'SUV / Pickup',fr:'SUV / Pickup',pt:'SUV / Pickup'},
    mpv:{it:'MPV / Monovolume',en:'MPV / Minivan',es:'MPV / Monovolumen',fr:'Monospace',pt:'MPV / Monovolume'},
    van:{it:'Van / Furgoni',en:'Van / LCV',es:'Furgón',fr:'Fourgon',pt:'Furgão'},
    lcv:{it:'Veicoli lunghi / WAGON',en:'Long vehicles / WAGON',es:'Vehículos largos / WAGON',fr:'Véhicules longs / WAGON',pt:'Veículos longos / WAGON'}
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

  function applyVehicleDefaults(typeKey) {
    const s = VEHICLE_DEFAULTS[typeKey];
    if (!s) return;
    const g=$('#inpGVW'), w=$('#inpWB'), u=$('#inpUse'), d=$('#inpDuty');
    if (g) g.value = s.kg;
    if (w) w.value = s.wb;
    if (u) u.value = s.use;
    if (d) d.value = String(s.duty);
    if (typeof calculate === 'function') calculate();
  }

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
    vSel.addEventListener('change', () => {
      applyVehicleDefaults(vSel.value);
      render(makeFiltered().slice(0, 40));
    });
    const lbl = $('#t_secVeh'); if (lbl) lbl.textContent = (I18N[lang]||I18N.it).secVeh;
  }

  // ------------------ dataset ------------------
  let MODELS = [];

  async function loadModels() {
    try {
      const r = await fetch('./models.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('http');
      MODELS = await r.json();
    } catch {
      // Fallback minimale (per non bloccare l’app se manca models.json)
      MODELS = [
        { id:'C3.2', ref:'13120E', base:'withbase', portata:3200, interasse:2700, larghezza:3350, h_sotto_traversa:4248, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:710,max_mm:1050}, vehicleTypes:['city','sedan','mpv','suv'] },
        { id:'C3.2 Comfort', ref:'13120C', base:'withbase', portata:3200, interasse:2700, larghezza:3350, h_sotto_traversa:4248, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:597,max_mm:1122}, vehicleTypes:['city','sedan','mpv'] },
        { id:'C3.5', ref:'13168', base:'withbase', portata:3500, interasse:2700, larghezza:3350, h_sotto_traversa:4248, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:690,max_mm:1325}, vehicleTypes:['sedan','mpv','suv','van'] },
        { id:'C4', ref:'13194', base:'withbase', portata:4000, interasse:2700, larghezza:3350, h_sotto_traversa:4248, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:705,max_mm:1335}, vehicleTypes:['suv','van','lcv'] },
        { id:'C4XL', ref:'13194-4', base:'withbase', portata:4000, interasse:3000, larghezza:3340, h_sotto_traversa:4248, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:705,max_mm:1335}, vehicleTypes:['suv','van','lcv'] },
        { id:'C5.5', ref:'13998', base:'withbase', portata:5500, interasse:2810, larghezza:3250, h_sotto_traversa:4250, power:['400/3~','230/3~'], anchors:{qty:16,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:823,max_mm:1505}, vehicleTypes:['van','lcv'] },
        { id:'C5 WAGON', ref:'13176', base:'withbase', portata:5000, interasse:3000, larghezza:3570, h_sotto_traversa:4250, power:['400/3~','230/3~'], anchors:{qty:16,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, vehicleTypes:['lcv'] },
        { id:'C3.2S', ref:'13120SE', base:'baseless', portata:3200, interasse:2700, larghezza:4250, h_sotto_traversa:4250, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:710,max_mm:1050}, vehicleTypes:['city','sedan','mpv','suv'] },
        { id:'C3.5S', ref:'13169', base:'baseless', portata:3500, interasse:2700, larghezza:4250, h_sotto_traversa:4250, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:690,max_mm:1325}, vehicleTypes:['sedan','mpv','suv','van'] },
        { id:'C4S', ref:'13194S', base:'baseless', portata:4000, interasse:2700, larghezza:4250, h_sotto_traversa:4250, power:['400/3~','230/3~'], anchors:{qty:12,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{max_mm:1341}, vehicleTypes:['suv','van','lcv'] },
        { id:'C5.5S', ref:'13998S', base:'baseless', portata:5500, interasse:2810, larghezza:5150, h_sotto_traversa:4250, power:['400/3~','230/3~'], anchors:{qty:16,type:'M16x145',concrete:'C20/25',thickness_min_mm:170}, arms:{min_mm:758,max_mm:1505}, vehicleTypes:['van','lcv'] }
      ];
    }
  }

  // ------------------ filtro e render ------------------
  function makeFiltered() {
    const base = $('#inpBase')?.value || 'withbase';
    const gvw = num($('#inpGVW')?.value);
    const wb  = num($('#inpWB')?.value);
    const pw  = $('#inpPower')?.value;
    const typeKey = $('#vehicleSel')?.value || 'any';

    let list = MODELS.filter(m => m.base === base);

    if (typeKey !== 'any') {
      const allow = new Set(VEHICLE_COMPAT[typeKey] || []);
      list = list.filter(m => allow.has(m.id) || (m.vehicleTypes && m.vehicleTypes.includes(typeKey)));
    }
    if (gvw) list = list.filter(m => (m.portata || 0) >= gvw + 200);
    if (wb)  list = list.filter(m => !m.interasse || wb <= (m.interasse + 200));
    if (pw)  list = list.filter(m => !m.power || m.power.includes(pw));

    return list;
  }

  function render(list) {
    const lang = document.documentElement.lang || 'it';
    const L = I18N[lang] || I18N.it;
    const tbody = $('#rows'); if (!tbody) return;
    tbody.innerHTML = '';

    // avvisi
    const warnings = $('#warnings'); if (warnings) {
      warnings.innerHTML = '';
      const thk = num($('#inpThickness')?.value);
      if (thk && thk < 170) {
        const chip = document.createElement('div');
        chip.className = 'tag bad'; chip.textContent = L.warn_slab;
        warnings.appendChild(chip);
      }
    }

    list.forEach(m => {
      const tr = document.createElement('tr');
      const isWithBase = m.base === 'withbase';
      const sheetUrl  = buildSheetUrl(m.id, isWithBase ? 'withbase' : 'baseless');
      const manualUrl = buildManualUrl(m.id);
      const armsUrl   = buildArmsUrl(m.id);
      const armsTxt   = m.arms ? `${m.arms.type?m.arms.type+' ':''}${m.arms.min_mm ?? '–'}–${m.arms.max_mm ?? '–'} mm` : '–';

      tr.innerHTML = `
        <td>
          <div style="font-weight:600">${m.id}</div>
          <div class="hint">ref. ${m.ref || '-'}</div>
          <div class="tag" style="margin-top:4px">${isWithBase ? L.withbase : L.baseless}</div>
          <div class="chips" style="margin-top:6px;gap:6px;flex-wrap:wrap">
            <a class="btn" href="${sheetUrl}"  target="_blank" rel="noopener">${L.btn_sheet}</a>
            <a class="btn" href="${manualUrl}" target="_blank" rel="noopener">${L.btn_manual}</a>
            <a class="btn" href="${armsUrl}"   target="_blank" rel="noopener">${L.btn_arms}</a>
            <a class="btn" href="${PDF.fondazioni}" target="_blank" rel="noopener">${L.btn_found}</a>
          </div>
        </td>
        <td>${fmt(m.portata,'kg')}</td>
        <td>${fmt(m.interasse,'mm')}</td>
        <td>${fmt(m.larghezza,'mm')}</td>
        <td>${fmt(m.h_sotto_traversa,'mm')}</td>
        <td>${(m.power||[]).join(', ')||'-'}</td>
        <td>${m.anchors ? `${m.anchors.qty}× ${m.anchors.type}<br>${m.anchors.concrete}, ≥ ${m.anchors.thickness_min_mm} mm` : '-'}</td>
        <td>${armsTxt}</td>
        <td><input type="checkbox" class="selRow"></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ------------------ azioni ------------------
  function selectedModels() {
    const ids = [];
    $$('#rows tr').forEach(r => {
      const cb = r.querySelector('.selRow');
      if (cb && cb.checked) {
        const id = r.querySelector('td:first-child div')?.textContent.trim();
        ids.push(id);
      }
    });
    return ids.length ? MODELS.filter(m => ids.includes(m.id)) : makeFiltered().slice(0, 10);
  }

  function shareConfig() {
    const params = new URLSearchParams({
      h: $('#inpH')?.value || '', w: $('#inpW')?.value || '', t: $('#inpThickness')?.value || '',
      c: $('#inpConcrete')?.value || '', p: $('#inpPower')?.value || '', b: $('#inpBase')?.value || '',
      g: $('#inpGVW')?.value || '', wb: $('#inpWB')?.value || '', u: $('#inpUse')?.value || '',
      d: $('#inpDuty')?.value || '', vt: $('#vehicleSel')?.value || '', lang: $('#langSel')?.value || (document.documentElement.lang||'it')
    });
    const url = `${location.origin}${location.pathname}?${params.toString()}`;
    if (navigator.share) navigator.share({ title: document.title, url }).catch(()=>{});
    else { navigator.clipboard.writeText(url); alert('Link copiato:\n' + url); }
  }

  function exportCSV() {
    const list = selectedModels();
    const head = ['Modello','Ref','Tipo','Portata(kg)','Interasse(mm)','Larghezza(mm)','Altezza(mm)','Alimentazione','Ancoraggi','Bracci'];
    const rows = list.map(m => [
      m.id, m.ref||'', m.base||'', m.portata||'', m.interasse||'', m.larghezza||'', m.h_sotto_traversa||'',
      (m.power||[]).join('/'), m.anchors?`${m.anchors.qty}x ${m.anchors.type} ${m.anchors.concrete} ≥${m.anchors.thickness_min_mm}mm`:'', m.arms?`${m.arms.min_mm||''}-${m.arms.max_mm||''}`:''
    ].join(';'));
    const blob = new Blob([head.join(';')+'\n'+rows.join('\n')], { type:'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cascos_modelli.csv'; a.click();
    URL.revokeObjectURL(a.href);
  }

  function openPDFMultiple() {
    selectedModels().forEach((m, i) => {
      const url = buildSheetUrl(m.id, m.base==='withbase'?'withbase':'baseless');
      setTimeout(()=>window.open(url,'_blank','noopener'), i*200);
    });
  }

  function saveJSON() {
    const payload = {
      ts: new Date().toISOString(),
      lang: document.documentElement.lang,
      inputs: {
        H: $('#inpH')?.value, W: $('#inpW')?.value, T: $('#inpThickness')?.value,
        C: $('#inpConcrete')?.value, P: $('#inpPower')?.value, B: $('#inpBase')?.value,
        GVW: $('#inpGVW')?.value, WB: $('#inpWB')?.value, USE: $('#inpUse')?.value, DUTY: $('#inpDuty')?.value,
        VTYPE: $('#vehicleSel')?.value
      }
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    a.download = 'cascos_config.json'; a.click();
  }

  // ------------------ calcolo / reset ------------------
  function calculate(){ render(makeFiltered().slice(0,40)); }
  function resetForm(){
    ['inpH','inpW','inpThickness','inpGVW','inpWB'].forEach(id=>{ const el=$('#'+id); if(el) el.value=''; });
    if($('#inpConcrete')) $('#inpConcrete').value='C20/25';
    if($('#inpPower'))    $('#inpPower').value='400/3~';
    if($('#inpBase'))     $('#inpBase').value='withbase';
    if($('#inpUse'))      $('#inpUse').value='auto';
    if($('#inpDuty'))     $('#inpDuty').value='6';
    if($('#vehicleSel'))  $('#vehicleSel').value='any';
    calculate();
  }

  // ------------------ restore da URL ------------------
  function restoreFromURL() {
    const q = new URLSearchParams(location.search);
    const setIf = (id,k) => { const el = $('#'+id); if (el && q.has(k)) el.value = q.get(k); };
    setIf('inpH','h'); setIf('inpW','w'); setIf('inpThickness','t');
    setIf('inpConcrete','c'); setIf('inpPower','p'); setIf('inpBase','b');
    setIf('inpGVW','g'); setIf('inpWB','wb'); setIf('inpUse','u'); setIf('inpDuty','d');
    if (q.get('vt') && $('#vehicleSel')) { $('#vehicleSel').value = q.get('vt'); applyVehicleDefaults(q.get('vt')); }
    if (q.get('lang') && $('#langSel')) { $('#langSel').value = q.get('lang'); applyLang(q.get('lang')); }
  }

  // ------------------ PWA ------------------
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; const b=$('#installBtn'); if(b) b.hidden=false; });
  $('#installBtn')?.addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('#installBtn').hidden=true; });
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }

  // ------------------ wireup ------------------
  function initUI() {
    $('#calcBtn')?.addEventListener('click', calculate);
    $('#resetBtn')?.addEventListener('click', resetForm);
    $('#shareBtn')?.addEventListener('click', shareConfig);
    $('#csvBtn')?.addEventListener('click', exportCSV);
    $('#pdfMultiBtn')?.addEventListener('click', openPDFMultiple);
    $('#saveBtn')?.addEventListener('click', saveJSON);
    initVehicleFilter();
  }

  async function init() {
    initUI();
    await loadModels();
    applyLang($('#langSel')?.value || 'it');
    restoreFromURL();
    render(makeFiltered().slice(0, 40));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
