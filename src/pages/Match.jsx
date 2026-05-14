import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { calculateMatch } from "../utils/matchLogic.js";
import { getUserAlbum } from "../services/albumService.js";

const CopyButton = ({ figureIds, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = figureIds.flatMap((cat) => cat.ids).join(", ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
        copied
          ? "bg-emerald-500 text-white"
          : "bg-slate-700 text-slate-200 hover:bg-slate-600"
      }`}
    >
      {copied ? "✓ Copiado" : "Copiar lista"}
    </button>
  );
};

const FigurePill = ({ id, variant = "neutral" }) => {
  const variantStyles = {
    neutral: "bg-slate-700 text-slate-100",
    receive: "bg-blue-100 text-blue-900",
    give: "bg-green-100 text-green-900",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold shadow-sm ${variantStyles[variant]}`}
    >
      {id}
    </span>
  );
};

const MatchSection = ({ title, figuresByCategory, variant, sectionTitle }) => {
  const allFigureIds = figuresByCategory.flatMap((cat) => cat.ids);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-slate-900/90 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">{sectionTitle}</p>
        </div>
        {allFigureIds.length > 0 && <CopyButton figureIds={figuresByCategory} label={title} />}
      </div>

      {allFigureIds.length > 0 ? (
        <div className="space-y-4">
          {figuresByCategory.map((category) => (
            <div key={category.label}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {category.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.ids.map((id) => (
                  <FigurePill key={id} id={id} variant={variant} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">¡No hay cambios posibles por ahora!</p>
      )}
    </div>
  );
};

const Match = () => {
  const { friendId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [myAlbum, setMyAlbum] = useState([]);
  const [friendAlbum, setFriendAlbum] = useState([]);
  const [friendName, setFriendName] = useState("Amigo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !friendId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadMatchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [friendAlbumData, myAlbumData] = await Promise.all([
          getUserAlbum(friendId),
          getUserAlbum(user.uid),
        ]);

        if (!isMounted) return;

        setFriendName(friendId);
        setFriendAlbum(friendAlbumData);
        setMyAlbum(myAlbumData);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Error al cargar los inventarios");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMatchData();

    return () => {
      isMounted = false;
    };
  }, [friendId, user]);

  const { loQueMeSirve, loQueLeSirve } = useMemo(
    () => calculateMatch(myAlbum, friendAlbum),
    [myAlbum, friendAlbum]
  );

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-center text-slate-400">
          Debes iniciar sesión para ver el match.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-sm shadow-slate-900/20">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Comparando con <span className="text-emerald-400">{friendName}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Organiza tu intercambio de figuras con {friendName} de manera fácil.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <MatchSection
            title="Para darle"
            figuresByCategory={loQueLeSirve}
            variant="give"
            sectionTitle={`Figuras que tienes para ${friendName}`}
          />

          <MatchSection
            title="Para recibir"
            figuresByCategory={loQueMeSirve}
            variant="receive"
            sectionTitle={`Figuras que ${friendName} tiene para ti`}
          />
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-7xl rounded-3xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}
      </div>
    </main>
  );
};

export default Match;
