import { GetDB } from "../config";
import { BudgetModel } from "../type/type";

const COLLECTION_NAME = "budgets";
type InputModelBudget = Pick<
  BudgetModel,
  "name" | "amount" | "startDate" | "endDate"
>;

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
