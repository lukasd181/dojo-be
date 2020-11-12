const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication.js");
const { route } = require("./fighter.api.js");
const reviewController = require("../controllers/review.controller");
const { auth } = require("../controllers/auth.controller.js");

/**
 * @route POST api/review/
 * @description Create a new review
 * @access Login required
 */
router.post("/:id", authMiddleware.loginRequired, reviewController.createReview);

/**
 * @route GET api/review/:id
 * @description Get reviews of a user
 * @access Login required
 */
router.get(
  "/:id",
  authMiddleware.loginRequired,
  reviewController.getReviewsUser
);

/**
 * @route GET api/review/
 * @description Get reviews of yours
 * @access Login required
 */
router.get("/", authMiddleware.loginRequired, reviewController.getYourReviews);

/**
 * @route PUT api/review/:id
 * @description Edit review
 * @access Login required
 */
router.put(
  "/edit/:id",
  authMiddleware.loginRequired,
  reviewController.editReview
);

/**
 * @route PUT api/review/:id
 * @description Delete review
 * @access Login required
 */
router.put("/delete/:id", authMiddleware.loginRequired, reviewController.deleteReview);

module.exports = router
