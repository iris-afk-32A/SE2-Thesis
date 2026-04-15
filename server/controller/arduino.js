const { sendCommandToArduino } = require("../services/arduinoService");

exports.controlDevices = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Command is required" });
    }

    await sendCommandToArduino(command);

    return res.status(200).json({
      message: "Command sent successfully",
      command,
    });
  } catch (error) {
    console.error("Arduino control error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};