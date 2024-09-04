import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "@features/api/apiSlice";
import authSlice from "@store/authSlice";
import uiSlice from "@store/uiSlice";
import dialogUiSlice from "@store/dialogUiSlice";
import socketSlice from "./socketSlice";
import messengerSlice from "@store/messengerSlice";
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authSlice,
  ui: uiSlice,
  dialog: dialogUiSlice,
  socket: socketSlice,
  messenger: messengerSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable the check
      // serializableCheck: {
      //   ignoredPaths: ["socket.socket"],
      //   ignoredActions: ["socket/setSocket"],
      // },
    }).concat(apiSlice.middleware),
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
