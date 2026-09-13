import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { useAppStore } from "../../store/useAppStore";



function CT({ active, payload, label, dk }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-lg border
      ${dk ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}>
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-amber-500">{payload[0].value} W/m²</p>
    </div>
  );
}

export default function SolarBarChart({ hourlyData, loading }) {
  const dk = useAppStore((s) => s.theme) === "dark";

  if (loading || !hourlyData) return <ChartSkeleton />;

  const { times, solarHourly } = hourlyData;
  const maxVal = Math.max(...solarHourly);

  const data = times
    .map((ora, i) => ({ ora, valore: solarHourly[i] }))
    .filter((_, i) => i % 2 === 0);

  return (
    <ResponsiveContainer width="100%" height={176}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -26, bottom: 0 }} isAnimationActive={false}>
        <XAxis dataKey="ora" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <Tooltip content={(p) => <CT {...p} dk={dk} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <ReferenceLine y={400} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1} />
        <Bar dataKey="valore" radius={[3, 3, 0, 0]} maxBarSize={22}>
          {data.map((e, i) => (
            <Cell key={i}
              fill={e.valore === maxVal && maxVal > 0 ? "#f59e0b"
                : e.valore > 200 ? "#10b981"
                : e.valore > 0  ? "#6ee7b7"
                : "#e5e7eb"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-50 flex items-end gap-1 px-2 animate-pulse">
      {[30, 0, 0, 20, 60, 90, 100, 80, 50, 20, 5, 0].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
          style={{ height: `${Math.max(4, h)}%` }}
        />
      ))}
    </div>
  );
}
