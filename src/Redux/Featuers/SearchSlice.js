import { createSlice } from "@reduxjs/toolkit";

const SearchSlice = createSlice({
  name: "Search",
  initialState: {
    query: "",
    activeTab: "Photos",
    results: [],
    loading: false,
    error: null,
  },

  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    setResults: (state, action) => {
      state.results = action.payload;
      state.loading = false;
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
  },
});

export const {
  setQuery,
  setActiveTab,
  setResults,
  setLoading,
  setError,
  ClearResults,
} = SearchSlice.actions;
export default SearchSlice.reducer;
