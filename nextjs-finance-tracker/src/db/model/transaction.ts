import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { BudgetModel, TransactionModel } from "../type/type";

const COLLECTION_NAME = "transactions";
type InputTransactionModel = Omit<
  TransactionModel,
  "_id" | "createdAt" | "updatedAt"
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

  // Update budget
  

  return updateTransaction;
}

// deleteMyTransaction
