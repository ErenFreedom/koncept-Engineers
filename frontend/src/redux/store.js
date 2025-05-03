import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
import { combineReducers } from "redux";
import { thunk } from "redux-thunk";

import { authReducer } from "./reducers/authReducer"; 


const persistConfig = {
  key: "root",
  storage,
};


const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
});


const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});


const persistor = persistStore(store);

export { store, persistor };
