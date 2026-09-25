import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { IconTreePine, IconHome, IconArrowLeft, IconShieldOff, IconLeaf } from "../components/icons";

export default function NotFound() {
  const location       = useLocation();
  const navigate       = useNavigate();
  const theme          = useAppStore((s) => s.theme);
  const dk             = theme === "dark";
  const isUnauthorized = location.state?.unauthorized === true;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center
      ${dk ? "bg-gray-950" : "bg-linear-to-br from-emerald-50 to-green-100"}`}>

      <div className={`flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-2xl
        ${isUnauthorized
          ? "bg-linear-to-br from-red-500 to-rose-400 shadow-red-200 dark:shadow-red-900/40"
          : "bg-linear-to-br from-emerald-500 to-green-400 shadow-emerald-200 dark:shadow-emerald-900/40"}`}>
        {isUnauthorized
          ? <IconShieldOff size={44} className="text-white" />
          : <IconTreePine  size={44} className="text-white" />}
      </div>

      <p className={`text-8xl font-black leading-none mb-3
        ${isUnauthorized ? "text-red-500" : "text-emerald-500"}`}>
        {isUnauthorized ? "401" : "404"}
      </p>

      <h1 className={`text-2xl font-bold mb-3
        ${dk ? "text-gray-100" : "text-gray-800"}`}>
        {isUnauthorized ? "Accesso non autorizzato" : "Pagina non trovata"}
      </h1>

      <p className={`text-sm max-w-sm leading-relaxed mb-8
        ${dk ? "text-gray-400" : "text-gray-500"}`}>
        {isUnauthorized
          ? "Devi effettuare il login per accedere a questa sezione di GreenPulse Italia."
          : "La pagina che cerchi non esiste o l'URL non è corretto."}
      </p>

      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-8 border max-w-sm
        ${dk
          ? "bg-emerald-950 border-emerald-900"
          : "bg-emerald-50 border-emerald-200"}`}>
        <IconLeaf size={14} className="text-emerald-500 shrink-0" />
        <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">
          "La natura non spreca energia — nemmeno noi dovremmo."
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            border transition-all duration-200 hover:scale-105
            ${dk
              ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
          <IconArrowLeft size={15} />
          Indietro
        </button>

        <Link to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
            text-white bg-linear-to-r from-emerald-600 to-green-500
            hover:from-emerald-700 hover:to-green-600 shadow-lg shadow-emerald-200
            dark:shadow-emerald-900/40 transition-all duration-200 hover:scale-105">
          <IconHome size={15} />
          Home
        </Link>

        {isUnauthorized && (
          <Link to="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              text-white bg-emerald-600 hover:bg-emerald-700
              transition-all duration-200 hover:scale-105">
            Accedi
          </Link>
        )}
      </div>

      {!isUnauthorized && (
        <p className={`mt-6 text-xs font-mono ${dk ? "text-gray-600" : "text-gray-400"}`}>
          Percorso: <span className="text-emerald-500">{location.pathname}</span>
        </p>
      )}
    </div>
  );
}