import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { IconLeaf, IconMapPin, IconBarChart2, IconMoon, IconX, IconChevronRight } from "./icons";

const STEPS = [
  {
    icon: <IconLeaf size={32} className="text-white" />,
    bg:   "from-emerald-500 to-green-400",
    title:"Benvenuto in GreenPulse Italia",
    body: "Dashboard energetica con dati in tempo reale su irraggiamento solare, vento e CO₂ per 20 regioni italiane.",
  },
  {
    icon: <IconMapPin size={32} className="text-white" />,
    bg:   "from-blue-500 to-cyan-400",
    title:"Scegli regione e città",
    body: "Il selettore regione aggiorna i dati e naviga automaticamente alla pagina degli impianti. Le 5 città usano coordinate reali per l'API solare.",
  },
  {
    icon: <IconBarChart2 size={32} className="text-white" />,
    bg:   "from-violet-500 to-purple-400",
    title:"Grafici in tempo reale",
    body: "I tre grafici mostrano l'andamento di oggi: irraggiamento solare, CO₂ stimata e vento. Dati da Open-Meteo, aggiornati ogni ora.",
  },
  {
    icon: <IconMoon size={32} className="text-white" />,
    bg:   "from-gray-600 to-gray-500",
    title:"Dark mode e filtri",
    body: "Il pulsante 🌙 in basso a destra alterna i temi. I filtri Tutte / Rinnovabili / Fossili sono condivisi tra Dashboard e pagine Regione.",
  },
];

export default function WelcomeModal() {
  const theme = useAppStore((s) => s.theme);
  const dk    = theme === "dark";

  const [open, setOpen]   = useState(
    () => !localStorage.getItem("gp-tutorial-seen")
  );
  const [step, setStep]   = useState(0);

  function close() {
    localStorage.setItem("gp-tutorial-seen", "1");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Apri guida"
        className="fixed bottom-20 right-5 z-50 w-8 h-8 rounded-full text-xs font-bold
          bg-emerald-600 text-white shadow-lg hover:bg-emerald-700
          flex items-center justify-center transition-all hover:scale-110">
        ?
      </button>
    );
  }

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-black/50 backdrop-blur-sm"
      onClick={close}>
      <div
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in
          ${dk ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>

        <button onClick={close}
          className={`absolute top-4 right-4 p-1 rounded-lg
            ${dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
          <IconX size={16} />
        </button>

        <div className={`flex items-center justify-center w-16 h-16 rounded-2xl
          bg-linear-to-br ${s.bg} mx-auto mb-4 shadow-lg`}>
          {s.icon}
        </div>

        <h2 className={`text-base font-bold text-center mb-2
          ${dk ? "text-gray-100" : "text-gray-800"}`}>
          {s.title}
        </h2>
        <p className={`text-sm text-center leading-relaxed mb-5
          ${dk ? "text-gray-400" : "text-gray-500"}`}>
          {s.body}
        </p>

        <div className="flex justify-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all duration-200
                ${i === step
                  ? "w-5 h-1.5 bg-emerald-500"
                  : "w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600"}`} />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className={`flex-1 py-2 rounded-xl text-sm border transition-colors
                ${dk
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              ← Indietro
            </button>
          )}
          <button
            onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : close}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              text-sm font-bold text-white
              bg-emerald-600 hover:bg-emerald-700 transition-colors">
            {step < STEPS.length - 1
              ? <><span>Avanti</span><IconChevronRight size={14} /></>
              : "Inizia →"}
          </button>
        </div>

        {step < STEPS.length - 1 && (
          <button onClick={close}
            className={`w-full mt-2 text-xs text-center
              ${dk ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
            Salta
          </button>
        )}
      </div>
    </div>
  );
}
