import React from "react";

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
      <p className="text-sm text-slate-400">Cargando datos del match...</p>
    </div>
  </div>
);

export default LoadingSpinner;
