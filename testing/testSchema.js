const mongoose = require("mongoose");
const User = require("../models/user");
const Experience = require("../models/experience");
const faker = require("faker");
const bcrypt = require("bcryptjs");

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const cleanData = async (startTime) => {
  try {
    await User.collection.drop();
    await Experience.collection.drop();
    // OR: await mongoose.connection.dropDatabase();
    console.log("| Deleted all data");
    console.log("-------------------------------------------");
  } catch (error) {
    console.log(error);
  }
};

const generateData = async () => {
  try {
    await cleanData();
    let users = [];
    let experiences = [];
    console.log("| Create 10 users:");
    console.log("-------------------------------------------");
    const userNum = 10;
    const otherNum = 3; // num of experience each user
    for (let i = 0; i < userNum; i++) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash("123", salt);
      await User.create({
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        avatarUrl: faker.image.avatar(),
        password,
        emailVerified: true,
      }).then(function (user) {
        console.log("Created new user: " + user.name);
        users.push(user);
      });
    }
    console.log(`| Each user writes ${otherNum} experiences`);
    console.log("-------------------------------------------");
    const categories = [
      "Cooking",
      "Art and Culture",
      "Sports",
      "Entertainment",
      "Food and drink",
      "Nature and outdoors",
      "Transportation activities",
      "Sightseeing",
    ];
    const languages = ["English", "Vietnamese", "Korean", "French"];
    for (let i = 0; i < userNum; i++) {
      for (let j = 0; j < otherNum; j++) {
        await Experience.create({
          title: faker.lorem.sentence(),
          city: faker.address.city(),
          country: faker.address.country(),
          category: categories[getRandomInt(0, 7)],
          minimumRate: getRandomInt(25, 50),
          duration: 60,
          groupCapacity: getRandomInt(5, 15),
          language: languages[getRandomInt(0, 3)],
          description: faker.lorem.paragraph(),
          pictures: [
            faker.image.imageUrl(400, 300),
            faker.image.imageUrl(400, 300),
          ],
          user: users[i]._id,
        }).then(async (experience) => {
          console.log("Created experience:" + experience.title);
          experiences.push(experience);
        });
      }
    }
    console.log("| Generate Data Done");
    console.log("-------------------------------------------");
  } catch (error) {
    console.log(error);
  }
};

const getRandomExperiences = async (experienceNum) => {
  console.log(`Get ${experienceNum} random experiences`);
  const totalExperienceNum = await Experience.countDocuments();
  for (let i = 0; i < experienceNum; ++i) {
    const experience = await Experience.findOne()
      .skip(getRandomInt(0, totalExperienceNum - 1))
      .populate("user");
    console.log(experience);
  }
};

const main = async (resetDB = false) => {
  if (resetDB) await generateData();
  getRandomExperiences(1);
};

// remove true if you don't want to reset the DB
main(true);
