require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;
const connectDB = require("./config/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");


// !So i added rateLimiter specifically for authentication as of now, but ill add
// !rate limiter on other request to especially ones that needs database request 
const authLimiter = rateLimit({
    // *When you reach the limit of 5 request consecutively, youll be 
    // *locked 15 minutes before being able to send another request
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: "Too many request, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

connectDB().catch(console.dir);

const HomeRouter = require("./Routes/home");
const AuthRouter = require("./Routes/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/Thesis/home", HomeRouter);

//* We implement that authLimiter here
app.use("auth/register", authLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth", AuthRouter);


// !So you see these requests logs their activties using the logger. It takes the request method,
// !what page its from, what is the status of the request, then where it come from.
app.get("/health", (req, res) => {
  logger.info({
    message: "SERVER - Health check request",
    method: req.method,
    route: req.originalUrl,
    status: res.statusCode,
    ip: req.ip,
  });
  res.status(200).send("Server is healthy");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  logger.info(`SERVER -- Server started runnin on port: ${port}`);
});
