import { UnAuthenticatedError } from "../errors/index.js";
import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthenticatedError("Authentication Invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    //in payload we are getting back the user id
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //attach the user request object
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    //if suppose token expires then we may land in the error section
    throw new UnAuthenticatedError("Authentication Invalid");
  }
};

export default auth;
