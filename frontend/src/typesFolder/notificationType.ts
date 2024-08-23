import { TUser } from "./authType";
export type TNotification = {
  _id: string;
  from: TUser;
  to: TUser;
  type: string;
  read: boolean;
  postId: string;
  createdAt: string;
  updatedAt: string;
};
