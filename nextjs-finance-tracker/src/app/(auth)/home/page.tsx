"use client";

import { useEffect, useState } from "react";
import Loading from "./loading";
import { poppins } from "@/font";
import { MdAttachMoney } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";
import Swal from "sweetalert2";
import { formatRupiah } from "@/db/type/type";

export default function Home() {
  const url = process.env.NEXT_PUBLIC_CLIENT_URL;
  const [data, setData] = useState({
    totalBudget: 0,
    totalIncome: 0,
    totalExpenses: 0,
    name: "",
  });
  console.log(data, "data kim");

  const [transaction, setTransaction] = useState({
    totalTransaction: 0,
  });
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/budgets`, {
        method: "GET",
        cache: "no-cache",
      });

      const result = await response.json();
      console.log(result, "result budget kim minji");

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData({
        totalBudget: result.data[0].amount,
        totalIncome: result.data[0].income,
        totalExpenses: result.data[0].spent,
        name: result.data[0].name,
      });

      // Fetch transactions after budgets
      // await fetchDataTransaction();

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
    fetchData();
  }, []);

  async function fetchDataTransaction() {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/transactions`, {
        method: "GET",
        cache: "no-cache",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setTransaction({
        totalTransaction: result.data.length,
      });

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

  function oneClass1() {
    return "w-full flex flex-col justify-between bg-white p-4 border border-blue-950 rounded-lg cursor-pointer hover:bg-blue-950  transition-all group";
  }

  function oneClass2() {
    return "text-sm text-slate-800 font-semibold flex justify-between items-center group-hover:text-white";
  }

  function oneClass3() {
    return "text-2xl font-bold flex flex-col group-hover:text-white";
  }

  if (loading) return <Loading />;
  return (
    <div
      className={`${poppins.className} bg-[#F4F6FA] w-full min-h-screen text-black p-8 flex flex-col gap-2 items-start`}
    >
      <div className="w-full h-28   flex justify-between gap-6">
        <div className={oneClass1()}>
          <div className={oneClass2()}>
            <div>Total Budget</div>
            <MdAttachMoney className="text-2xl text-blue-950 group-hover:text-white" />
          </div>
          <div className={oneClass3()}>
            <div>{formatRupiah(data.totalBudget)}</div>
            <div className="text-xs text-slate-500 group-hover:text-white">
              from last month
            </div>
          </div>
        </div>
        <div className={oneClass1()}>
          <div className={oneClass2()}>
            <div>Total Transactions</div>
            <GrTransaction className="text-2xl text-blue-950 group-hover:text-white" />
          </div>

          <div className={oneClass3()}>
            <div>{transaction.totalTransaction}</div>
            <div className="text-xs text-slate-500 group-hover:text-white">
              from last month
            </div>
          </div>
        </div>
        <div className={oneClass1()}>
          <div className={oneClass2()}>
            <div>Income</div>
            <FaArrowTrendUp className="text-2xl text-blue-950 group-hover:text-white" />
          </div>

          <div className={oneClass3()}>
            <div>{formatRupiah(data.totalIncome)}</div>
            <div className="text-xs text-slate-500 group-hover:text-white">
              from last month
            </div>
          </div>
        </div>
        <div className={oneClass1()}>
          <div className={oneClass2()}>
            <div>Expenses</div>
            <FaArrowTrendDown className="text-2xl text-blue-950 group-hover:text-white" />
          </div>

          <div className={oneClass3()}>
            <div>{formatRupiah(data.totalExpenses)}</div>
            <div className="text-xs text-slate-500 group-hover:text-white">
              from last month
            </div>
          </div>
        </div>
      </div>
      <div>Recent Transaction dan Budget Overview</div>
      <div>Quick Actions</div>
    </div>
  );
}
// bg-[#F4F6FA]
