import { apiSlice } from "@features/api/apiSlice";
import { messengerSlice } from "@features/api/messengerApiSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { AppDispatch } from "@store/index";
import type { TMessage, TChat } from "@typesFolder/messengerType";

export const updateUnseenMessagesCache = (
  dispatch: Dispatch,
  chatId: string
) => {
  dispatch(
    apiSlice.util.invalidateTags([{ type: "Message", id: `UNSEEN-${chatId}` }])
  );
  dispatch(
    apiSlice.util.invalidateTags([{ type: "Message", id: "ALLUNSEEN" }])
  );
};

export const updateMessagesStatusCache = (
  dispatch: AppDispatch,
  chatId: string,
  messagesToUpdate: TMessage[]
) => {
  dispatch(
    messengerSlice.util.updateQueryData(
      "getMessages",
      chatId,
      (draft: TMessage[]) => {
        // Map message updates by _id for quick lookups
        const updatesMap = new Map(
          messagesToUpdate.map((msg) => [msg._id.toString(), msg])
        );

        // Iterate over the draft messages and apply updates
        draft.forEach((message, index) => {
          const update = updatesMap.get(message._id.toString());
          // console.log(update);
          if (update) {
            Object.assign(message, update); // Use immer to mutate the draft
            console.log(`Updated message at index ${index}:`, message);
          }
        });
      }
    )
  );
};

export const updateNewMessagesCache = (
  dispatch: AppDispatch,
  chat: string,
  data: TMessage
) => {
  const chatId = chat.toString();
  dispatch(
    messengerSlice.util.updateQueryData(
      "getMessages",
      chatId,
      (draft: TMessage[]) => {
        draft.push(data);
      }
    )
  );
};

export const updateDeleteMessageCache = (
  dispatch: AppDispatch,
  chatId: string,
  messageId: string
) => {
  const patchResult = dispatch(
    messengerSlice.util.updateQueryData(
      "getMessages",
      chatId,
      (draft: TMessage[]) => {
        return draft.filter(
          (message: TMessage) => message._id.toString() !== messageId
        );
      }
    )
  );
  return patchResult;
};

export const updateChatsCache = (dispatch: AppDispatch, data: TChat) => {
  dispatch(
    messengerSlice.util.updateQueryData(
      "getChats",
      undefined,
      (draft: TChat[]) => {
        const index = draft.findIndex(
          (chat) => chat._id.toString() === data._id.toString()
        );
        if (index !== -1) {
          draft[index] = data;
        }
      }
    )
  );
};

export const updateLastMessageCache = (
  dispatch: AppDispatch,
  data: TMessage
) => {
  dispatch(
    messengerSlice.util.updateQueryData(
      "getChats",
      undefined,
      (draft: TChat[]) => {
        const index = draft.findIndex(
          (chat) => chat._id.toString() === data.chat.toString()
        );
        if (index !== -1) {
          draft[index].lastMessage = data;
        }
      }
    )
  );
};

export const updateCreateChatCache = (dispatch: AppDispatch, data: TChat) => {
  dispatch(
    messengerSlice.util.updateQueryData(
      "getChats",
      undefined,
      (draft: TChat[]) => {
        const index = draft.findIndex(
          (chat) => chat._id.toString() === data._id.toString()
        );
        if (index === -1) {
          draft.unshift(data);
        }
      }
    )
  );
};
