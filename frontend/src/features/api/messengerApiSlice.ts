import { apiSlice } from "@features/api/apiSlice";
import type { TChat, TMessage } from "@typesFolder/messengerType";
export const messengerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<TMessage[], string>({
      query: (chatId) => ({
        url: `/messages/${chatId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: TMessage[] }) => {
        return response.data;
      },

      providesTags: (result, _, chatId) =>
        result
          ? [
              // { type: "Message" as const, id: chatId },
              ...result.map(({ _id }) => ({
                type: "Message" as const,
                id: _id,
              })),
            ]
          : [{ type: "Message", id: chatId }],
    }),
    getMessagesNotSeen: builder.query<TMessage[], string>({
      query: (chatId) => ({
        url: `/messages/unseen/${chatId}`,
      }),
      transformResponse: (response: { data: TMessage[] }) => {
        return response.data;
      },

      providesTags: (result, _, chatId) =>
        result
          ? [
              // { type: "Message" as const, id: chatId },
              { type: "Message" as const, id: `UNSEEN-${chatId}` },
              // ...result.map(({ _id }) => ({
              //   type: "Message" as const,
              //   id: _id,
              // })),
            ]
          : [{ type: "Message", id: chatId }],
    }),
    sendMessage: builder.mutation<
      TMessage,
      { content: string; chatId: string }
    >({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: TMessage }) => response.data,
      invalidatesTags: (result, __, { chatId }) =>
        result
          ? [{ type: "Message" as const, id: result._id }]
          : [{ type: "Chat" as const, id: chatId }],
    }),
    deleteMessage: builder.mutation<
      TMessage,
      { messageId: string; chatId: string }
    >({
      query: ({ messageId, chatId }) => ({
        url: `/messages/${chatId}/${messageId}`,
        method: "DELETE",
      }),

      // async onQueryStarted(
      //   { messageId, chatId },
      //   { dispatch, queryFulfilled }
      // ) {
      //   const patchResult = updateDeleteMessageCache(
      //     dispatch,
      //     chatId,
      //     messageId
      //   );
      //   try {
      //     await queryFulfilled;
      //   } catch (error) {
      //     patchResult.undo();
      //     console.error("Error deleting message:", error);
      //   }
      // },
    }),
    createChat: builder.mutation<TChat, { userId: string }>({
      query: (data) => ({
        url: "/chats",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: TChat }) => response.data,
      // invalidatesTags: (result) =>
      //   result ? [{ type: "Chat" as const, id: result._id }] : [],
    }),
    getChats: builder.query<TChat[], void>({
      query: () => ({
        url: `/chats/user`,
        method: "GET",
      }),
      transformResponse: (response: { data: TChat[] }) => {
        return response.data;
      },
      // providesTags: (result) =>
      //   result
      //     ? [...result.map(({ _id }) => ({ type: "Chat" as const, id: _id }))]
      //     : [{ type: "Chats" as const, id: "LIST" }],
    }),
    getChatById: builder.query<TChat, string>({
      query: (chatId: string) => ({
        url: `/chats/${chatId}`,
      }),
      transformResponse: (response: { data: TChat }) => response.data,
      providesTags: (_, __, chatId) => [{ type: "Chat" as const, id: chatId }],
    }),
    deleteChat: builder.mutation<void, string>({
      query: (chatId: string) => ({
        url: `/chats/${chatId}`,
        method: "DELETE",
      }),
      async onQueryStarted(chatId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          messengerSlice.util.updateQueryData(
            "getChats",
            undefined,
            (chats) => {
              return chats.filter((chat) => chat._id.toString() !== chatId);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
          console.error("Error deleting chat:", error);
        }
      },

      // invalidatesTags: (_, __, chatId) => [
      //   { type: "Chat" as const, id: chatId },
      // ],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetMessagesNotSeenQuery,
  useLazyGetMessagesNotSeenQuery,
  useDeleteMessageMutation,

  useGetChatsQuery,
  useGetChatByIdQuery,
  useLazyGetChatByIdQuery,
  useSendMessageMutation,
  useCreateChatMutation,
  useDeleteChatMutation,
} = messengerSlice;
