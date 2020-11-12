const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const ratingController = require("../controllers/rating.controller");
const { auth } = require("../controllers/auth.controller");

/**
 * @route POST api/rating/:id
 * @description Create a new rating
 * @access Login required
 */
router.post("/:id", authMiddleware.loginRequired, ratingController.rateUser);

/**
 * @route GET api/rating/:id
 * @description Get a rating
 * @access Login required
 */
router.get("/:id", authMiddleware.loginRequired, ratingController.getRating);

/**
 * @route PUT api/rating/edit/:id
 * @description Edit a new rating
 * @access Login required
 */
router.put(
  "/edit/:id",
  authMiddleware.loginRequired,
  ratingController.changeRatingScore
);

/**
 * @route PUT api/rating/delete/:id
 * @description Delete a new rating
 * @access Login required
 */
router.put(
  "/delete/:id",
  authMiddleware.loginRequired,
  ratingController.deleteRating
);

module.exports = router;
