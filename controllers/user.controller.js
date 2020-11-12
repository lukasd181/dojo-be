const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const User = require("../models/user/user");
const Fighter = require("../models/user/fighter");
const bcrypt = require("bcryptjs");
const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, avatarUrl, password, userType } = req.body;
  let user = await User.findOne({ email });
  if (user)
    return next(new AppError(409, "User already exists", "Register Error"));

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({
    name,
    email,
    password,
    avatarUrl,
    userType,
  });
  const accessToken = await user.generateToken();

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user successful"
  );
});

userController.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const allows = ["name", "password", "avatarUrl"];
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(404, "Account not found", "Update Profile Error"));
  }

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update Profile successfully"
  );
});

userController.getUsers = catchAsync(async (req, res, next) => {
  let { page, limit, sortBy, ...filter } = { ...req.query };
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const totalUsers = await User.countDocuments({
    ...filter,
    isDeleted: false,
  });
  const totalPages = Math.ceil(totalUsers / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filter)
    .sort({ ...sortBy, createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(res, 200, true, { users, totalPages }, null, "");
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  console.log("hererere");
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user)
    return next(new AppError(400, "User not found", "Get Current User Error"));

console.log("jijijiji")
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successful"
  );
});

userController.updateUserLevel = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const fighterObj = await User.findById(userId);
  if (fighterObj) {
    const user = await User.findOneAndUpdate({ _id: userId }, { userLevel: 2 });
    return sendResponse(
      res,
      200,
      true,
      user,
      null,
      "Update User Level successfully"
    );
  }
  return sendResponse(res, 200, true, null, null, "No update has been made.");
});

module.exports = userController;
