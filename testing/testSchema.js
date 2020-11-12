const mongoose = require("mongoose");
const User = require("../models/user/user");
const Fighter = require("../models/user/fighter");
const Host = require("../models/user/host");
const Review = require("../models/review&rating/review");
const Rating = require("../models/review&rating/rating");
const Match = require("../models/match/match");
const MatchRating = require("../models/review&rating/matchRating");
const MatchReview = require("../models/review&rating/matchReview");
const SparRequest = require("../models/sparring/sparRequest");
const MatchRequest = require("../models/match/matchRequest");
const Decision = require("../models/match/decision");
const faker = require("faker");

const bcrypt = require("bcryptjs");

const USERS_NUM = 300;
const FIGHTER_NUM = 250; //<= MUST =< USER!!
const STANCE = ["SouthPaw", "Orthodox", "Switch"];
const FORM = ["MuayThai", "KickBoxing", "Boxing", "JiuJitsu", "MMA"];
const MATCHES = 100;
const SPAR_REQUEST_NUM = 100;
const MAXIMUM_OF_100 = 100;
const DIVISION = [
  "Strawweight",
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
];
const DECISION = ["PTS", "UD", "SD", "MD", "KO", "TKO", "DQ", "RTD"];
const MATCH_TYPES = [3, 5];
const ROUND_DURATION = [3, 5];
const MATCH_STATUS = ["ready", "ended", "cancelled", "happening", "looking"];

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
require("dotenv").config();
const fetch = require("node-fetch");
const { find } = require("../models/user/fighter");
const { random } = require("faker");

const UNSPLASH_ACCESSKEY = process.env.UNSPLASH_ACCESSKEY;

