import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000, //MS
    httpOnly: true,
    // sameSite: "strict",
    // secure: process.env.NODE_ENV === "production",
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, //MS
    httpOnly: true,
    // sameSite: "strict",
    // secure: process.env.NODE_ENV === "production",
  });

  return token;
};

