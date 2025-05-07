const { Controller } = require("../controllers/controller");
const { authentication } = require("../middlewares/authentication");
const { errorHandling } = require("../middlewares/errorHandler");

const router = require("express").Router();

router.post("/login", Controller.login);
router.post("/register", Controller.register);

// Authentication
router.use(authentication);

// Budget Routes
router.post("/budget", Controller.createBudget);
router.get("/budget", Controller.getMyBudget);

// Transaction Routes
router.post("/transaction", Controller.createTransaction);

router.use(errorHandling);

module.exports = {
  router,
};
