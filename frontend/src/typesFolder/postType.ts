import { TUser } from "./authType";
export type TPost = {
  _id: string;
  text?: string;
  img?: {
    public_id: string;
    url: string;
  };
  user: TUser;
  likes: TUser[];
  comments: TComment[];
  createdAt?: string;
  updatedAt?: string;
};

export type TComment = {
  _id: string;
  user: TUser;
  text: string;
};
