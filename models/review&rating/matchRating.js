const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchRatingSchema = Schema({
  from: { type: Schema.ObjectId, required: true, ref: "User" },
  to: { type: Schema.ObjectId, required: true, ref: "Match" },
  ratingScore: { type: Number, required: true },
});

const MatchRating = mongoose.model("MatchRating", matchRatingSchema);
module.exports = MatchRating;