const fetchUnsplash = async () => {
  let url = `https://api.unsplash.com/photos/random?count=30&orientation=landscape`;
  let data = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESSKEY}` },
  });
  let response = await data.json();
  console.log(response);
  let urlArray = [];
  for (let i = 0; i < response.length; i++) {
    urlArray.push(response[i].urls.small);
  }
  return urlArray;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const cleanData = async (startTime) => {
  try {
    await Fighter.collection.drop();
    await User.collection.drop();
    await Host.collection.drop();
    await Review.collection.drop();
    await Rating.collection.drop();
    await Match.collection.drop();
    await Decision.collection.drop();
    await MatchRating.collection.drop();
    await MatchReview.collection.drop();
    await Decision.collection.drop();
    await MatchRequest.collection.drop();
    await SparRequest.collection.drop();

    // OR: await mongoose.connection.dropDatabase();
    console.log("| Deleted all data");
    console.log("-------------------------------------------");
  } catch (error) {
    console.log(error);
  }
};

const updateToTalReviews = async (userId) => {
  let totalReviews = await Review.find({ to: userId }).count();

  let user = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { totalReviews } }
  );
};

const updateAvgRating = async (userId) => {
  let ratingsToUser = Rating.find({ to: userId });
  let rantingCount = ratingsToUser.count();
  let sumRatings = null;
  await ratingsToUser.forEach((item, err) => {
    sumRatings = sumRatings + item.ratingScore;
  });
  let avgRating = sumRatings / rantingCount;
  await User.findByIdAndUpdate({ _id: userId }, {});
};

const generateData = async () => {
  const salt = await bcrypt.genSalt(10);
  let password = await bcrypt.hash("123", salt);
  let userArray = [];
  let fighterArray = [];
  let hostArray = [];
  let matchArray = [];
  try {
    await cleanData();
    for (let i = 0; i <= USERS_NUM; i++) {
      let random1 = getRandomInt(0, 1);
      let gender = random1 === 0 ? "male" : "female";
      var userType = i < FIGHTER_NUM ? "fighter" : "host";
      let user = new User({
        name: faker.name.findName(random1),
        email: faker.internet.email(),
        password,
        avatarUrl: faker.image.avatar(),
        userType,
      });
      userArray.push(user._id);
      await user.save();
      if (i < FIGHTER_NUM) {
        let fighter = new Fighter({
          weight: getRandomInt(40, 200),
          height: getRandomInt(150, 210),
          age: getRandomInt(15, 60),
          stance: STANCE[getRandomInt(0, 2)],
          forms: [FORM[getRandomInt(0, 1)], FORM[getRandomInt(2, 4)]],
          gender,
          location: faker.address.state(),
          creator: user._id,
          description: faker.lorem.paragraphs(getRandomInt(1, 3)),
        });
        fighterArray.push(fighter._id);

        await fighter.save();
      } else {
        let host = new Host({
          clubName: faker.company.companyName(),
          creator: user._id,
          description: faker.lorem.paragraphs(getRandomInt(1, 3)),
          emailAddress: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
        });
        hostArray.push(host._id);
        await host.save();
      }
    }

    let users = await User.find();

    users.forEach(async function (item, err) {
      // need to generate review length
      let randomLength = getRandomInt(1, 10);
      let ratings = [];
      for (let x = 0; x < randomLength; x++) {
        let randomUserId = userArray[getRandomInt(0, userArray.length - 1)];

        let review = new Review({
          description: faker.lorem.paragraphs(getRandomInt(1, 3)),
          from: randomUserId,
          to: item._id,
        });

        review.save();

        let rating = new Rating({
          ratingScore: getRandomInt(1, 5),
          from: randomUserId,
          to: item._id,
        });

        rating.save();

        ratings.push(rating.ratingScore);
      }

      await item.save();
    });

    //This is for Match model

    for (let i = 0; i < MATCHES; i++) {
      const division = DIVISION[getRandomInt(0, DIVISION.length - 1)];
      const gender = getRandomInt(0, 1) === 0 ? "male" : "female";
      let FIGHTER_NUM = getRandomInt(0, 2);
      const randomForm = FORM[getRandomInt(0, 4)];
      const randomHost = hostArray[getRandomInt(0, hostArray.length - 1)];
      let randomFighters = [];
      let randomStatus = "";
      let timeHappen = faker.date.future();
      let randomEnded = getRandomInt(0, 1) === 0 ? true : false;
      console.log(gender, division, randomForm, FIGHTER_NUM);

      let totalFighters = await Fighter.find({
        gender,
        division,
        forms: randomForm,
      }).count();

      console.log("total", totalFighters);

      if (totalFighters >= 1 && FIGHTER_NUM === 1) {
        let randomFighter = await Fighter.find({
          gender,
          division,
          forms: randomForm,
        })
          .skip(getRandomInt(0, totalFighters - 1))
          .limit(1);
        console.log(" 1 1: ", totalFighters, randomFighter);
        randomFighter.forEach((item) => randomFighters.push(item._id));
      } else if (totalFighters >= 2 && FIGHTER_NUM === 2) {
        let randomFighter = await Fighter.find({
          gender,
          division,
          forms: randomForm,
        }).limit(2);

        randomFighter.forEach((item) => randomFighters.push(item._id));
      } else if (totalFighters === 0) {
        FIGHTER_NUM = 0;
      } else {
        FIGHTER_NUM = 1;
        let randomFighter = await Fighter.find({
          gender,
          division,
          forms: randomForm,
        }).limit(1);
        console.log(randomFighter);
        randomFighter.forEach((item) => randomFighters.push(item._id));
      }
      if (FIGHTER_NUM === 2 && randomEnded) {
        timeHappen = faker.date.past();
        randomStatus = "ended";
      } else {
        randomStatus = getRandomInt(0, 1) === 0 ? "cancelled" : "ready";
      }

      const match = new Match({
        matchTitle: faker.lorem.words(getRandomInt(1, 3)),
        rounds: MATCH_TYPES[getRandomInt(0, 1)],
        roundDuration: ROUND_DURATION[getRandomInt(0, 1)],
        form: randomForm,
        division,
        gender,
        status:
          FIGHTER_NUM == 2 ? MATCH_STATUS[getRandomInt(0, 3)] : MATCH_STATUS[4],
        fighters: randomFighters,
        host: randomHost,
        location: faker.address.state(),
        description: faker.lorem.paragraph(),
        timeHappen,
      }).populate("host");
      matchArray.push(match._id);
      if (match.status === "ended") {
        let decision = new Decision({
          won: match.fighters[0],
          lost: match.fighters[1],
          decision: DECISION[getRandomInt(0, 7)],
          matchInfo: match._id,
        });
        await decision.save();
        const totalMatchReview = getRandomInt(0, MAXIMUM_OF_100);
        const matchReviewArray = [];
        for (let i = 0; i < totalMatchReview; i++) {
          let matchReview = new MatchReview({
            from: userArray[getRandomInt(0, userArray.length - 1)],
            to: match._id,
            description: faker.lorem.paragraphs(getRandomInt(1, 3)),
          });
          matchReviewArray.push(matchReview._id);
          await matchReview.save();
        }
        match.reviewed = matchReviewArray;
      }
      if (match.status === "ready") {
        let matchRequestArray = [];
        const totalMatchRequest = getRandomInt(0, MAXIMUM_OF_100);
        for (let i = 0; i < totalMatchRequest; i++) {
          let matchRequest = new MatchRequest({
            description: faker.lorem.paragraphs(getRandomInt(1, 3)),
            from: fighterArray[getRandomInt(0, fighterArray.length - 1)],
            to: match._id,
          });
          matchRequestArray.push(matchRequest);
          await matchRequest.save();
        }
        match.matchRequests = matchRequestArray;
      }
      console.log("match", match)
      await match.save();
    }

    console.log("| Generate Data Done");
    console.log("-------------------------------------------");
  } catch (error) {
    console.log(error);
  }
};

const getOngoingMatches = () => {
  let onGoingMatches = Match.find({ status: "ongoing" });
  return onGoingMatches;
};

const main = async (resetDB = false) => {
  if (resetDB) await generateData();
};

// remove true if you don't want to reset the DB
main(true);
