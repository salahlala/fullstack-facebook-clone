import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "@features/api/apiSlice";
import authSlice from "@store/authSlice";
import uiSlice from "@store/uiSlice";
import dialogUiSlice from "@store/dialogUiSlice";
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authSlice,
  ui: uiSlice,
  dialog: dialogUiSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

// store.subscribe(() => {
//   const state = store.getState();
//   if (!state.auth.isLoggedIn) {
//     store.dispatch(apiSlice.util.resetApiState());
//   }
// });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
