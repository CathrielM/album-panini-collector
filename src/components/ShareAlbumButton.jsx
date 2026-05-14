import React, { useRef, useState } from "react";

const ShareAlbumButton = ({ userId }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);

  const handleShare = async () => {
    if (!userId) return;

    const shareUrl = `${window.location.origin}/match/${userId}`;
    const shareText = "¡Mira mis repetidas del álbum y comparemos qué nos falta!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Álbum Panini",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error compartiendo:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage("¡Enlace de comparación copiado!");
        setShowToast(true);

        if (toastTimer.current) {
          clearTimeout(toastTimer.current);
        }

        toastTimer.current = setTimeout(() => {
          setShowToast(false);
        }, 2500);
      } catch (error) {
        console.error("Error al copiar:", error);
        setToastMessage("Error al copiar el enlace");
        setShowToast(true);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full bg-indigo-600 p-2.5 text-white shadow-lg transition hover:bg-indigo-700 active:scale-95 sm:rounded-2xl sm:px-4 sm:py-2.5"
        title="Compartir mi álbum"
      >
        <span className="inline-block text-lg sm:mr-2">↗</span>
        <span className="hidden text-sm font-semibold sm:inline">Compartir</span>
      </button>

      {showToast && (
        <div className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full border border-indigo-500 bg-indigo-500/15 px-4 py-2.5 text-sm font-semibold text-indigo-100 shadow-lg backdrop-blur-md sm:bottom-auto sm:top-20">
          <span>✓</span>
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default ShareAlbumButton;
