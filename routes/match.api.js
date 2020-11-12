const express = require("express");
const router = express.Router();
const matchController = require("../controllers/match.controller");
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST api/match
 * @description Create a new match
 * @access Login required
 */
router.post("/", authMiddleware.loginRequired, matchController.createMatch);

/**
 * @route GET api/match query: form, gender, division, location, status, page
 * @description Get match with query
 * @access Login required
 */
router.get("/", authMiddleware.loginRequired, matchController.getMatches);

/**
 * @route GET api/match/:id
 * @description Get match with query
 * @access Login required
 */
router.get("/:id", authMiddleware.loginRequired, matchController.getSingleMatch);

/**
 * @route PUT api/match/:id
 * @description Edit a match
 * @access Login required
 */
router.put("/:id", authMiddleware.loginRequired, matchController.editMatch);

module.exports = router;
