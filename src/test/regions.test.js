/* global process */
// Test di copertura dati per le 20 regioni italiane su dataset reali TERNA.
// Verifica che ogni regione selezionabile nell'UI abbia i propri dati nei JSON
// (regioni + province) e che i nomi dei dataset combacino con i nomi canonici.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  REGIONS,
  REGION_LIST,
  normalizeRegion,
  normalizeProvince,
  provinceToRegion,
} from '../data/regions.js';

function loadDataset(name) {
  const file = join(process.cwd(), 'src', 'data', 'energy-datasets', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

function regionKeysOf(dataset) {
  const { indexed } = loadDataset(dataset);
  return new Set(Object.keys(indexed).map((k) => k.split('|')[0]));
}

function regionTotal(dataset, name) {
  const { indexed } = loadDataset(dataset);
  let total = 0;
  for (const [key, entries] of Object.entries(indexed)) {
    const region = normalizeRegion(key.split('|')[0]);
    if (region === name) {
      for (const e of entries) total += e.value ?? 0;
    }
  }
  return total;
}

const REGION_LEVEL_DATASETS = [
  'produzioneRegionalePerFonte',
  'potenzaEfficienteRegionaleFonteRinnovabile',
  'potenzaEfficienteRegionalePerFonte',
  'produzioneLordaRegionalePerCombustibile',
  'emissioneRegionalePerCombustibile',
  'domandaTotaleRegionale',
  'produzioneYoYRegionali',
];

describe('coverage dataset regionali (dati reali TERNA)', () => {
  it('ci sono esattamente 20 regioni selezionabili', () => {
    expect(REGION_LIST).toHaveLength(20);
    expect(Object.keys(REGIONS).length).toBe(20);
  });

  it.each(REGION_LEVEL_DATASETS)('%s contiene tutte le 20 regioni', (dataset) => {
    const keys = regionKeysOf(dataset);
    const normalized = new Set([...keys].map(normalizeRegion));
    const missing = REGION_LIST.filter((r) => !normalized.has(r));
    expect(missing).toEqual([]);
  });

  it('ogni regione ha produzione, capacità, combustibili ed emissioni positive', () => {
    const checks = {
      produzioneRegionalePerFonte: REGION_LIST,
      potenzaEfficienteRegionaleFonteRinnovabile: REGION_LIST,
      potenzaEfficienteRegionalePerFonte: REGION_LIST,
      produzioneLordaRegionalePerCombustibile: REGION_LIST,
      emissioneRegionalePerCombustibile: REGION_LIST,
    };
    for (const [dataset, regions] of Object.entries(checks)) {
      for (const region of regions) {
        const total = regionTotal(dataset, region);
        expect(total, `${dataset} ⟶ ${region} pari a 0`).toBeGreaterThan(0);
      }
    }
  });

  it('la domanda elettrica è presente per ogni regione (saldo import/export può essere negativo)', () => {
    const { indexed } = loadDataset('domandaTotaleRegionale');
    for (const region of REGION_LIST) {
      const valori = [];
      for (const [key, entries] of Object.entries(indexed)) {
        if (normalizeRegion(key.split('|')[0]) === region) {
          for (const e of entries) valori.push({ tipologia: key.split('|')[1], value: e.value ?? 0 });
        }
      }
      expect(valori.length, `domanda ⟶ ${region} senza voci`).toBeGreaterThan(0);
      const domandaFisica = valori
        .filter(v => v.tipologia !== 'Saldo import/export')
        .reduce((s, v) => s + v.value, 0);
      expect(domandaFisica, `${region} domanda fisica negativa`).toBeGreaterThan(0);
    }
  });

  it("la regione 'Valle d'Aosta' è normalizzata a partire da entrambe le varianti dei dataset", () => {
    expect(normalizeRegion("Valle d'Aosta")).toBe("Valle d'Aosta");
    expect(normalizeRegion("Valle D'Aosta")).toBe("Valle d'Aosta");
    expect(regionTotal('produzioneRegionalePerFonte', "Valle d'Aosta")).toBeGreaterThan(0);
    expect(regionTotal('potenzaEfficienteRegionalePerFonte', "Valle d'Aosta")).toBeGreaterThan(0);
  });
});

describe('coverage dati provinciali', () => {
  const PROVINCE_DATASETS = [
    'produzioneProvincialePerFonte',
    'potenzaEfficienteProvincialePerFonte',
    'potenzaEfficienteProvincialeFonteRinnovabile',
  ];

  it('ogni provincia dei dataset è mappabile a una delle 20 regioni', () => {
    const unmatched = new Set();
    for (const dataset of PROVINCE_DATASETS) {
      const { indexed } = loadDataset(dataset);
      for (const key of Object.keys(indexed)) {
        const province = key.split('|')[0];
        if (!provinceToRegion(province)) unmatched.add(province);
      }
    }
    expect([...unmatched]).toEqual([]);
  });

  it('tutte le 20 regioni hanno almeno un impianto provinciale registrato', () => {
    const { indexed } = loadDataset('potenzaEfficienteProvincialePerFonte');
    const covered = new Set();
    for (const key of Object.keys(indexed)) {
      const region = provinceToRegion(key.split('|')[0]);
      if (region) covered.add(region);
    }
    const missing = REGION_LIST.filter((r) => !covered.has(r));
    expect(missing).toEqual([]);
  });

  it('normalizza i nomi provincia non standard dei dataset', () => {
    expect(normalizeProvince('Bolzano/Bozen')).toBe('Bolzano');
    expect(normalizeProvince('Pesaro E Urbino')).toBe('Pesaro e Urbino');
    expect(normalizeProvince('Reggio Di Calabria')).toBe('Reggio Calabria');
    expect(normalizeProvince("Reggio Nell'Emilia")).toBe('Reggio Emilia');
    expect(normalizeProvince('Sud Sardegna')).toBe('Sud Sardegna');
    expect(provinceToRegion('Sud Sardegna')).toBe('Sardegna');
  });
});