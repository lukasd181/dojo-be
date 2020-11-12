const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fighterSchema = Schema(
  {
    division: {
      type: String,
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
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    age: { type: Number, required: true },
    stance: { type: String, required: false },
    forms: [
      {
        type: String,
        required: true,
        enum: ["MuayThai", "KickBoxing", "Boxing", "JiuJitsu", "MMA"],
      },
    ],
    creator: { type: Schema.ObjectId, required: true, ref: "User" },
    gender: { type: String, required: true, enum: ["male", "female"] },
    location: { type: String, required: true },
    description: { type: String, required: false },
    inAction: { type: String, required: false },
    partnerCount: { type: Number, default: 0 },
    matchesAttended: { type: Number, default:0 },
  },
  {
    timestamps: true,
  }
);
const divisionConvertor = (weight) => {
  let divisions = [
    "Strawweight",
    "Flyweight",
    "Bantamweight",
    "Featherweight",
    "Lightweight",
    "Welterweight",
    "Middleweight",
    "Light Heavyweight",
    "Heavyweight",
  ];
  if (weight <= 52.2) return divisions[0];
  if (weight <= 56.7) return divisions[1];
  if (weight <= 61.2) return divisions[2];
  if (weight <= 65.8) return divisions[3];
  if (weight <= 70.3) return divisions[4];
  if (weight <= 77.1) return divisions[5];
  if (weight <= 83.9) return divisions[6];
  if (weight <= 93.0) return divisions[7];
  if (weight > 93.0) return divisions[8];
};

fighterSchema.pre("save", function (next) {
  if (this.isModified("weight") || !this.division) {
    this.division = divisionConvertor(this.weight);
  }
  next();
});

const Fighter = mongoose.model("Fighter", fighterSchema);
module.exports = Fighter;
