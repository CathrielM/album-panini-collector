import React from "react";
import useAuth from "../hooks/useAuth.js";

const Login = () => {
  const { login, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-900/20">
        <h1 className="mb-4 text-center text-3xl font-semibold text-white">Inicia sesión</h1>
        <p className="mb-8 text-center text-sm text-slate-400">
          Accede con Google para gestionar tu álbum Panini.
        </p>
        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-bold text-slate-950">
            G
          </span>
          {loading ? "Cargando..." : "Iniciar sesión con Google"}
        </button>
      </div>
    </div>
  );
};

export default Login;
