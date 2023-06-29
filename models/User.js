import mongoose from "mongoose";
//Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
//Mongoose simplifies the process of defining database schemas, performing CRUD operations, handling relationships between data, simplifies interaction with mongoDb.
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    max_length: 20,
    trim: true, //trim extra spaces from beginning or the end
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
    unique: true, //ensures that user should not signup with an email already used but this is not technically enough to achieve validation functionality
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
    select: false,
  },
  lastName: {
    type: String,
    trim: true,
    max_length: 20,
    default: "last name",
  },
  location: {
    type: String,
    trim: true,
    max_length: 20,
    default: "my city",
  },
});

//this middleware shall get triggered prior to saving a document while create or update
UserSchema.pre("save", async function () {
  //"salt" is a random value that is added to the password before it is hashed
  //console.log(this.modifiedPaths());
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
