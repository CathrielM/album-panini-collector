import React from "react";

const SyncStatus = ({ isSyncing }) => {
  if (isSyncing) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300"
        title="Sincronizando cambios..."
      >
        <span className="inline-block h-2 w-2 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300"
      title="Todos los cambios guardados"
    >
      <span>☁️✓</span>
    </div>
  );
};

export default SyncStatus;
