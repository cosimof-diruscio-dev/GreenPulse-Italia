import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore }  from "../store/useAppStore";
import { REGIONS, getRegionStats } from "../data/regions";
import useEnergyData    from "../hooks/useEnergyData";
import useTERNA         from "../hooks/useTERNA";
import SolarBarChart    from "../components/charts/SolarBarChart";
import SolarWidget      from "../components/SolarWidget";
import ProductionBars   from "../components/ProductionBars";
import {
  IconArrowLeft, IconSun, IconWind, IconDroplets, IconFlame, IconLeaf,
  IconZap, IconFactory, IconTreePine, IconCloudLightning, IconLoader2,
} from "../components/icons";

function SubtypeIcon({ subtype, size = 16 }) {
  const map = {
    Idrico:          <IconDroplets        size={size} className="text-cyan-500" />,
    Fotovoltaico:     <IconSun             size={size} className="text-amber-500" />,
    Eolico:          <IconWind             size={size} className="text-blue-500" />,
    "Eolico Offshore":<IconWind            size={size} className="text-blue-400" />,
    Geotermico:       <IconCloudLightning  size={size} className="text-purple-500" />,
    Bioenergie:       <IconLeaf            size={size} className="text-green-500" />,
    "Accumulo stand alone": <IconDroplets  size={size} className="text-indigo-500" />,
    Termoelettrico:   <IconFlame           size={size} className="text-orange-500" />,
  };
  return map[subtype] ?? <IconZap size={size} className="text-gray-400" />;
}

