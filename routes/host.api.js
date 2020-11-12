const express = require("express");
const router = express.Router();
const hostController = require("../controllers/host.controller");
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST api/host/
 * @description Create a new host
 * @access Login required
 */
router.post("/", authMiddleware.loginRequired, hostController.createHost);

/**
 * @route GET api/host/me
 * @description Get me host
 * @access Login required
 */
router.get("/me", authMiddleware.loginRequired, hostController.getMeHost);

/**
 * @route GET api/host/:id
 * @description Get a single host
 * @access Login required
 */
router.get("/:id", authMiddleware.loginRequired, hostController.getSingleHost);



/**
 * @route GET api/host/
 * @description Get hosts by search bar
 * @access Login required
 */
router.get(
  "/",
  authMiddleware.loginRequired,
  hostController.getHostBySearchBar
);

/**
 * @route PUT api/host/:id
 * @description Edit a host
 * @access Login required
 */
router.put("/:id", authMiddleware.loginRequired, hostController.editHost);

module.exports = router;
