const mongoose = require("mongoose");
const User = require("../user/user");
const Schema = mongoose.Schema;

const reviewSchema = Schema(
  {
    from: { type: Schema.ObjectId, required: true, ref: "User" },
    to: { type: Schema.ObjectId, required: true, ref: "User" },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

reviewSchema.statics.reviewCount = async function (toUserId) {
  const stats = await Review.find({ to: toUserId, isDeleted: false }).count();
  await User.findByIdAndUpdate({ _id: toUserId }, { reviewCount: stats });
};

reviewSchema.post("save", async function () {
  await this.constructor.reviewCount(this.to);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
