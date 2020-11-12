const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Fighter = require("../models/user/fighter");
const fighterController = {};

fighterController.createFighter = catchAsync(async (req, res, next) => {
  const creator = req.userId;
  const {
    weight,
    height,
    age,
    stance,
    forms,
    gender,
    location,
    description,
    inAction,
  } = req.body;

  const fighter = new Fighter({
    weight,
    height,
    age,
    stance,
    forms,
    gender,
    location,
    description,
    creator,
    inAction,
  });

  await fighter.save();
  return sendResponse(
    res,
    200,
    true,
    fighter,
    null,
    "Create new fighter successfully"
  );
});

fighterController.findSparPartners = catchAsync(async (req, res, next) => {
  console.log("asdasdasdaasdasdasdasdasd");
  let { location, division, gender, form, minAge, maxAge, page } = req.query;
  let limit = 10;
  let filter = {
    $and: [],
  };

  if (location) filter.$and.push({ location: { $eq: location } });
  if (division) filter.$and.push({ division: { $eq: division } });
  if (gender) filter.$and.push({ gender: { $eq: gender } });
  if (form) filter.$and.push({ forms: form });
  if (minAge && maxAge)
    filter.$and.push({ age: { $gte: minAge, $lte: maxAge } });
  console.log(filter.$and);
  if (filter.$and.length == 0) {
    const totalFighters = await Fighter.countDocuments({});
    const totalPages = Math.ceil(totalFighters / limit);
    const offset = limit * (page - 1);

    const fighters = await Fighter.find({})
      .sort({ ratingScore: -1 })
      .skip(offset)
      .limit(limit)
      .populate("creator");

    return sendResponse(
      res,
      200,
      true,
      { fighters, totalPages, totalFighters },
      null,
      "Get sparring partners successfully."
    );
  } else {
    const totalFighters = await Fighter.countDocuments({ ...filter });
    const totalPages = Math.ceil(totalFighters / limit);
    const offset = limit * (page - 1);

    const fighters = await Fighter.find(filter)
      .sort({ ratingScore: -1 })
      .skip(offset)
      .limit(limit)
      .populate("creator");

    return sendResponse(
      res,
      200,
      true,
      { fighters, totalPages, totalFighters },
      null,
      "Get sparring partners successfully."
    );
  }
});

fighterController.getMeFighter = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const fighter = await Fighter.findOne({ creator: userId }).populate("creator");
  if (fighter) {
    return sendResponse(res,200,true,fighter,null,"Get Me Fighter Successfully")
  }else {
    return new AppError(400, "Fighter Not Found", "Get Me Fighter Error.")
   
  }
});

fighterController.getSingleFighter = catchAsync(async (req, res, next) => {
  const fighterId = req.params.id;
  const fighter = await Fighter.findById({ _id: fighterId });
  if (!fighter) {
    return next(
      new AppError(400, "Fighter Not Found", "Get Single Fighter Error.")
    );
  }
  return sendResponse(
    res,
    200,
    true,
    fighter,
    null,
    "Get fighter successfully."
  );
});

fighterController.editFighter = catchAsync(async (req, res, next) => {
  const fighterId = req.params.id;
  let allows = [
    "weight",
    "height",
    "forms",
    "stance",
    "location",
    "inAction",
    "description",
  ];
  const update = {};
  for (let index = 0; index < allows.length; index++) {
    const field = allows[index];
    if (req.body[field]) {
      update[field] = req.body[field];
    }
  }
  const fighter = await findByIdAndUpdate({ _id: fighterId }, update, {
    new: true,
  });
  return sendResponse(
    res,
    200,
    true,
    fighter,
    null,
    `Update fighter ${fighterId} successfully.`
  );
});

module.exports = fighterController;
