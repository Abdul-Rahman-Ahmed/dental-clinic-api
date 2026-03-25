import jwt from "jsonwebtoken";

export const newToken = (data, isAccessToken = null) =>
  jwt.sign(
    data,
    isAccessToken ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: isAccessToken ? "15m" : "7d",
    }
  );

export const verifyToken = (token, isAccessToken = null) => {
  return jwt.verify(
    token,
    isAccessToken ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET
  );
};
