const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");

const connectDB = require("./config/connectDB");
const router = require("./routers/router");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));

connectDB();

app.use(router);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});
