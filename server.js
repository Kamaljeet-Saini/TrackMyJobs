import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import "express-async-errors";

//db and authenticate user
import connectDB from "./db/connect.js";

//routers
import authRouter from "./routes/authRoutes.js";
import jobsRouter from "./routes/jobsRoutes.js";

//middleware
import notFoundMiddleWare from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateUser from "./middleware/auth.js";

import morgan from "morgan";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

import helmet from "helmet";
import xss from "xss";
import mongoSanitize from "express-mongo-sanitize";

import cookieParser from "cookie-parser";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, "./client/build")));

//will make json data available to us because we also have post requests
app.use(express.json());
app.use(cookieParser());
//to secure headers
app.use(helmet());
//to make sure we sanitize the input and prevent cross-side scripting attacks
//app.use(xss());
//to prevent mongoDB operator injection
app.use(mongoSanitize());

console.log("Hello");

app.get("/", (req, res) => {
  res.send({ msg: "Welcome" });
});

app.get("/api/v1", (req, res) => {
  res.send({ msg: "Welcome" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

//Looks for the requests that don't match any of the above specified routes
app.use(notFoundMiddleWare);

//Handles errors that occur within the routes
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is running at port ${port}....`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
