import { createSlice } from "@reduxjs/toolkit";
import { toast, Zoom } from "react-toastify";

// Composite key used ONLY by the new multi-collection logic below, so media
// from different sources (photo/Video/GIF) that happen to share a numeric id
// can never collide inside a collection's mediaIds list. This does NOT touch
// how `items` is keyed (that dedup logic is untouched, see addCollection).
export const getMediaKey = (item) => `${item.type}-${item.id}`;

const genId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const initialState = {
  // UNCHANGED - this is the existing flat "Favorites" pool of saved media.
  // The Save button on ResultCard/MediaModal keeps writing here exactly as
  // it always has. It also doubles as the lookup table the new named
  // collections use to render their media (see addMediaToUserCollection).
  items: JSON.parse(localStorage.getItem("collection")) || [],

  // NEW - user-created named collections. Each entry only stores a name,
  // description and a list of mediaIds (composite keys) pointing back into
  // `items`. No media is duplicated, and nothing about `items` changes shape.
  collections: JSON.parse(localStorage.getItem("userCollections")) || [],

  // NEW - lightweight side-table of { [mediaKey]: timestamp } used only to
  // power the "recently added" stat on the dashboard. Kept separate from
  // `items` so the existing media object structure is never touched.
  savedAt: JSON.parse(localStorage.getItem("collectionSavedAt")) || {},
};

const persistItems = (state) =>
  localStorage.setItem("collection", JSON.stringify(state.items));
const persistCollections = (state) =>
  localStorage.setItem("userCollections", JSON.stringify(state.collections));
const persistSavedAt = (state) =>
  localStorage.setItem("collectionSavedAt", JSON.stringify(state.savedAt));

const CollectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {
    // ================= EXISTING REDUCERS (behavior unchanged) =================
    addCollection: (state, action) => {
      const alreadyExists = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (!alreadyExists) {
        state.items.push(action.payload);
        persistItems(state);
        console.log("ha ha");

        // Additive only: record when this media was saved, for the
        // "recently added" stat. Does not alter `items` itself.
        state.savedAt[getMediaKey(action.payload)] = Date.now();
        persistSavedAt(state);
      }
    },
    removeCollection: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistItems(state);
    },
    clearCollection: (state, action) => {
      state.items = [];
      localStorage.removeItem("collection");
    },
    addedToast: () => {
      toast.success("Added to collection! \u2705", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true,
        theme: "dark",
        transition: Zoom,
      });
    },
    removeToast: () => {
      toast.error("Removed from collection! \u274c", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true,
        theme: "dark",
        transition: Zoom,
      });
    },

    // ================= NEW: named collections =================
    createUserCollection: {
      reducer: (state, action) => {
        const { id, name, description } = action.payload;
        state.collections.push({
          id,
          name,
          description: description || "",
          mediaIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        persistCollections(state);
      },
      prepare: (payload) => ({
        payload: { id: genId(), ...payload },
      }),
    },

    renameUserCollection: (state, action) => {
      const { id, name } = action.payload;
      const col = state.collections.find((c) => c.id === id);
      if (col) {
        col.name = name;
        col.updatedAt = Date.now();
        persistCollections(state);
      }
    },

    deleteUserCollection: (state, action) => {
      // Only removes the named grouping itself. The underlying media stays
      // in `items` (Favorites) untouched, per the "data safety" requirement.
      state.collections = state.collections.filter(
        (c) => c.id !== action.payload,
      );
      persistCollections(state);
    },

    addMediaToUserCollection: (state, action) => {
      const { collectionId, item } = action.payload;
      const col = state.collections.find((c) => c.id === collectionId);
      if (!col) return;

      const key = getMediaKey(item);
      if (!col.mediaIds.includes(key)) {
        col.mediaIds.push(key);
        col.updatedAt = Date.now();
        persistCollections(state);
      }

      // A collection can only render media that also lives in the shared
      // `items` pool, so make sure it's there (mirrors addCollection's own
      // dedup, kept id-only there on purpose to not change its behavior).
      const alreadyInItems = state.items.some((i) => i.id === item.id);
      if (!alreadyInItems) {
        state.items.push(item);
        persistItems(state);
      }
      if (!state.savedAt[key]) {
        state.savedAt[key] = Date.now();
        persistSavedAt(state);
      }
    },

    removeMediaFromUserCollection: (state, action) => {
      const { collectionId, mediaKey } = action.payload;
      const col = state.collections.find((c) => c.id === collectionId);
      if (!col) return;
      col.mediaIds = col.mediaIds.filter((k) => k !== mediaKey);
      col.updatedAt = Date.now();
      persistCollections(state);
    },

    collectionToast: (_state, action) => {
      const { message, variant } = action.payload;
      const fn = variant === "error" ? toast.error : toast.success;
      fn(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true,
        theme: "dark",
        transition: Zoom,
      });
    },
  },
});

export const {
  addCollection,
  removeCollection,
  clearCollection,
  addedToast,
  removeToast,
  createUserCollection,
  renameUserCollection,
  deleteUserCollection,
  addMediaToUserCollection,
  removeMediaFromUserCollection,
  collectionToast,
} = CollectionSlice.actions;
export default CollectionSlice.reducer;
