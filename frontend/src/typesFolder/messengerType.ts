import type { TUser } from "./authType";

export type TMessage = {
  chat: TChat;
  content: string;
  seen: boolean;
  sender: TUser;
  receiver?: string;
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
