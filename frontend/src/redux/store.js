import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import siteReducer from "./reducers/siteReducer";
import subSiteStructureReducer from "./reducers/subSiteStructureReducer";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  site: siteReducer,
  subSiteStructure: subSiteStructureReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(thunk),
});

export const persistor = persistStore(store);
