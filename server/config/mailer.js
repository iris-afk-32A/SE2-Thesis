const { Resend } = require("resend");

// Validate that Resend API key is set
if (!process.env.RESEND_API_KEY) {
  console.error(
    "ERROR: Resend API key not configured. Please set RESEND_API_KEY in your .env file. Get one from https://resend.com"
  );
}

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;