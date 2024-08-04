import { createSlice } from "@reduxjs/toolkit";

type AuthState = {
  isLoggedIn: boolean;
  user: {
    _id: string;
    email: string;
    username: string;
  };
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: {
    _id: "",
    email: "",
    username: "",
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
