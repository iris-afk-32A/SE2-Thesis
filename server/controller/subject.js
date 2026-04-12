require("dotenv").config();
const Subject = require("../models/subject_model");
const User = require("../models/user_model");
const logger = require("../utils/logger");

exports.addSubject = async (req, res, next) => {
  try {
    const { subject_code, subject_name } = req.body;
    const user = await User.findById(req.userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.user_organization) {
      return res.status(400).json({ message: "User is not part of any organization" });
    }

    const existingSubject = await Subject.findOne({
      subject_code,
      organization_id: user.user_organization
    });

    if (existingSubject) {
      logger.error({
        message: `SUBJECT CREATE -- Attempted to create a subject with an existing code`,
        method: req.method,
        ip: req.ip,
      });
      return res
        .status(400)
        .json({ message: "Subject code already exists in this organization." });
    }

    const subject = new Subject({
      subject_code,
      subject_name,
      organization_id: user.user_organization,
    });

    await subject.save();
    logger.info({
      message: `SUBJECT CREATE -- Subject added ${subject_code}: With status code 201`,
      method: req.method,
      ip: req.ip,
    });

    res.status(201).json({
      message: "Subject added successfully",
      subject,
    });
  } catch (error) {
    logger.error({
      message: `SUBJECT CREATE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.user_organization) {
      return res.status(200).json([]);
    }

    const subjects = await Subject.find({
      organization_id: user.user_organization,
    });

    logger.info({
      message: `SUBJECTS FETCHED -- ${subjects.length} subjects fetched`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json(subjects);
  } catch (error) {
    logger.error({
      message: `SUBJECT FETCH -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const user = await User.findById(req.userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (subject.organization_id !== user.user_organization) {
      logger.error({
        message: `SUBJECT DELETE -- Unauthorized deletion attempt by user ${req.userID}`,
        method: req.method,
        ip: req.ip,
      });
      return res.status(403).json({ message: "Unauthorized to delete this subject" });
    }

    await Subject.findByIdAndDelete(subjectId);

    logger.info({
      message: `SUBJECT DELETE -- Subject deleted: ${subject.subject_code}`,
      method: req.method,
      ip: req.ip,
    });

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    logger.error({
      message: `SUBJECT DELETE -- ${error.message}`,
      method: req.method,
      ip: req.ip,
    });
    res.status(500).json({ message: error.message });
  }
};
