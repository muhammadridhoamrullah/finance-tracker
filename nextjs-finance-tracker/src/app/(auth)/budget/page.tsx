"use client";

import { BudgetModel, formatRupiah } from "@/db/type/type";
import { poppins } from "@/font";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Loading from "./loading";

// https://cdn.dribbble.com/userupload/31845706/file/original-4e314bc66c789b2a868ce18f922dc7f7.png?resize=1024x768&vertical=center

export default function Budget() {
  const [data, setData] = useState<BudgetModel[]>([]);
  console.log(data, "Data woi");

  const [loading, setLoading] = useState(true);
  const url = "http://localhost:3000";
  const totalBalance = data.reduce((acc, curr) => acc + curr.amount, 0);
  console.log(totalBalance, "Total Balance");

  async function fetchBudgets() {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/budgets`, {
        method: "GET",
        cache: "no-cache",
        next: {
          tags: ["fetch-budgets"],
        },
      });

      const result = await response.json();

      console.log(result, "result from budgets in Budget component");

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Internal Server Error",
        });
      }
    }
  }

  useEffect(() => {
    fetchBudgets();
  }, []);

  if (loading) return <Loading />;
  return (
    <div
      className={`${poppins.className} bg-[#F4F6FA] w-full min-h-screen p-8 text-black flex flex-col gap-4 items-start`}
    >
      <div className="flex flex-col gap-2">
        <div className="text-5xl font-semibold text-blue-950">Budget Hub</div>
        <div className="text-sm font-semibold text-gray-500">
          Track your money moves. All in one place. Easy peasy. 🧠💰
        </div>
      </div>
      <div className="bg-blue-950 w-full h-36 p-4 text-white flex flex-col justify-between rounded-2xl">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-semibold">Total Balance</div>
          <div className="text-sm text-gray-400 font-semibold">
            All wallets combined
          </div>
        </div>
        <div className="text-4xl font-bold">
          {data.length > 0 ? `${formatRupiah(totalBalance)}` : "-"}
        </div>
      </div>
      <div>Daftar Card Budget</div>
    </div>
  );
}
