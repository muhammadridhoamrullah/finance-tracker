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
  formatRupiah,
  thisDate,
} from "@/db/type/type";
import { poppins } from "@/font";

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

  const monthAndYear = thisDate(data?.startDate);
  const startDate = formatMonthDay(data?.startDate);
  const endDate = formatMonthDayYear(data?.endDate);
  const percentage = Math.round((data?.spent / data?.amount) * 100);

  //   // Hitung jumlah hari yang sudah berlalu dari startDate sampai hari ini
  const startDateObj = new Date(data?.startDate);
  const endDateObj = new Date(data?.endDate);
  const today = new Date();
  const timeDiff = today.getTime() - startDateObj.getTime();
  const timeDiffRemaining = endDateObj.getTime() - today.getTime();

  const daysRemaining = Math.ceil(timeDiffRemaining / (1000 * 3600 * 24));

  const daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // // Pastikan minimal 1 hari untuk menghindari pembagian dengan 0
  const validDaysPassed = Math.max(daysPassed, 1);
  const validDaysRemaining = Math.max(daysRemaining, 0);

  // // Hitung average daily spending
  const averageDailySpending = data.spent / validDaysPassed;

  // Mencari kategori unik dari transaksi
  const unikCategory = new Set(data?.transactions.map((el) => el.category));
  const totalCategories = unikCategory.size;

  // Mencari kategori yang paling banyak dihabiskan
  const categorySpent = data?.transactions
    ?.filter((el) => el.type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const mostSpentCategory = Object.entries(categorySpent).reduce(
    (max, [category, amount]) =>
      amount > max.amount ? { category, amount } : max,
    { category: "", amount: 0 }
  );

  return (
    <div
      className={`${poppins.className} w-full  text-black p-4 flex flex-col items-start justify-center gap-4`}
    >
      {/* Awal Monthly Budget & Add Edit Transaction */}
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
      {/* Akhir Monthly Budget & Add Edit Transaction */}

      {/* Awal Budget Overview & Quick Stats */}
      <div className=" w-full h-64 flex justify-between items-center gap-6">
        <div className=" w-3/4 h-full border border-slate-300 rounded-lg p-4 flex flex-col items-start justify-between">
          <div className=" flex flex-col gap-1">
            <div className="font-semibold text-2xl">Budget Overview</div>
            <div className="text-sm text-slate-500 font-semibold">
              Your spending progress for this period
            </div>
          </div>
          <div className=" w-full h-fit flex justify-between items-center ">
            <div className="flex flex-col  items-center ">
              <div className="text-blue-600 font-bold text-2xl">
                {formatRupiah(data?.amount)}
              </div>
              <div className="text-sm font-semibold text-slate-500">
                Total Budget
              </div>
            </div>
            <div className="flex flex-col  items-center">
              <div className="text-red-500 font-bold text-2xl">
                {formatRupiah(data?.spent)}
              </div>
              <div className="text-sm font-semibold text-slate-500">
                Expenses
              </div>
            </div>
            <div className="flex flex-col  items-center">
              <div className="text-green-600 font-bold text-2xl">
                {formatRupiah(data?.income)}
              </div>
              <div className="text-sm font-semibold text-slate-500">Income</div>
            </div>
            <div className="flex flex-col  items-center">
              <div className="text-purple-700 font-bold text-2xl">
                {formatRupiah(data?.remaining)}
              </div>
              <div className="text-sm font-semibold text-slate-500">
                Remaining
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2  w-full h-fit">
            <div className="flex justify-between text-sm font-semibold">
              <div className="">Progress</div>
              <div>{percentage}% used</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                style={{ width: `${percentage}%` }}
                className="bg-blue-950 rounded-full h-3"
              ></div>
            </div>
          </div>
        </div>
        <div className="w-1/4 h-full border border-slate-300 rounded-lg p-4 flex flex-col items-start justify-between">
          <div className="font-semibold text-2xl h-1/4">Quick Stats</div>
          <div className="flex flex-col justify-start gap-4 w-full  h-3/4 text-xs text-slate-500">
            <div className="flex justify-between">
              <div>Average Daily Spending</div>
              <div className="text-black font-semibold">
                {formatRupiah(averageDailySpending)}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Day Remaining</div>
              <div className="text-black font-semibold">
                {validDaysRemaining} days
              </div>
            </div>
            <div className="flex justify-between">
              <div>Categories Used</div>
              <div className="text-black font-semibold">{totalCategories}</div>
            </div>
            <div className="flex justify-between">
              <div>Most Spent Category</div>
              <div className="text-black font-semibold">
                {mostSpentCategory.category}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Akhir Budget Overview & Quick Stats */}

      <div>Category Breakdown</div>
      <div>Recent Transactions</div>
    </div>
  );
}

