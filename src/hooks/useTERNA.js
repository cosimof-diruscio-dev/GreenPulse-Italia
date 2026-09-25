import { useEffect, useState } from "react";
import * as terna from "../services/ternaData.js";
import {
  normalizeRegion,
  normalizeProvince,
  provinceToRegion,
} from "../data/regions.js";

// Decisione di dominio (vedi colloquio con il proprietario del progetto):
// "Accumulo stand alone" è uno stoccaggio, non una fonte di produzione.
// Viene comunque conteggiato come rinnovabile perché l'energia che
// accumula proviene da impianti rinnovabili — non introduce quindi
// energia fossile nel totale; il criterio è "origine rinnovabile
// dell'energia", non "tecnologia di produzione".
const RENEWABLE_SOURCES = new Set([
  "Idrico",
  "Fotovoltaico",
  "Eolico",
  "Eolico Offshore",
  "Geotermico",
  "Bioenergie",
  "Accumulo stand alone",
]);

const SOURCE_META = {
  Idrico: { icon: "💧", short: "Idrico", type: "renewable" },
  Fotovoltaico: { icon: "☀️", short: "Fotovoltaico", type: "renewable" },
  Eolico: { icon: "💨", short: "Eolico", type: "renewable" },
  "Eolico Offshore": { icon: "🌊", short: "Eolico off.", type: "renewable" },
  Geotermico: { icon: "🌋", short: "Geotermico", type: "renewable" },
  Bioenergie: { icon: "🌿", short: "Bioenergie", type: "renewable" },
  "Accumulo stand alone": { icon: "🔋", short: "Accumulo", type: "renewable" },
  Termoelettrico: { icon: "🏭", short: "Termoelettrico", type: "fossil" },
};

export default function useTERNA(region) {
  const [state, setState] = useState({
    production: [],
    capacity: [],
    plants: [],
    fuels: [],
    emissions: [],
    demand: [],
    provincialPlants: [],
    renewableMW: 0,
    fossilMW: 0,
    regionYoY: null,
    national: {
      totalGWh: 0,
      renewableGWh: 0,
      renewablePct: 0,
      bySource: {},
      byYear: [],
    },
    regions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        const [
          productionAll,
          capacityAll,
          plantsAll,
          fuelsAll,
          emissionsAll,
          demandAll,
          provincialAll,
          yearlyAll,
          regionalYoY,
          regions,
        ] = await Promise.all([
          terna.getProduzioneByRegionSource(),
          terna.getPotenzaRinnovabileByRegion(),
          terna.getPotenzaRegionaleAll(),
          terna.getProduzioneLordaByRegionFuel(),
          terna.getEmissioneByRegionFuel(),
          terna.getDomandaByRegion(),
          terna.getPotenzaProvincialeAll(),
          terna.getProduzioneAnnualePerFonte(),
          terna.getProduzioneYoYRegionale(),
          terna.getAllRegions(),
        ]);

        if (cancelled) return;

        const sortByValue = (a, b) => (b.value ?? 0) - (a.value ?? 0);

        const matchesRegion = (name) => normalizeRegion(name) === region;

        const production = productionAll
          .filter((d) => matchesRegion(d.region))
          .map((d) => ({
            source: d.source,
            value: d.value ?? 0,
            type: SOURCE_META[d.source]?.type ?? "fossil",
            ...(SOURCE_META[d.source] ?? { icon: "⚡", short: d.source }),
          }))
          .sort(sortByValue);

        const capacity = capacityAll
          .filter((d) => matchesRegion(d.region))
          .map((d) => ({
            source: d.source,
            value: d.value ?? 0,
            type: "renewable",
            ...(SOURCE_META[d.source] ?? { icon: "⚡", short: d.source }),
          }))
          .sort(sortByValue);

        const plants = plantsAll
          .filter((d) => matchesRegion(d.region))
          .map((d) => ({
            type: SOURCE_META[d.type]?.type ?? "fossil",
            subtype: d.type,
            capacity: d.value ?? 0,
          }))
          .sort((a, b) => b.capacity - a.capacity);

        const fuels = fuelsAll
          .filter((d) => matchesRegion(d.region))
          .map((d) => ({ fuel: d.fuel, value: d.value ?? 0 }))
          .sort(sortByValue);

        const emissions = emissionsAll
          .filter((d) => matchesRegion(d.region))
          .map((d) => ({ fuel: d.fuel, value: d.value ?? 0 }))
          .sort(sortByValue);

        const demand = demandAll
          .filter((d) => matchesRegion(d.region))
          .map((d) => ({
            tipologia: d.tipologia,
            value: d.value ?? 0,
            yoYValue: d.yoYValue,
          }))
          .sort(sortByValue);

        const provincialPlants = provincialAll
          .filter((d) => matchesRegion(provinceToRegion(d.province)))
          .map((d) => ({
            province: normalizeProvince(d.province),
            type: SOURCE_META[d.type]?.type ?? "fossil",
            subtype: d.type,
            capacity: d.value ?? 0,
          }))
          .sort((a, b) => b.capacity - a.capacity);

        const renewableMW = capacity.reduce((s, c) => s + c.value, 0);
        const fossilMW = plants
          .filter((p) => p.type === "fossil")
          .reduce((s, p) => s + p.capacity, 0);

        const bySource = {};
        let totalGWh = 0,
          renewableGWh = 0;
        for (const d of productionAll) {
          bySource[d.source] = (bySource[d.source] || 0) + (d.value ?? 0);
          totalGWh += d.value ?? 0;
          if (RENEWABLE_SOURCES.has(d.source)) renewableGWh += d.value ?? 0;
        }

        const byYearMap = {};
        for (const d of yearlyAll) {
          if (!byYearMap[d.year])
            byYearMap[d.year] = { year: d.year, renewable: 0, fossil: 0 };
          const isRenewable = RENEWABLE_SOURCES.has(d.source);
          if (isRenewable) byYearMap[d.year].renewable += d.value ?? 0;
          else byYearMap[d.year].fossil += d.value ?? 0;
        }
        const byYear = Object.values(byYearMap).sort((a, b) => a.year - b.year);

        const regionYoY = regionalYoY.find((d) => matchesRegion(d.region));

        const national = {
          totalGWh,
          renewableGWh,
          renewablePct: totalGWh > 0 ? (renewableGWh / totalGWh) * 100 : 0,
          bySource,
          byYear,
        };

        setState({
          production,
          capacity,
          plants,
          fuels,
          emissions,
          demand,
          provincialPlants,
          renewableMW,
          fossilMW,
          regionYoY,
          national,
          regions,
          loading: false,
          error: null,
        });
      } catch (e) {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: e.message ?? "Errore caricamento dati",
          }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [region]);

  return state;
}
