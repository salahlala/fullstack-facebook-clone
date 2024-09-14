import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "@features/api/apiSlice";
import authSlice from "@store/authSlice";
import uiSlice from "@store/uiSlice";
import dialogUiSlice from "@store/dialogUiSlice";
import socketSlice from "./socketSlice";
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authSlice,
  ui: uiSlice,
  dialog: dialogUiSlice,
  socket: socketSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable the check
    }).concat(apiSlice.middleware),
  devTools: true,
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