// data {
//   _id: '68387187990d370687a88a9b',
//   name: 'January',
//   amount: 1000000,
//   startDate: '2025-01-01',
//   endDate: '2025-01-31',
//   UserId: '6837fa9aba2caa3cc9cab502',
//   spent: 809700,
//   income: 0,
//   remaining: 190300,
//   isDeleted: false,
//   deletedAt: null,
//   createdAt: '2025-05-29T14:39:03.580Z',
//   updatedAt: '2025-05-29T14:39:03.580Z',
//   User: {
//     _id: '6837fa9aba2caa3cc9cab502',
//     firstName: 'Danielle',
//     lastName: 'Marsh',
//     email: 'daniellemarsh@gmail.com',
//     phoneNumber: '085363508583',
//     address: 'Australia',
//     role: 'User',
//     createdAt: '2025-05-29T06:11:38.358Z',
//     updatedAt: '2025-05-29T06:11:38.358Z',
//     isVerified: true
//   },
//   transactions: [
//     {
//       _id: '6838726a990d370687a88a9c',
//       amount: 5000,
//       category: 'Food',
//       type: 'expense',
//       date: '2025-01-12',
//       description: 'Ikan Bakar',
//       BudgetId: '68387187990d370687a88a9b',
//       UserId: '6837fa9aba2caa3cc9cab502',
//       isDeletedByBudget: false,
//       isDeleted: false,
//       deletedAt: null,
//       createdAt: '2025-05-29T14:42:50.248Z',
//       updatedAt: '2025-05-29T14:42:50.248Z'
//     },
//     {
//       _id: '683872f4990d370687a88a9d',
//       amount: 10000,
//       category: 'Food',
//       type: 'expense',
//       date: '2025-01-12',
//       description: 'Bakso Bakar',
//       BudgetId: '68387187990d370687a88a9b',
//       UserId: '6837fa9aba2caa3cc9cab502',
//       isDeletedByBudget: false,
//       isDeleted: false,
//       deletedAt: null,
//       createdAt: '2025-05-29T14:45:08.217Z',
//       updatedAt: '2025-05-29T14:45:08.217Z'
//     },
//     {
//       _id: '68387640990d370687a88a9e',
//       amount: 10000,
//       category: 'Food',
//       type: 'expense',
//       date: '2025-01-20',
//       description: 'Bakso Ikan',
//       BudgetId: '68387187990d370687a88a9b',
//       UserId: '6837fa9aba2caa3cc9cab502',
//       isDeletedByBudget: false,
//       isDeleted: false,
//       deletedAt: null,
//       createdAt: '2025-05-29T14:59:12.154Z',
//       updatedAt: '2025-05-29T14:59:12.154Z'
//     },
//     {
//       _id: '68387647990d370687a88a9f',
//       amount: 5000,
//       category: 'Food',
//       type: 'expense',
//       date: '2025-01-01',
//       description: 'Bakso Sapi 20',
//       BudgetId: '68387187990d370687a88a9b',
//       UserId: '6837fa9aba2caa3cc9cab502',
//       isDeletedByBudget: false,
//       isDeleted: false,
//       deletedAt: null,
//       createdAt: '2025-05-29T14:59:19.063Z',
//       updatedAt: '2025-05-29T15:52:19.872Z'
//     },
//     {
//       _id: '686a97f3eb65994db48eca67',
//       amount: 779700,
//       category: 'Shoes',
//       type: 'expense',
//       date: '2025-01-17',
//       description: 'New Balance 1000',
//       BudgetId: '68387187990d370687a88a9b',
//       UserId: '6837fa9aba2caa3cc9cab502',
//       isDeletedByBudget: false,
//       isDeleted: false,
//       deletedAt: null,
//       createdAt: '2025-07-06T15:36:19.604Z',
//       updatedAt: '2025-07-06T15:36:19.604Z'
//     }
//   ]
// }
