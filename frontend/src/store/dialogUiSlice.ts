import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface PostDialogState {
//   likesDialog: boolean;
//   commentDetailsDialog: boolean;
//   addCommentDialog: boolean;
// }
// interface ProfileDialogState {
//   followerDialog: boolean;
//   followingDialog: boolean;
// }
// // Define a type for dialog state
// type DialogState = {
//   [postId: string]: PostDialogState; // For post-related dialogs
// } & {
//   [profileId: string]: ProfileDialogState; // For profile-related dialogs
// };

interface DialogState {
  [postId: string]: {
    likesDialog: boolean;
    commentDetailsDialog: boolean;
    addCommentDialog: boolean;
  };
}

const initialState: DialogState = {};

const dialogUiSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    openDialog: (
      state,
      action: PayloadAction<{
        postId: string;
        dialogType: keyof DialogState[string];
      }>
    ) => {
      const { postId, dialogType } = action.payload;

      // Remove dialogs for all posts except the current one
      Object.keys(state).forEach((id) => {
        if (id !== postId) {
          delete state[id];
        }
      });
      if (!state[postId]) {
        state[postId] = {
          likesDialog: false,
          commentDetailsDialog: false,
          addCommentDialog: false,
        };
      }
      state[postId][dialogType] = true;
    },
    closeDialog: (
      state,
      action: PayloadAction<{
        postId: string;
        dialogType: keyof DialogState[string];
      }>
    ) => {
      const { postId, dialogType } = action.payload;
      if (state[postId]) {
        state[postId][dialogType] = false;
      }
    },
    closeAllDialogs: (state) => {
      Object.keys(state).forEach((postId) => {
        delete state[postId];
      });
    },
  },
});

export const { openDialog, closeDialog, closeAllDialogs } =
  dialogUiSlice.actions;
export default dialogUiSlice.reducer;
