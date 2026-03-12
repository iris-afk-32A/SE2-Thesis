const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Wala dito yung user_id kasi sa may _id object na agad sa MongoDB
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  is_authorized: {
    type: Boolean,
    default: false,
  },
  user_organization: {
    type: String,
  },
  time_created: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
