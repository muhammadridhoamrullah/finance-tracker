import { getMyBudgetById } from "@/db/model/budget";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
