import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { BudgetModel } from "../type/type";
import { log } from "console";

const COLLECTION_NAME = "budgets";
type InputModelBudget = Pick<
  BudgetModel,
  "name" | "amount" | "startDate" | "endDate" | "UserId"
>;

type inputEditBudget = Pick<
  BudgetModel,
  "name" | "amount" | "startDate" | "endDate"
>;

// createBudget
export async function createBudget(input: InputModelBudget) {
  const db = await GetDB();

  const createNewBudget = await db.collection(COLLECTION_NAME).insertOne({
    ...input,
    spent: 0,
    income: 0,
    remaining: input.amount,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return createNewBudget;
}

// getMyBudgets
export async function getMyBudgets(UserId: string) {
  const db = await GetDB();

  const budgets = await db
    .collection(COLLECTION_NAME)
    .find({
      UserId: new ObjectId(UserId),
    })
    .sort({ createdAt: 1 })
    .toArray();

  return budgets;
}

// getMyBudgetById
export async function getMyBudgetById(BudgetId: string, UserId: string) {
  const db = await GetDB();

  const findMyBudget = await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(BudgetId),
    UserId: new ObjectId(UserId),
  });

  return findMyBudget;
}

// updateMyBudget

export async function updateMyBudget(
  BudgetId: string,
  input: inputEditBudget,
  UserId: string
) {
  const db = await GetDB();

  const updateMyBudget = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(BudgetId),
      UserId: new ObjectId(UserId),
    },
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    }
  );

  

  return updateMyBudget;
}

// deleteMyBudget
