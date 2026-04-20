const { SerialPort } = require("serialport");

let port = null;

const initArduinoPort = () => {
  if (port && port.isOpen) return port;

  port = new SerialPort({
    path: "COM4",
    baudRate: 9600,
    autoOpen: false,
  });

  port.on("open", () => {
    console.log("Arduino serial port opened");
  });

  port.on("error", (err) => {
    console.error("Serial port error:", err.message);
  });

  return port;
};

const sendCommandToArduino = (command) => {
  return new Promise((resolve, reject) => {
    const serialPort = initArduinoPort();

    const writeCommand = () => {
      serialPort.write(command + "\n", (err) => {
        if (err) {
          return reject(err);
        }

        console.log("Sent to Arduino:", command);
        resolve();
      });
    };

    if (serialPort.isOpen) {
      return writeCommand();
    }

    serialPort.open((err) => {
      if (err) {
        return reject(new Error(`Failed to open Arduino port: ${err.message}`));
      }

      writeCommand();
    });
  });
};

module.exports = { sendCommandToArduino };