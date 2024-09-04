import type { TUser } from "./authType";

export type TMessage = {
  chat: string;
  content: string;
  seen: boolean;
  sender: TUser;
  status: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
};
export type TChat = {
  _id: string;
  members: TUser[];
  lastMessage: TMessage;
  createdAt: string;
  updatedAt: string;
};
