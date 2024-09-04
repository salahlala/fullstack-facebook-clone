import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
  const cookieOptions = (maxAge) => ({
    maxAge,
    httpOnly: true,
    // sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.cookie("jwt", token, cookieOptions(1 * 24 * 60 * 60 * 1000)); // 1 day

  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(7 * 24 * 60 * 60 * 1000)
  ); // 7 days

  return token;
};
