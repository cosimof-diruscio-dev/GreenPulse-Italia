const Skel = ({ className = "h-6" }) => (
  <div className={`rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
);

const PBar = ({ pct, color = "bg-emerald-500" }) => (
  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 my-1.5">
    <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
         style={{ width: `${Math.max(2, pct)}%` }} />
  </div>
);

export default function LiveCard({ icon, title, loading, value, unit, pct, pctText, pctColor, barColor, footer }) {
  return (
    <div className={`rounded-2xl p-4 ${loading ? "border-gray-100 dark:border-gray-800" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className={`text-xs font-semibold text-gray-400-300`}>{title}</span>
      </div>
      {loading ? (
        <>
          <Skel className="h-9 mb-2" />
          <Skel className="h-1.5" />
          <Skel className="h-3 w-2/3" />
        </>
      ) : value != null ? (
        <div className="text-center">
          <p className={`text-3xl font-black ${pctColor ?? "text-emerald-500"}`}>{value}{unit ?? ""}</p>
          <p className="text-xs mt-0.5 text-gray-500">{unit && !pctText ? unit : pctText}</p>
          {pct != null && <PBar pct={pct} color={barColor ?? "bg-emerald-500"} />}
          {pctText && pct != null && (
            <p className="text-xs text-gray-500">{pct}% del potenziale</p>
          )}
          {footer}
        </div>
      ) : null}
    </div>
  );
}
