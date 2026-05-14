import { useEffect, useMemo, useState } from "react";
import { getUserAlbum, updateFigura } from "../services/albumService.js";

const ALBUM_SIZE = 980;
const DEFAULT_ALBUM = Array(ALBUM_SIZE).fill(0);
const DEBOUNCE_DELAY = 2000;

const getLocalStorageKey = (userId) => `album_${userId}`;
const getPendingChangesKey = (userId) => `album_pending_${userId}`;

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mergeAlbumWithPending = (album, pendingChanges) => {
  if (!pendingChanges || Object.keys(pendingChanges).length === 0) {
    return album;
  }

  const merged = [...album];
  Object.entries(pendingChanges).forEach(([id, tipo]) => {
    const index = Number(id) - 1;
    if (index >= 0 && index < ALBUM_SIZE) {
      merged[index] = tipo;
    }
  });
  return merged;
};

const useAlbum = (userId) => {
  const [album, setAlbum] = useState(DEFAULT_ALBUM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  const persistLocalAlbum = (nextAlbum) => {
    if (!userId) return;
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(nextAlbum));
  };

  const persistPendingChanges = (nextPending) => {
    if (!userId) return;
    const pendingKey = getPendingChangesKey(userId);

    if (Object.keys(nextPending).length === 0) {
      localStorage.removeItem(pendingKey);
    } else {
      localStorage.setItem(pendingKey, JSON.stringify(nextPending));
    }
  };

  useEffect(() => {
    if (!userId) {
      setAlbum(DEFAULT_ALBUM);
      setPendingChanges({});
      setLoading(false);
      return;
    }

    let isMounted = true;
    const localStorageKey = getLocalStorageKey(userId);
    const pendingKey = getPendingChangesKey(userId);

    const loadAlbum = async () => {
      setLoading(true);
      setError(null);

      const cachedAlbumStr = localStorage.getItem(localStorageKey);
      const cachedPendingStr = localStorage.getItem(pendingKey);

      const cachedAlbum = parseJson(cachedAlbumStr, null);
      const cachedPending = parseJson(cachedPendingStr, {});

      if (cachedAlbum && Array.isArray(cachedAlbum) && cachedAlbum.length === ALBUM_SIZE) {
        setAlbum(cachedAlbum);
      }

      if (cachedPending && typeof cachedPending === "object") {
        setPendingChanges(cachedPending);
      }

      try {
        const fetchedAlbum = await getUserAlbum(userId);
        if (!isMounted) return;

        const mergedAlbum = mergeAlbumWithPending(fetchedAlbum, cachedPending);
        setAlbum(mergedAlbum);
        persistLocalAlbum(mergedAlbum);

        if (Object.keys(cachedPending).length > 0) {
          persistPendingChanges(cachedPending);
          setIsSyncing(true);
        } else {
          localStorage.removeItem(pendingKey);
          setIsSyncing(false);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAlbum();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsSyncing(false);
      return;
    }

    const pendingKey = getPendingChangesKey(userId);

    if (Object.keys(pendingChanges).length === 0) {
      persistPendingChanges({});
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    persistPendingChanges(pendingChanges);

    const timeoutId = window.setTimeout(async () => {
      const changes = { ...pendingChanges };

      try {
        await Promise.all(
          Object.entries(changes).map(([id, tipo]) =>
            updateFigura(userId, Number(id), tipo)
          )
        );
        localStorage.removeItem(pendingKey);
        setPendingChanges({});
        setIsSyncing(false);
      } catch (saveError) {
        setError(saveError);
        // Mantener isSyncing en true para que antes de cerrar siga protegiendo
        // y se pueda reintentar cuando vuelva la conexión.
      }
    }, DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pendingChanges, userId]);

  useEffect(() => {
    if (!userId) return;

    const handleOnline = () => {
      if (Object.keys(pendingChanges).length > 0) {
        setPendingChanges((prev) => ({ ...prev }));
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [pendingChanges, userId]);

  useEffect(() => {
    if (!isSyncing) {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      return;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSyncing]);

  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue = "Tienes cambios sin guardar, ¿estás seguro de salir?";
    return "Tienes cambios sin guardar, ¿estás seguro de salir?";
  };

  const toggleFigura = (id, tipo) => {
    if (id < 1 || id > ALBUM_SIZE) return;

    const current = typeof tipo === "number" ? tipo : album[id - 1];
    const nextTipo = current === 2 ? 0 : current + 1;

    setAlbum((prev) => {
      const next = [...prev];
      next[id - 1] = nextTipo;
      if (userId) {
        persistLocalAlbum(next);
      }
      return next;
    });

    setPendingChanges((prev) => {
      const next = {
        ...prev,
        [id]: nextTipo,
      };
      persistPendingChanges(next);
      return next;
    });
  };

  const progress = useMemo(() => {
    const collected = album.filter((value) => value > 0).length;
    return {
      total: ALBUM_SIZE,
      collected,
      percentage: ALBUM_SIZE ? Math.round((collected / ALBUM_SIZE) * 100) : 0,
    };
  }, [album]);

  return {
    album,
    loading,
    error,
    toggleFigura,
    progress,
    isSyncing,
  };
};

export default useAlbum;
