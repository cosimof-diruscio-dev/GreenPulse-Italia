import { useAppStore } from "../store/useAppStore";
import { CITIES }      from "../data/cities";
import { IconMapPin } from "./icons";

export default function CitySelector() {
  const setCity  = useAppStore((s) => s.setCity);
  const setRegion= useAppStore((s) => s.setRegion);
  const selected = useAppStore((s) => s.selectedCity);
  const theme    = useAppStore((s) => s.theme);
  const dk       = theme === "dark";

  function handleSelect(city) {
    setCity(city);
    setRegion(city.region);
  }

  return (
    <div className="w-full">
      <p className={`flex items-center gap-1.5 text-xs font-semibold mb-2
        ${dk ? "text-gray-400" : "text-gray-500"}`}>
        <IconMapPin size={12} className="text-emerald-500" />
        Città
      </p>
      <div className="flex flex-wrap gap-2">
        {CITIES.map(city => {
          const active = selected?.id === city.id;
          return (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                text-xs font-medium border transition-all duration-200
                ${active
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                  : dk
                    ? "bg-gray-800 text-gray-300 border-gray-700 hover:border-emerald-600 hover:text-emerald-400"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
                }`}>
              <span>{city.emoji}</span>
              <span>{city.name}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className={`text-xs mt-2 ${dk ? "text-gray-500" : "text-gray-400"}`}>
          Regione: <span className="text-emerald-500 font-medium">{selected.region}</span>
        </p>
      )}
    </div>
  );
}
