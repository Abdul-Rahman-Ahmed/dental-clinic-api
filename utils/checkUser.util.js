import User from "../models/user.model.js";

export const checkUserExists = async (email, session) => {
  return session
    ? await User.exists({ email }).session(session)
    : await User.exists({ email });
};
