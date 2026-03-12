require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.SERVER_PORT;
const connectDB = require('./config/db');
const cors = require('cors');


connectDB().catch(console.dir);

const HomeRouter = require('./Routes/home');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/Thesis/home', HomeRouter);

app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})