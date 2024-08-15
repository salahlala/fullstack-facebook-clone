
export type authType = {
  email: string
  password: string
  fullname?: string
  username?: string
}

export type TUser = {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  followers: TUser[];
  following: TUser[];
  profileImg: {
    public_id: string;
    url: string;
  };
  bio: string;
  coverImg: string;
  __v: number;
  updatedAt: Date;
  likedPosts: string[];
};