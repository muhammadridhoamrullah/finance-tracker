import { createBudget, getMyBudgets } from "@/db/model/budget";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// {
//   "id": 1,
//   "UserId": 1,
//   "name": "January",
//   "amount": 5000000,
//   "spent": 150000,
//   "income": 0,
//   "startDate": "2023-11-01T00:00:00Z",
//   "endDate": "2023-11-30T23:59:59Z",
//   "remaining": 4850000
// }

const schemaCreateBudget = z.object({
  name: z.string(),
  amount: z.number(),
  startDate: z.string().transform((date) => new Date(date)),
  endDate: z.string().transform((date) => new Date(date)),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");

    const validatedData = schemaCreateBudget.safeParse(data);

    if (!validatedData.success) {
      throw new z.ZodError(validatedData.error.issues);
    }

    const makeBudget = {
      ...data,
      UserId: new ObjectId(UserId!),
    };

    const creatingBudget = await createBudget(makeBudget);

    return NextResponse.json(
      {
        message: "Sucessfully create budget",
        data: creatingBudget,
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
          message: `Invalid ${path} : ${message}`,
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

export async function GET(request: NextRequest) {
  try {
    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");

    const budget = await getMyBudgets(UserId!);

    if (!budget || budget.length === 0) {
      throw new Error("Budgets not found");
    }

    return NextResponse.json(
      {
        data: budget,
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
