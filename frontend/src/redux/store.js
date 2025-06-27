import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {thunk} from "redux-thunk"; 
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { authReducer } from "./reducers/authReducer";  // ✅ IMPORT your auth reducer
import siteReducer from "./reducers/siteReducer";
import subSiteStructureReducer from "./reducers/subSiteStructureReducer";
import { hierarchyReducer } from "./reducers/hierarchyReducer"; 

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer, // ✅ ADD auth reducer here
  site: siteReducer,
  subSiteStructure: subSiteStructureReducer,
  hierarchy: hierarchyReducer, 
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
