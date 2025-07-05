import { createBudget, getMyBudgets } from "@/db/model/budget";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const schemaCreateBudget = z
  .object({
    name: z.string(),
    amount: z.number(),
    startDate: z.string().transform((date) => new Date(date)),
    endDate: z.string().transform((date) => new Date(date)),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
  });

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const headerList = headers();

    const UserId = (await headerList).get("x-user-id");

    if (!UserId) {
      throw new Error("User ID is required");
    }

    const validatedData = schemaCreateBudget.safeParse(data);

    if (!validatedData.success) {
      throw new z.ZodError(validatedData.error.issues);
    }

    const makeBudget = {
      ...data,
      UserId: new ObjectId(UserId),
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

    if (!UserId) {
      throw new Error("User ID is required");
    }

    const budget = await getMyBudgets(UserId);

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
