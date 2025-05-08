import { createTransaction } from "@/db/model/transaction";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { date, z } from "zod";

const schemaCreateTransaction = z.object({
  amount: z.number().min(1),
  category: z.string(),
  type: z.enum(["income", "expense"]),
  date: z.string().transform((date) => new Date(date)),
  description: z.string().optional(),
  BudgetId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const headerList = headers();
    const UserId = (await headerList).get("x-user-id");

    const validatedData = schemaCreateTransaction.safeParse(data);

    if (!validatedData.success) {
      throw new z.ZodError(validatedData.error.issues);
    }

    const makeTransaction = {
      ...data,
      UserId: new ObjectId(UserId!),
      BudgetId: new ObjectId(data.BudgetId),
    };

    const creatingTransaction = await createTransaction(makeTransaction);

    return NextResponse.json(
      {
        message: "Sucessfully create transaction",
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
