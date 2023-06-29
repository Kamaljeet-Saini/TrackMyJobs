import express from "express";
const router = express.Router();

import { register, login, updateUser } from "../controllers/authController.js";
import authenticateUser from "../middleware/auth.js";

//register and login are public and anyone can have access to these two
//so we need not add 'authenticateUser' to it
router.route("/register").post(register);
router.route("/login").post(login);
//updateUser path must be restricted to authenticate the user first
router.route("/updateUser").patch(authenticateUser, updateUser);

export default router;
