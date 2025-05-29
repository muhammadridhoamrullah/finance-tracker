import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { BudgetModel, TransactionModel } from "../type/type";

const COLLECTION_NAME = "transactions";
type InputTransactionModel = Omit<
  TransactionModel,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "isDeleted"
  | "deletedAt"
  | "isDeletedByBudget"
>;

type InputEditTransaction = Pick<
  TransactionModel,
  "amount" | "category" | "type" | "date" | "description"
>;

type FindBudget = Pick<BudgetModel, "remaining" | "spent" | "income">;

// createTransaction
export async function createTransaction(
  input: InputTransactionModel,
  findBudget: FindBudget
) {
  const db = await GetDB();

  const createNewTransaction = await db.collection(COLLECTION_NAME).insertOne({
    ...input,
    isDeletedByBudget: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (input.type === "expense") {
    await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(input.BudgetId),
      },
      {
        $set: {
          remaining: Number(findBudget.remaining) - Number(input.amount),
          spent: Number(findBudget.spent) + Number(input.amount),
        },
      }
    );
  } else if (input.type === "income") {
    console.log("masuk income di model transaction");
    await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(input.BudgetId),
      },
      {
        $set: {
          remaining: Number(findBudget.remaining) + Number(input.amount),
          income: Number(findBudget.income) + Number(input.amount),
        },
      }
    );
  }

  return createNewTransaction;
}

