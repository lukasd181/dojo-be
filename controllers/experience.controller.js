const Experience = require("../models/experience");

const getExperiences = async (req, res) => {
  const experiences = await Experience.find();
  res.json(experiences);
};

const createExperience = async (req, res) => {
  const {
    title,
    pictures,
    city,
    country,
    category,
    minimumRate,
    duration,
    groupCapacity,
    language,
    description,
  } = req.body;
  const experience = await Experience.create({
    title,
    pictures,
    city,
    country,
    category,
    minimumRate,
    duration,
    groupCapacity,
    language,
    description,
  });
  res.json({ experience });
};

module.exports = {
  getExperiences,
  createExperience,
};
