const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchReviewSchema = Schema({
  from: { type: Schema.ObjectId, required: true, ref: "User" },
  to: { type: Schema.ObjectId, required: true, ref: "Match" },
  description: { type: String, required: true },
  isDeleted: {type: Boolean, default: false}
});

const MatchReview = mongoose.model("MatchReview", matchReviewSchema);
module.exports = MatchReview;