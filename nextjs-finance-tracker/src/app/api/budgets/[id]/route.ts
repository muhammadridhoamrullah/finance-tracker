import { getMyBudgetById, updateMyBudget } from "@/db/model/budget";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { schemaCreateBudget } from "../route";
import { z } from "zod";
import { inflateSync } from "zlib";

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
    const findBudget = await getMyBudgetById(BudgetId, UserId);

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

    const findBudget = await getMyBudgetById(BudgetId, UserId);
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

    // Cek jika startDate lebih besar dari endDate
    if (data.startDate > data.endDate) {
      throw new Error("Start date must be less than end date");
    }

    // Cek jika startDate lebih besar dari endDate di data yang sudah ada

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
