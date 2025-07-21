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

interface Props {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    // Ambil UserId dari header
    const { id } = await params;

    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");

    if (!UserId) {
      throw new Error("UserId not found");
    }

    const BudgetId = id;

    if (!BudgetId) {
      throw new Error("BudgetId not found");
    }

    // Ambil budget berdasarkan BudgetId dan UserId
    const findBudget = (await getMyBudgetById(BudgetId)) as BudgetModel;

    // if (findBudget.length === 0) {
    //   throw new Error("Budget not found");
    // }
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

    const findBudget = (await getMyBudgetById(BudgetId)) as BudgetModel[];

    if (findBudget.length === 0) {
      throw new Error("Budget not found");
    }

    // Sementara ini dulu
    if (findBudget[0].income > 0 || findBudget[0].spent > 0) {
      throw new Error(
        "Can't edit because this budget already has transactions"
      );
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

    const findBudget = (await getMyBudgetById(BudgetId)) as BudgetModel[];

    if (findBudget.length === 0) {
      throw new Error("Budget not found");
    }

    const isAlreadyHaveTransaction =
      findBudget[0].income > 0 || findBudget[0].spent > 0;

    // Cek apakah user yang menghapus adalah pemilik budget atau admin
    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findBudget[0].UserId.toString()
    );

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
    )) as BudgetModel[];

    if (findBudget.length === 0) {
      throw new Error("Budget not found or already restored");
    }

    const isAlreadyHaveTransaction =
      findBudget[0].income > 0 || findBudget[0].spent > 0;

    // Cek apakah user yang menghapus adalah pemilik budget atau admin
    const authCheck = await checkAuthorization(
      UserId,
      UserRole,
      findBudget[0].UserId.toString()
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