// getMyTransactions
export async function getMyTransactions(UserId: string) {
  const db = await GetDB();

  const agg = [
    {
      $match: {
        UserId: new ObjectId(UserId),
        isDeleted: false,
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
    {
      $lookup: {
        from: "budgets",
        localField: "BudgetId",
        foreignField: "_id",
        as: "Budget",
      },
    },
    {
      $unwind: {
        path: "$Budget",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ];

  const findMyTransactions = await db
    .collection(COLLECTION_NAME)
    .aggregate(agg)
    .toArray();

  return findMyTransactions;
}

// getMyTransactionById
export async function getMyTransactionById(TransactionId: string) {
  const db = await GetDB();

  const agg = [
    {
      $match: {
        _id: new ObjectId(TransactionId),
        isDeleted: false,
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
    {
      $lookup: {
        from: "budgets",
        localField: "BudgetId",
        foreignField: "_id",
        as: "Budget",
      },
    },
    {
      $unwind: {
        path: "$Budget",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const findMyTransaction = await db
    .collection(COLLECTION_NAME)
    .aggregate(agg)
    .toArray();

  return findMyTransaction;
}

export async function getMyTransactionByIdForRestore(TransactionId: string) {
  const db = await GetDB();

  const agg = [
    {
      $match: {
        _id: new ObjectId(TransactionId),
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
    {
      $lookup: {
        from: "budgets",
        localField: "BudgetId",
        foreignField: "_id",
        as: "Budget",
      },
    },
    {
      $unwind: {
        path: "$Budget",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const findMyTransaction = await db
    .collection(COLLECTION_NAME)
    .aggregate(agg)
    .toArray();

  return findMyTransaction;
}

// updateMyTransaction

export async function updateMyTransaction(
  TransactionId: string,
  input: InputEditTransaction,
  UserId: string
) {
  const db = await GetDB();

  const updateTransaction = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(TransactionId),
      UserId: new ObjectId(UserId),
    },
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    }
  );

  return updateTransaction;
}

export async function afterUpdateTransaction(
  BudgetId: string,
  UserId: string,
  input: InputEditTransaction,
  TransactionId: string,
  nilaiTransactionLama: number
) {
  const db = await GetDB();
  const budgetAiDi = BudgetId.toString();

  const findBudgetById = (await db.collection("budgets").findOne({
    _id: new ObjectId(budgetAiDi),
    UserId: new ObjectId(UserId),
  })) as BudgetModel | null;

  const findTransaction = (await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(TransactionId),
    UserId: new ObjectId(UserId),
  })) as TransactionModel | null;

  // Cek jika inputan type expense
  const remainingExpense =
    Number(findBudgetById!.remaining) + Number(nilaiTransactionLama);
  const spentExpense =
    Number(findBudgetById!.spent) - Number(nilaiTransactionLama);

  // Cek jika inputan type income
  const remainingIncome =
    Number(findBudgetById!.remaining) - Number(nilaiTransactionLama);
  const incomeIncome =
    Number(findBudgetById!.income) - Number(nilaiTransactionLama);

  // Cek jika inputan type expense
  if (findTransaction?.type === "expense") {
    await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(budgetAiDi),
        UserId: new ObjectId(UserId),
      },
      {
        $set: {
          remaining: Number(remainingExpense) - Number(input.amount),
          spent: Number(spentExpense) + Number(input.amount),
        },
      }
    );
  } else if (findTransaction?.type === "income") {
    await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(budgetAiDi),
        UserId: new ObjectId(UserId),
      },
      {
        $set: {
          remaining: Number(remainingIncome) + Number(input.amount),
          income: Number(incomeIncome) + Number(input.amount),
        },
      }
    );
  }

  // Cek budget terbaru
  const findBudgetTerbaru = (await db.collection("budgets").findOne({
    _id: new ObjectId(budgetAiDi),
    UserId: new ObjectId(UserId),
  })) as BudgetModel | null;

  return findBudgetTerbaru;
}

// deleteMyTransaction

export async function deleteMyTransaction(TransactionId: string) {
  const db = await GetDB();

  const deleteTransaction = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(TransactionId),
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  return deleteTransaction;
}

export async function updateBudgetAfterDeleteTransaction(
  BudgetId: string,
  typeTransaction: "income" | "expense",
  oldAmount: number
) {
  const db = await GetDB();

  const findBudget = (await db.collection("budgets").findOne({
    _id: new ObjectId(BudgetId),
  })) as BudgetModel | null;

  const isExpense = typeTransaction === "expense";
  const isIncome = typeTransaction === "income";

  if (isExpense) {
    const updateBudgetExp = await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(BudgetId),
      },
      {
        $set: {
          remaining: Number(findBudget?.remaining) + Number(oldAmount),
          spent: Number(findBudget?.spent) - Number(oldAmount),
        },
      }
    );

    return updateBudgetExp;
  } else if (isIncome) {
    const updateBudgetInc = await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(BudgetId),
      },
      {
        $set: {
          remaining: Number(findBudget?.remaining) - Number(oldAmount),
          income: Number(findBudget?.income) - Number(oldAmount),
        },
      }
    );

    return updateBudgetInc;
  }
}

// restoreMyTransaction

export async function restoreMyTransaction(TransactionId: string) {
  const db = await GetDB();

  const restoreTransaction = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(TransactionId),
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

export async function updateBudgetAfterRestoreTransaction(
  BudgetId: string,
  typeTransaction: "income" | "expense",
  amountDeletedTransaction: number
) {
  const db = await GetDB();

  const findBudget = await db.collection("budgets").findOne({
    _id: new ObjectId(BudgetId),
  });

  const isExpense = typeTransaction === "expense";
  const isIncome = typeTransaction === "income";

  if (isExpense) {
    const updateBudgetExp = await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(BudgetId),
      },
      {
        $set: {
          remaining:
            Number(findBudget?.remaining) - Number(amountDeletedTransaction),
          spent: Number(findBudget?.spent) + Number(amountDeletedTransaction),
        },
      }
    );

    return updateBudgetExp;
  } else if (isIncome) {
    const updateBudgetInc = await db.collection("budgets").updateOne(
      {
        _id: new ObjectId(BudgetId),
      },
      {
        $set: {
          remaining:
            Number(findBudget?.remaining) + Number(amountDeletedTransaction),
          income: Number(findBudget?.income) + Number(amountDeletedTransaction),
        },
      }
    );
    return updateBudgetInc;
  }
}
