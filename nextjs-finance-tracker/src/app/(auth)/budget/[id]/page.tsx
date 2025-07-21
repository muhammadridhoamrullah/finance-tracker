// interface Props {
//   params: {
//     id: string;
//   };
// }
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { CiCalendarDate } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { cookies } from "next/headers";
import {
  BudgetModel,
  formatMonthDay,
  formatMonthDayYear,
  thisDate,
} from "@/db/type/type";

interface Props {
  params: {
    id: string;
  };
}

async function fetchDetailBudget(id: string) {
  const cookiesStore = await cookies();
  const response = await fetch(
    process.env.NEXT_PUBLIC_CLIENT_URL + `/api/budgets/${id}`,
    {
      method: "GET",
      headers: {
        Cookie: cookiesStore.toString(),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result.data;
}

export default async function DetailBudget({ params }: Props) {
  const { id } = await params;
  const data = (await fetchDetailBudget(id)) as BudgetModel;
  console.log("Detail Budget Data:", data);

  const monthAndYear = thisDate(data.startDate);
  const startDate = formatMonthDay(data.startDate);
  const endDate = formatMonthDayYear(data.endDate);

  return (
    <div className=" w-full  text-black p-4 flex flex-col items-start justify-center">
      {/* Awal Monthly Budget dan Add Edit Transaction */}
      <div className=" w-full h-fit flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={"/budget"}>
            <IoArrowBack className="text-2xl cursor-pointer hover:text-blue-950" />
          </Link>
          <div className="flex flex-col items-start justify-center ">
            <div className="font-bold text-2xl">
              Monthly Budget - {monthAndYear}
            </div>
            <div className="flex gap-2 items-center  h-8 ">
              <CiCalendarDate className="text-xl" />
              <div className="text-sm font-semibold text-slate-500">
                {startDate} - {endDate}
              </div>
            </div>
          </div>
        </div>
        <div className=" flex gap-2 items-center">
          <div className="flex items-center gap-4 p-2 border border-slate-400 rounded-md cursor-pointer hover:bg-slate-200 hover:border-transparent">
            <FaRegEdit className="text-xl" />
            <Link href={`/budget/edit/${id}`} className="font-semibold text-sm">
              Edit Budget
            </Link>
          </div>

          <div className="text-white bg-black flex items-center gap-4 p-2 rounded-md cursor-pointer hover:bg-blue-950 transition-all duration-300">
            <HiOutlinePlusCircle className="text-xl" />
            <Link href={`/transaction/add`} className="font-semibold text-sm">
              Add Transaction
            </Link>
          </div>
        </div>
      </div>
      {/* Akhir Monthly Budget dan Add Edit Transaction */}

      <div>Budget Overview Quick Stats</div>
      <div>Category Breakdown</div>
      <div>Recent Transactions</div>
    </div>
  );
}
