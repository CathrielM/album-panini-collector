const CATEGORY_SIZE = 100;
const ALBUM_SIZE = 980;

const normalizeAlbum = (album) => {
  if (!Array.isArray(album)) return Array(ALBUM_SIZE).fill(0);
  if (album.length >= ALBUM_SIZE) return album.slice(0, ALBUM_SIZE);
  return [...album, ...Array(ALBUM_SIZE - album.length).fill(0)];
};

const buildCategories = (items) => {
  const categories = [];
  for (let start = 0; start < ALBUM_SIZE; start += CATEGORY_SIZE) {
    const end = Math.min(start + CATEGORY_SIZE, ALBUM_SIZE);
    categories.push({
      label: `${start + 1}-${end}`,
      ids: items.filter((item) => item.id > start && item.id <= end).map((item) => item.id),
    });
  }
  return categories;
};

export const calculateMatch = (myAlbum, friendAlbum) => {
  const mine = normalizeAlbum(myAlbum);
  const friend = normalizeAlbum(friendAlbum);

  const itemsIneed = [];
  const itemsHeNeeds = [];

  for (let i = 0; i < ALBUM_SIZE; i += 1) {
    const myValue = mine[i];
    const friendValue = friend[i];

    if (myValue === 0 && friendValue === 2) {
      itemsIneed.push({ id: i + 1 });
    }
    if (myValue === 2 && friendValue === 0) {
      itemsHeNeeds.push({ id: i + 1 });
    }
  }

  return {
    loQueMeSirve: buildCategories(itemsIneed),
    loQueLeSirve: buildCategories(itemsHeNeeds),
  };
};
