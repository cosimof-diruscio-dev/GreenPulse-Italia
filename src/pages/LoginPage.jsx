import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useAuthStore";
import { useAppStore }  from "../store/useAppStore";
import {
  IconLeaf, IconLogIn, IconEye, IconEyeOff, IconLoader2,
  IconAlertCircle, IconZap,
} from "../components/icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { login, isAuthenticated, error, isLoading, clearError } = useAuthStore();
  const theme = useAppStore((s) => s.theme);
  const dk    = theme === "dark";

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPass, setShowPass] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async ({ email, password }) => {
    clearError();
    const ok = await login(email, password);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4
      ${dk ? "bg-gray-950" : "bg-linear-to-br from-emerald-50 to-green-100"}`}>

      <div className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 sm:p-8 animate-fade-in
        ${dk
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-100"}`}>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4
            bg-linear-to-br from-emerald-500 to-green-400 shadow-lg shadow-emerald-200">
            <IconLeaf size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            GreenPulse Italia
          </h1>
          <p className={`text-sm mt-1 ${dk ? "text-gray-400" : "text-gray-500"}`}>
            Accedi per visualizzare la dashboard energetica
          </p>
        </div>

        <div className={`flex items-start gap-3 rounded-xl p-3 mb-6 border
          ${dk
            ? "bg-emerald-950 border-emerald-900"
            : "bg-emerald-50 border-emerald-200"}`}>
          <IconZap size={14} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Demo — Credenziali di accesso
            </p>
            <p className={`text-xs mt-0.5 ${dk ? "text-gray-400" : "text-gray-500"}`}>
              Qualsiasi email valida + password ≥ 4 caratteri
            </p>
            <p className={`text-xs mt-0.5 ${dk ? "text-gray-400" : "text-gray-500"}`}>
              Es: <strong>demo@greenpulse.it</strong> / <strong>demo</strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950
            border border-red-200 dark:border-red-900 rounded-xl px-3 py-2.5 mb-4">
            <IconAlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          <div>
            <label className={`block text-sm font-semibold mb-1.5
              ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Email
            </label>
            <input
              type="email"
              placeholder="la.tua@email.it"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none
                transition-colors duration-200
                focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                ${errors.email
                  ? "border-red-400 dark:border-red-600"
                  : dk
                    ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                }`}
              {...register("email", {
                required: "L'email è obbligatoria",
                pattern: { value: /\S+@\S+\.\S+/, message: "Email non valida" },
                onChange: clearError,
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1.5
              ${dk ? "text-gray-200" : "text-gray-700"}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Minimo 4 caratteri"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm outline-none
                  transition-colors duration-200
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                  ${errors.password
                    ? "border-red-400 dark:border-red-600"
                    : dk
                      ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                  }`}
                {...register("password", {
                  required: "La password è obbligatoria",
                  minLength: { value: 4, message: "Minimo 4 caratteri" },
                  onChange: clearError,
                })}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2
                  ${dk ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}>
                {showPass ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl
              font-bold text-sm text-white transition-all duration-200
              ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 hover:scale-[1.01]"
              }`}>
            {isLoading
              ? <><IconLoader2 size={16} className="animate-spin" />Accesso in corso...</>
              : <><IconLogIn size={16} />Accedi</>
            }
          </button>
        </form>

        <p className={`text-center text-xs mt-6 ${dk ? "text-gray-500" : "text-gray-400"}`}>
          GreenPulse Italia ·
          <a href="https://github.com/greenexplorerdev" target="_blank"
            className="text-emerald-500 hover:text-emerald-400 transition-colors">
            github.com/greenexplorerdev
          </a>
        </p>
      </div>
    </div>
  );
}
