import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { BudgetModel } from "../type/type";
import { log } from "console";
import { isDataView } from "util/types";

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

  const agg = [
    {
      $match: {
        UserId: new ObjectId(UserId),
        isDeleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "UserId",
        foreignField: "_id",
        as: "User",
      },
    },
    {
      $unwind: {
        path: "$User",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "transactions", // koleksi transaksi
        localField: "_id", // _id budget
        foreignField: "BudgetId", // referensi dari transaksi
        as: "transactions", // hasil disimpan di sini
      },
    },
    {
      $project: {
        "User.password": 0,
      },
    },
  ];

  const budgets = await db.collection(COLLECTION_NAME).aggregate(agg).toArray();

  return budgets;
}

// getMyBudgetById
export async function getMyBudgetById(BudgetId: string) {
  const db = await GetDB();

  const agg = [
    {
      $match: {
        _id: new ObjectId(BudgetId),
        isDeleted: {
          $ne: true,
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "UserId",
        foreignField: "_id",
        as: "User",
      },
    },
    {
      $unwind: {
        path: "$User",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "transactions", // koleksi transaksi
        localField: "_id", // _id budget
        foreignField: "BudgetId", // referensi dari transaksi
        as: "transactions", // hasil disimpan di sini
      },
    },
    {
      $project: {
        "User.password": 0,
      },
    },
  ];

  const findMyBudget = await db
    .collection(COLLECTION_NAME)
    .aggregate(agg)
    .toArray();

  return findMyBudget;
}

export async function getMyBudgetByIdForRestore(BudgetId: string) {
  const db = await GetDB();

  const agg = [
    {
      $match: {
        _id: new ObjectId(BudgetId),
        isDeleted: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "UserId",
        foreignField: "_id",
        as: "User",
      },
    },
    {
      $unwind: {
        path: "$User",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "User.password": 0,
      },
    },
  ];

  const findMyBudget = await db
    .collection(COLLECTION_NAME)
    .aggregate(agg)
    .toArray();

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
      isDeletedByBudget: false,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        isDeletedByBudget: true,
        updatedAt: new Date(),
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
      isDeletedByBudget: true,
    },
    {
      $set: {
        isDeleted: false,
        isDeletedByBudget: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
    }
  );

  return restoreTransaction;
}
