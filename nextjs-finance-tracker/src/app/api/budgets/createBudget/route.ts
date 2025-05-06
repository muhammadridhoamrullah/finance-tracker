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
  startDate: z.date(),
  endDate: z.date(),
});

export async function GET(request: NextRequest) {
  try {
    // const data = await request.json();

    return NextResponse.json(
      {
        message: "success",
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
