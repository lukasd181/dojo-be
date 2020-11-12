const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication.js");


/**
 * @route POST api/partner/
 * @description Create a new sparring request
 * @access Login required
 */
router.post(
    "/request",
    authMiddleware.loginRequired,
    sparRequestController.sendSparringRequest
  );

  