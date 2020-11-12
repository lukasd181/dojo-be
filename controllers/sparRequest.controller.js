const {
  AppError,
  catchAsync,
  sendResponse,
} = require("../helpers/utils.helper");
const SparRequest = require("../models/sparring/sparRequest");
const Fighter = require("../models/user/fighter");
const sparRequestController = {};
const SPARRING_REQUESTS_PER_PAGE = 20;

sparRequestController.sendSparringRequest = catchAsync(
  async (req, res, next) => {
    const { from, to } = req.body;
    const fighterId = from;
    const toFighterId = to;

    const toFighter = await Fighter.findById(toFighterId);
    if (!toFighter) {
      return next(
        new AppError(400, "User not found", "Send Sparring Request Error")
      );
    }

    let partnership = await SparRequest.findOne({
      $or: [
        { from: toFighterId, to: fighterId },
        { from: fighterId, to: toFighterId },
      ],
    });
    if (!partnership) {
      await SparRequest.create({
        from: fighterId,
        to: toFighterId,
        status: "pending",
      });
      return sendResponse(res, 200, true, null, null, "Request has ben sent");
    } else {
      switch (partnership.status) {
        case "pending":
          if (partnership.from.equals(fighterId)) {
            return next(
              new AppError(
                400,
                "You have already sent a request to this fighter",
                "Sparring Request Error"
              )
            );
          } else {
            return next(
              new AppError(
                400,
                "You have received a request from this fighter",
                "Sparring Request Error"
              )
            );
          }
        case "accepted":
          return next(
            new AppError(
              400,
              "Fighters are already partners",
              "Sparring Request Error"
            )
          );
        case "removed":
        case "declined":
        case "cancelled":

        
          partnership.from = fighterId;
          partnership.to = toFighterId;
          partnership.status = "pending";
          await partnership.save();
          return sendResponse(
            res,
            200,
            true,
            null,
            null,
            "Request has ben sent"
          );
        default:
          break;
      }
    }
  }
);

sparRequestController.acceptSparingRequest = catchAsync(
  async (req, res, next) => {
    const fighterId = req.body.fighterId;
    const fromFighterId = req.params.id;

    let partnership = await SparRequest.findOne({
      from: fromFighterId,
      to: fighterId,
      status: "pending",
    });
    if (!partnership)
      return next(
        new AppError(404, "Sparring Request not found", "Accept Request Error")
      );

    partnership.status = "accepted";
    await partnership.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Sparring request has been accepted"
    );
  }
);

sparRequestController.declineSparringRequest = catchAsync(
  async (req, res, next) => {
    const fighterId = req.body.fighterId;
    const fromFighterId = req.params.id;

    let partnership = await SparRequest.findOne({
      from: fromFighterId,
      to: fighterId,
      status: "pending",
    });
    if (!partnership)
      return next(
        new AppError(404, "Request not found", "Decline Request Error")
      );

    partnership.status = "declined";
    await partnership.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Sparring request has been declined"
    );
  }
);

sparRequestController.getPartnerList = catchAsync(async (req, res, next) => {
  let { page, limit } = req.query;
  const { fighterId } = req.body; //take in fighterId;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
  let partnerList = await SparRequest.find({
    $or: [{ from: fighterId }, { to: fighterId }],
    status: "accepted",
  });

  const partnerIDs = partnerList.map((partnership) => {
    if (partnership.from._id.equals(fighterId)) return partnership.to;
    return partnership.from;
  });

  console.log("partnireIds", partnerIDs);

  const totalPartners = await Fighter.countDocuments({
    _id: { $in: partnerIDs },
  });

  const totalPages = Math.ceil(totalPartners / SPARRING_REQUESTS_PER_PAGE);
  const offset = SPARRING_REQUESTS_PER_PAGE * (page - 1);

  let fighters = await Fighter.find({ _id: { $in: partnerIDs } })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("creator");

  console.log("fighters", fighters);

  return sendResponse(res, 200, true, { fighters, totalPages }, null, null);
});

// //MODIFY BELOW CODE
// sparRequestController.getSentSparringRequestList = catchAsync(async (req, res, next) => {
//     let { page, limit, sortBy, ...filter } = { ...req.query };
//     const fighterId = req.body.fighterId;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;

//     let requestList = await SparRequest.find({
//       from: userId,
//       status: "pending",
//     });

//     const recipientIDs = requestList.map((friendship) => {
//       if (friendship.from._id.equals(fighterId)) return friendship.to;
//       return friendship.from;
//     });

//     const totalRequests = await Fighter.countDocuments({
//       ...filter,
//       isDeleted: false,
//       _id: { $in: recipientIDs },
//     });
//     const totalPages = Math.ceil(totalRequests / limit);
//     const offset = limit * (page - 1);

//     let fighters = await Fighter.find({ ...filter, _id: { $in: recipientIDs } })
//       .sort({ ...sortBy, createdAt: -1 })
//       .skip(offset)
//       .limit(limit);

//     const promises = fighters.map(async (fighter) => {
//       let temp = fighters.toJSON();
//       temp.friendship = requestList.find((friendship) => {
//         if (friendship.from.equals(fighter._id) || friendship.to.equals(fighter._id)) {
//           return { status: friendship.status };
//         }
//         return false;
//       });
//       return temp;
//     });
//     const usersWithFriendship = await Promise.all(promises);

