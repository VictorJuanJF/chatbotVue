require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//auth
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
//2020
// parse application/json
app.use(bodyParser.json());
// app.use(cors());
// CORS middleware
const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};

app.use(allowCrossDomain);

const routes = require("./routes/api/api.js");
const webhook = require("./chatbot/app.js");
app.use("/api", routes);
app.use("/api", webhook);

if (process.env.NODE_ENV === "production") {
  //static folder
  app.use(express.static(__dirname + "/public"));
  //Handle SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });
}
process.env.PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`Server starting on port ${process.env.PORT}`);
});
