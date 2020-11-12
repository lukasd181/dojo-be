const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Match = require("../models/match/match");
const Host = require("../models/user/host");
const MatchRequest = require("../models/match/matchRequest");
const matchController = {};

const MATCH_LIMIT_PER_PAGE = 15;

matchController.createMatch = catchAsync(async (req, res, next) => {
  const {
    matchTitle,
    form,
    rounds,
    roundDuration,
    gender,
    division,
    fighters,
    location,
    timeHappen,
    host,
    status,
    description,
  } = req.body;

  const match = new Match({
    matchTitle,
    rounds,
    roundDuration,
    form,
    gender,
    division,
    fighters,
    location,
    timeHappen,
    host,
    status,
    description,
  });
  await match.save();

  return sendResponse(
    res,
    200,
    true,
    match,
    null,
    "Create new match successfully"
  );
});

matchController.getMatches = catchAsync(async (req, res, next) => {
  let {
    form,
    gender,
    division,
    location,
    status,
    host,
    isLooking,
    page,
    matchId,
  } = req.query;
  page = parseInt(page) || 1;
  let filter = {
    $and: [],
  };

  if (form) filter.$and.push({ form });
  if (gender) filter.$and.push({ gender });
  if (division) filter.$and.push({ division });
  if (location) filter.$and.push({ location });
  if (status) filter.$and.push({ status });
  if (host) filter.$and.push({ host });
  if (isLooking) filter.$and.push({ isLooking });
  if (matchId) filter.$and.push({ _id: matchId });

  if (filter.$and.length > 0) {
    const totalMatch = await Match.find({ ...filter }).count();
    const totalPages = Math.ceil(totalMatch / MATCH_LIMIT_PER_PAGE);
    const offset = MATCH_LIMIT_PER_PAGE * (page - 1);
    const matches = await Match.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(MATCH_LIMIT_PER_PAGE)
      .populate("fighters")
      .populate("host")
      .populate({ path: "fighters", populate: { path: "creator" } })
      .populate({ path: "host", populate: { path: "creator" } });

    return sendResponse(
      res,
      200,
      true,
      { matches, totalMatch, totalPages },
      null,
      "Get matches successfully."
    );
  } else {
    console.log("here in else match");
    const totalMatch = await Match.find({}).count();
    const totalPages = Math.ceil(totalMatch / MATCH_LIMIT_PER_PAGE);
    const offset = MATCH_LIMIT_PER_PAGE * (page - 1);

    // const hosts = await Host.find();
    // console.log("Number of hosts:", hosts.length);

    const matches = await Match.find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(MATCH_LIMIT_PER_PAGE)
      .populate("fighters")
      .populate("host")
      .populate({ path: "fighters", populate: { path: "creator" } })
      .populate({ path: "host", populate: { path: "creator" } });
    // .populate({ path: "fighters", populate: { path: "creator" } })
    // .populate({ path: "host", populate: { path: "creator" } });
    if (!matches) {
      return next(new AppError(400, "Matches not found", "Matches Error."));
    }
    return sendResponse(
      res,
      200,
      true,
      { matches, totalMatch, totalPages },
      null,
      "Get matches successfully."
    );
  }
});

matchController.getSingleMatch = catchAsync(async (req, res, next) => {
  const matchId = req.params.id;
  const match = await Match.findById({ _id: matchId }).populate("fighters");
  // .populate("host")
  // .populate({ path: "fighters", populate: { path: "creator" } })
  // .populate({ path: "host", populate: { path: "creator" } });
  return sendResponse(
    res,
    200,
    true,
    match,
    null,
    `Get Match ${matchId} successfully.`
  );
});

matchController.editMatch = catchAsync(async (req, res, next) => {
  const matchId = req.params.id;
  // const {
  //   matchTitle,
  //   form,
  //   gender,
  //   division,
  //   fighters,
  //   location,
  //   timeHappen,
  //   status,
  // } = req.body;

  let allows = [
    "matchTitle",
    "form",
    "gender",
    "division",
    "fighters",
    "location",
    "timeHappen",
    "status",
    "roundDuration",
    "rounds",
  ];
  let update = {};
  for (let index = 0; index < allows.length; index++) {
    const field = allows[index];
    if (req.body[field]) {
      update[field] = req.body[field];
    }
  }

  if (update.status.equals("cancelled") || update.status.equals("ended")) {
    const matchRequests = await MatchRequest.find({ to: matchId });
    if (matchRequests.length > 0)
      matchRequests.map((request) => {
        request.status = "declined";
        request.save();
      });
  }

  const match = await Match.findByIdAndUpdate({ _id: matchId }, update, {
    new: true,
  });
  return sendResponse(res, 200, true, match, null, "Edit host successfully.");

  // let update = {
  //   $and: [],
  // };
  // if (matchTitle) update.$and.push({ matchTitle });
  // if (form) update.$and.push({ form });
  // if (gender) update.$and.push({ gender });
  // if (division) update.$and.push({ division });
  // if (fighters.length > 0) update.$and.push({ fighters });
});

module.exports = matchController;
