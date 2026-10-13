import { useAppStore } from "../store/useAppStore";
import { IconLeaf, IconCode, IconGlobe, IconInfo } from "../components/icons";

const STACK = [
  { name: "React 19",         desc: "UI library" },
  { name: "Vite 8",           desc: "Build tool" },
  { name: "Tailwind CSS 4",  desc: "Utility-first styling" },
  { name: "Zustand",          desc: "State management + persist" },
  { name: "React Router v7", desc: "Client-side routing" },
  { name: "Recharts",         desc: "Data visualization" },
  { name: "React Hook Form",  desc: "Form validation" },
  { name: "SVG inline",       desc: "Icon library (no deps)" },
  { name: "Open-Meteo API",   desc: "Solar & weather data (free)" },
];

export default function AboutPage() {
  const theme = useAppStore((s) => s.theme);
  const dk    = theme === "dark";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl
          bg-linear-to-br from-emerald-500 to-green-400">
          <IconLeaf size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-extrabold ${dk ? "text-gray-100" : "text-gray-800"}`}>
            GreenPulse Italia
          </h1>
          <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>
            Dashboard energetica — Cosimo Francesco Di Ruscio · 2026
          </p>
        </div>
      </div>

      <div className={`rounded-2xl p-5 border
        ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
        <h2 className={`text-sm font-bold mb-2 ${dk ? "text-gray-200" : "text-gray-700"}`}>
          Scopo del progetto
        </h2>
        <p className={`text-sm leading-relaxed ${dk ? "text-gray-400" : "text-gray-600"}`}>
          Dashboard per il monitoraggio energetico italiano: irraggiamento solare per città,
          mix rinnovabili/fossili per regione, capacità installata per fonte. Dati meteo live
          da Open-Meteo (nessuna API key necessaria), dati produzione/capacità/emissioni
          da dataset ufficiali TERNA/GSE 2024 per tutte le 20 regioni italiane.
        </p>
      </div>

      <div className={`rounded-2xl p-5 border border-amber-200 dark:border-amber-800
        ${dk ? "bg-amber-950/50" : "bg-amber-50/50"}`}>
        <div className="flex items-start gap-2 mb-2">
          <IconInfo size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <h2 className={`text-sm font-bold ${dk ? "text-amber-300" : "text-amber-700"}`}>
            Sorgenti dati
          </h2>
        </div>
        <div className={`text-xs leading-relaxed space-y-1.5 ${dk ? "text-amber-200" : "text-amber-800"}`}>
          <p>
            <strong>Open-Meteo</strong> — dati meteorologici in tempo reale (irraggiamento solare,
            vento, temperatura, copertura nuvolosa, intensità carbonica) — API gratuita,
            nessuna key richiesta.
          </p>
          <p>
            <strong>TERNA/GSE</strong> — dati ufficiali 2024 per tutte le 20 regioni italiane:
            produzione lorda per fonte e combustibile (GWh), capacità installata rinnovabile (MW),
            emissioni CO₂ per combustibile (Mt). Capacità fossile stimata da produzione lorda
            fossile / 5500h.
          </p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>
              <a href="https://www.terna.it/it/sistema-elettrico/statistiche"
                target="_blank" rel="noopener noreferrer"
                className="underline hover:no-underline">
                terna.it — Statistiche
              </a>
            </li>
            <li>
              <a href="https://www.gse.it/dati-e-scenari/statistiche"
                target="_blank" rel="noopener noreferrer"
                className="underline hover:no-underline">
                gse.it — Dati e scenari
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`rounded-2xl p-5 border
        ${dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-sm"}`}>
        <h2 className={`text-sm font-bold mb-3 ${dk ? "text-gray-200" : "text-gray-700"}`}>
          Stack tecnico
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STACK.map(({ name, desc }) => (
            <div key={name} className={`flex items-center justify-between
              px-3 py-2 rounded-xl border
              ${dk ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
              <span className={`text-xs font-semibold ${dk ? "text-gray-200" : "text-gray-700"}`}>
                {name}
              </span>
              <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a href="https://github.com/cosimof-diruscio-dev" target="_blank" rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl
            text-sm font-medium border transition-all hover:scale-105
            ${dk
              ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
          <IconCode size={15} />
          github.com/greenexplorerdev
        </a>
        <a href="https://www.linkedin.com/in/cosimo-francesco-di-ruscio"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl
            text-sm font-bold text-white
            bg-linear-to-r from-emerald-600 to-green-500
            hover:from-emerald-700 hover:to-green-600
            shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40
            transition-all hover:scale-105">
          <IconGlobe size={15} />
          LinkedIn
        </a>
      </div>
    </div>
  );
}
