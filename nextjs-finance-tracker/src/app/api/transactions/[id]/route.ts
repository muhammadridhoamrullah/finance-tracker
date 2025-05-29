import { getMyBudgetById } from "@/db/model/budget";
import {
  afterUpdateTransaction,
  deleteMyTransaction,
  getMyTransactionById,
  getMyTransactionByIdForRestore,
  restoreMyTransaction,
  updateBudgetAfterDeleteTransaction,
  updateBudgetAfterRestoreTransaction,
  updateMyTransaction,
} from "@/db/model/transaction";
import { BudgetModel } from "@/db/type/type";
import { checkAuthorization } from "@/db/utils/authorization";
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
  isDeleted: boolean;
  deletedAt: Date | null;
  Budget: BudgetModel;
}

export async function GET(request: NextRequest) {
  try {
    const TransactionId = request.nextUrl.pathname.split("/").pop();

    if (!TransactionId) {
      throw new Error("TransactionId not found");
    }

    const findTransaction = await getMyTransactionById(TransactionId);

    if (findTransaction.length === 0) {
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
    const UserRole = await (await headerList).get("x-role");

    if (!UserRole) {
      throw new Error("UserRole not found");
    }

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
      TransactionId
    )) as TransactionModel2[];

    if (findTransaction.length === 0) {
      throw new Error("Transaction not found");
    }
    const nilaiTransactionLama = findTransaction[0].amount;

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

    // Check authorization
    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findTransaction[0].UserId.toString()
    );

    if (authCheck) {
      return authCheck;
    }

    const updateTransaction = await updateMyTransaction(
      TransactionId,
      data,
      UserId
    );

    if (updateTransaction.modifiedCount === 0) {
      throw new Error("Failed to update transaction");
    } else {
      const updateBudgetAfterUpdateTransaction = await afterUpdateTransaction(
        findTransaction[0].BudgetId,
        UserId,
        data,
        TransactionId,
        nilaiTransactionLama
      );

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

export async function DELETE(request: NextRequest) {
  try {
    const headerList = headers();
    const UserId = (await headerList).get("x-user-id");
    const TransactionId = request.nextUrl.pathname.split("/").pop();
    const UserRole = (await headerList).get("x-role");

    if (!UserId) {
      throw new Error("UserId not found");
    }

    if (!TransactionId) {
      throw new Error("TransactionId not found");
    }

    if (!UserRole) {
      throw new Error("UserRole not found");
    }

    // Cari transaksi berdasarkan TransactionId
    const findTransaction = (await getMyTransactionById(
      TransactionId
    )) as TransactionModel2[];
    console.log(findTransaction, "findTransaction API DEL");

    if (findTransaction.length === 0) {
      throw new Error("Transaction not found");
    }

    const BudgetId = findTransaction[0].BudgetId.toString();
    const oldAmount = findTransaction[0].amount;
    const typeTransaction = findTransaction[0].type;

    // Check authorization

    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findTransaction[0].UserId.toString()
    );

    if (authCheck) {
      return authCheck;
    }

    // Soft delete transaksi
    const softDeleteTransaction = await deleteMyTransaction(TransactionId);

    if (softDeleteTransaction.modifiedCount === 0) {
      throw new Error("Failed to delete transaction");
    }

    // Update budget setelah transaksi dihapus
    const updatedBudget = await updateBudgetAfterDeleteTransaction(
      BudgetId,
      typeTransaction,
      oldAmount
    );

    if (updatedBudget?.modifiedCount === 0) {
      throw new Error("Failed to update budget");
    }

    return NextResponse.json(
      {
        message: "Successfully delete transaction",
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

export async function PATCH(request: NextRequest) {
  try {
    const headerList = headers();
    const UserId = (await headerList).get("x-user-id");
    const TransactionId = request.nextUrl.pathname.split("/").pop();
    const UserRole = (await headerList).get("x-role");

    if (!UserId) throw new Error("UserId not found");
    if (!TransactionId) throw new Error("TransactionId not found");
    if (!UserRole) throw new Error("UserRole not found");

    const findTransaction = (await getMyTransactionByIdForRestore(
      TransactionId
    )) as TransactionModel2[];

    if (findTransaction.length === 0) {
      throw new Error("Transaction not found");
    }
    const BudgetId = findTransaction[0].BudgetId.toString();
    const typeTransaction = findTransaction[0].type;
    const amountDeletedTransaction = findTransaction[0].amount;

    const findBudget = await getMyBudgetById(BudgetId);

    if (!findBudget) {
      throw new Error("Budget not found or has been deleted");
    }

    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findTransaction[0].UserId.toString()
    );

    if (authCheck) {
      return authCheck;
    }

    const restoreTransaction = await restoreMyTransaction(TransactionId);

    if (restoreTransaction.modifiedCount === 0) {
      throw new Error("Failed to restore transaction");
    }

    const updateBudgetAftRestoreTrans =
      await updateBudgetAfterRestoreTransaction(
        BudgetId,
        typeTransaction,
        amountDeletedTransaction
      );

    if (updateBudgetAftRestoreTrans?.modifiedCount === 0) {
      throw new Error("Failed to update budget after restoring transaction");
    }

    return NextResponse.json(
      {
        message: "Successfully restored transaction",
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
