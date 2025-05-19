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
router.get("/budget/:id", Controller.getMyBudgetById);
router.put("/budget/:id", Controller.updateMyBudget);

// Transaction Routes
router.post("/transaction", Controller.createTransaction);
router.get("/transaction", Controller.getMyTransaction);
router.get("/transaction/:id", Controller.getMyTransactionById);

router.use(errorHandling);

module.exports = {
  router,
};
