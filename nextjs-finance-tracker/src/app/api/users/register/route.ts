import { createUser } from "@/db/model/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schemaRegister = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().min(10).max(13),
  address: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const validateData = schemaRegister.safeParse(data);

    if (!validateData.success) {
      throw validateData.error;
    }

    const creatingUser = await createUser(data);

    return NextResponse.json(
      {
        status: "success",
        message: "User created successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 400,
        }
      );
    }
    if (error instanceof z.ZodError) {
      const path = error.issues[0].path[0];
      const message = error.issues[0].message;

      return NextResponse.json(
        {
          message: `Invalid on path: ${path}, error message: ${message}`,
        },
        {
          status: 400,
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
