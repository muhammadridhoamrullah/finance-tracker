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
    isDeleted: false,
    deletedAt: null,
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
      isDeleted: { $ne: true },
      UserId: new ObjectId(UserId),
    })
    .sort({ createdAt: 1 })
    .toArray();

  return budgets;
}

// getMyBudgetById
export async function getMyBudgetById(BudgetId: string) {
  const db = await GetDB();

  const findMyBudget = await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(BudgetId),
  });

  return findMyBudget;
}

export async function getMyBudgetByIdForRestore(BudgetId: string) {
  const db = await GetDB();

  const findMyBudget = await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(BudgetId),
    isDeleted: true,
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
        remaining: input.amount,
        updatedAt: new Date(),
      },
    }
  );

  return updateMyBudget;
}

// deleteMyBudget

export async function deleteMyBudget(BudgetId: string) {
  const db = await GetDB();

  const softDeleteMyBudget = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(BudgetId),
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  return softDeleteMyBudget;
}

export async function softDeleteTransactionAfterDeleteBudget(BudgetId: string) {
  const db = await GetDB();

  const softDeleteTransaction = await db.collection("transactions").updateMany(
    {
      BudgetId: new ObjectId(BudgetId),
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  return softDeleteTransaction;
}

// restoreMyBudget

export async function restoreMyBudget(BudgetId: string) {
  const db = await GetDB();

  const restore = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(BudgetId),
    },
    {
      $set: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
    }
  );

  return restore;
}

export async function restoreTransactionAfterRestoreBudget(BudgetId: string) {
  const db = await GetDB();

  const restoreTransaction = await db.collection("transactions").updateMany(
    {
      BudgetId: new ObjectId(BudgetId),
      isDeleted: true,
    },
    {
      $set: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
    }
  );

  return restoreTransaction;
}
