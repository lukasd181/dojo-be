const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const Experience = require("../models/experience");
const experienceController = {};

experienceController.getExperiences = catchAsync(async (req, res, next) => {
  let { page, limit, sortBy, min, max, ...filter } = { ...req.query };

  const filteredList = await Experience.find({
    minimumRate: { $gt: min, $lt: max },
  });
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 25;

  const totalExperiences = await Experience.countDocuments({
    ...filter,
    isDeleted: false,
  });
  const totalPages = Math.ceil(totalExperiences / limit);
  const offset = limit * (page - 1);

  // console.log({ filter, sortBy });
  const experiences = await Experience.find(filter)
    .sort({ ...sortBy, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("user");

  return sendResponse(
    res,
    200,
    true,
    { filteredList, experiences, totalPages },
    null,
    ""
  );
});

experienceController.getSingleExperience = catchAsync(
  async (req, res, next) => {
    let experience = await Experience.findById(req.params.id).populate("user");
    if (!experience)
      return next(
        new AppError(404, "Experience not found", "Get Single Experience Error")
      );
    experience = experience.toJSON();
    return sendResponse(res, 200, true, experience, null, null);
  }
);

experienceController.createNewExperience = catchAsync(
  async (req, res, next) => {
    const user = req.userId;
    const {
      title,
      city,
      country,
      category,
      minimumRate,
      duration,
      groupCapacity,
      language,
      description,
    } = req.body;
    let { pictures } = req.body;

    const experience = await Experience.create({
      title,
      city,
      country,
      category,
      minimumRate,
      duration,
      groupCapacity,
      language,
      description,
      user,
      pictures,
    });

    return sendResponse(
      res,
      200,
      true,
      experience,
      null,
      "Create new experience successful"
    );
  }
);

experienceController.updateSingleExperience = catchAsync(
  async (req, res, next) => {
    const user = req.userId;
    const experienceId = req.params.id;
    const { title, description } = req.body;

    const experience = await Experience.findOneAndUpdate(
      { _id: experienceId, user: user },
      { title, description },
      { new: true }
    );
    if (!experience)
      return next(
        new AppError(
          400,
          "Experience not found or User not authorized",
          "Update Experience Error"
        )
      );
    return sendResponse(
      res,
      200,
      true,
      experience,
      null,
      "Update Experience successful"
    );
  }
);

experienceController.deleteSingleExperience = catchAsync(
  async (req, res, next) => {
    const user = req.userId;
    const experienceId = req.params.id;

    const experience = await Experience.findOneAndUpdate(
      { _id: experienceId, user: user },
      { isDeleted: true },
      { new: true }
    );
    if (!experience)
      return next(
        new AppError(
          400,
          "Experience not found or User not authorized",
          "Delete Experience Error"
        )
      );
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Delete Experience successful"
    );
  }
);

module.exports = experienceController;
