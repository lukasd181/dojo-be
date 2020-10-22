const express = require("express");
const router = express.Router();

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// experienceApi
const experienceApi = require("./experience.api");
router.use("/experiences", experienceApi);

module.exports = router;
