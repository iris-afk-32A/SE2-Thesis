const axios = require("axios");
const path = require("path");

const imagePath = path.join(__dirname, "../images/sample2.jpg");

// TODO: This need a complete overhaul like wtf is this. Spaghetti ah shi (シ_ _)シ

// !This needs a dedicated controller (I know this is in development, but shit it giving me headaches)
// TODO: Well refactor then move it to its dedicated controller, then add comments on this shit too
const getPeopleCount = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const FormData = require("form-data");
    const axios = require("axios");

    console.log("Received file:", req.file);


    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "frame.jpg",
      contentType: req.file.mimetype,
    });

    const response = await axios.post("http://localhost:8000/detect", formData, {
      headers: formData.getHeaders(),
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getPeopleCount:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process image" });
  }
};

// ! Well theres nothing much to change in this
const getHealth = async (req, res) => {
  try {
    const response = await axios.get("http://localhost:8000/health");
    res.status(200).json({ status: response.data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health status" });
  }
};

module.exports = {
  getPeopleCount,
  getHealth,
};
