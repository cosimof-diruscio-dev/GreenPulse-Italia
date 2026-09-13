import { useNavigate } from "react-router-dom";
import { MapPin } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";
import { REGIONS } from "../data/regions";

export default function RegionSelector() {
  const navigate   = useNavigate();
  const region     = useAppStore((s) => s.region);
  const setRegion  = useAppStore((s) => s.setRegion);
  const theme      = useAppStore((s) => s.theme);
  const dk         = theme === "dark";

  const regionNames = Object.keys(REGIONS).sort();

  function handleChange(e) {
    const val = e.target.value;
    setRegion(val);
    navigate(`/regioni/${val}`);
  }

  return (
    <div className="flex flex-col gap-1 w-full sm:max-w-xs">
      <label htmlFor="region-select"
        className={`flex items-center gap-1.5 text-xs font-semibold
          ${dk ? "text-gray-400" : "text-gray-500"}`}>
        <MapPin size={12} className="text-emerald-500" />
        Regione
      </label>
      <select
        id="region-select"
        value={region}
        onChange={handleChange}
        className={`w-full px-3 py-2 rounded-xl border text-sm outline-none
          transition-colors duration-200
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
          ${dk
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-800"}`}>
        {regionNames.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}