export default function RegionPage() {
  const { regionId } = useParams();
  const navigate     = useNavigate();
  const theme        = useAppStore((s) => s.theme);
  const filter       = useAppStore((s) => s.filter);
  const setFilter    = useAppStore((s) => s.setFilter);
  const setRegion    = useAppStore((s) => s.setRegion);
  const dk           = theme === "dark";

  const terna = useTERNA(regionId);
  const {
    production: regionProduction = [],
    plants: regionPlants = [],
    demand: regionDemand = [],
    provincialPlants = [],
    renewableMW,
    fossilMW,
  } = terna;
  const stats = getRegionStats({ renewableMW, fossilMW });
  const refCity = REGIONS[regionId];

  const plantsByType = useMemo(() =>
    regionPlants.reduce((acc, p) => {
      const existing = acc.find(x => x.subtype === p.subtype);
      if (existing) {
        existing.capacity += p.capacity;
        existing.count += 1;
      } else {
        acc.push({ ...p, count: 1 });
      }
      return acc;
    }, []).filter(p => p.capacity > 0).sort((a, b) => b.capacity - a.capacity),
    [regionPlants]
  );

  const filteredPlants = filter === "all"
    ? plantsByType
    : plantsByType.filter(p => p.type === filter);

  useEffect(() => {
    if (refCity) setRegion(regionId);
  }, [regionId, refCity, setRegion]);

  const { data: energyData, loading, error } = useEnergyData(
    refCity?.lat ?? null,
    refCity?.lng ?? null
  );

  if (!refCity) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] gap-4
        ${dk ? "text-gray-400" : "text-gray-500"}`}>
        <IconTreePine size={48} className="text-emerald-400 opacity-40" />
        <p className="text-lg font-semibold">Regione non trovata: {regionId}</p>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-emerald-600 hover:underline">
          <IconArrowLeft size={14} /> Torna indietro
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">

      <div className={`rounded-2xl p-5 border
        ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>

        <button onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-1.5 text-xs mb-4 transition-colors
            ${dk
              ? "text-gray-400 hover:text-emerald-400"
              : "text-gray-500 hover:text-emerald-600"}`}>
          <IconArrowLeft size={13} /> Torna alla Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold ${dk ? "text-gray-100" : "text-gray-800"}`}>
              {regionId}
            </h1>
            <p className={`text-sm mt-1 max-w-xl leading-relaxed
              ${dk ? "text-gray-400" : "text-gray-500"}`}>
              Capoluogo: <strong>{refCity.capital}</strong> · dati reali TERNA/GSE 2024
            </p>
          </div>
          <div className={`shrink-0 flex flex-col items-center justify-center
            rounded-xl px-5 py-3 border
            ${stats.renewablePct >= 70
              ? dk ? "bg-emerald-950 border-emerald-800" : "bg-emerald-50 border-emerald-200"
              : dk ? "bg-orange-950 border-orange-800" : "bg-orange-50 border-orange-200"
            }`}>
            <span className={`text-3xl font-black
              ${stats.renewablePct >= 70 ? "text-emerald-500" : "text-orange-500"}`}>
              {stats.renewablePct}%
            </span>
            <span className={`text-xs mt-0.5
              ${stats.renewablePct >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-orange-600 dark:text-orange-400"}`}>
              rinnovabile
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Capacità totale",        value:`${stats.totalMW.toLocaleString()} MW`,    icon:<IconZap     size={16} className="text-emerald-500" /> },
          { label:"Capacità rinnovabile",   value:`${stats.renewableMW.toLocaleString()} MW`, icon:<IconLeaf    size={16} className="text-green-500" /> },
          { label:"Capacità fossile",       value:`${stats.fossilMW.toLocaleString()} MW`,   icon:<IconFlame   size={16} className="text-orange-500" /> },
          { label:"CO₂ evitata/anno",       value:`${(stats.co2SavedTonnes/1_000_000).toFixed(1)} Mt`, icon:<IconTreePine size={16} className="text-emerald-600" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className={`rounded-xl p-4 border
            ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex items-center gap-2 mb-2">{icon}
              <span className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
            </div>
            <p className={`text-xl font-bold ${dk ? "text-gray-100" : "text-gray-800"}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { v:"all",       label:"Tutti",            activeClass:"bg-cyan-500" },
          { v:"renewable", label:"🌿 Rinnovabili",    activeClass:"bg-emerald-500" },
          { v:"fossil",    label:"🏭 Fossili",        activeClass:"bg-orange-500" },
        ].map(({ v, label, activeClass }) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${filter === v
                ? `${activeClass} text-white shadow-md`
                : dk
                  ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border overflow-hidden
        ${dk ? "border-gray-800" : "border-gray-100 shadow-sm"}`}>

        <div className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 text-xs font-semibold
          uppercase tracking-wide border-b
          ${dk
            ? "bg-gray-800 text-gray-400 border-gray-700"
            : "bg-gray-50 text-gray-500 border-gray-100"}`}>
          <span>Tipo</span>
          <span>Impianto</span>
          <span className="text-right">Capacità</span>
          <span className="text-right">N° impianti</span>
        </div>

        {filteredPlants.length === 0 ? (
          <div className={`py-10 text-center text-sm
            ${dk ? "text-gray-500 bg-gray-900" : "text-gray-400 bg-white"}`}>
            {terna.loading ? "Caricamento..." : "Nessun impianto registrato per questa regione"}
          </div>
        ) : (
          filteredPlants.map((plant, i) => (
            <div key={plant.subtype}
              className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3.5
                transition-colors duration-150
                ${i < filteredPlants.length - 1
                  ? dk ? "border-b border-gray-800" : "border-b border-gray-50"
                  : ""
                }
                ${dk ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50"}`}>

                <SubtypeIcon subtype={plant.subtype} size={18} />

                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${dk ? "text-gray-200" : "text-gray-800"}`}>
                    {plant.subtype}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${plant.type === "renewable"
                      ? dk ? "bg-emerald-950 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                      : dk ? "bg-orange-950 text-orange-400" : "bg-orange-50 text-orange-700"}`}>
                    {plant.type === "renewable" ? "rinnovabile" : "fossile"}
                  </span>
                </div>

                <span className={`text-sm font-bold text-right tabular-nums
                  ${plant.type === "renewable"
                    ? "text-emerald-500"
                    : "text-orange-500"}`}>
                  {plant.capacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
                </span>

                <span className={`text-xs text-right tabular-nums ${dk ? "text-gray-400" : "text-gray-500"}`}>
                  {plant.count}
                </span>
              </div>
          ))
        )}
      </div>

      {regionProduction.length > 0 && (
        <div className={`rounded-2xl p-5 border
          ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>

          <div className="flex items-center gap-2 mb-4">
            <IconZap size={16} className="text-emerald-500" />
            <h2 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Produzione reale per fonte — {regionId}
            </h2>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              GWh · fonte: TERNA/GSE
            </span>
          </div>

          <ProductionBars data={regionProduction} dk={dk} />

          <p className={`mt-3 text-[10px] ${dk ? "text-emerald-400" : "text-emerald-600"}`}>
            Statistiche calcolate da dati reali TERNA/GSE 2024
          </p>
        </div>
      )}

      {(terna.fuels.length > 0 || terna.emissions.length > 0) && (
        <div className={`rounded-2xl p-5 border
          ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>

          <div className="flex items-center gap-2 mb-4">
            <IconFlame size={16} className="text-orange-500" />
            <h2 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Combustibili ed emissioni — {regionId}
            </h2>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              fonte: TERNA/GSE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {terna.fuels.length > 0 && (
              <div>
                <p className={`text-xs font-semibold mb-2 ${dk ? "text-gray-400" : "text-gray-500"}`}>
                  Produzione lorda per combustibile (GWh)
                </p>
                <div className="space-y-1.5">
                  {terna.fuels.map(f => (
                    <div key={f.fuel} className="flex justify-between text-xs">
                      <span className={dk ? "text-gray-300" : "text-gray-700"}>{f.fuel}</span>
                      <span className="font-bold text-orange-500 tabular-nums">
                        {f.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {terna.emissions.length > 0 && (
              <div>
                <p className={`text-xs font-semibold mb-2 ${dk ? "text-gray-400" : "text-gray-500"}`}>
                  Emissioni CO₂ (Mt = milioni di tonnellate)
                </p>
                <div className="space-y-1.5">
                  {terna.emissions.map(e => (
                    <div key={e.fuel} className="flex justify-between text-xs">
                      <span className={dk ? "text-gray-300" : "text-gray-700"}>{e.fuel}</span>
                      <span className="font-bold text-red-500 tabular-nums">
                        {e.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`rounded-2xl border p-5
        ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="flex items-center gap-2 mb-4">
          <IconSun size={18} className="text-amber-500" />
          <h2 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
            Irraggiamento solare — {refCity.capital}
          </h2>
          {loading && (
            <IconLoader2 size={14} className="text-emerald-500 animate-spin ml-auto" />
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-3">
            Errore nel caricamento dati: {error}
          </p>
        )}

        <SolarWidget
          currentData={energyData?.current ?? null}
          cityName={refCity.capital}
          loading={loading}
        />

        <div className="mt-5">
          <p className={`text-xs font-medium mb-3 ${dk ? "text-gray-400" : "text-gray-500"}`}>
            Curva di irraggiamento — oggi
          </p>
          <SolarBarChart hourlyData={energyData?.hourly ?? null} loading={loading} />
        </div>
      </div>

      {regionDemand.length > 0 && (
        <div className={`rounded-2xl p-5 border
          ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className="flex items-center gap-2 mb-4">
            <IconZap size={16} className="text-cyan-500" />
            <h2 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Domanda elettrica — {regionId}
            </h2>
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

      {provincialPlants.length > 0 && (
        <div className={`rounded-2xl p-5 border
          ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className="flex items-center gap-2 mb-4">
            <IconFactory size={16} className="text-cyan-500" />
            <h2 className={`text-sm font-bold ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Province — {regionId}
            </h2>
            <span className={`ml-auto text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
              MW per provincia · fonte: TERNA
            </span>
          </div>
          <div className="space-y-1.5">
            {provincialPlants.map(p => (
              <div key={`${p.province}-${p.subtype}`}
                className={`grid grid-cols-[1fr_auto_auto] gap-3 items-center px-3 py-2 rounded-lg
                  ${dk ? "hover:bg-gray-800" : "hover:bg-gray-50"} transition-colors`}>
                <span className={`text-xs ${dk ? "text-gray-300" : "text-gray-700"}`}>
                  {p.province} · <span className="opacity-60">{p.subtype}</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                  ${p.type === "renewable"
                    ? dk ? "bg-emerald-950 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                    : dk ? "bg-orange-950 text-orange-400" : "bg-orange-50 text-orange-700"}`}>
                  {p.type === "renewable" ? "rinnov" : "fossile"}
                </span>
                <span className={`text-xs font-bold w-20 text-right tabular-nums
                  ${p.type === "renewable" ? "text-emerald-500" : "text-orange-500"}`}>
                  {p.capacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-xl px-5 py-4 border flex items-start gap-3
        ${dk ? "bg-emerald-950 border-emerald-900" : "bg-emerald-50 border-emerald-200"}`}>
        <IconTreePine size={16} className="text-emerald-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
            Impatto climatico — {regionId}
          </p>
          <p className={`text-xs leading-relaxed ${dk ? "text-emerald-300" : "text-emerald-700"}`}>
            Grazie ai <strong>{stats.renewableMW.toLocaleString()} MW</strong> di capacità rinnovabile,
            la regione evita circa <strong>{(stats.co2SavedTonnes / 1_000_000).toFixed(1)} Mt di CO₂</strong>/anno
            {stats.renewablePct >= 70 ? " 🌱" : " — quota rinnovabile " + stats.renewablePct + "%"}.
          </p>
        </div>
      </div>
    </div>
  );
}
