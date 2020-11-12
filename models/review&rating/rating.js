const mongoose = require("mongoose");
const User = require("../user/user");
const Schema = mongoose.Schema;

const ratingSchema = Schema(
  {
    ratingScore: { type: Number, required: true },
    from: { type: Schema.ObjectId, requried: true, ref: "User" },
    to: { type: Schema.ObjectId, required: true, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ratingSchema.statics.calculateRating = async function (toUserId) {
  const stats = await this.aggregate([
    {
      $match: { to: toUserId, isDeleted: false },
    },
    {
      $group: {
        _id: { to: "$to" },
        averageRating: { $avg: "$ratingScore" },
        total: { $sum: "$ratingScore" },
      },
    },
  ]);
  
  await User.findByIdAndUpdate(toUserId, {
    avgRating: (stats[0] && stats[0].averageRating) || 0,
    total: stats[0].total,
  });
};

ratingSchema.post("save", async function () {
  await this.constructor.calculateRating(this.to);
});

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