//     return sendResponse(
//       res,
//       200,
//       true,
//       { fighters: usersWithFriendship, totalPages },
//       null,
//       null
//     );
//   });

sparRequestController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, sortBy, ...filter } = { ...req.query };
    const fighterId = req.body.fighterId;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let requestList = await SparRequest.find({
      to: fighterId,
      status: "pending",
    })
      .populate("from")
      .populate("to");

    const requesterIDs = requestList.map((friendship) => {
      if (friendship.from._id.equals(fighterId)) return friendship.to;
      return friendship.from;
    });

    const totalRequests = await Fighter.countDocuments({
      ...filter,
      _id: { $in: requesterIDs },
    });
    const totalPages = Math.ceil(totalRequests / limit);
    const offset = limit * (page - 1);

    let users = await Fighter.find({ ...filter, _id: { $in: requesterIDs } })
      .sort({ ...sortBy, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("creator");

    const promises = users.map(async (user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });
    const usersWithFriendship = await Promise.all(promises);

    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages },
      null,
      null
    );
  }
);
sparRequestController.getStatusSparringRequest = catchAsync(
  async (req, res, next) => {
    const { fighterId } = req.body;
    console.log("fighterId", fighterId);
    const toFighterId = req.params.id;
    console.log("tofighterId", toFighterId);
    let partnership = await SparRequest.findOne({
      $or: [
        { from: fighterId, to: toFighterId },
        { from: toFighterId, to: fighterId },
      ],
    });
    console.log("partnership", partnership);
    if (!partnership) console.log("failed");
    if (
      !partnership ||
      partnership.status == "removed" ||
      partnership.status == "cancelled" ||
      partnership.status == "declined"
    ) {
      const status = { type: "Spar" };
      return sendResponse(res, 200, true, status, null);
    } else if (partnership.status == "accepted") {
      const status = { type: "Partners" };
      return sendResponse(res, 200, true, status, null);
    } else if (partnership.status == "pending") {
      const status = { type: "Cancel Request" };
      return sendResponse(res, 200, true, status, null);
    }
  }
);

sparRequestController.cancelSparringRequest = catchAsync(
  async (req, res, next) => {
    const fighterId = req.body.fighterId;
    const toFighterId = req.params.id;
    let partnership = await SparRequest.findOne({
      from: fighterId,
      to: toFighterId,
      status: "pending",
    });
    if (!partnership)
      return next(
        new AppError(404, "Request not found", "Cancel Request Error")
      );

    partnership.status = "cancelled";
    await partnership.save();
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Spar request has been cancelled"
    );
  }
);

sparRequestController.removePartnership = catchAsync(async (req, res, next) => {
  const fighterId = req.body.fighterId;
  const toBeRemovedFighterId = req.params.id;
  let partnership = await SparRequest.findOne({
    $or: [
      { from: fighterId, to: toBeRemovedFighterId },
      { from: toBeRemovedFighterId, to: fighterId },
    ],
    status: "accepted",
  });
  if (!partnership)
    return next(new AppError(404, "Partner not found", "Remove Partner Error"));

  partnership.status = "removed";
  await partnership.save();
  return sendResponse(
    res,
    200,
    true,
    partnership,
    null,
    "Partnership has been removed"
  );
});

// sparRequestController.createSparRequest = catchAsync(async (req, res, next) => {
//   const { from, to } = req.body;
//   const sparRequest = new SparRequest({
//     from,
//     to,
//   });
//   sparRequest.save();
//   return sendResponse(
//     res,
//     200,
//     true,
//     null,
//     null,
//     "Create spar request successfully"
//   );
// });

// sparRequestController.getSpars = catchAsync(async (req, res, next) => {
//   const { from, to, status, page } = req.body;
//   page = page || 1;
//   const filter = {
//     $and: [],
//   };
//   if (from) filter.$and.push({ from });
//   if (to) filter.$and.push({ to });
//   if (status) filter.$and.push({ status });

//   const totalSentSparRequest = await Fighter.find(filter).count();
//   const totalPages = Math.ceil(
//     totalSentSparRequest / SPARRING_REQUESTS_PER_PAGE
//   );
//   const offset = SPARRING_REQUESTS_PER_PAGE * (page - 1);

//   const sparRequests = await Fighter.find({ status, from })
//     .sort({ createdAt: -1 })
//     .skip(offset)
//     .limit(SPARRING_REQUESTS_PER_PAGE)
//     .populate("to");

//   return sendResponse(
//     res,
//     200,
//     true,
//     { sparRequests, totalPages },
//     null,
//     "Get sparring requests successfully"
//   );
// });
// sparRequestController.editSparRequest = catchAsync(async (req, res, next) => {
//   const { status } = req.body;
//   const sparRequestId = req.params.id;
//   const sparRequest = await SparRequest.findByIdAndUpdate(
//     { _id: sparRequestId },
//     { status }
//   );

//   return sendResponse(
//     res,
//     200,
//     true,
//     null,
//     null,
//     `Update sparring request ${sparRequestId} successfully`
//   );
// });

module.exports = sparRequestController;
