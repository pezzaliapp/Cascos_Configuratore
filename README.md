# CASCOS — Configuratore 2 Colonne (PWA)

PWA offline‑ready per suggerire i modelli CASCOS a 2 colonne in base a vincoli d’officina e veicolo tipo.

## Come usare
1. Compila **Vincoli officina** e **Veicolo**.
2. Clicca **Calcola suggerimenti**.
3. Esporta i dati con **💾 Salva**.
4. Installa su smartphone/desktop con **➕ Installa**.

## Dati e assunzioni
- **Margine portata**: 25% (peso × 1.25).
- **Calcestruzzo**: C20/25 con **soletta ≥ 170 mm**.
- **Avvertenza**: i dati sono indicativi. Fare riferimento ai manuali ufficiali inclusi in `/docs`.

## Struttura
```
index.html
app.js
manifest.webmanifest
sw.js
icons/
docs/
```
