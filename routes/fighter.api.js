const express = require("express");
const router = express.Router();
const fighterController = require("../controllers/fighter.controller");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication.js");
const { body, param } = require("express-validator");

/**
 * @route POST api/fighter/
 * @description Create a new fighter
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,

  fighterController.createFighter
);

/**
 * @route GET api/fighter/
 * @description  Get fighter with pagination
 * @query location, division, gender, form, minAge, maxAge, page
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  fighterController.findSparPartners
);

/**
 * @route GET api/fighter/me
 * @description  Get your fighter profile
 * @access Login required
 */
router.get(
  "/me",
  authMiddleware.loginRequired,
  fighterController.getMeFighter
);

/**
 * @route GET api/fighter/:id
 * @description  Get a single fighter
 * @access Login required
 */
router.get(
  "/:id",
  authMiddleware.loginRequired,
  fighterController.getSingleFighter
);

/**
 * @route PUT api/fighter/:id
 * @description  Edit fighter
 * @access Login required
 */
router.put("/:id", authMiddleware.loginRequired, fighterController.editFighter);

module.exports = router;
