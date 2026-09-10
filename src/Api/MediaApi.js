import axios from "axios";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY;
const GIPHY_KEY = import.meta.env.VITE_GIPHY_KEY;

export async function FetchPhotos(query, page = 1, par_page = 40) {
  const res = await axios.get("https://api.unsplash.com/search/photos", {
    params: {
      query,
      page,
      par_page,
    },
    headers: {
      Authorization: `Client-ID ${UNSPLASH_KEY}`,
    },
  });
  return res.data;
}

export async function FetchVideos(query, per_page = 40) {
  const res = await axios.get("https://api.pexels.com/v1/videos/search", {
    params: {
      query,
      per_page,
    },
    headers: {
      Authorization: PEXELS_KEY,
    },
  });

  return res.data;
}

export async function FetchGIF(query, per_page = 40) {
  const res = await axios.get("https://api.giphy.com/v1/gifs/search", {
    params: {
      api_key: GIPHY_KEY,
      q: query,
      limit: per_page,
    },
  });

  return res.data;
}
