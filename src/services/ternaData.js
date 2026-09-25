const DATASETS = [
  "produzioneYoYRegionali",
  "produzioneRegionalePerFonte",
  "produzioneProvincialePerFonte",
  "produzionePerFonteAnnuale",
  "produzioneLordaRegionalePerCombustibile",
  "potenzaEfficienteRegionaleFonteRinnovabile",
  "potenzaEfficienteRegionalePerFonte",
  "potenzaEfficienteProvincialeFonteRinnovabile",
  "potenzaEfficienteProvincialePerFonte",
  "emissioneRegionalePerCombustibile",
  "domandaTotaleRegionale",
];

const cache = new Map();

async function loadDataset(name) {
  if (cache.has(name)) return cache.get(name);
  try {
    const response = await fetch(`/data/energy-datasets/${name}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    cache.set(name, data);
    return data;
  } catch (e) {
    console.warn(`ternaData: failed to load ${name}`, e);
    return { indexed: {}, flat: [], totalRecords: 0 };
  }
}

export async function getAllRegions() {
  const sets = [
    "produzioneRegionalePerFonte",
    "produzioneYoYRegionali",
    "domandaTotaleRegionale",
  ];
  const regions = new Set();
  for (const name of sets) {
    const { indexed } = await loadDataset(name);
    for (const key of Object.keys(indexed)) {
      const region = key.split("|")[0];
      if (region) regions.add(region);
    }
  }
  return Array.from(regions).sort();
}


export async function getProduzioneByRegionSource() {
  const { indexed } = await loadDataset("produzioneRegionalePerFonte");
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [region, source] = key.split("|");
    for (const e of entries) {
      out.push({
        region,
        source,
        value: e.value,
        yoYValue: e.yoYValue,
        yoYPercentage: e.yoYPercentage,
      });
    }
  }
  return out;
}

export async function getProduzioneAnnualePerFonte() {
  const { indexed } = await loadDataset("produzionePerFonteAnnuale");
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [year, source] = key.split("|");
    for (const e of entries)
      out.push({ year: parseInt(year), source, value: e.value });
  }
  return out.sort((a, b) => a.year - b.year);
}

export async function getProduzioneYoYRegionale() {
  const { indexed } = await loadDataset("produzioneYoYRegionali");
  const out = [];
  for (const [region, entries] of Object.entries(indexed)) {
    for (const e of entries)
      out.push({
        region,
        yoYValue: e.yoYValue,
        yoYPercentage: e.yoYPercentage,
      });
  }
  return out;
}

export async function getPotenzaRinnovabileByRegion() {
  const { indexed } = await loadDataset(
    "potenzaEfficienteRegionaleFonteRinnovabile",
  );
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [region, source] = key.split("|");
    for (const e of entries)
      out.push({
        region,
        source,
        value: e.value,
        yoYValue: e.yoYValue,
        yoYPercentage: e.yoYPercentage,
      });
  }
  return out;
}

export async function getPotenzaRinnovabileByProvince() {
  const { indexed } = await loadDataset(
    "potenzaEfficienteProvincialeFonteRinnovabile",
  );
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [province, source] = key.split("|");
    for (const e of entries)
      out.push({
        province,
        source,
        value: e.value,
        yoYValue: e.yoYValue,
        yoYPercentage: e.yoYPercentage,
      });
  }
  return out;
}

export async function getPotenzaRegionaleAll() {
  const { indexed } = await loadDataset("potenzaEfficienteRegionalePerFonte");
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [region, type] = key.split("|");
    for (const e of entries) out.push({ region, type, value: e.value });
  }
  return out;
}

export async function getPotenzaProvincialeAll() {
  const { indexed } = await loadDataset("potenzaEfficienteProvincialePerFonte");
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [province, type] = key.split("|");
    for (const e of entries) out.push({ province, type, value: e.value });
  }
  return out;
}

export async function getEmissioneByRegionFuel() {
  const { indexed } = await loadDataset("emissioneRegionalePerCombustibile");
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [region, fuel] = key.split("|");
    for (const e of entries) out.push({ region, fuel, value: e.value });
  }
  return out;
}

export async function getDomandaByRegion() {
  const { indexed } = await loadDataset("domandaTotaleRegionale");
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [region, tipologia] = key.split("|");
    for (const e of entries)
      out.push({
        region,
        tipologia,
        value: e.value,
        yoYValue: e.yoYValue,
        yoYPercentage: e.yoYPercentage,
      });
  }
  return out;
}

export async function getProduzioneLordaByRegionFuel() {
  const { indexed } = await loadDataset(
    "produzioneLordaRegionalePerCombustibile",
  );
  const out = [];
  for (const [key, entries] of Object.entries(indexed)) {
    const [region, fuel] = key.split("|");
    for (const e of entries) out.push({ region, fuel, value: e.value });
  }
  return out;
}

export async function preloadAll() {
  await Promise.all(DATASETS.map(loadDataset));
}

export default {
  loadDataset,
  preloadAll,
  getAllRegions,
  getProduzioneByRegionSource,
  getProduzioneAnnualePerFonte,
  getProduzioneYoYRegionale,
  getPotenzaRinnovabileByRegion,
  getPotenzaRinnovabileByProvince,
  getPotenzaRegionaleAll,
  getPotenzaProvincialeAll,
  getEmissioneByRegionFuel,
  getDomandaByRegion,
  getProduzioneLordaByRegionFuel,
};
