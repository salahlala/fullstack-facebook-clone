import { apiSlice } from "@features/api/apiSlice";

import { TNotification } from "@typesFolder/notificationType";

// Define the response structure
interface INotificationsResponse {
  unreadCount: number;
  notifications: TNotification[];
}

export const notificationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<INotificationsResponse, void>({
      query: () => "/notifications",
      providesTags: ["Notification"],
      transformResponse: (response: { data: INotificationsResponse }) =>
        response.data,
    }),
    deleteNotificationById: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/single/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    markNotificationAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-as-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useDeleteNotificationByIdMutation,
  useMarkNotificationAsReadMutation,
} = notificationSlice;
