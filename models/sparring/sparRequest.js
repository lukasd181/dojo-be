const mongoose = require("mongoose");
const Fighter = require("../user/fighter");
const Schema = mongoose.Schema;

const sparRequestSchema = Schema(
  {
    from: { type: Schema.ObjectId, required: true, ref: "Fighter" },
    to: { type: Schema.ObjectId, required: true, ref: "Fighter" },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "declined", "cancelled", "removed"],
    },
  },
  {
    timestamps: true,
  }
);

sparRequestSchema.statics.partnerUpdate = async function (fighterId) {
  const stats = await SparRequest.find({
    $and: [
      { $or: [{ from: fighterId }, { to: fighterId }] },
      { status: "accepted" },
    ],
  }).count();
  await Fighter.findByIdAndUpdate({ _id: fighterId }, { partnerCount: stats });
};

sparRequestSchema.post("save", async function () {
  await this.constructor.partnerUpdate(this.to);
  await this.constructor.partnerUpdate(this.from);
});

const SparRequest = mongoose.model("SparRequest", sparRequestSchema);
module.exports = SparRequest;
