const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, require: false, default: "" },
    password: { type: String, required: true, select: false },
    emailVerificationCode: { type: String, select: false },
    emailVerified: { type: Boolean, require: true, default: false },
    description: { type: String, require: false, default: "" },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
