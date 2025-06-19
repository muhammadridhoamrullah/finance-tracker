"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const [status, setStatus] = useState("Verifying...");
  const url = process.env.NEXT_PUBLIC_CLIENT_URL;

  async function verifyEmail() {
    try {
      const response = await fetch(`${url}/api/users/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        cache: "no-cache",
      });

      console.log(response, "Response from verify email API");

      const result = await response.json();
      console.log(result, "Result from verify email API res");
      if (!response.ok) {
        throw new Error(`Error: ${result.message}`);
      }

      setStatus(result.message || "Email verified successfully");
    } catch (error) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Internal Server Error");
      }
    }
  }

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus("Token is required");
    }
  }, [token]);

  return (
    <div>
      <p>{status}</p>
    </div>
  );
}
