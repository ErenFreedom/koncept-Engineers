import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import { combineReducers } from "redux";
import { thunk } from "redux-thunk";

import { authReducer } from "./reducers/authReducer"; // Ensure correct export

// ✅ Persist Config
const persistConfig = {
  key: "root",
  storage,
};

// ✅ Combine Reducers
const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
});

// ✅ Create Store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

// ✅ Persistor
const persistor = persistStore(store);

export { store, persistor };
