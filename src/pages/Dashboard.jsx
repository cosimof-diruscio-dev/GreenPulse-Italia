import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { CITIES } from "../data/cities";
import { getRegionStats } from "../data/regions";
import useEnergyData from "../hooks/useEnergyData";
import useTERNA from "../hooks/useTERNA";
import RegionSelector from "../components/RegionSelector";
import CitySelector from "../components/CitySelector";
import EnergyList from "../components/EnergyList";
import SolarWidget from "../components/SolarWidget";
import SolarBarChart from "../components/charts/SolarBarChart";
import CO2LineChart from "../components/charts/CO2LineChart";
import EnergyAreaChart from "../components/charts/EnergyAreaChart";
import HistoryChart from "../components/charts/HistoryChart";
import ProductionBars from "../components/ProductionBars";
import LiveCard from "../components/LiveCard";
import CO2Badge from "../components/CO2Badge";
import {
  IconSun, IconWind, IconLeaf, IconLoader2, IconZap, IconDroplets,
  IconFlame, IconMap, IconChevronRight, IconFactory,
} from "../components/icons";

const card = (dk) =>
  `rounded-2xl p-4 border ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`;

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const region = useAppStore((s) => s.region);
  const selectedCity = useAppStore((s) => s.selectedCity);
  const filter = useAppStore((s) => s.filter);
  const setFilter = useAppStore((s) => s.setFilter);
  const dk = theme === "dark";

  const { lat, lng } = selectedCity ?? CITIES[0];
  const { data, loading, error } = useEnergyData(lat, lng);
  const cur = data?.current ?? null;
  const hourly = data?.hourly ?? null;

  const { production: regionProduction = [], capacity: regionCapacity = [],
          plants: regionPlants = [], demand: regionDemand = [],
          renewableMW = 0, fossilMW = 0, regionYoY = null,
          national: nationalReal = { totalGWh: 0, renewableGWh: 0, renewablePct: 0, bySource: {}, byYear: [] } } = useTERNA(region);

  const regionStats = getRegionStats({ renewableMW, fossilMW });

  useEffect(() => {
    document.title = `GreenPulse — ${selectedCity?.name ?? region}`;
  }, [selectedCity, region]);

  // Fonti per EnergyList: TERNA GWh + dato live Open-Meteo per Fotovoltaico/Eolico
  const sources = regionProduction.map((p) => {
    const live = p.source === "Fotovoltaico" ? cur?.solarNow
              : p.source === "Eolico"        ? cur?.windNow
              : null;
    return {
      id: p.source, name: p.short, icon: p.icon, type: p.type,
      value: live ?? p.value,
      unit: live != null ? (p.source === "Fotovoltaico" ? "W/m²" : "km/h") : "GWh",
    };
  });
  const filtered = filter === "all" ? sources : sources.filter((s) => s.type === filter);
  const topPlants = regionPlants.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">

      {/* ── Selettori regione e città ── */}
      <div className={`${card(dk)} space-y-4`}>
        <h2 className={`text-base font-bold text-center ${dk ? "text-gray-100" : "text-gray-800"}`}>
          Dashboard Energetica — <span className="text-emerald-500">{selectedCity?.name ?? region}</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <RegionSelector />
          <div className={`hidden sm:block w-px h-8 ${dk ? "bg-gray-700" : "bg-gray-200"}`} />
          <CitySelector />
        </div>
      </div>

      {/* ── Loading / Error banners ── */}
      {loading && (
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-sm">
          <IconLoader2 size={15} className="animate-spin shrink-0" />
          Recupero dati per <strong>{selectedCity?.name ?? region}</strong>...
        </div>
      )}
      {error && !loading && (
        <div className="py-3 px-4 rounded-xl text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
          ⚠️ Errore API: {error}
        </div>
      )}

      {/* ── 3 Card dati live ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={card(dk)}>
          <LiveCard
            icon={<IconSun size={16} className="text-amber-500" />}
            title="Solare · W/m²"
            loading={loading}
            value={cur?.solarNow}
            unit=" W/m²"
            pct={cur?.solarPct}
            pctText={`${cur?.solarPct ?? 0}% del potenziale`}
            pctColor="text-amber-500"
            barColor="bg-amber-400"
            footer={!cur?.isDay ? <p className="text-xs text-blue-400 mt-1">🌙 Notte</p> : null}
          />
        </div>
        <div className={card(dk)}>
          <LiveCard
            icon={<IconWind size={16} className="text-blue-500" />}
            title="Vento · km/h"
            loading={loading}
            value={cur?.windNow}
            unit=" km/h"
            pct={cur?.windPct}
            pctText={`${cur?.windPct ?? 0}% potenziale eolico`}
            pctColor="text-blue-500"
            barColor="bg-blue-400"
          />
        </div>
        <div className={card(dk)}>
          <LiveCard
            icon={<IconLeaf size={16} className="text-emerald-500" />}
            title="Quota Verde · %"
            loading={loading}
            value={cur?.renewablePct}
            unit="%"
            pct={cur?.renewablePct}
            pctText={cur ? `🌡️ ${cur.tempNow}°C · ☁️ ${cur.cloudNow}%` : null}
            pctColor={cur?.renewablePct >= 60 ? "text-emerald-500" : cur?.renewablePct >= 30 ? "text-amber-500" : "text-red-500"}
            barColor={cur?.renewablePct >= 60 ? "bg-emerald-500" : cur?.renewablePct >= 30 ? "bg-amber-400" : "bg-red-400"}
          />
        </div>
      </div>

      <CO2Badge value={cur?.co2Now} dk={dk} />

      {/* ── SolarWidget ── */}
      <div className={card(dk)}>
        <SolarWidget currentData={cur} cityName={selectedCity?.name ?? region} loading={loading} />
      </div>

      {/* ── Filtro + lista fonti ── */}
      <div className={`${card(dk)} overflow-hidden`}>
        <div className="flex flex-wrap gap-2 p-4 border-b dark:border-gray-800 border-gray-100">
          {[
            { v: "all",       l: "Tutte",            a: "bg-cyan-500"    },
            { v: "renewable", l: "🌿 Rinnovabili",   a: "bg-emerald-500" },
            { v: "fossil",    l: "🏭 Fossili",       a: "bg-orange-500"  },
          ].map(({ v, l, a }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === v
                  ? `${a} text-white shadow`
                  : dk ? "bg-gray-800 text-gray-300 border border-gray-700"
                       : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {l}
            </button>
          ))}
        </div>
        <EnergyList sources={filtered} />
      </div>

      {/* ── Riepilogo impianti regione corrente ── */}
      <div className={card(dk)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconMap size={15} className="text-emerald-500" />
            <h3 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Impianti — {region}
            </h3>
          </div>
          <button onClick={() => navigate(`/regioni/${region}`)}
            className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
            Dettaglio completo <IconChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {topPlants.length === 0 ? (
            <p className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              Nessun impianto registrato nei dataset TERNA per questa regione.
            </p>
          ) : topPlants.map((plant, i) => {
            const isRen = plant.type === "renewable";
            return (
              <div key={`${plant.subtype}-${i}`} className="flex items-center gap-3">
                <span className="text-sm w-6 text-center shrink-0">{isRen ? "🌿" : "🏭"}</span>
                <span className={`text-xs flex-1 ${dk ? "text-gray-300" : "text-gray-700"}`}>
                  {plant.subtype}
                </span>
                <span className={`text-xs font-bold w-20 text-right tabular-nums ${isRen ? "text-emerald-500" : "text-orange-500"}`}>
                  {plant.capacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
                </span>
              </div>
            );
          })}
        </div>
        <div className={`mt-4 pt-3 border-t flex items-center justify-between ${dk ? "border-gray-800" : "border-gray-100"}`}>
          <span className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>
            Quota rinnovabile regione · {regionStats.renewableMW.toLocaleString()} MW
            <span className="opacity-60"> / {regionStats.totalMW.toLocaleString()} MW</span>
          </span>
          <span className={`text-sm font-bold
            ${regionStats.renewablePct >= 60 ? "text-emerald-500" : regionStats.renewablePct >= 40 ? "text-amber-500" : "text-orange-500"}`}>
            {regionStats.renewablePct}%
          </span>
        </div>
        {regionYoY && regionYoY.yoYValue != null && (
          <p className={`text-[10px] mt-2 ${dk ? "text-gray-500" : "text-gray-400"}`}>
            Produzione regionale YoY 2024: {" "}
            <span className={regionYoY.yoYValue > 0 ? "text-emerald-500" : "text-red-500"}>
              {regionYoY.yoYValue > 0 ? "▲ +" : "▼ "}{regionYoY.yoYValue.toFixed(1)}%
            </span>
          </p>
        )}
      </div>

      {/* ── Domanda regionale (bilancio produzione vs fabbisogno) ── */}
      {regionDemand.length > 0 && (
        <div className={`${card(dk)} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <IconFactory size={15} className="text-cyan-500" />
            <h3 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Domanda elettrica — {region}
            </h3>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              GWh · fonte: TERNA
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regionDemand.map(d => (
              <div key={d.tipologia} className={`rounded-xl p-3 border ${dk ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
                <p className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>{d.tipologia}</p>
                <p className={`text-base font-bold tabular-nums ${dk ? "text-gray-100" : "text-gray-800"}`}>
                  {d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} GWh
                </p>
                {d.yoYValue != null && (
                  <p className={`text-[10px] mt-0.5 ${d.yoYValue > 0 ? "text-emerald-500" : "text-red-500"}`}>
                    YoY {d.yoYValue > 0 ? "+" : ""}{d.yoYValue.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Riepilogo nazionale ── */}
      <div className={`${card(dk)} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <IconZap size={15} className="text-emerald-500" />
          <h3 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
            Riepilogo nazionale — produzione TERNA
          </h3>
          <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-semibold
            ${nationalReal.renewablePct >= 50
              ? (dk ? "bg-emerald-950 text-emerald-400" : "bg-emerald-50 text-emerald-700")
              : (dk ? "bg-orange-950 text-orange-400" : "bg-orange-50 text-orange-700")}`}>
            {nationalReal.renewablePct.toFixed(1)}% rinnovabile
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { key: "Idrico",         label: "Idroelettrico",  icon: <IconDroplets size={14} className="text-cyan-500" />   },
            { key: "Fotovoltaico",   label: "Fotovoltaico",   icon: <IconSun      size={14} className="text-amber-500" />  },
            { key: "Eolico",         label: "Eolico",         icon: <IconWind     size={14} className="text-blue-500" />   },
            { key: "Termoelettrico", label: "Termoelettrico", icon: <IconFlame    size={14} className="text-orange-500" /> },
          ].map(({ key, label, icon }) => {
            const gwh = nationalReal.bySource[key] ?? 0;
            return (
              <div key={key} className={`rounded-xl p-3 border ${dk ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {icon}
                  <span className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
                </div>
                <p className={`text-base font-bold ${dk ? "text-gray-100" : "text-gray-800"}`}>
                  {gwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} GWh
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-emerald-500 font-semibold">
            🌿 {nationalReal.renewableGWh.toLocaleString(undefined, { maximumFractionDigits: 0 })} GWh rinnovabili
          </span>
          <span className="text-orange-500 font-semibold">
            {(nationalReal.totalGWh - nationalReal.renewableGWh).toLocaleString(undefined, { maximumFractionDigits: 0 })} GWh fossili 🏭
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden bg-orange-200 dark:bg-orange-900">
          <div className="h-3 rounded-full bg-linear-to-r from-emerald-500 to-green-400 transition-all duration-700"
               style={{ width: `${nationalReal.renewablePct}%` }} />
        </div>
        <p className={`text-[10px] mt-1.5 ${dk ? "text-gray-500" : "text-gray-400"}`}>
          {nationalReal.totalGWh.toLocaleString(undefined, { maximumFractionDigits: 0 })} GWh totali · anno 2024
        </p>
      </div>

      {/* ── Mix energetico regionale ── */}
      {regionProduction.length > 0 && (
        <div className={`${card(dk)} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <IconZap size={15} className="text-emerald-500" />
            <h3 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Mix energetico regionale — {region}
            </h3>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              Produzione GWh · fonte: TERNA
            </span>
          </div>
          <ProductionBars data={regionProduction} dk={dk} />
        </div>
      )}

      {/* ── Capacità installata ── */}
      {regionCapacity.length > 0 && (
        <div className={`${card(dk)} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <IconFactory size={15} className="text-cyan-500" />
            <h3 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Capacità installata — {region}
            </h3>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              MW per fonte rinnovabile · fonte: TERNA
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {regionCapacity.map((c) => (
              <div key={c.source} className={`rounded-xl p-3 border ${dk ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{c.icon}</span>
                  <span className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>{c.short}</span>
                </div>
                <p className="text-base font-bold tabular-nums text-emerald-500">
                  {c.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
                </p>
                {c.yoYPercentage != null && (
                  <p className={`text-[10px] mt-0.5
                    ${c.yoYValue > 0 ? "text-emerald-500" : c.yoYValue < 0 ? "text-red-500" : "text-gray-400"}`}>
                    YoY {c.yoYValue > 0 ? "+" : ""}{c.yoYValue.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Grafici ── */}
      <div>
        <h3 className={`text-sm font-bold mb-3 ${dk ? "text-gray-200" : "text-gray-700"}`}>
          📊 Andamenti di oggi — {selectedCity?.name ?? region}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "☀️ Irraggiamento solare (W/m²)", Chart: SolarBarChart },
            { title: "🏭 CO₂ stimata (g/kWh)",         Chart: CO2LineChart },
          ].map(({ title, Chart }) => (
            <div key={title} className={card(dk)}>
              <p className={`text-xs font-medium mb-3 ${dk ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
              <Chart hourlyData={hourly} loading={loading} />
            </div>
          ))}
          <div className={`${card(dk)} md:col-span-2`}>
            <p className={`text-xs font-medium mb-3 ${dk ? "text-gray-400" : "text-gray-500"}`}>
              💨 Vento nelle 24 ore (km/h)
            </p>
            <EnergyAreaChart hourlyData={hourly} loading={loading} />
          </div>
        </div>
      </div>

      {/* ── Serie storica nazionale ── */}
      {nationalReal.byYear.length > 0 && (
        <div className={`${card(dk)} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <IconZap size={15} className="text-emerald-500" />
            <h3 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Serie storica — produzione nazionale
            </h3>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              GWh per anno · fonte: TERNA
            </span>
          </div>
          <HistoryChart data={nationalReal.byYear} />
        </div>
      )}
    </div>
  );
}

