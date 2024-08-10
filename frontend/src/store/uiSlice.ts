import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDialogOpen: false,
  type: "",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openDialog: (state, action) => {
      state.isDialogOpen = true;
      state.type = action.payload;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
      state.type = "";
    },
  },
});

export const { openDialog, closeDialog } = uiSlice.actions;
export default uiSlice.reducer;
