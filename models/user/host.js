const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hostSchema = Schema(
  {
    clubName: { type: String, required: true },
    clubImage: { type: String, required: false },
    creator: { type: Schema.ObjectId, required: true, ref: "User" },
    description: { type: String, required: false },
    emailAddress: { type: String, required: true },
    phone: { type: String, required: true },
    hostedMatchesCount: {type: Number, default:0},
  },
  {
    timestamps: true,
  }
);

const Host = mongoose.model("Host", hostSchema);
module.exports = Host;
