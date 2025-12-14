import { sign } from "jsonwebtoken";

const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export default generateToken;
