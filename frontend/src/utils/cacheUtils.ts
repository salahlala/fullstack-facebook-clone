import { apiSlice } from "@features/api/apiSlice";
import { messengerSlice } from "@features/api/messengerApiSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { AppDispatch } from "@store/index";
import type { TMessage } from "@typesFolder/messengerType";
export const updateUnseenMessagesCache = (
  dispatch: Dispatch,
  chatId: string
) => {
  dispatch(
    apiSlice.util.invalidateTags([{ type: "Message", id: `UNSEEN-${chatId}` }])
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
        // Replace the old messages with the updated ones
        messagesToUpdate.forEach((updatedMessage: TMessage) => {
          const index = draft.findIndex(
            (msg) => msg._id === updatedMessage._id
          );
          if (index !== -1) {
            draft[index] = { ...draft[index], ...updatedMessage }; // Replace the old message with the updated one
          }
        });
      }
    )
  );
};

export const updateNewMessagesCache = (
  dispatch: AppDispatch,
  chatId: string,
  data: TMessage
) => {
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
