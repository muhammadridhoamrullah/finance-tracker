async function errorHandling(err, req, res, next) {
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    const errors = err.errors.map((el) => {
      return el.message;
    });
    res.status(400).json({ message: errors[0] });
  } else if (err.name === "EMAIL_PASSWORD_REQUIRED") {
    res.status(400).json({ message: "Email and Password are required" });
  } else if (err.name === "EMAIL_PASSWORD_INVALID") {
    res.status(401).json({ message: "Email or Password is invalid" });
  } else if (err.name === "REGISTER_FIELDS_REQUIRED") {
    res.status(400).json({
      message:
        "First Name, Last Name, Email, Password, Phone Number, and Address are required",
    });
  } else if (err.name === "UNAUTHORIZED") {
    res.status(401).json({ message: "Unauthorized: Please login first" });
  } else if (err.name === "BUDGET_FIELDS_REQUIRED") {
    res.status(400).json({
      message: "Name, Amount, Start Date, and End Date are required",
    });
  } else if (err.name === "BUDGET_DATES_INVALID") {
    res
      .status(400)
      .json({ message: "End Date must be greater than Start Date" });
  } else if (err.name === "BUDGET_NOT_FOUND") {
    res.status(404).json({ message: "Budget not found" });
  } else if (err.name === "TRANSACTION_FIELDS_REQUIRED") {
    res.status(400).json({
      message: "Amount, Category, Type, Date, and BudgetId are required",
    });
  } else if (err.name === "BUDGET_NOT_ENOUGH") {
    res.status(400).json({ message: "Budget not enough" });
  } else if (err.name === "TRANSACTION_DATE_INVALID") {
    res.status(400).json({
      message:
        "Transaction date must be greater than Budget Start Date and Lower than Budget End Date",
    });
  } else if (err.name === "TRANSACTION_NOT_FOUND") {
    res.status(404).json({ message: "Transaction not found" });
  } else if (err.name === "STARTDATE_INVALID") {
    res
      .status(400)
      .json({ message: "Start Date must should be less than End Date" });
  } else if (err.name === "ENDDATE_INVALID") {
    res
      .status(400)
      .json({ message: "End Date must should be greater than Start Date" });
  } else if (err.name === "ERROR_UPDATE_BUDGET") {
    res.status(404).json({ message: "Error update budget" });
  } else if (err.name === "BUDGET_CANT_BE_UPDATED") {
    res.status(400).json({
      message:
        "Budget can't be updated because of there is already transaction in this budget",
    });
  } else if (err.name === "UPDATE_DATE_TRANSACTION_LESSER") {
    res
      .status(400)
      .json({ message: "Date is can't lesser than Start Date on Budget" });
  } else if (err.name === "UPDATE_DATE_TRANSACTION_GREATER") {
    res
      .status(400)
      .json({ message: "Date is can't greater than End Date on Budget" });
  } else if (err.name === "ERROR_UPDATE_TRANSACTION") {
    res.status(404).json({ message: "Error update transaction" });
  } else if (err.name === "ERROR_DELETE_BUDGET") {
    res.status(404).json({ message: "Error delete budget" });
  }
}

module.exports = {
  errorHandling,
};
