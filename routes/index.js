var express = require("express");
var router = express.Router();

const fighterApi = require("./fighter.api");
router.use("/fighter", fighterApi);

const userApi = require("./user.api");
router.use("/users", userApi);

const authApi = require("./auth.api");
router.use("/auth", authApi);

const matchApi = require("./match.api");
router.use("/match", matchApi);

const hostApi = require("./host.api");
router.use("/host", hostApi);

const partnershipApi = require("./sparRequest.api");
router.use("/partner", partnershipApi);

const reviewApi = require("./review.api");
router.use("/review", reviewApi);

const ratingApi = require("./rating.api");
router.use("/rating", ratingApi);

module.exports = router;
