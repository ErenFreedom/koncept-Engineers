import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {thunk} from "redux-thunk"; 
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { authReducer } from "./reducers/authReducer"; 
import siteReducer from "./reducers/siteReducer";
import subSiteStructureReducer from "./reducers/subSiteStructureReducer";
import { hierarchyReducer } from "./reducers/hierarchyReducer"; 
import { subsiteReducer } from "./reducers/subsiteReducer";
import { sensorMountReducer } from "./reducers/sensorMountReducer";
import { displaySensorDataReducer } from "./reducers/displaySensorDataReducer";
import { floorRoomFetchReducer } from "./reducers/floorRoomFetchReducer";


const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer, 
  site: siteReducer,
  subSiteStructure: subSiteStructureReducer,
  hierarchy: hierarchyReducer, 
  subsite: subsiteReducer,
  sensorMount: sensorMountReducer,
  displaySensorData: displaySensorDataReducer,
  floorRoomFetch: floorRoomFetchReducer,
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
