const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError } = require("../helpers/utils.helper");
const MatchRequest = require("../models/match/matchRequest");
const SparRequest = require("../models/sparring/sparRequest");
const authMiddleware = {};

authMiddleware.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString)
      return next(new AppError(401, "Login required", "Validation Error"));
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new AppError(401, "Token expired", "Validation Error"));
        } else {
          return next(
            new AppError(401, "Token is invalid", "Validation Error")
          );
        }
      }
      // console.log(payload);
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    next(error);
  }
};

authMiddleware.isUserEditMatchRequest = (req, res, next) => {
  try {
    const userId = req.userId;
    const matchRequestId = req.params.id;
    const matchRequestObject = MatchRequest.findById(matchRequestId);
    if (matchRequestObject) {
      const matchId = matchRequestObject.to;
      const checkingUserId = Match.findById(matchId).creator;
      if (userId) {
        if (checkingUserId !== userId) {
          return next(new AppError(401, "Not Owner", "Validation Error"));
        } else {
          return next(
            new AppError(401, "Checking Id not found", "ID Query Not Found")
          );
        }
      }
    } else {
      return next(
        new AppError(401, "MatchRequest Object not found", "ID Query Not Found")
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.isUserEditSparRequest = (req, res, next) => {
  try {
    const userId = req.userId;
    const sparRequestId = req.params.id;
    const sparRequestObject = SparRequest.findById(sparRequestId);
    if (sparRequestObject) {
      const fighterId = sparRequestObject.to;
      const checkingUserId = Fighter.findById(figterId).creator;
      if (checkingUserId) {
        if (userId !== checkingUserId) {
          return next(new AppError("Not Owner", "Validation Error"));
        }
      } else {
        return next(
          new AppError(401, "Checking Id not found", "ID Query Not Found")
        );
      }
    } else {
      return next(
        new AppError(401, "SparRequest not found", "ID Query Not Found")
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.isUserEditFighter = (req, res, next) => {
  try {
    const userId = req.userId;
    const fighterId = req.params.id;
    const fighterObject = Fighter.findById(fighterId);
    if (fighterObject) {
      const checkingId = fighterObject.creator;
      if (checkingId !== userId) {
        return next(new AppError(401, "Not Owner", "Validation Error"));
      }
    } else {
      return next(new AppError(401, "Fighter not found", "ID Query Not Found"));
    }
    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.isUserEditEvent = (req, res, next) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;
    const eventObject = Event.findById(eventId);
    if (eventObject) {
      const checkingUserId = eventObject.creator;
      if (checkingUserId !== userId) {
        return next(new AppError(401, "Not Owner", "Validation Error"));
      }
    } else {
      return next(new AppError(401, "Event not found", "ID Query Not Found"));
    }
    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.isUserEditMatch = (req, res, next) => {
  try {
    const userId = req.userId;
    const matchId = req.params.id;
    const matchObject = Match.findById(matchId);
    if (matchObject) {
      const checkingUserId = matchObject.creator;
      if (checkingUserId !== userId) {
        return next(new AppError(401, "Not Owner", "Validation Error"));
      }
    } else {
      return next(new AppError(401, "Match not found", "ID Query Not Found"));
    }
    next();
  } catch (err) {
    next(err);
  }
};

authMiddleware.isFormSparRequest = (req, res, next) => {
  try {
    const userId = req.userId;
    const sparRequestId = req.params.id;
    const sparRequestObject = SparRequest.findById(sparRequestId);
    const toId = sparRequestObject.to;
    const fromId = sparRequestObject.from;
    const toFigterForms = Fighter.findById(toId).form;
  } catch (err) {}
};

module.exports = authMiddleware;
