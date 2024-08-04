
export type authType = {
  email: string
  password: string
  fullname?: string
  username?: string
}

export type TUser = {
  _id: string
  username: string
  email: string
  fullName: string
  followers: string[]
  following: string[]
  profileImg: string
  bio: string
  coverImg: string
  __v: number
  updatedAt: Date
  likedPosts: string[]
}