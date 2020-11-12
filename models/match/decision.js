const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const decisionSchema = Schema(
  {
    won: { type: Schema.ObjectId, ref: "Fighter", required: true },
    lost: { type: Schema.ObjectId, ref: "Fighter", required: true },
    decision: {
      type: String,
      enum: ["PTS", "UD", "SD", "MD", "KO", "TKO", "DQ", "RTD"],
      required: true,
    },
    matchInfo: { type: Schema.ObjectId, ref: "Match", required: true },
  },
  { timestamps: true }
);

const Decision = mongoose.model("Decision", decisionSchema);
module.exports = Decision;
