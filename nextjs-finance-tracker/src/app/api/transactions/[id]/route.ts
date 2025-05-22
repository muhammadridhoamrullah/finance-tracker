import { getMyTransactionById } from "@/db/model/transaction";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
