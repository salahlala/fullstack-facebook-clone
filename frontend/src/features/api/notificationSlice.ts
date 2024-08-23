import { apiSlice } from "@features/api/apiSlice";

import { TNotification } from "@typesFolder/notificationType";

// Define the response structure
interface INotificationsResponse {
  length: number;
  notifications: TNotification[];
}

export const notificationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<INotificationsResponse, void>({
      query: () => "/notifications",
      transformResponse: (response: { data: INotificationsResponse }) =>
        response.data,
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationSlice;
