import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDialogOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openDialog: (state) => {
      state.isDialogOpen = true;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
    },
  },
});

export const { openDialog, closeDialog } = uiSlice.actions;
export default uiSlice.reducer;
