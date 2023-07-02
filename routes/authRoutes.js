import express from "express";
const router = express.Router();

import rateLimiter from "express-rate-limit";

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 10,
  message:
    "Too many requests from this IP address, please try again after 15 minutes",
});

import {
  register,
  login,
  updateUser,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";
import authenticateUser from "../middleware/auth.js";
import testUser from "../middleware/testUser.js";

//register and login are public and anyone can have access to these two
//so we need not add 'authenticateUser' to it
router.route("/register").post(apiLimiter, register);
router.route("/login").post(apiLimiter, login);
router.route("/logout").get(logout);
//updateUser path must be restricted to authenticate the user first
router.route("/updateUser").patch(authenticateUser, testUser, updateUser);
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);

export default router;
