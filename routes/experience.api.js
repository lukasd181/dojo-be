const express = require("express");
const router = express.Router();
const experienceController = require("../controllers/experience.controller");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication.js");
const { body, param } = require("express-validator");

/**
 * @route GET api/experiences?page=1&limit=25
 * @description Get experiences with pagination
 * @access Public
 */
router.get("/", experienceController.getExperiences);

/**
 * @route GET api/experiences/:id
 * @description Get a single experience
 * @access Public
 */
router.get(
  "/:id",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  experienceController.getSingleExperience
);

/**
 * @route POST api/experiences
 * @description Create a new experience
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("title", "Missing title").exists().notEmpty(),
    body("description", "Missing description").exists().notEmpty(),
  ]),
  experienceController.createNewExperience
);

/**
 * @route PUT api/experiences/:id
 * @description Update a experience
 * @access Login required
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("title", "Missing title").exists().notEmpty(),
    body("description", "Missing description").exists().notEmpty(),
  ]),
  experienceController.updateSingleExperience
);

/**
 * @route DELETE api/experiences/:id
 * @description Delete a experience
 * @access Login required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  experienceController.deleteSingleExperience
);

module.exports = router;
