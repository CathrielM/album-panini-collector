import React, { memo, useCallback, useEffect, useState } from "react";

const ALBUM_SIZE = 980;
const statusStyles = {
  0: "bg-slate-200 text-slate-700",
  1: "bg-blue-500 text-white",
  2: "bg-green-500 text-white",
};

const AlbumCell = memo(
  ({ id, tipo, onToggle, isHighlighted }) => {
    const label = tipo === 2 ? "X2" : id;
    const highlightStyles = isHighlighted ? "ring-2 ring-amber-400" : "";

    return (
      <button
        id={`figure-${id}`}
        type="button"
        onClick={() => onToggle(id, tipo)}
        className={`flex aspect-square items-center justify-center rounded-2xl border border-slate-300 px-1 text-center text-[10px] font-semibold leading-none transition-colors duration-150 ${statusStyles[tipo] ?? statusStyles[0]} ${highlightStyles}`}
      >
        <span className="select-none">{label}</span>
      </button>
    );
  },
  (prevProps, nextProps) => prevProps.tipo === nextProps.tipo && prevProps.isHighlighted === nextProps.isHighlighted
);

const AlbumGrid = ({ album = [], toggleFigura, highlightedId }) => {
  const [activeHighlightId, setActiveHighlightId] = useState(null);

  useEffect(() => {
    if (!highlightedId) return;

    const target = document.getElementById(`figure-${highlightedId}`);
    if (!target) {
      return undefined;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveHighlightId(highlightedId);

    const timeoutId = window.setTimeout(() => {
      setActiveHighlightId(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedId]);

  const handleToggle = useCallback(
    (id, tipo) => {
      toggleFigura(id, tipo);
    },
    [toggleFigura]
  );

  return (
    <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
      {Array.from({ length: ALBUM_SIZE }, (_, index) => {
        const id = index + 1;
        const tipo = album[index] ?? 0;
        const isHighlighted = activeHighlightId === id;

        return (
          <AlbumCell
            key={id}
            id={id}
            tipo={tipo}
            onToggle={handleToggle}
            isHighlighted={isHighlighted}
          />
        );
      })}
    </div>
  );
};

export default AlbumGrid;
