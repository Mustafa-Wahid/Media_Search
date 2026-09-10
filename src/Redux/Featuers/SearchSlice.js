import { createSlice } from "@reduxjs/toolkit";

const SearchSlice = createSlice({
  name: "Search",
  initialState: {
    query: "",
    activeTab: "All",
    results: [],
    loading: false,
    error: null,
    // --- infinite scroll (pagination) state ---
    page: 1,
    hasMore: true,
    loadingMore: false,
    loadMoreError: null,
  },

  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
      // new search term -> pagination starts over from page 1
      state.page = 1;
      state.hasMore = true;
      state.loadingMore = false;
      state.loadMoreError = null;
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      // switching All/Photos/Videos/GIF is effectively a new search -> reset pagination
      state.page = 1;
      state.hasMore = true;
      state.loadingMore = false;
      state.loadMoreError = null;
    },

    setResults: (state, action) => {
      // first page of a fresh search/tab: replace, don't append
      state.results = action.payload;
      state.loading = false;
    },

    // append a subsequent page's results to the existing ones (infinite scroll)
    appendResults: (state, action) => {
      state.results = state.results.concat(action.payload);
      state.loadingMore = false;
    },

    setLoading: (state, action) => {
      state.loading = true;
      state.error = null;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    ClearResults: (state) => {
      state.results = [];
    },

    setPage: (state, action) => {
      state.page = action.payload;
    },

    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },

    setLoadingMore: (state, action) => {
      state.loadingMore = action.payload;
      if (action.payload) state.loadMoreError = null;
    },

    setLoadMoreError: (state, action) => {
      state.loadMoreError = action.payload;
      state.loadingMore = false;
    },
  },
});

export const {
  setQuery,
  setActiveTab,
  setResults,
  appendResults,
  setLoading,
  setError,
  ClearResults,
  setPage,
  setHasMore,
  setLoadingMore,
  setLoadMoreError,
} = SearchSlice.actions;
export default SearchSlice.reducer;