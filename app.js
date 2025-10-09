// app.js — v6.1 (multilingua + bracci + share + CSV + PDF multiplo + salva JSON
// + mappa pagine PDF + PWA + auto-precompilazione parametri da “Tipo di veicolo”)
(function () {
  'use strict';

  // ------------------ helpers ------------------
  const $ = (s) => document.querySelector(s);
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

  // Mappa "modello -> pagina" nei PDF consolidati (quando la pagina è nota).
  // Dove non nota = fallback con #search=<modello>.
  const SHEET_PAGES = {
    withbase: {
      'C3.2': 1,          // esiste indice sulla 1
      'C3.2 Comfort': null,
      'C3.5': null,
      'C3.5XL': null,
      'C4': null,
      'C4XL': null,
      'C5': null,
      'C5.5': null,
      'C5 WAGON': null
    },
    baseless: {
      'C3.2S': null,
      'C3.2S Comfort': null,
      'C3.2SVS': null,
      'C3.5S': null,
      'C3.5SXL': null,
      'C4S': null,
      'C4SXL': null,
      'C4SVS': null,
      'C5.5S': null,
      'C5.5S WAGON': null,
      'C5S WAGON': null,
      'C5.5S GLOBAL': null
    }
  };

  // Alcune pagine del MANUALE (per “Manuale”/“Misure”); dati certi dalle tue schermate.
  // NB: manterremo fallback #search se non specificato.
  const MANUAL_PAGES = {
    'C3.2': 7,
    'C3.2 Comfort': 14,
    'C3.5': 20,
    // 'C3.5XL': ?,  'C4': ?, 'C4XL': ?, ecc. (lo completiamo al prossimo giro)
  };

  function buildSheetUrl(modelId, baseKind /* 'withbase' | 'baseless' */) {
    const pdf = baseKind === 'withbase' ? PDF.withbase : PDF.baseless;
    const page = SHEET_PAGES[baseKind]?.[modelId];
    if (Number.isInteger(page) && page > 0) return `${pdf}#page=${page}`;
    return `${pdf}#search=${encodeURIComponent(modelId)}`;
  }
  function buildManualUrl(modelId) {
    const page = MANUAL_PAGES[modelId];
    if (Number.isInteger(page) && page > 0) return `${PDF.manuale}#page=${page}`;
    return `${PDF.manuale}#search=${encodeURIComponent(modelId)}`;
  }

  // ------------------ i18n ------------------
  const I18N = {
    it: {
      title: '🔧 CASCOS — Configuratore Sollevatori 2 Colonne',
      lang: 'Lingua',
      share: 'Condividi',
      csv: 'CSV',
      pdfmulti: 'PDF multiplo',
      save: 'Salva',
      readme: 'Leggimi',
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
      secVeh: 'Tipo di veicolo',
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
      tag_withbase: 'Con basamento',
      tag_baseless: 'Senza basamento',
      btn_sheet: '📄 Scheda',
      btn_manual: '📘 Manuale',
      btn_found: '🏗️ Fondazioni',
      compat: 'Compatibile',
      notCompat: '—',
      warn_slab: 'Soletta < 170 mm: adeguare prima del montaggio',
    },
    en: {
      title: '🔧 CASCOS — 2-Post Lift Configurator',
      lang: 'Language',
      share: 'Share',
      csv: 'CSV',
      pdfmulti: 'Bulk PDF',
      save: 'Save',
      readme: 'Readme',
      install: 'Install',
      sec1: '1) Workshop constraints',
      h: 'Ceiling useful height (mm)',
      w: 'Bay width available (mm)',
      conc: 'Concrete quality',
      conc_hint: 'For 3.2–5.5 t models anchors on C20/25 concrete are required.',
      th: 'Slab thickness (mm)',
      pow: 'Available power',
      base: 'Column type',
      tip: 'Tip: set <em>bay width ≥ 3350 mm</em> for C3.2–C4; for long vehicles consider XL / WAGON versions.',
      sec2: '2) Vehicle to lift',
      secVeh: 'Vehicle type',
      gvw: 'Vehicle weight (kg)',
      wb: 'Wheelbase / length (mm)',
      use: 'Use',
      duty: 'Cycles per hour',
      calc: 'Compute suggestions',
      reset: 'Reset',
      sec3: '3) Results & suggested models',
      th_model: 'Model',
      th_cap: 'Capacity',
      th_inter: 'Bay<br>(mm)',
      th_width: 'Total width<br>(mm)',
      th_height: 'Clear height<br>under crossbeam (mm)',
      th_power: 'Power',
      th_anchor: 'Anch. / Slab',
      th_arms: 'Arms',
      th_notes: 'Notes',
      tag_withbase: 'With base',
      tag_baseless: 'Baseless',
      btn_sheet: '📄 Datasheet',
      btn_manual: '📘 Manual',
      btn_found: '🏗️ Foundations',
      compat: 'Compatible',
      notCompat: '—',
      warn_slab: 'Slab < 170 mm: fix before installation',
    },
    es: {
      title: '🔧 CASCOS — Configurador 2 Columnas',
      lang: 'Idioma',
      share: 'Compartir',
      csv: 'CSV',
      pdfmulti: 'PDF múltiple',
      save: 'Guardar',
      readme: 'Léeme',
      install: 'Instalar',
      sec1: '1) Restricciones del taller',
      h: 'Altura útil techo (mm)',
      w: 'Ancho bahía disponible (mm)',
      conc: 'Calidad del hormigón',
      conc_hint: 'Para 3.2–5.5 t se requieren anclajes en C20/25.',
      th: 'Espesor losa (mm)',
      pow: 'Alimentación disponible',
      base: 'Tipo de columna',
      tip: 'Sugerencia: usa <em>ancho ≥ 3350 mm</em> para C3.2–C4; para vehículos largos versiones XL / WAGON.',
      sec2: '2) Vehículo a elevar',
      secVeh: 'Tipo de vehículo',
      gvw: 'Peso vehículo (kg)',
      wb: 'Batalla / largo (mm)',
      use: 'Uso',
      duty: 'Ciclos por hora',
      calc: 'Calcular sugerencias',
      reset: 'Reset',
      sec3: '3) Resultados y modelos sugeridos',
      th_model: 'Modelo',
      th_cap: 'Capacidad',
      th_inter: 'Intereje<br>(mm)',
      th_width: 'Ancho total<br>(mm)',
      th_height: 'Altura libre<br>bajo travesaño (mm)',
      th_power: 'Alimentación',
      th_anchor: 'Ancl. / Losa',
      th_arms: 'Brazos',
      th_notes: 'Notas',
      tag_withbase: 'Con base',
      tag_baseless: 'Sin base',
      btn_sheet: '📄 Ficha',
      btn_manual: '📘 Manual',
      btn_found: '🏗️ Cimentaciones',
      compat: 'Compatible',
      notCompat: '—',
      warn_slab: 'Losa < 170 mm: adecuar antes del montaje',
    },
    fr: {
      title: '🔧 CASCOS — Configurateur 2 colonnes',
      lang: 'Langue',
      share: 'Partager',
      csv: 'CSV',
      pdfmulti: 'PDF multiple',
      save: 'Enregistrer',
      readme: 'Lisez-moi',
      install: 'Installer',
      sec1: '1) Contraintes de l’atelier',
      h: 'Hauteur utile sous plafond (mm)',
      w: 'Largeur baie dispo (mm)',
      conc: 'Qualité béton',
      conc_hint: 'Pour 3.2–5.5 t, ancrages sur béton C20/25 requis.',
      th: 'Épaisseur dalle (mm)',
      pow: 'Alimentation dispo',
      base: 'Type de colonne',
      tip: 'Astuce : largeur baie ≥ 3350 mm pour C3.2–C4 ; véhicules longs versions XL / WAGON.',
      sec2: '2) Véhicule à lever',
      secVeh: 'Type de véhicule',
      gvw: 'Poids véhicule (kg)',
      wb: 'Empattement / longueur (mm)',
      use: 'Usage',
      duty: 'Cycles/heure',
      calc: 'Calculer',
      reset: 'Réinitialiser',
      sec3: '3) Résultats et modèles conseillés',
      th_model: 'Modèle',
      th_cap: 'Capacité',
      th_inter: 'Entraxe<br>(mm)',
      th_width: 'Largeur tot.<br>(mm)',
      th_height: 'Hauteur utile<br>sous traverse (mm)',
      th_power: 'Alimentation',
      th_anchor: 'Ancr. / Dalle',
      th_arms: 'Bras',
      th_notes: 'Notes',
      tag_withbase: 'Avec châssis',
      tag_baseless: 'Sans châssis',
      btn_sheet: '📄 Fiche',
      btn_manual: '📘 Manuel',
      btn_found: '🏗️ Fondations',
      compat: 'Compatible',
      notCompat: '—',
      warn_slab: 'Dalle < 170 mm : à corriger avant pose',
    },
    pt: {
      title: '🔧 CASCOS — Configurador 2 colunas',
      lang: 'Idioma',
      share: 'Partilhar',
      csv: 'CSV',
      pdfmulti: 'PDF múltiplo',
      save: 'Guardar',
      readme: 'Leia-me',
      install: 'Instalar',
      sec1: '1) Restrições da oficina',
      h: 'Altura útil do teto (mm)',
      w: 'Largura da baía (mm)',
      conc: 'Qualidade do betão',
      conc_hint: 'Para 3.2–5.5 t exigem-se ancoragens em C20/25.',
      th: 'Espessura da laje (mm)',
      pow: 'Alimentação disponível',
      base: 'Tipo de coluna',
      tip: 'Sugestão: largura ≥ 3350 mm para C3.2–C4; veículos longos XL / WAGON.',
      sec2: '2) Veículo a elevar',
      secVeh: 'Tipo de veículo',
      gvw: 'Peso do veículo (kg)',
      wb: 'Distância entre eixos (mm)',
      use: 'Uso',
      duty: 'Ciclos/h',
      calc: 'Calcular sugestões',
      reset: 'Repor',
      sec3: '3) Resultados e modelos sugeridos',
      th_model: 'Modelo',
      th_cap: 'Capacidade',
      th_inter: 'Entre-eixos<br>(mm)',
      th_width: 'Largura total<br>(mm)',
      th_height: 'Altura livre<br>sob travessa (mm)',
      th_power: 'Alimentação',
      th_anchor: 'Ancr. / Laje',
      th_arms: 'Braços',
      th_notes: 'Notas',
      tag_withbase: 'Com base',
      tag_baseless: 'Sem base',
      btn_sheet: '📄 Ficha',
      btn_manual: '📘 Manual',
      btn_found: '🏗️ Fundações',
      compat: 'Compatível',
      notCompat: '—',
      warn_slab: 'Laje < 170 mm: adequar antes da montagem',
    }
  };

  const bindings = [
    ['t_title', 'title'], ['t_lang', 'lang'], ['t_share', 'share'],
    ['t_csv', 'csv'], ['t_pdfmulti', 'pdfmulti'], ['t_save', 'save'],
    ['t_readme', 'readme'], ['t_install', 'install'],
    ['t_sec1', 'sec1'], ['t_h', 'h'], ['t_w', 'w'], ['t_conc', 'conc'],
    ['t_conc_hint', 'conc_hint'], ['t_th', 'th'], ['t_pow', 'pow'],
    ['t_base', 'base'], ['t_tip', 'tip'], ['t_sec2', 'sec2'],
    ['t_secVeh', 'secVeh'], ['t_gvw', 'gvw'], ['t_wb', 'wb'],
    ['t_use', 'use'], ['t_duty', 'duty'], ['t_calc', 'calc'],
    ['t_reset', 'reset'], ['t_sec3', 'sec3'],
    ['t_th_model', 'th_model'], ['t_th_cap', 'th_cap'],
    ['t_th_inter', 'th_inter'], ['t_th_width', 'th_width'],
    ['t_th_height', 'th_height'], ['t_th_power', 'th_power'],
    ['t_th_anchor', 'th_anchor'], ['t_th_arms', 'th_arms'],
    ['t_th_notes', 'th_notes']
  ];

  function applyLang(lang) {
    const L = I18N[lang] || I18N.it;
    bindings.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = L[key];
    });

    // Ritraduci il menu “Tipo veicolo” mantenendo la scelta
    const vSel = $('#vehicleSel');
    const prev = vSel ? vSel.value : 'any';
    if (vSel) {
      vSel.innerHTML = '';
      Object.entries(VEHICLE_TYPES).forEach(([k, labels]) => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = labels[lang] || labels.it;
        vSel.appendChild(opt);
      });
      vSel.value = prev;
    }

    document.documentElement.lang = lang;
    render(makeFiltered().slice(0, 40));
  }

  // ------------------ dataset modelli (ridotto esemplificativo) ------------------
  // NB: bracci min/max = valori reali per alcuni modelli; completiamo gli altri a step successivo.
  const MODELS = [
    { id: 'C3.2', ref: '13120E', capacity: 3200, bay: 2700, width: 3350, clear: 4248, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 710 — Max 1050 mm',  vehicleTypes: ['city','sedan','mpv','suv'] },

    { id: 'C3.2 Comfort', ref: '13120C', capacity: 3200, bay: 2700, width: 3350, clear: 4248, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 597 — Max 1122 mm',  vehicleTypes: ['city','sedan','mpv'] },

    { id: 'C3.5', ref: '13168', capacity: 3500, bay: 2700, width: 3350, clear: 4248, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 690 — Max 1325 mm', vehicleTypes: ['sedan','mpv','suv','van'] },

    { id: 'C4', ref: '13194', capacity: 4000, bay: 2700, width: 3350, clear: 4248, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 705 — Max 1335 mm', vehicleTypes: ['suv','van','lcv'] },

    { id: 'C4XL', ref: '13194-4', capacity: 4000, bay: 3000, width: 3340, clear: 4248, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 705 — Max 1335 mm', vehicleTypes: ['suv','van','lcv'] },

    { id: 'C5.5', ref: '13998', capacity: 5500, bay: 2810, width: 3250, clear: 4250, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '16× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 823 — Max 1505 mm', vehicleTypes: ['van','lcv'] },

    { id: 'C5 WAGON', ref: '13176', capacity: 5000, bay: 3000, width: 3570, clear: 4250, power: ['400/3~','230/3~'], base: 'withbase',
      anchors: '16× M16x145<br>C20/25, ≥ 170 mm', arms: '—', vehicleTypes: ['lcv'] },

    // senza basamento (esempi)
    { id: 'C3.2S', ref: '13120SE', capacity: 3200, bay: 2700, width: 4250, clear: 4250, power: ['400/3~','230/3~'], base: 'baseless',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 710 — Max 1050 mm', vehicleTypes: ['city','sedan','mpv','suv'] },

    { id: 'C3.5S', ref: '13169', capacity: 3500, bay: 2700, width: 4250, clear: 4250, power: ['400/3~','230/3~'], base: 'baseless',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 690 — Max 1325 mm', vehicleTypes: ['sedan','mpv','suv','van'] },

    { id: 'C4S', ref: '13194S', capacity: 4000, bay: 2700, width: 4250, clear: 4250, power: ['400/3~','230/3~'], base: 'baseless',
      anchors: '12× M16x145<br>C20/25, ≥ 170 mm', arms: 'Max 1341 mm', vehicleTypes: ['suv','van','lcv'] },

    { id: 'C5.5S', ref: '13998S', capacity: 5500, bay: 2810, width: 5150, clear: 4250, power: ['400/3~','230/3~'], base: 'baseless',
      anchors: '16× M16x145<br>C20/25, ≥ 170 mm', arms: 'Min 758 — Max 1505 mm', vehicleTypes: ['van','lcv'] }
  ];

  // ------------------ tipi veicolo + compatibilità ------------------
  const VEHICLE_TYPES = {
    any:   { it:'Qualsiasi', en:'Any', es:'Cualquiera', fr:'Tous', pt:'Qualquer' },
    city:  { it:'City / Utilitaria', en:'City / Small', es:'Ciudad / utilitario', fr:'Citadine', pt:'Citadino' },
    sedan: { it:'Berlina / Crossover', en:'Sedan / Crossover', es:'Berlina / Crossover', fr:'Berline / Crossover', pt:'Sedan / Crossover' },
    suv:   { it:'SUV / Pickup', en:'SUV / Pickup', es:'SUV / Pickup', fr:'SUV / Pickup', pt:'SUV / Pickup' },
    mpv:   { it:'MPV / Monovolume', en:'MPV / Minivan', es:'MPV / Monovolumen', fr:'Monospace', pt:'MPV / Monovolume' },
    van:   { it:'Van / Furgoni', en:'Van / LCV', es:'Furgón', fr:'Fourgon', pt:'Furgão' },
    lcv:   { it:'Veicoli lunghi / WAGON', en:'Long vehicles / WAGON', es:'Vehículos largos / WAGON', fr:'Véhicules longs / WAGON', pt:'Veículos longos / WAGON' }
  };

  // Valori tipici per auto-compilare i campi quando si cambia tipo veicolo
  const VEHICLE_DEFAULTS = {
    any:   null,
    city:  { kg: 1200, wb: 2400, use: 'auto', duty: 6 },
    sedan: { kg: 1650, wb: 2700, use: 'auto', duty: 6 },
    suv:   { kg: 2300, wb: 2900, use: 'auto', duty: 6 },
    mpv:   { kg: 2000, wb: 2800, use: 'mpv', duty: 6 },
    van:   { kg: 2800, wb: 3100, use: 'van',  duty: 10 },
    lcv:   { kg: 3200, wb: 3300, use: 'auto', duty: 10 }
  };

  function applyVehicleDefaults(typeKey) {
    const s = VEHICLE_DEFAULTS[typeKey];
    if (!s) return;
    const g = $('#inpGVW'), w = $('#inpWB'), u = $('#inpUse'), d = $('#inpDuty');
    if (g) g.value = s.kg;
    if (w) w.value = s.wb;
    if (u) u.value = s.use;
    if (d) d.value = String(s.duty);
    if (typeof calculate === 'function') calculate();
  }

  // ------------------ filtro risultati ------------------
  function makeFiltered() {
    const base = $('#inpBase')?.value || 'withbase';
    const gvw = num($('#inpGVW')?.value);
    const wb = num($('#inpWB')?.value);
    const duty = $('#inpDuty')?.value;
    const typeKey = $('#vehicleSel')?.value || 'any';

    return MODELS.filter(m => {
      if (m.base !== base) return false;
      if (typeKey !== 'any' && !m.vehicleTypes?.includes(typeKey)) return false;
      if (gvw && m.capacity < gvw + 200) return false;            // piccolo margine sicurezza
      if (wb && m.bay && wb > (m.bay + 200)) return false;        // passo troppo lungo per l’interasse
      if (duty === '10' && m.capacity < 3500 && typeKey !== 'city') return false; // uso intensivo: escludi quelli leggerini
      return true;
    });
  }

  // ------------------ render tabella ------------------
  function render(list) {
    const lang = document.documentElement.lang || 'it';
    const L = I18N[lang] || I18N.it;
    const tbody = $('#rows'); if (!tbody) return;
    tbody.innerHTML = '';

    const warnings = $('#warnings');
    warnings.innerHTML = '';
    const thk = num($('#inpThickness')?.value);
    if (thk && thk < 170) {
      const chip = document.createElement('div');
      chip.className = 'tag bad';
      chip.textContent = L.warn_slab;
      warnings.appendChild(chip);
    }

    list.forEach(m => {
      const tr = document.createElement('tr');

      const tdModel = document.createElement('td');
      tdModel.innerHTML = `
        <div style="font-weight:600">${m.id}</div>
        <div class="hint">ref. ${m.ref}</div>
        <div class="tag">${m.base === 'withbase' ? L.tag_withbase : L.tag_baseless}</div>
        <div class="chips" style="margin-top:6px;gap:6px">
          <a class="btn" href="${buildSheetUrl(m.id, m.base)}" target="_blank" rel="noopener">${L.btn_sheet}</a>
          <a class="btn" href="${buildManualUrl(m.id)}" target="_blank" rel="noopener">${L.btn_manual}</a>
          <a class="btn" href="${PDF.fondazioni}" target="_blank" rel="noopener">${L.btn_found}</a>
        </div>`;
      tr.appendChild(tdModel);

      const tdCap = document.createElement('td'); tdCap.textContent = fmt(m.capacity, 'kg'); tr.appendChild(tdCap);
      const tdBay = document.createElement('td'); tdBay.textContent = fmt(m.bay, 'mm'); tr.appendChild(tdBay);
      const tdW  = document.createElement('td'); tdW.textContent  = fmt(m.width, 'mm'); tr.appendChild(tdW);
      const tdH  = document.createElement('td'); tdH.textContent  = fmt(m.clear, 'mm'); tr.appendChild(tdH);
      const tdP  = document.createElement('td'); tdP.innerHTML    = (m.power || []).join(', '); tr.appendChild(tdP);
      const tdAnc= document.createElement('td'); tdAnc.innerHTML  = m.anchors || '-'; tr.appendChild(tdAnc);
      const tdAr = document.createElement('td'); tdAr.textContent = m.arms || '-'; tr.appendChild(tdAr);

      const tdNote = document.createElement('td');
      tdNote.innerHTML = `<span class="ok">✓</span> ${L.compat}`;
      tr.appendChild(tdNote);

      const tdSel = document.createElement('td');
      tdSel.innerHTML = `<input type="checkbox" class="selRow">`;
      tr.appendChild(tdSel);

      tbody.appendChild(tr);
    });
  }

  // ------------------ calcolo, reset ------------------
  function calculate() {
    render(makeFiltered().slice(0, 40));
  }
  function resetForm() {
    ['inpH','inpW','inpThickness','inpGVW','inpWB'].forEach(id => { const el = $('#'+id); if (el) el.value=''; });
    $('#inpConcrete').value = 'C20/25';
    $('#inpPower').value = '400/3~';
    $('#inpBase').value = 'withbase';
    $('#inpUse').value = 'auto';
    $('#inpDuty').value = '6';
    $('#vehicleSel').value = 'any';
    render(makeFiltered().slice(0, 40));
  }

  // ------------------ share / CSV / PDF multiplo / salva ------------------
  function shareConfig() {
    const params = new URLSearchParams({
      h: $('#inpH').value || '',
      w: $('#inpW').value || '',
      t: $('#inpThickness').value || '',
      c: $('#inpConcrete').value || '',
      p: $('#inpPower').value || '',
      b: $('#inpBase').value || '',
      g: $('#inpGVW').value || '',
      wb: $('#inpWB').value || '',
      u: $('#inpUse').value || '',
      d: $('#inpDuty').value || '',
      vt: $('#vehicleSel').value || '',
      lang: $('#langSel').value || (document.documentElement.lang || 'it')
    });
    const url = `${location.origin}${location.pathname}?${params.toString()}`;
    if (navigator.share) {
      navigator.share({ title: document.title, url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url).then(()=> alert('Link copiato negli appunti')).catch(()=>{});
    }
  }

  function selectedModels() {
    const rows = $$('#rows tr');
    const out = [];
    rows.forEach(r => {
      const cb = r.querySelector('.selRow');
      if (cb && cb.checked) {
        const id = r.querySelector('td:first-child div')?.textContent.trim();
        const m = MODELS.find(x => x.id === id);
        if (m) out.push(m);
      }
    });
    return out.length ? out : makeFiltered().slice(0, 10);
  }

  function exportCSV() {
    const L = I18N[document.documentElement.lang || 'it'];
    const list = selectedModels();
    const head = [
      L.th_model,'ref','base',L.th_cap,'bay(mm)','width(mm)','clear(mm)',L.th_power,'anchors','arms'
    ].join(';');
    const body = list.map(m => [
      m.id, m.ref, (m.base==='withbase'?L.tag_withbase:L.tag_baseless),
      m.capacity, m.bay, m.width, m.clear, (m.power||[]).join('/'), (m.anchors||'').replace(/<br>/g,' '), (m.arms||'')
    ].join(';')).join('\n');
    const blob = new Blob([head+'\n'+body], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cascos_config.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function openPDFMultiple() {
    selectedModels().forEach(m => {
      window.open(buildSheetUrl(m.id, m.base), '_blank', 'noopener');
    });
  }

  function saveJSON() {
    const cfg = {
      h: $('#inpH').value, w: $('#inpW').value, t: $('#inpThickness').value,
      concrete: $('#inpConcrete').value, power: $('#inpPower').value, base: $('#inpBase').value,
      g: $('#inpGVW').value, wb: $('#inpWB').value, use: $('#inpUse').value, duty: $('#inpDuty').value,
      vehType: $('#vehicleSel').value, lang: $('#langSel').value
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(cfg,null,2)], {type:'application/json'}));
    a.download = 'cascos_config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ------------------ init vehicle filter ------------------
  function initVehicleFilter() {
    const vSel = $('#vehicleSel'); if (!vSel) return;
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
  }

  // ------------------ restore da URL ------------------
  function restoreFromURL() {
    const q = new URLSearchParams(location.search);
    const get = (k) => q.get(k);
    const map = {
      inpH:'h', inpW:'w', inpThickness:'t', inpConcrete:'c', inpPower:'p',
      inpBase:'b', inpGVW:'g', inpWB:'wb', inpUse:'u', inpDuty:'d'
    };
    Object.entries(map).forEach(([id,key]) => { const el = $('#'+id); if (el && get(key)!=null) el.value = get(key); });
    if (get('lang')) { $('#langSel').value = get('lang'); applyLang(get('lang')); }
    if (get('vt')) { $('#vehicleSel').value = get('vt'); applyVehicleDefaults(get('vt')); }
  }

  // ------------------ PWA ------------------
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt=e; $('#installBtn').hidden=false; });
  $('#installBtn')?.addEventListener('click', async() => { if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; });

  // ------------------ wireup ------------------
  function init() {
    // lingua
    const langSel = $('#langSel');
    if (langSel) langSel.addEventListener('change', () => applyLang(langSel.value));
    applyLang(langSel?.value || 'it');

    // vehicle filter
    initVehicleFilter();

    // azioni
    $('#calcBtn')?.addEventListener('click', calculate);
    $('#resetBtn')?.addEventListener('click', resetForm);
    $('#shareBtn')?.addEventListener('click', shareConfig);
    $('#csvBtn')?.addEventListener('click', exportCSV);
    $('#pdfMultiBtn')?.addEventListener('click', openPDFMultiple);
    $('#saveBtn')?.addEventListener('click', saveJSON);

    // ripristino da URL
    restoreFromURL();

    // primo render
    render(makeFiltered().slice(0, 40));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
