const { Controller } = require("../controllers/controller");
const { authentication } = require("../middlewares/authentication");
const { authorizationAdmin } = require("../middlewares/authorizationAdmin");
const {
  authorizationBudget,
  authorizationBudgetForRestore,
} = require("../middlewares/authorizationBudget");
const {
  authorizationTransaction,
} = require("../middlewares/authorizationTransaction");
const { errorHandling } = require("../middlewares/errorHandler");

const router = require("express").Router();

router.post("/login", Controller.login);
router.post("/register", Controller.register);
router.get("/verify-email", Controller.verifyEmail);
// Authentication
router.use(authentication);

// Budget Routes
router.post("/budget", Controller.createBudget);
router.get("/budget", Controller.getMyBudget);
router.get("/budget/:id", Controller.getMyBudgetById);
router.put("/budget/:id", authorizationBudget, Controller.updateMyBudget);
router.delete("/budget/:id", authorizationBudget, Controller.deleteMyBudget);
router.patch(
  "/budget/restore/:id",
  authorizationBudgetForRestore,
  Controller.restoreMyBudget
);

// Transaction Routes
router.post("/transaction", Controller.createTransaction);
router.get("/transaction", Controller.getMyTransaction);
router.get("/transaction/:id", Controller.getMyTransactionById);
router.put(
  "/transaction/:id",
  authorizationTransaction,
  Controller.updateMyTransaction
);
router.delete(
  "/transaction/:id",
  authorizationTransaction,
  Controller.deleteMyTransaction
);
router.patch(
  "/transaction/restore/:id",
  authorizationTransaction,
  Controller.restoreMyTransaction
);

// Summary
router.get("/summary/overall", Controller.getSummary);
router.get("/summary/range", Controller.getSummaryByRange);
router.get("/summary/month", Controller.getSummaryByMonth);
router.get("/summary/this-month", Controller.getSummaryThisMonth);
router.get("/summary/one-month-ago", Controller.getSummaryOneMonthAgo);
router.get("/summary/yearly", Controller.getSummaryByYear);
router.get("/summary/report-month", Controller.getReportMonthly);

// Admin
router.get("/admin/budget", authorizationAdmin, Controller.getAllBudget);
router.get(
  "/admin/transaction",
  authorizationAdmin,
  Controller.getAllTransaction
);

// User Profile
router.get("/profile", Controller.getMyProfile);
router.get("/profile/:id", Controller.getProfileById);

router.use(errorHandling);

module.exports = {
  router,
};
