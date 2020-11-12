const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchRequest = Schema(
  {
    description: {type: String, required: true},
    from: { type: Schema.ObjectId, required: true, ref: "Fighter" },
    to: { type: Schema.ObjectId, required: true, ref: "Match" },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "declined", "cancelled"],
    }
  },
  {
    timestamps: true,
  }
);


const MatchRequest = mongoose.model("MatchResquest", matchRequest);
module.exports = MatchRequest;


// matchRequestId => matchId => creator (compare with userId)
