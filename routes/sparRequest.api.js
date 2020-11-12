const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication.js");
const sparRequestController = require("../controllers/sparRequest.controller");

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

/**
 * @route PUT api/partner/accept/:id
 * @description Accept a sparring request
 * @access Login required
 */
router.put(
  "/accept/:id",
  authMiddleware.loginRequired,
  sparRequestController.acceptSparingRequest
);

/**
 * @route PUT api/partner/decline/:id
 * @description decline a sparring request
 * @access Login required
 */
router.put(
  "/decline/:id",
  authMiddleware.loginRequired,
  sparRequestController.declineSparringRequest
);

/**
 * @route GET api/partner/received/
 * @description Get received sparring request
 * @access Login required
 */
router.post(
  "/received/",
  authMiddleware.loginRequired,
  sparRequestController.getReceivedFriendRequestList
);

/**
 * @route PUT api/partner/cancel/:id
 * @description decline a sparring request
 * @access Login required
 */
router.post(
  "/cancel/:id",
  authMiddleware.loginRequired,
  sparRequestController.cancelSparringRequest
);

/**
 * @route POST api/partner/status/:id
 * @description Get status of partnership
 * @access Login required
 */
router.post(
  "/status/:id",
  authMiddleware.loginRequired,
  sparRequestController.getStatusSparringRequest
);

/**
 * @route POST api/partner/accepted/
 * @description Get status of partnership
 * @access Login required
 */
router.put(
  "/accepted/",
  authMiddleware.loginRequired,
  sparRequestController.getPartnerList
);





/**
 * @route PUT api/partner/remove/:id
 * @description Remove sparring request
 * @access Login required
 */
router.put(
  "/remove/:id",
  authMiddleware.loginRequired,
  sparRequestController.removePartnership
);



module.exports = router;
