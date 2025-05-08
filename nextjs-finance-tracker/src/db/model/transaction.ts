import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { BudgetModel, TransactionModel } from "../type/type";

const COLLECTION_NAME = "transactions";
type InputTransactionModel = Omit<
  TransactionModel,
  "_id" | "createdAt" | "updatedAt"
>;

export async function createTransaction(input: InputTransactionModel) {
  const db = await GetDB();

  const findBudget = (await db.collection("budgets").findOne({
    _id: new ObjectId(input.BudgetId),
  })) as BudgetModel | null;

  if (!findBudget) {
    throw new Error("Budget not found");
  }

  const isBeforeStartDate =
    new Date(input.date) < new Date(findBudget.startDate);
  const isAfterEndDate = new Date(input.date) > new Date(findBudget.endDate);

  if (isBeforeStartDate) {
    throw new Error("Transaction date is before budget start date");
  }

  if (isAfterEndDate) {
    throw new Error("Transaction date is after budget end date");
  }

  if (input.amount > findBudget.remaining) {
    throw new Error("Transaction amount is greater than budget remaining");
  }

  const createNewTransaction = await db.collection(COLLECTION_NAME).insertOne({
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (input.type === "income") {
    await db.collection("budgets").updateMany(
      {
        _id: new ObjectId(input.BudgetId),
      },
      {
        $inc: {
          income: findBudget.income + input.amount,
          remaining: findBudget.remaining + input.amount,
        },
      }
    );
  } else if (input.type === "expense") {
    await db.collection("budgets").updateMany(
      {
        _id: new ObjectId(input.BudgetId),
      },
      {
        $inc: {
          spent: findBudget.spent + input.amount,
          remaining: findBudget.remaining - input.amount,
        },
      }
    );
  }

  return createNewTransaction;
}
