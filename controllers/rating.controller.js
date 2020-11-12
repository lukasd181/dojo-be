const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const ratingController = {};
const Rating = require("../models/review&rating/rating");
const User = require("../models/user/user");

ratingController.rateUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const toUserId = req.params.id;
  const rating = await Rating.find({ from: userId, to: toUserId });
  console.log("RATING", rating);
  if (rating.length > 0 ) {
    return next(
      new AppError(400, "You already rated this user", "Rating Error")
    );
  } else {
    const { ratingScore } = req.body;
    const rating = new Rating({
      from: userId,
      to: toUserId,
      ratingScore,
    });

    //   const test = await Rating.aggregate({});

    rating.save();
    return sendResponse(res, 200, true, rating, null, null);
  }
});

ratingController.getRating = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const toUserId = req.params.id;
  const rating = await Rating.find({ from: userId, to: toUserId });
  if (!rating || rating.isDeleted) {
    return sendResponse(res, 200, true, { message: "able" }, null, null);
  } else {
    return sendResponse(res, 200, true, { message: "unble" }, null, null);
  }
});

ratingController.changeRatingScore = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const ratingId = req.params.id;
  const { ratingScore } = req.body;
  const rating = await Rating.findById({ _id: ratingId });
  if (rating.from == userId) {
    rating.ratingScore = ratingScore;
    rating.save();
    return sendResponse(
      res,
      200,
      true,
      rating,
      null,
      "The Rating Has Been Changed"
    );
  } else {
    return next(
      new AppError(
        400,
        "You have no authorization to change this rating",
        "Rating Error."
      )
    );
  }
});

ratingController.deleteRating = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const ratingId = req.params.id;
  const rating = await Rating.findById({_id: ratingId });
  if (rating.from == userId || rating.to == userId) {
    rating.isDeleted = true;
    rating.save();
    return sendResponse(res, 200, true, null, null, "The Rating Is Deleted.");
  } else {
    return next(
      new AppError(
        400,
        "You Don't Have Auth To Delete This Rating",
        "Rating Error"
      )
    );
  }
});
module.exports = ratingController;
