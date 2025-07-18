"use client";

import { BudgetModel, formatRupiah } from "@/db/type/type";
import { poppins } from "@/font";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Loading from "./loading";
import CardBudgetPage from "@/components/CardBudgetPage";
import Link from "next/link";

// https://cdn.dribbble.com/userupload/31845706/file/original-4e314bc66c789b2a868ce18f922dc7f7.png?resize=1024x768&vertical=center

export default function Budget() {
  const [data, setData] = useState<BudgetModel[]>([]);
  const duplicateData = [
    {
      _id: "1",
      UserId: "user1",
      name: "Monthly Budget",
      amount: 5000000,
      spent: 2000000,
      income: 7000000,
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-01-31"),
      remaining: 3000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "2",
      UserId: "user2",
      name: "Vacation Fund",
      amount: 10000000,
      spent: 5000000,
      income: 15000000,
      startDate: new Date("2023-02-01"),
      endDate: new Date("2023-02-28"),
      remaining: 5000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "3",
      UserId: "user3",
      name: "Emergency Fund",
      amount: 20000000,
      spent: 5000000,
      income: 25000000,
      startDate: new Date("2023-03-01"),
      endDate: new Date("2023-03-31"),
      remaining: 15000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "4",
      UserId: "user4",
      name: "Education Savings",
      amount: 30000000,
      spent: 10000000,
      income: 40000000,
      startDate: new Date("2023-04-01"),
      endDate: new Date("2023-04-30"),
      remaining: 20000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "5",
      UserId: "user5",
      name: "Home Renovation",
      amount: 15000000,
      spent: 7000000,
      income: 22000000,
      startDate: new Date("2023-05-01"),
      endDate: new Date("2023-05-31"),
      remaining: 8000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "6",
      UserId: "user6",
      name: "Car Maintenance",
      amount: 8000000,
      spent: 3000000,
      income: 11000000,
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-06-30"),
      remaining: 5000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "7",
      UserId: "user7",
      name: "Travel Fund",
      amount: 12000000,
      spent: 4000000,
      income: 16000000,
      startDate: new Date("2023-07-01"),
      endDate: new Date("2023-07-31"),
      remaining: 8000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "8",
      UserId: "user8",
      name: "Gadget Upgrade",
      amount: 6000000,
      spent: 2000000,
      income: 8000000,
      startDate: new Date("2023-08-01"),
      endDate: new Date("2023-08-31"),
      remaining: 4000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "9",
      UserId: "user9",
      name: "Health Insurance",
      amount: 10000000,
      spent: 3000000,
      income: 13000000,
      startDate: new Date("2023-09-01"),
      endDate: new Date("2023-09-30"),
      remaining: 7000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "10",
      UserId: "user10",
      name: "Wedding Fund",
      amount: 25000000,
      spent: 10000000,
      income: 35000000,
      startDate: new Date("2023-10-01"),
      endDate: new Date("2023-10-31"),
      remaining: 15000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "11",
      UserId: "user11",
      name: "Pet Care",
      amount: 7000000,
      spent: 2000000,
      income: 9000000,
      startDate: new Date("2023-11-01"),
      endDate: new Date("2023-11-30"),
      remaining: 5000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "12",
      UserId: "user12",
      name: "Charity Donations",
      amount: 4000000,
      spent: 1000000,
      income: 5000000,
      startDate: new Date("2023-12-01"),
      endDate: new Date("2023-12-31"),
      remaining: 3000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "13",
      UserId: "user13",
      name: "Emergency Fund",
      amount: 20000000,
      spent: 5000000,
      income: 25000000,
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-12-31"),
      remaining: 15000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "14",
      UserId: "user14",
      name: "Home Renovation",
      amount: 15000000,
      spent: 7000000,
      income: 22000000,
      startDate: new Date("2023-02-01"),
      endDate: new Date("2023-12-31"),
      remaining: 8000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "15",
      UserId: "user15",
      name: "Car Maintenance",
      amount: 8000000,
      spent: 3000000,
      income: 11000000,
      startDate: new Date("2023-03-01"),
      endDate: new Date("2023-12-31"),
      remaining: 5000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "16",
      UserId: "user16",
      name: "Travel Fund",
      amount: 12000000,
      spent: 4000000,
      income: 16000000,
      startDate: new Date("2023-04-01"),
      endDate: new Date("2023-12-31"),
      remaining: 8000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "17",
      UserId: "user17",
      name: "Gadget Upgrade",
      amount: 6000000,
      spent: 2000000,
      income: 8000000,
      startDate: new Date("2023-05-01"),
      endDate: new Date("2023-12-31"),
      remaining: 4000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "18",
      UserId: "user18",
      name: "Health Insurance",
      amount: 10000000,
      spent: 3000000,
      income: 13000000,
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-12-31"),
      remaining: 7000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
    {
      _id: "19",
      UserId: "user19",
      name: "Wedding Fund",
      amount: 25000000,
      spent: 10000000,
      income: 35000000,
      startDate: new Date("2023-07-01"),
      endDate: new Date("2023-12-31"),
      remaining: 15000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isDeleted: false,
    },
  ];
  console.log(data, "Data woi");

  const [loading, setLoading] = useState(true);
  const url = "http://localhost:3000";
  const totalBalance = data.reduce((acc, curr) => acc + curr.amount, 0);

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
    fetchBudgets();
  }, []);

  if (loading) return <Loading />;
  return (
    <div
      className={`${poppins.className} bg-[#F4F6FA] w-full min-h-screen p-8 text-black flex flex-col gap-4 items-start`}
    >
      <div className=" w-full flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="text-5xl font-semibold text-blue-950">Budget Hub</div>
          <div className="text-sm font-semibold text-gray-500">
            Track your money moves. All in one place. Easy peasy. 🧠💰
          </div>
        </div>
        <Link
          className="bg-green-700 text-white p-2 rounded-md text-xs hover:bg-green-900 transition-all duration-300"
          href={"/create-budget"}
        >
          Create Budget
        </Link>
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
      <div className="w-full flex  flex-wrap gap-4">
        {data.length > 0 ? (
          data.map((el) => <CardBudgetPage key={el._id} data={el} />)
        ) : (
          <div>
            No budgets available. Please create a budget to tracking your
            finances.
          </div>
        )}
      </div>
    </div>
  );
}
