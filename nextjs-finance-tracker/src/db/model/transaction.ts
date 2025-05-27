import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { BudgetModel, TransactionModel } from "../type/type";

const COLLECTION_NAME = "transactions";
type InputTransactionModel = Omit<
  TransactionModel,
  "_id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"
>;
// {
//   "message": "Succesfully get Transaction",
//   "data": {
//     "_id": "682ed3c640273b0dd85d93f5",
//     "amount": 50000,
//     "category": "Food",
//     "type": "expense",
//     "date": "2025-01-12",
//     "description": "Bakso",
//     "BudgetId": "682ecd0c63e6e0a95c2a2226",
//     "UserId": "6819ac414f3b3d61b90759d7",
//     "createdAt": "2025-05-22T07:35:34.597Z",
//     "updatedAt": "2025-05-22T07:35:34.597Z"
//   }
// }

type InputEditTransaction = Pick<
  TransactionModel,
  "amount" | "category" | "type" | "date" | "description"
>;

// createTransaction
export async function createTransaction(input: InputTransactionModel) {
  const db = await GetDB();

  const findBudget = (await db.collection("budgets").findOne({
    _id: new ObjectId(input.BudgetId),
    isDeleted: { $ne: true },
  })) as BudgetModel | null;

  if (!findBudget) {
    throw new Error("Budget not found / has been deleted");
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

  const findMyTransactions = await db
    .collection(COLLECTION_NAME)
    .find({
      UserId: new ObjectId(UserId),
      isDeleted: { $ne: true },
    })
    .sort({ createdAt: 1 })
    .toArray();

  return findMyTransactions;
}

// getMyTransactionById
export async function getMyTransactionById(
  TransactionId: string,
  UserId: string
) {
  const db = await GetDB();

  const agg = [
    {
      $match: {
        _id: new ObjectId(TransactionId),
        UserId: new ObjectId(UserId),
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
        path: "$Transaction",
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
  UserId: string,
  BudgetId: string
) {
  console.log(BudgetId, "ini budget id di model transaction update");

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
  console.log(findBudgetById, "MODEL - ini find budget by id");

  const findTransaction = (await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(TransactionId),
    UserId: new ObjectId(UserId),
  })) as TransactionModel | null;
  console.log(findTransaction, "MODEL - ini find transaction by id");

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
  console.log(remainingExpense, "ini remaining expense");
  console.log(spentExpense, "ini spent expense");
  console.log(BudgetId, "ini budget id di model transaction after update");
  console.log(UserId, "ini user id di model transaction after update");
  console.log(
    input.amount,
    "ini input amount di model transaction after update"
  );
  console.log(
    findTransaction?.amount,
    "ini find transaction amount di model transaction after update"
  );
  console.log(
    budgetAiDi,
    "ini budget id to string di model transaction after update"
  );
  console.log(nilaiTransactionLama, "nilai amount lama");

  // Cek jika inputan type expense
  if (findTransaction?.type === "expense") {
    console.log("masuk expense");

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
    console.log("masuk income");

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

// restoreMyTransaction
