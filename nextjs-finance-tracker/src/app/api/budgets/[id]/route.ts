import {
  deleteMyBudget,
  getMyBudgetById,
  getMyBudgetByIdForRestore,
  restoreMyBudget,
  restoreTransactionAfterRestoreBudget,
  softDeleteTransactionAfterDeleteBudget,
  updateMyBudget,
} from "@/db/model/budget";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { schemaCreateBudget } from "../route";
import { z } from "zod";
import { inflateSync } from "zlib";
import { BudgetModel } from "@/db/type/type";
import { checkAuthorization } from "@/db/utils/authorization";

// interface BudgetParams {
//   params: {
//     id: string;
//   };
// }

export async function GET(request: NextRequest) {
  try {
    // Ambil UserId dari header

    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");

    if (!UserId) {
      throw new Error("UserId not found");
    }

    // const BudgetId = params.id;
    // console.log(BudgetId, "ini BudgetId");

    const BudgetId = request.nextUrl.pathname.split("/").pop();
    console.log(BudgetId, "ini BudgetId");

    if (!BudgetId) {
      throw new Error("BudgetId not found");
    }

    // Ambil budget berdasarkan BudgetId dan UserId
    const findBudget = await getMyBudgetById(BudgetId);

    if (!findBudget) {
      throw new Error("Budget not found");
    }

    return NextResponse.json(
      {
        message: "Succesfully get Budget",
        data: findBudget,
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
    // const UserId = "682f23c06a86ea8561ed6969";

    if (!UserId) {
      throw new Error("UserId not found");
    }

    const BudgetId = request.nextUrl.pathname.split("/").pop();

    if (!BudgetId) {
      throw new Error("BudgetId not found");
    }

    const data = await request.json();

    const validatedData = schemaCreateBudget.safeParse(data);

    if (!validatedData.success) {
      throw new z.ZodError(validatedData.error.issues);
    }

    const findBudget = (await getMyBudgetById(BudgetId)) as BudgetModel | null;
    console.log(findBudget, "TES");

    if (!findBudget) {
      throw new Error("Budget not found");
    }

    //     {
    //   _id: new ObjectId('682f23c06a86ea8561ed6961'),
    //   name: 'March 23',
    //   amount: 1000000,
    //   startDate: '2025-03-01',
    //   endDate: '2025-03-30',
    //   UserId: new ObjectId('6819ac414f3b3d61b90759d7'),
    //   spent: 0,
    //   income: 0,
    //   remaining: 1000000,
    //   createdAt: 2025-05-22T13:16:48.088Z,
    //   updatedAt: 2025-05-22T14:00:00.635Z
    // } TES

    // Check terlebih dahulu

    // if (findBudget.Transactions.length > 0) {
    //   throw new Error(
    //     "Can't edit because this budget already has transactions"
    //   );
    // }

    // Sementara ini dulu
    if (findBudget.income > 0 || findBudget.spent > 0) {
      throw new Error(
        "Can't edit because this budget already has transactions"
      );
    }

    // Cek jika startDate lebih besar dari endDate
    if (data.startDate > data.endDate) {
      throw new Error("Start date must be less than end date");
    }

    // Cek jika startDate lebih besar dari endDate di data yang sudah ada
    if (data.startDate > findBudget.endDate) {
      throw new Error("Start date must be less than end date");
    }

    // Cek jika endDate lebih kecil dari startDate
    if (data.endDate < data.startDate) {
      throw new Error("End date must be greater than start date");
    }

    // Cek jika endDate lebih kecil dari startDate di data yang sudah ada
    if (data.endDate < findBudget.startDate) {
      throw new Error("End date must be greater than start date");
    }

    const editBudget = await updateMyBudget(BudgetId, data, UserId);

    if (editBudget.modifiedCount === 0) {
      throw new Error("Failed to update budget");
    }

    return NextResponse.json(
      {
        message: "Successfully update budget",
        data: editBudget,
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
          message: `Invalid on ${path} : ${message}`,
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
    const BudgetId = request.nextUrl.pathname.split("/").pop();
    const UserRole = (await headerList).get("x-role");

    if (!UserId) {
      throw new Error("UserId not found");
    }

    if (!BudgetId) {
      throw new Error("BudgetId not found");
    }

    if (!UserRole) {
      throw new Error("UserRole not found");
    }

    const findBudget = (await getMyBudgetById(BudgetId)) as BudgetModel | null;
    console.log(findBudget, "findBudget di route budget");

    if (!findBudget) {
      throw new Error("Budget not found");
    }

    const isAlreadyHaveTransaction =
      findBudget.income > 0 || findBudget.spent > 0;
    console.log(isAlreadyHaveTransaction, "isAlreadyHaveTransaction");

    // Cek apakah user yang menghapus adalah pemilik budget atau admin
    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findBudget.UserId.toString()
    );

    console.log(authCheck, "ini authCheck di route budget");

    if (authCheck) {
      return authCheck;
    }

    const deleteBudget = await deleteMyBudget(BudgetId);

    if (deleteBudget.modifiedCount === 0) {
      throw new Error("Failed to delete budget");
    }

    // Otomatis mendelete transaksi yang terkait dengan budget ini
    if (isAlreadyHaveTransaction) {
      const deleteTransactionByBudgetId =
        await softDeleteTransactionAfterDeleteBudget(BudgetId);

      if (deleteTransactionByBudgetId.modifiedCount === 0) {
        throw new Error("Failed to delete transactions related to this budget");
      }
    }

    return NextResponse.json(
      {
        message: "Successfully delete budget",
        data: deleteBudget,
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
    const UserRole = (await headerList).get("x-role");
    const BudgetId = request.nextUrl.pathname.split("/").pop();

    if (!UserId) throw new Error("UserId not found");
    if (!BudgetId) throw new Error("BudgetId not found");
    if (!UserRole) throw new Error("UserRole not found");

    const findBudget = (await getMyBudgetByIdForRestore(
      BudgetId
    )) as BudgetModel | null;

    if (!findBudget) throw new Error("Budget not found or not deleted");
    const isAlreadyHaveTransaction =
      findBudget.income > 0 || findBudget.spent > 0;

    // Cek apakah user yang menghapus adalah pemilik budget atau admin
    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findBudget.UserId.toString()
    );

    if (authCheck) {
      return authCheck;
    }

    const restoreBudget = await restoreMyBudget(BudgetId);

    if (restoreBudget.modifiedCount === 0) {
      throw new Error("Failed to restore budget");
    }

    // Check jika budget yang di restore sudah ada transaksi yang terkait

    if (isAlreadyHaveTransaction) {
      const restoreTransaction = await restoreTransactionAfterRestoreBudget(
        BudgetId
      );

      if (restoreTransaction.modifiedCount === 0) {
        throw new Error(
          "Failed to restore transactions related to this budget"
        );
      }
    }

    return NextResponse.json(
      {
        message: "Successfully restore budget",
        data: restoreBudget,
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
