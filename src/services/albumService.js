import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "../config/firebase.js";

const firestore = getFirestore(app);
const DEFAULT_ALBUM_LENGTH = 980;

const buildDefaultAlbum = () => Array(DEFAULT_ALBUM_LENGTH).fill(0);

const getAlbumDocRef = (userId) => doc(firestore, "albums", userId);

export const getUserAlbum = async (userId) => {
  if (!userId) throw new Error("getUserAlbum requiere userId");

  const albumDoc = await getDoc(getAlbumDocRef(userId));

  if (!albumDoc.exists()) {
    return buildDefaultAlbum();
  }

  const data = albumDoc.data();
  const stickers = data?.stickers || {};
  const album = buildDefaultAlbum();

  Object.entries(stickers).forEach(([key, value]) => {
    const index = Number(key) - 1;
    if (index >= 0 && index < DEFAULT_ALBUM_LENGTH) {
      album[index] = Number(value) || 0;
    }
  });

  return album;
};

export const getAlbumDocument = async (userId) => {
  if (!userId) throw new Error("getAlbumDocument requiere userId");

  const albumDoc = await getDoc(getAlbumDocRef(userId));
  return albumDoc.exists() ? albumDoc.data() : null;
};

export const updateFigura = async (userId, id, tipo) => {
  if (!userId) throw new Error("updateFigura requiere userId");
  if (!id || id < 1 || id > DEFAULT_ALBUM_LENGTH) {
    throw new Error("updateFigura requiere un id entre 1 y 980");
  }

  const docRef = getAlbumDocRef(userId);
  await setDoc(
    docRef,
    {
      stickers: {
        [id]: tipo,
      },
    },
    { merge: true }
  );
};
