const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceSchema = Schema(
  {
    title: { type: String, required: true },
    pictures: { type: [String], required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Cooking",
        "Art and Culture",
        "Sports",
        "Entertainment",
        "Food and drink",
        "Nature and outdoors",
        "Transportation activities",
        "Sightseeing",
      ],
    },
    minimumRate: { type: Number, required: true },
    duration: { type: Number, required: true },
    groupCapacity: { type: Number, required: true },
    language: {
      type: [String],
      required: true,
      enum: ["English", "Vietnamese", "Korean", "French"],
    },
    description: { type: String, required: true },
    user: { type: Schema.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);

module.exports = Experience;
