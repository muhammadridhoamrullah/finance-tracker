import { NextResponse } from "next/server";

export async function checkAuthorization(
  UserId: string,
  UserRole: string,
  TargetUserId: string
) {
  if (UserRole !== "Admin") return null;

  if (UserId === TargetUserId) return null;

  return NextResponse.json(
    {
      message: "You are not allowed to access this resource",
    },
    {
      status: 403,
    }
  );
}
