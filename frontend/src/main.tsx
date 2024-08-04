import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "@store/index";
import AppRouter from "@routes/AppRouter";
import { ThemeProvider } from "@components/theme-provider";
import AuthProvider from "react-auth-kit";

import { store as authStore } from "@lib/authStore";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Provider store={store}>
        <AuthProvider store={authStore}>
          <AppRouter />
        </AuthProvider>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
