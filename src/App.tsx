import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import ShareAlbumButton from "./components/ShareAlbumButton.jsx";
import SyncStatus from "./components/SyncStatus.jsx";
import AlbumGrid from "./components/AlbumGrid.jsx";
import AlbumGridSkeleton from "./components/AlbumGridSkeleton.jsx";
import useAlbum from "./hooks/useAlbum.js";
import useAuth from "./hooks/useAuth.js";

function App() {
  const { user, loading: authLoading, login } = useAuth();
  const userId = user?.uid ?? null;
  const { album, loading: albumLoading, toggleFigura, progress, isSyncing } = useAlbum(userId);

  const [searchValue, setSearchValue] = useState("");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!highlightedId) return;

    const timeoutId = window.setTimeout(() => {
      setHighlightedId(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedId]);

  useEffect(() => {
    if (!toastMessage) return;

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, [toastMessage]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numberValue = Number(searchValue);
    const isValid = Number.isInteger(numberValue) && numberValue >= 1 && numberValue <= 980;

    if (!isValid) {
      setToastMessage("Número no válido");
      setSearchValue("");
      return;
    }

    setHighlightedId(numberValue);
    setSearchValue("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Album Panini</h1>
            <p className="text-sm text-slate-400">Busca una figura rápida y navega directamente al sticker.</p>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 sm:flex-row sm:items-center">
            <label htmlFor="figure-search" className="sr-only">
              Buscar figura
            </label>
            <span className="text-slate-400">#</span>
            <input
              id="figure-search"
              type="number"
              min="1"
              max="980"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value.replace(/\D/g, ""))}
              placeholder="Buscar figura"
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Ir
            </button>
            {toastMessage && (
              <div className="rounded-2xl border border-yellow-500 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200 shadow-sm shadow-yellow-500/10">
                {toastMessage}
              </div>
            )}
          </form>
          <div className="flex items-center gap-2 sm:gap-3">
            <SyncStatus isSyncing={isSyncing} />
            {user && <ShareAlbumButton userId={user.uid} />}
            {user ? (
              <span className="text-sm text-slate-300">Usuario: {user.displayName ?? user.email}</span>
            ) : (
              <button
                type="button"
                onClick={login}
                disabled={authLoading}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {authLoading ? "Cargando..." : "Iniciar sesión"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28">
        <div className="mx-auto max-w-7xl px-4 pb-12">
          <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-sm shadow-slate-900/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Inventario</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Toca cualquier celda para cambiar el estado de la figura.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm">Total: 980</span>
                <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm">Completadas: {progress.collected}</span>
                <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm">Progreso: {progress.percentage}%</span>
              </div>
            </div>
          </section>

          {albumLoading ? (
            <AlbumGridSkeleton />
          ) : (
            <AlbumGrid album={album} toggleFigura={toggleFigura} highlightedId={highlightedId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
