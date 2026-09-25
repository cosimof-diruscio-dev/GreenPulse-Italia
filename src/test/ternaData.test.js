// Test per src/services/ternaData.js
// Usa un mock globale di fetch per evitare chiamate di rete reali

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as ternaData from '../services/ternaData.js';

// Mock dei dataset (un sottoinsieme realistico per i test)
const mockDatasets = {
  produzioneYoYRegionali: {
    indexed: {
      'Lombardia': [{ key: 'Lombardia', value: 0, yoYValue: 2.5, yoYPercentage: true }],
      'Toscana':   [{ key: 'Toscana',   value: 0, yoYValue: -1.2, yoYPercentage: true }],
    },
  },
  produzioneRegionalePerFonte: {
    indexed: {
      'Lombardia|Fotovoltaico': [{ key: 'Lombardia|Fotovoltaico', value: 1200, yoYValue: 15, yoYPercentage: true }],
      'Lombardia|Gas':          [{ key: 'Lombardia|Gas',          value: 5000, yoYValue: -3, yoYPercentage: true }],
      'Toscana|Fotovoltaico':   [{ key: 'Toscana|Fotovoltaico',   value: 800,  yoYValue: 8,  yoYPercentage: true }],
    },
  },
  produzioneProvincialePerFonte: {
    indexed: {
      'Milano|Fotovoltaico': [{ key: 'Milano|Fotovoltaico', value: 600 }],
      'Roma|Solare':         [{ key: 'Roma|Solare',         value: 900 }],
    },
  },
  produzionePerFonteAnnuale: {
    indexed: {
      '2023|Fotovoltaico': [{ key: '2023|Fotovoltaico', value: 30000 }],
      '2024|Fotovoltaico': [{ key: '2024|Fotovoltaico', value: 33000 }],
    },
  },
  produzioneLordaRegionalePerCombustibile: {
    indexed: {
      'Lombardia|Gas naturale': [{ key: 'Lombardia|Gas naturale', value: 20000 }],
    },
  },
  potenzaEfficienteRegionaleFonteRinnovabile: {
    indexed: {
      'Lombardia|Fotovoltaico': [{ key: 'Lombardia|Fotovoltaico', value: 2500 }],
    },
  },
  potenzaEfficienteRegionalePerFonte: {
    indexed: {
      'Lombardia|Fotovoltaico': [{ key: 'Lombardia|Fotovoltaico', value: 2500 }],
    },
  },
  potenzaEfficienteProvincialeFonteRinnovabile: {
    indexed: {
      'Milano|Fotovoltaico': [{ key: 'Milano|Fotovoltaico', value: 200 }],
    },
  },
  potenzaEfficienteProvincialePerFonte: {
    indexed: {
      'Milano|Fotovoltaico': [{ key: 'Milano|Fotovoltaico', value: 200 }],
    },
  },
  emissioneRegionalePerCombustibile: {
    indexed: {
      'Lombardia|Gas naturale': [{ key: 'Lombardia|Gas naturale', value: 5.2 }],
      'Toscana|Gas naturale':   [{ key: 'Toscana|Gas naturale',   value: 1.1 }],
      'Sicilia|Carbone':        [{ key: 'Sicilia|Carbone',        value: 3.0 }],
    },
  },
  domandaTotaleRegionale: {
    indexed: {
      'Lombardia|Rinnovabili':   [{ key: 'Lombardia|Rinnovabili',   value: 8000,  yoYValue: 5,  yoYPercentage: true }],
      'Lombardia|Tradizionali':  [{ key: 'Lombardia|Tradizionali',  value: 25000, yoYValue: -2, yoYPercentage: true }],
    },
  },
};

// Mock fetch globale
beforeEach(() => {
  globalThis.fetch = vi.fn(async (url) => {
    // Estrai il nome del dataset dall'URL: /data/energy-datasets/<name>.json
    const match = url.match(/\/([^/]+)\.json$/);
    const name = match ? match[1] : null;
    const data = name && mockDatasets[name];
    return {
      ok: !!data,
      status: data ? 200 : 404,
      json: async () => data || { indexed: {}, flat: [], totalRecords: 0 },
    };
  });
});

describe('ternaData.js', () => {

  describe('getProduzioneByRegionSource', () => {
    it('restituisce entries con region, source, value', async () => {
      const data = await ternaData.getProduzioneByRegionSource();
      expect(data).toHaveLength(3);
      expect(data[0]).toMatchObject({ region: 'Lombardia', source: 'Fotovoltaico', value: 1200 });
    });

    it('esposrta YoY quando presente', async () => {
      const data = await ternaData.getProduzioneByRegionSource();
      const lombardiaPV = data.find(d => d.region === 'Lombardia' && d.source === 'Fotovoltaico');
      expect(lombardiaPV.yoYValue).toBe(15);
      expect(lombardiaPV.yoYPercentage).toBe(true);
    });
  });

  describe('getProduzioneAnnualePerFonte', () => {
    it('parsa anno come numero e ordina per anno crescente', async () => {
      const data = await ternaData.getProduzioneAnnualePerFonte();
      expect(data[0]).toMatchObject({ year: 2023, source: 'Fotovoltaico' });
      expect(data[1]).toMatchObject({ year: 2024, source: 'Fotovoltaico' });
      expect(typeof data[0].year).toBe('number');
    });
  });

  describe('getAllRegions', () => {
    it('restituisce regioni uniche ordinate', async () => {
      const regions = await ternaData.getAllRegions();
      expect(regions).toContain('Lombardia');
      expect(regions).toContain('Toscana');
      expect(new Set(regions).size).toBe(regions.length); // univoche
    });
  });

});
