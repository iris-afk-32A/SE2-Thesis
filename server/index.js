require("dotenv").config();

const express = require("express");
const http = require("http")
const app = express();
const port = process.env.SERVER_PORT;
const connectDB = require("./config/db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

const { initSocket } = require("./config/socket");

const server = http.createServer(app);
initSocket(server);

server.listen(4000, () => console.log("Server running"));
// !So i added rateLimiter specifically for authentication as of now, but ill add
// !rate limiter on other request to especially ones that needs database request 
const requestLimiter = rateLimit({
    // *When you reach the limit of 5 request consecutively, youll be 
    // *locked 15 minutes before being able to send another request
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many request, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

connectDB().catch(console.dir);

const HomeRouter = require("./Routes/home");
const RoomRouter = require("./Routes/room");
const DeviceRouter = require("./Routes/device");
const AuthRouter = require("./Routes/auth");
const OrganizationRouter = require("./Routes/organization");
const PointRouter = require("./Routes/points");
const SubjectRouter = require("./Routes/subject");
const ScheduleRouter = require("./Routes/schedule");
const ActivityRouter = require("./Routes/activity");
const ArduinoRouter = require("./Routes/arduino");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/activity", ActivityRouter);

app.use("/server/home", HomeRouter);

//* We implement that requestLimiter here
app.use("/auth/register", requestLimiter);
app.use("/auth/login", requestLimiter);
app.use("/auth/me", requestLimiter);
app.use("/auth", AuthRouter);

app.use("/room/create", requestLimiter);
app.use("/room/list", requestLimiter);
app.use("/room", RoomRouter);

app.use("/points", PointRouter);

app.use("/room/add", requestLimiter);
app.use("/device", DeviceRouter);
app.use("/organization", OrganizationRouter);
app.use("/organization/addOrganization", requestLimiter);
app.use("/organization/getOrganization", requestLimiter);
app.use("/subject/create", requestLimiter);
app.use("/subject/list", requestLimiter);
app.use("/subject", SubjectRouter);
app.use("/schedule", ScheduleRouter);
app.use("/schedule/room/:roomId", requestLimiter);

app.use("/control", ArduinoRouter);



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
