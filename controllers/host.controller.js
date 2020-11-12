const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Host = require("../models/user/host");
const hostController = {};

hostController.createHost = catchAsync(async (req, res, next) => {
  const { clubName, clubImage, description, emailAddress, phone } = req.body;
  const creator = req.userId;
  const host = new Host({
    clubName,
    clubImage,
    description,
    emailAddress,
    phone,
    creator,
  });
  await host.save();
  return sendResponse(
    res,
    200,
    true,
    host.populate("creator"),
    null,
    "Create new host successfully"
  );
});

hostController.getMeHost = catchAsync(async (req, res, next) => {
  // console.log("me host in BE",host)

  const userId = req.userId;
  const host = await Host.findOne({ creator: userId }).populate("creator");

  if (!host) {
    return next(
      new AppError(400, "Host Profile Not Found", "GET ME HOST ERROR")
    );
  } else {
    return sendResponse(res, 200, true, host, null, "Get me host successfully");
  }
});

hostController.getSingleHost = catchAsync(async (req, res, next) => {
  const hostId = req.params.id;
  const host = await Host.findById({ _id: hostId }).populate("creator");
  return sendResponse(
    res,
    200,
    true,
    host,
    null,
    "Get single host successfully"
  );
});

hostController.getHostBySearchBar = catchAsync(async (req, res, next) => {
  let allows = ["clubName", "emailAddess", "phone", "_id"];
  let filter = {};

  for (let index = 0; index < allows.length; index++) {
    const field = allows[index];
    if (req.body[field]) {
      filter[field] = req.body[field];
    }
  }
  const hosts = await Host.find(filter).populate("creator");
  return sendResponse(res, 200, true, hosts, null, "Get host successfully.");
});

hostController.editHost = catchAsync(async (req, res, next) => {
  const hostId = req.params.id;
  let allows = [
    "clubName",
    "clubImage",
    "description",
    "emailAddress",
    "phone",
  ];
  let update = {};
  for (let index = 0; index < allows.length; index++) {
    const field = allows[index];
    if (req.body[field]) {
      update[field] = req.body[field];
    }
  }

  const host = await Host.findByIdAndUpdate({ _id: hostId }, update, {
    new: true,
  }).populate("creator");
  return sendResponse(res, 200, true, host, null, "Edit host successfully.");
});

module.exports = hostController;
