const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, require: false, default: "" },
    password: { type: String, required: true, select: false },
    emailVerificationCode: { type: String, select: false },
    emailVerified: { type: Boolean, required: true, default: false },
    description: { type: String, require: false, default: "" },
    isDeleted: { type: Boolean, default: false, select: false },
    userType: { type: String, required: true, enum: ["fighter", "host"] },
    reviewCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    interestedMatch: [{ type: Schema.ObjectId, ref: "Match" }],
  },
  { timestamps: true }
);

// userSchema.methods.toJSON = function () {
//   const obj = this._doc;
//   delete obj.password;
//   delete obj.emailVerified;
//   delete obj.emailVerificationCode;
//   delete obj.isDeleted;
//   return obj;
// };

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
