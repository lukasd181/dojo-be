const mongoose = require("mongoose");
const Host = require("../user/host");
const Schema = mongoose.Schema;

const matchSchema = Schema(
  {
    rounds: { type: Number, required: true },
    roundDuration: { type: Number, required: true },
    matchTitle: { type: String, required: false },
    form: {
      type: String,
      required: true,
      enum: ["MuayThai", "KickBoxing", "Boxing", "JiuJitsu", "MMA"],
    },
    gender: { type: String, required: true, enum: ["male", "female"] },
    division: {
      type: String,
      required: true,
      enum: [
        "Strawweight",
        "Flyweight",
        "Bantamweight",
        "Featherweight",
        "Lightweight",
        "Welterweight",
        "Middleweight",
        "Light Heavyweight",
        "Heavyweight",
      ],
    },
    fighters: [{ type: Schema.ObjectId, ref: "Fighter" }],

    status: {
      type: String,
      enum: ["ready", "ended", "cancelled", "looking", "happening"],
    },
    host: { type: Schema.ObjectId, required: true, ref: "Host" },
    location: { type: String, required: true },
    description: { type: String, required: false },
    timeHappen: { type: Date, required: true },
    reviewCoiunt: { type: Number, default: 0 },
    matchRequestCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

matchSchema.pre("save", function (next) {
  if (this.fighters.length < 2) {
    this.status = "looking";
  }
  if (this.fighters.length == 2) {
    this.isLooking = "ready";
  }
  next();
});

matchSchema.statics.matchCount = async function (hostId) {
  const matchCount = await Match.find({
    host: hostId,
    $or: [{ status: "ended" }, { status: "ready" }, { status: "looking" }],
  }).count();
  await Host.findByIdAndUpdate(
    { _id: hostId },
    { hostedMatchesCount: matchCount }
  );
};

matchSchema.post("save", async function () {
  await this.constructor.matchCount(this.host._id);
});

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
