import { configureStore } from "@reduxjs/toolkit";
import SearchReducer from "./Featuers/SearchSlice";
import collectionReducer from "./Featuers/CollectionSlice";

export const store = configureStore({
  reducer: {
    Search: SearchReducer,
    collection: collectionReducer,
  },
});
