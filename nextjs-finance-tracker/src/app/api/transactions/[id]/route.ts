import { getMyBudgetById } from "@/db/model/budget";
import {
  afterUpdateTransaction,
  getMyTransactionById,
  updateMyTransaction,
} from "@/db/model/transaction";
import { BudgetModel } from "@/db/type/type";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const schemaEditTransaction = z.object({
  amount: z.number().min(1),
  category: z.string(),
  type: z.enum(["income", "expense"]),
  date: z.string().transform((date) => new Date(date)),
  description: z.string().optional(),
});

interface TransactionModel2 {
  _id: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: Date;
  description: string;
  UserId: string;
  BudgetId: string;
  createdAt: Date;
  updatedAt: Date;
  Budget: BudgetModel;
}

export async function GET(request: NextRequest) {
  try {
    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");

    const TransactionId = request.nextUrl.pathname.split("/").pop();

    if (!TransactionId) {
      throw new Error("TransactionId not found");
    }

    if (!UserId) {
      throw new Error("UserId not found");
    }

    const findTransaction = await getMyTransactionById(TransactionId, UserId);

    if (!findTransaction) {
      throw new Error("Transaction not found");
    }

    return NextResponse.json(
      {
        message: "Succesfully get Transaction",
        data: findTransaction,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "Internal Server Error",
        },
        {
          status: 500,
        }
      );
    }
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");
    const TransactionId = request.nextUrl.pathname.split("/").pop();

    if (!UserId) {
      throw new Error("UserId not found");
    }

    if (!TransactionId) {
      throw new Error("TransactionId not found");
    }

    const data = await request.json();

    const validatedData = schemaEditTransaction.safeParse(data);

    if (!validatedData.success) {
      throw new z.ZodError(validatedData.error.issues);
    }

    const findTransaction = (await getMyTransactionById(
      TransactionId,
      UserId
    )) as TransactionModel2[] | null;
    console.log(findTransaction, "ini findTransaction API PUT");

    if (!findTransaction) {
      throw new Error("Transaction not found");
    }
    const nilaiTransactionLama = findTransaction[0].amount;

    if (findTransaction[0].Budget === null) {
      throw new Error("Budget already deleted");
    }

    // Cek jika inputan date lebih kecil dari startDate pada budget
    if (new Date(data.date) < new Date(findTransaction[0].Budget.startDate)) {
      throw new Error("Transaction date is before budget start date");
    }

    // Cek jika inputan date lebih besar dari endDate pada budget
    if (new Date(data.date) > new Date(findTransaction[0].Budget.endDate)) {
      throw new Error("Transaction date is after budget end date");
    }

    if (data.type === "expense") {
      if (data.amount > findTransaction[0].Budget.remaining) {
        throw new Error("Transaction amount is greater than budget remaining");
      }
    }

    const updateTransaction = await updateMyTransaction(
      TransactionId,
      data,
      UserId,
      findTransaction[0].BudgetId
    );
    console.log(updateTransaction, "ini update Trans");

    if (updateTransaction.modifiedCount === 0) {
      throw new Error("Failed to update transaction");
    } else {
      console.log("Masuk ke else update transaction");

      const updateBudgetAfterUpdateTransaction = await afterUpdateTransaction(
        findTransaction[0].BudgetId,
        UserId,
        data,
        TransactionId,
        nilaiTransactionLama
      );
      console.log(updateBudgetAfterUpdateTransaction, "ini updateBud");

      if (!updateBudgetAfterUpdateTransaction) {
        throw new Error("Failed to update budget");
      }
    }

    return NextResponse.json(
      {
        message: "Successfully update transaction",
        data: updateMyTransaction,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const path = error.issues[0].path[0];
      const message = error.issues[0].message;

      return NextResponse.json(
        {
          message: `Invalid on path ${path}: ${message}`,
        },
        {
          status: 400,
        }
      );
    } else if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "Internal Server Error",
        },
        {
          status: 500,
        }
      );
    }
  }
}

// Sebelum update
// {
//   "message": "Succesfully get Transaction",
//   "data": [
//     {
//       "_id": "682ed3c640273b0dd85d93f5",
//       "amount": 50000,
//       "category": "Food",
//       "type": "expense",
//       "date": "2025-01-20",
//       "description": "Bakso Polres",
//       "BudgetId": "682ecd0c63e6e0a95c2a2226",
//       "UserId": "6819ac414f3b3d61b90759d7",
//       "createdAt": "2025-05-22T07:35:34.597Z",
//       "updatedAt": "2025-05-23T14:34:03.879Z",
//       "Budget": [
//         {
//           "_id": "682ecd0c63e6e0a95c2a2226",
//           "name": "January 2222",
//           "amount": 2000000,
//           "startDate": "2025-01-01",
//           "endDate": "2025-01-31",
//           "UserId": "6819ac414f3b3d61b90759d7",
//           "spent": 50000,
//           "income": 0,
//           "remaining": 1950000,
//           "createdAt": "2025-05-22T07:06:52.845Z",
//           "updatedAt": "2025-05-23T07:23:54.021Z"
//         }
//       ]
//     }
//   ]
// }

// Setelah update
// {
//   "message": "Succesfully get Transaction",
//   "data": [
//     {
//       "_id": "682ed3c640273b0dd85d93f5",
//       "amount": 20000,
//       "category": "Food",
//       "type": "expense",
//       "date": "2025-01-20",
//       "description": "Bakso Polres",
//       "BudgetId": "682ecd0c63e6e0a95c2a2226",
//       "UserId": "6819ac414f3b3d61b90759d7",
//       "createdAt": "2025-05-22T07:35:34.597Z",
//       "updatedAt": "2025-05-23T15:17:43.477Z",
//       "Budget": [
//         {
//           "_id": "682ecd0c63e6e0a95c2a2226",
//           "name": "January 2222",
//           "amount": 2000000,
//           "startDate": "2025-01-01",
//           "endDate": "2025-01-31",
//           "UserId": "6819ac414f3b3d61b90759d7",
//           "spent": 50000,
//           "income": 0,
//           "remaining": 1950000,
//           "createdAt": "2025-05-22T07:06:52.845Z",
//           "updatedAt": "2025-05-23T07:23:54.021Z"
//         }
//       ]
//     }
//   ]
// }
