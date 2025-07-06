"use client";

import { useEffect, useState } from "react";
import Loading from "./loading";
import { poppins } from "@/font";
import { MdAttachMoney } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";
import { MdOutlinePayment } from "react-icons/md";
import { TbPlus } from "react-icons/tb";
import { FaRegBell } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import Swal from "sweetalert2";
import {
  formatRupiah,
  thisDate,
  thisTime,
  TransactionModel,
} from "@/db/type/type";
import Link from "next/link";

export default function Home() {
  const url = process.env.NEXT_PUBLIC_CLIENT_URL;
  const [data, setData] = useState({
    totalBudget: 0,
    totalIncome: 0,
    totalExpenses: 0,
    name: "",
  });

  type Transaction = {
    _id: string;
    amount: number;
    category: string;
    type: string;
    date: string;
    description: string;
    createdAt: string;
  };

  type BarExpense = {
    [key: string]: number;
  };

  const [transaction, setTransaction] = useState<Transaction[]>([]);
  console.log("transaction", transaction);

  const [loading, setLoading] = useState(true);

  async function fetchData() {
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

      if (!response.ok) {
        throw new Error(result.message);
      }

      if (result.data.length === 0) {
        setData({
          totalBudget: 0,
          totalIncome: 0,
          totalExpenses: 0,
          name: "",
        });
        setTransaction([]);
      } else {
        setData({
          totalBudget: result.data[0].amount,
          totalIncome: result.data[0].income,
          totalExpenses: result.data[0].spent,
          name: result.data[0].name,
        });
        await fetchDataTransaction();
      }
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
    } finally {
      setLoading(false);
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
        next: {
          tags: ["fetch-transactions"],
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      if (result.data.length === 0) {
        setTransaction([]);
      } else {
        const mappedTransactions: Transaction[] = result.data.map(
          (el: TransactionModel) => {
            return {
              _id: el._id.toString(),
              amount: el.amount,
              category: el.category,
              type: el.type,
              date: el.date,
              description: el.description,
              createdAt: el.createdAt,
            };
          }
        );
        setTransaction(mappedTransactions);
      }
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
    } finally {
      setLoading(false);
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
      className={`${poppins.className} bg-[#F4F6FA] w-full min-h-screen text-black p-8 flex flex-col gap-4 items-start`}
    >
      {/* Awal Information Budget */}
      <div className="w-full h-28   flex justify-between gap-6 ">
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
            {transaction.length > 0 ? (
              <>
                <div>{transaction.length}</div>
                <div className="text-xs text-slate-500 group-hover:text-white">
                  from last month
                </div>
              </>
            ) : (
              <>
                <div className="">0</div>
                <div className="invisible">from last month</div>
              </>
            )}
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
      {/* Akhir Information Budget */}

      {/* Awal Recent Transaction */}
      <div className=" w-full h-fit   flex flex-col gap-2 p-4 border-2 border-blue-950 rounded-lg bg-white">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-blue-950">
            Recent Transaction
          </div>
          {transaction.length > 0 ? (
            <div className="text-xs font-semibold text-slate-500">
              your {transaction.length} latest{" "}
              {transaction.length > 1 ? "transactions" : "transaction"}
            </div>
          ) : (
            <div></div>
          )}
        </div>
        {transaction.length > 0 ? (
          transaction.slice(0, 5).map((el: Transaction) => (
            <div
              key={el._id}
              className="bg-blue-950 text-white w-full h-14 py-2 px-4 rounded-xl flex justify-between items-center hover:bg-black transition-all"
            >
              <div className=" flex-3 flex gap-4 justify-start items-center ">
                {el.type === "income" ? (
                  <div className="bg-green-500 p-2 rounded-full ">
                    <FaArrowTrendUp className=" text-md" />
                  </div>
                ) : (
                  <div className="bg-red-600 p-2 rounded-full ">
                    <FaArrowTrendDown className=" text-md" />
                  </div>
                )}
                <div className="flex flex-col  items-start justify-center">
                  <div className="font-bold">{el.category}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {el.description}
                  </div>
                </div>
              </div>
              <div className=" flex-3 font-semibold text-center">
                {el.type === "income" ? "+" : "-"} {formatRupiah(el.amount)}
              </div>
              <div className="flex-3 flex flex-col items-center justify-center mr-10">
                <div className="text-sm font-semibold">{thisDate(el.date)}</div>
                <div className="text-xs">{thisTime(el.createdAt)}</div>
              </div>

              <Link
                href={"/transactions"}
                className="bg-white rounded-lg text-xs font-semibold text-blue-950  h-full flex items-center p-2 cursor-pointer hover:bg-blue-950 hover:text-white transition-all"
              >
                Details
              </Link>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center w-full bg-black/60 p-4 rounded-lg text-white">
            No transaction this month
          </div>
        )}
      </div>
      {/* Akhir Recent Transaction */}

      {/* Awal Budget Overview */}
      <div className=" w-full h-fit flex flex-col gap-2 p-4 border-2 border-blue-950 rounded-lg bg-white">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-blue-950">
            Budget Overview
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Track your spending by category
          </div>
          <div></div>
        </div>

        {/* Awal Bar */}
        {transaction.length > 0 ? (
          <div className="flex flex-col gap-2">
            {Object.entries(
              transaction.reduce((acc: BarExpense, curr) => {
                if (curr.type !== "expense") return acc;
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
              }, {})
            )
              .slice(0, 5)
              .map(([category, amount]) => {
                const budget = data.totalBudget;
                const percentage = (amount / budget) * 100;
                console.log(percentage, "percentage");

                return (
                  <div key={category} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <div className="text-blue-950 font-bold">{category}</div>
                      <div className="text-blue-950 font-bold">
                        {formatRupiah(amount)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-950 rounded-full h-3"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-semibold text-gray-500">
                        {percentage.toFixed()}% used
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div>There is no expense this month</div>
        )}
        {/* Akhir Bar */}
      </div>
      {/* Akhir Budget Overview */}

      {/* Awal Quick Action */}
      <div className="flex flex-col gap-2 w-full h-fit p-4 border-2 border-blue-950 rounded-lg bg-white">
        <div className="text-2xl font-bold text-blue-950">Quick Actions</div>
        <div className="  w-full flex justify-between items-center gap-4 text-blue-950 font-bold">
          <Link
            href={"/transaction"}
            className="w-1/4 border border-blue-950 h-20 flex flex-col gap-1 justify-center items-center rounded-lg cursor-pointer hover:bg-blue-950 hover:text-white transition-all"
          >
            <MdOutlinePayment className="text-xl" />
            <div className="text-sm">Make Transaction</div>
          </Link>
          <Link
            href={"/budgets"}
            className=" w-1/4 border border-blue-950 h-20 flex flex-col gap-1 justify-center items-center rounded-lg cursor-pointer hover:bg-blue-950 hover:text-white transition-all"
          >
            <TbPlus className="text-xl" />
            <div className="text-sm">Add Budget</div>
          </Link>
          <Link
            href={"/reports"}
            className=" w-1/4 border border-blue-950 h-20 flex flex-col gap-1 justify-center items-center rounded-lg cursor-pointer hover:bg-blue-950 hover:text-white transition-all"
          >
            <TbReportSearch className="text-xl" />
            <div className="text-sm">View Reports</div>
          </Link>
          <Link
            href={"/notifications"}
            className=" w-1/4 h-20 border border-blue-950 flex flex-col gap-1 justify-center items-center rounded-lg cursor-pointer hover:bg-blue-950 hover:text-white transition-all"
          >
            <FaRegBell className="text-xl " />
            <div className="text-sm">Notifications</div>
          </Link>
        </div>
      </div>
      {/* Akhir Quick Action */}
    </div>
  );
}
// bg-[#F4F6FA]

// [
//     {
//         "_id": "68387647990d370687a88a9f",
//         "amount": 5000,
//         "category": "Food",
//         "type": "expense",
//         "date": "2025-01-01",
//         "description": "Bakso Sapi 20",
//         "createdAt": "2025-05-29T14:59:19.063Z"
//     },
//     {
//         "_id": "6838726a990d370687a88a9c",
//         "amount": 5000,
//         "category": "Food",
//         "type": "expense",
//         "date": "2025-01-12",
//         "description": "Ikan Bakar",
//         "createdAt": "2025-05-29T14:42:50.248Z"
//     },
//     {
//         "_id": "683872f4990d370687a88a9d",
//         "amount": 10000,
//         "category": "Food",
//         "type": "expense",
//         "date": "2025-01-12",
//         "description": "Bakso Bakar",
//         "createdAt": "2025-05-29T14:45:08.217Z"
//     },
//     {
//         "_id": "68387640990d370687a88a9e",
//         "amount": 10000,
//         "category": "Food",
//         "type": "expense",
//         "date": "2025-01-20",
//         "description": "Bakso Ikan",
//         "createdAt": "2025-05-29T14:59:12.154Z"
//     }
// ]
