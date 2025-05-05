const { Controller } = require("../controllers/controller");

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Finance Tracker API!");
});

module.exports = {
  router,
};
