import axios from "axios";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY;
const GIPHY_KEY = import.meta.env.VITE_GIPHY_KEY;

export async function FetchPhotos(query, page = 1, per_page = 40) {
  const res = await axios.get("https://api.unsplash.com/search/photos", {
    params: {
      query,
      page,
      // NOTE: was "par_page" (typo) before infinite-scroll work — Unsplash ignored it
      // and silently fell back to its own default page size. Fixed so `page` actually
      // pages through distinct batches of `per_page` results.
      per_page,
    },
    headers: {
      Authorization: `Client-ID ${UNSPLASH_KEY}`,
    },
  });
  return res.data;
}

// page is 1-indexed, matching Pexels' own pagination model.
export async function FetchVideos(query, page = 1, per_page = 40) {
  const res = await axios.get("https://api.pexels.com/v1/videos/search", {
    params: {
      query,
      page,
      per_page,
    },
    headers: {
      Authorization: PEXELS_KEY,
    },
  });

  return res.data;
}

// Giphy paginates via offset/limit rather than page numbers.
export async function FetchGIF(query, offset = 0, per_page = 40) {
  const res = await axios.get("https://api.giphy.com/v1/gifs/search", {
    params: {
      api_key: GIPHY_KEY,
      q: query,
      limit: per_page,
      offset,
    },
  });

  return res.data;
}
