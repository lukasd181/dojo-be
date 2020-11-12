const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Review = require("../models/review&rating/review");
const User = require("../models/user/user");
const reviewController = {};
const REVIEWS_PER_PAGE = 10;

reviewController.createReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const toUserId = req.params.id;
  const { description } = req.body;

  const review = new Review({
    from: userId,
    to: toUserId,
    description,
  });

  await User.findByIdAndUpdate({ _id: toUserId }, { $inc: { reviewCount: 1 } });
  review.save();

  return sendResponse(
    res,
    200,
    true,
    review.populate("to").populate("from"),
    null,
    "Create review successfully."
  );
});

reviewController.getReviewsUser = catchAsync(async (req, res, next) => {
  let { page } = req.query;
  page = parseInt(page) || 1;
  const toUserId = req.params.id;
  const user = await User.findOne({ _id: toUserId, isDeleted: false });
  if (!user)
    return next(
      new AppError(400, "User not found", "Get Review from User Error")
    );
  const totalReviews = await Review.find({ to: toUserId }).count();
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
  const offset = REVIEWS_PER_PAGE * (page - 1);
  const reviews = await Review.find({ to: toUserId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(REVIEWS_PER_PAGE)
    .populate("to")
    .populate("from");
  return sendResponse(
    res,
    200,
    true,
    { reviews, totalPages, totalReviews },
    null,
    "Get reviews successfully"
  );
});

reviewController.getYourReviews = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  let { page } = req.query;
  page = parseInt(page) || 1;
  const totalReviews = await Review.find({ to: userId }).count();
  if (!totalReviews) {
    return next(new AppError(400, "No Review Found", "Review Not Found"));
  }
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
  const offset = REVIEWS_PER_PAGE * (page - 1);
  const reviews = await Review.find({ to: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(REVIEWS_PER_PAGE)
    .populate("to")
    .populate("from");
  return sendResponse(
    res,
    200,
    true,
    { reviews, totalPages, totalReviews },
    null,
    "Get Current User Reviews Successfully."
  );
});

reviewController.editReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const reviewId = req.params.id;
  const { description } = req.body;
  const review = await Review.findById({ _id: reviewId, from: userId });
  review.description = description;
  review.save();
  return sendResponse(
    res,
    200,
    true,
    review.populate("to").populate("from"),
    null,
    "Update Review Successfully"
  );
});

reviewController.deleteReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const reviewId = req.params.id;
  const review = await Review.findById({ _id: reviewId });
  if (review.to == userId) {
    review.isDeleted = true;
    await User.findByIdAndUpdate(
      { _id: userId },
      { $inc: { reviewCount: -1 } }
    );
    await review.save();
    return sendResponse(
      res,
      200,
      true,
      review,
      null,
      "Delete Review Successfully"
    );
  } else if (review.from == userId) {
    review.isDeleted = true;
    await User.findByIdAndUpdate(
      { _id: review.to },
      { $inc: { reviewCount: -1 } }
    );
    await review.save();
    return sendResponse(
      res,
      200,
      true,
      review,
      null,
      "Delete Review Successfully"
    );
  } else {
    return next(
      new AppError(
        400,
        "You Don't Have The Authorization To Delete This Review."
      )
    );
  }
});

module.exports = reviewController;
