"use client";

import { poppins } from "@/font";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CardBudgetData from "./CardBudgetData";
import {
  BudgetModel,
  formatRupiah,
  thisMonth,
  thisTime,
  thisYear,
} from "@/db/type/type";
import { FiPlusCircle } from "react-icons/fi";

export default function Data() {
  const url = process.env.NEXT_PUBLIC_CLIENT_URL;

  const [data, setData] = useState({
    totalMoney: 0,
    Budget: [],
  });
  console.log(data, "ini data di Data");

  async function fetchData() {
    try {
      const response = await fetch(`${url}/api/budgets`, {
        method: "GET",

        cache: "force-cache",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData({
        totalMoney: result.data[0].remaining,
        Budget: result.data,
      });
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

  return (
    <div
      className={`${poppins.className} p-6 flex flex-col justify-between w-full h-full`}
    >
      <div className=" text-2xl font-bold">Vibe$</div>

      <div className="flex flex-col gap-2 bg-white text-blue-950 rounded-2xl p-4">
        <div className="font-semibold">
          Remaining Money - {thisMonth} {thisYear}
        </div>
        <div className="text-3xl font-bold">
          {formatRupiah(data?.totalMoney)}
        </div>
      </div>

      <Link
        href={"/budget"}
        className="bg-green-700 p-3 rounded-md w-fit cursor-pointer hover:bg-green-900 text-xs"
      >
        Make a Payment
      </Link>

      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold">Budget Data</div>
        {data?.Budget?.length > 0 ? (
          data.Budget.slice(0, 2).map((el: BudgetModel, i: number) => (
            <CardBudgetData key={i} data={el} />
          ))
        ) : (
          <div className="font-bold text-lg">There is no budget data</div>
        )}
        <Link
          href={"/budget"}
          className="w-full h-20 bg-transparent border border-white p-2 rounded-md flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-800"
        >
          <FiPlusCircle className="text-xl text-white" />
          <div className="text-sm">Add new Budget</div>
        </Link>
      </div>
    </div>
  );
}

// {
//   "data": [
//     {
//       "_id": "68387187990d370687a88a9b",
//       "name": "January",
//       "amount": 1000000,
//       "startDate": "2025-01-01",
//       "endDate": "2025-01-31",
//       "UserId": "6837fa9aba2caa3cc9cab502",
//       "spent": 30000,
//       "income": 0,
//       "remaining": 970000,
//       "isDeleted": false,
//       "deletedAt": null,
//       "createdAt": "2025-05-29T14:39:03.580Z",
//       "updatedAt": "2025-05-29T14:39:03.580Z",
//       "User": {
//         "_id": "6837fa9aba2caa3cc9cab502",
//         "firstName": "Danielle",
//         "lastName": "Marsh",
//         "email": "daniellemarsh@gmail.com",
//         "phoneNumber": "085363508583",
//         "address": "Australia",
//         "role": "User",
//         "createdAt": "2025-05-29T06:11:38.358Z",
//         "updatedAt": "2025-05-29T06:11:38.358Z",
//         "isVerified": true
//       }
//     }
//   ]
// }
