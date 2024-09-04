import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TUser } from "@typesFolder/authType";
import type { TMessage } from "@typesFolder/messengerType";
export interface MessengerState {
  selectedChat: string;
  user: {
    _id: string;
    fullName: string;
    profileImg: {
      public_id: string;
      url: string;
    };
  };
  messages: TMessage[];
}

const initialState: MessengerState = {
  selectedChat: "",
  user: {
    _id: "",
    fullName: "",
    profileImg: {
      public_id: "",
      url: "",
    },
  },
  messages: [],
};

const messengerSlice = createSlice({
  name: "messenger",
  initialState,
  reducers: {
    setSelectedChat: (
      state,
      action: PayloadAction<{ chat: string; user: TUser }>
    ) => {
      const { chat, user } = action.payload;
      state.selectedChat = chat;

      state.user = user;
    },
    setMessages: (state, action: PayloadAction<TMessage[]>) => {
      state.messages = action.payload;
    },
  },
});

export const { setSelectedChat, setMessages } = messengerSlice.actions;
export default messengerSlice.reducer;
