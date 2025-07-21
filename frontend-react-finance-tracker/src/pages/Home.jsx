import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import instance from "../axiosInstance";
import { FaPlus } from "react-icons/fa";
import { CiWallet } from "react-icons/ci";
import { HiTrendingUp } from "react-icons/hi";
import { HiTrendingDown } from "react-icons/hi";
import { GiTakeMyMoney } from "react-icons/gi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { formatDate, formatRupiah, monthNumber } from "../util";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, getSummaryThisMonth } from "../store/homeSlice";

export default function Home() {
  const dispatch = useDispatch();
  const {
    loading: loadingUser,
    data: dataUser,
    error: errorUser,
  } = useSelector((state) => state.home);
  const {
    loading: loadingSummary,
    data: dataSummary,
    error: errorSummary,
  } = useSelector((state) => state.home);
  console.log("Summary State: ", { loadingSummary, dataSummary, errorSummary });

  // useEffect(() => {
  //   dispatch(fetchUserData());
  // }, []);

  useEffect(() => {
    dispatch(getSummaryThisMonth());
  }, []);

  function styleCard() {
    return "w-72 h-36 rounded-xl px-6 flex flex-col justify-center items-start ";
  }

  // if (loadingUser) return <div>Loading User Data...</div>;
  if (loadingSummary) {
    return (
      <>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
        <div>Loading</div>
      </>
    );
  }

  if (errorSummary) {
    return (
      <>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
        <div>Error : {errorSummary}</div>
      </>
    );
  }

  return (
    // <div className="pt-24 pb-16 w-full min-h-screen bg-black text-white px-14 flex flex-col overflow-y-auto ">
    //   {/* Awal Bagian Hello + Tambah Transaksi */}
    //   <div className="flex justify-between items-center mb-10">
    //     <div className="flex gap-2 items-end ">
    //       <div className="">Hello,</div>
    //       <div className="font-bold text-xl">
    //         {dataUser?.firstName} {dataUser?.lastName}
    //       </div>
    //     </div>
    //     <div className="flex items-center gap-2 border border-white px-3 py-2 rounded-md cursor-pointer hover:bg-blue-950 hover:border-black transition-all duration-75 ease-in-out">
    //       <FaPlus className="w-5 h-5 text-green-400" />
    //       <div className="font-semibold">Tambah Transaksi</div>
    //     </div>
    //   </div>
    //   {/* Akhir Bagian Hello + Tambah Transaksi */}

    //   {/* Awal Bagian Info Keuangan */}
    //   <div className="flex justify-between flex-wrap ">
    //     {/* Awal Total Budget */}
    //     <div className={`${styleCard()} bg-blue-800`}>
    //       <div className=" w-full font-semibold flex justify-between">
    //         <div>Total Balance</div>
    //         <CiWallet className="w-6 h-6 " />
    //       </div>
    //       <div className="font-bold text-2xl">
    //         {formatRupiah(dataSummary?.summary?.budgets?.amount)}
    //       </div>
    //       <div className="mt-1 text-xs font-semibold">Total Balance</div>
    //     </div>
    //     {/* Akhir Total Budget */}

    //     {/* Awal Income */}
    //     <div className={`${styleCard()} bg-green-800`}>
    //       <div className="w-full font-semibold flex justify-between">
    //         <div>Income</div>
    //         <HiTrendingUp className="w-6 h-6" />
    //       </div>
    //       <div className="font-bold text-2xl">
    //         {formatRupiah(dataSummary?.summary?.budgets?.income)}
    //       </div>
    //       <div className="mt-1 text-xs font-semibold">Total Income</div>
    //     </div>
    //     {/* Akhir Income */}

    //     {/* Awal Expenses */}
    //     <div className={`${styleCard()} bg-red-800`}>
    //       <div className="w-full font-semibold flex justify-between">
    //         <div>Expenses</div>
    //         <HiTrendingDown className="w-6 h-6" />
    //       </div>
    //       <div className="font-bold text-2xl">
    //         {formatRupiah(dataSummary?.summary?.budgets?.spent)}
    //       </div>
    //       <div className="mt-1 text-xs font-semibold">Total Expenses</div>
    //     </div>
    //     {/* Akhir Expenses */}

    //     {/* Awal Remaining */}
    //     <div className={`${styleCard()} bg-[#FE5000]`}>
    //       <div className="font-semibold w-full flex justify-between">
    //         <div>Remaining</div>
    //         <GiTakeMyMoney className="w-6 h-6" />
    //       </div>
    //       <div className="font-bold text-2xl">
    //         {formatRupiah(dataSummary?.summary.budgets.remaining)}
    //       </div>
    //       <div className="text-xs font-semibold">Total Remaining</div>
    //     </div>
    //     {/* Akhir Remaining */}
    //   </div>
    //   {/* Akhir Bagian Info Keuangan */}

    //   {/* Awal Bagian Transaksi Terbaru dan Budget Overview */}

    //   <div className="w-full flex justify-between gap-8 mt-8 text-black">
    //     <div className="bg-white w-2/3 p-5 rounded-xl flex flex-col gap-5">
    //       <div className="flex justify-between  items-center">
    //         <div className="flex flex-col">
    //           <div className="font-bold text-2xl">Newest Transactions</div>
    //           <div className="font-semibold text-xs text-slate-500">
    //             {dataSummary?.summary.budgets?.Transactions?.length >= 5
    //               ? "5"
    //               : dataSummary?.summary.budgets?.Transactions.length}{" "}
    //             your latest transactions
    //           </div>
    //         </div>
    //         <div className="bg-black border py-1 px-3 rounded-md text-xs text-white font-semibold cursor-pointer hover:bg-blue-950 transition-all duration-75 ease-in-out">
    //           See All
    //         </div>
    //       </div>

    //       {/* Awal Recent Transactions */}
    //       {dataSummary?.summary.budgets?.Transactions?.length > 0 ? (
    //         <div className="flex flex-col gap-3">
    //           {dataSummary.summary.budgets.Transactions.slice(0, 5).map(
    //             (el, i) => {
    //               return (
    //                 <div
    //                   key={el.id}
    //                   className="flex justify-between p-4 items-center border border-slate-400 rounded-md"
    //                 >
    //                   <div className="flex items-center gap-4">
    //                     {el.type === "income" ? (
    //                       <HiTrendingUp className="w-6 h-6    text-green-500" />
    //                     ) : (
    //                       <HiTrendingDown className="w-6 h-6 text-red-500" />
    //                     )}

    //                     <div className="flex flex-col ">
    //                       <div className="font-bold text-xl">
    //                         {el.description}
    //                       </div>
    //                       <div className="flex items-center gap-2">
    //                         <div className="text-xs px-2 py-1 rounded-sm bg-black text-white  font-semibold">
    //                           {el.category}
    //                         </div>
    //                         <div className="text-xs">-</div>
    //                         <div className="text-xs font-semibold text-gray-500">
    //                           {formatDate(el.date)}
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </div>
    //                   <div
    //                     className={`font-bold text-xl ${
    //                       el.type === "income"
    //                         ? "text-green-500"
    //                         : "text-red-500"
    //                     }`}
    //                   >
    //                     {el.type === "income" ? "+" : "-"}
    //                     {formatRupiah(el.amount)}
    //                   </div>
    //                 </div>
    //               );
    //             }
    //           )}
    //         </div>
    //       ) : (
    //         <div>There is no transaction</div>
    //       )}
    //     </div>
    //     {/* Akhir Recent Transactions */}

    //     {/* Awal Budget Overview */}
    //     <div className="bg-white w-1/3 p-5 flex flex-col gap-5 rounded-xl">
    //       <div className="flex flex-col">
    //         <div className=" flex items-center gap-2">
    //           <FaMoneyBillTrendUp className="w-6 h-6" />
    //           <div className="font-bold text-2xl">Budget Overview</div>
    //         </div>
    //         <div className="text-xs font-semibold text-slate-500">
    //           {/* Expenses on {monthNumber(dataSummary?.summary.month)}{" "} */}
    //           {dataSummary?.summary.year} - Budget{" "}
    //           {formatRupiah(dataSummary?.summary.budgets?.amount)}
    //         </div>
    //       </div>

    //       {dataSummary?.summary?.budgets?.Transactions?.length > 0 ? (
    //         <div className="flex flex-col gap-2">
    //           {Object.entries(
    //             dataSummary.summary.budgets.Transactions.reduce((acc, curr) => {
    //               if (curr.type !== "expense") return acc; // Hanya ambil transaksi expense
    //               acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    //               return acc;
    //             }, {})
    //           )
    //             .slice(0, 5)
    //             .map(([category, amount]) => {
    //               const budget = dataSummary.summary.budgets.amount;
    //               const percentage = (amount / budget) * 100;
    //               return (
    //                 <div key={category}>
    //                   <div className="flex flex-col gap-1">
    //                     <div className="flex justify-between items-center">
    //                       <div className="font-bold">{category}</div>
    //                       <div className="font-bold text-xs">
    //                         {formatRupiah(amount)}
    //                       </div>
    //                     </div>

    //                     <div className="flex flex-col gap-2">
    //                       <div className="w-full bg-gray-200 rounded-full h-3">
    //                         <div
    //                           className="bg-blue-950 h-3 rounded-full"
    //                           style={{ width: `${percentage}%` }}
    //                         ></div>
    //                       </div>
    //                       <div className="text-slate-500 text-xs">
    //                         {percentage.toFixed()}% from Total Budget
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               );
    //             })}
    //         </div>
    //       ) : (
    //         <div>There is no expense this month</div>
    //       )}
    //     </div>
    //   </div>
    //   {/* Akhir Budget Overview */}

    //   {/* Akhir Bagian Transaksi Terbaru dan Budget Overview */}
    // </div>
    <>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai</div>
      <div>Hai {dataSummary?.budgets?.amount}</div>
    </>
  );
}

// {
//     "budgets": {
//         "id": 17,
//         "UserId": 6,
//         "name": "June",
//         "amount": 1500000,
//         "spent": 1215000,
//         "income": 0,
//         "startDate": "2025-06-01T00:00:00.000Z",
//         "endDate": "2025-06-30T00:00:00.000Z",
//         "remaining": 285000,
//         "createdAt": "2025-06-17T14:22:38.995Z",
//         "updatedAt": "2025-06-18T06:27:14.146Z",
//         "deletedAt": null,
//         "Transactions": [
//             {
//                 "id": 18,
//                 "amount": 15000,
//                 "category": "Food",
//                 "type": "expense",
//                 "date": "2025-06-17T00:00:00.000Z",
//                 "description": "Mie Ayam",
//                 "UserId": 6,
//                 "BudgetId": 17,
//                 "createdAt": "2025-06-17T14:23:13.451Z",
//                 "updatedAt": "2025-06-17T14:23:13.451Z",
//                 "deletedAt": null
//             },
//             {
//                 "id": 19,
//                 "amount": 1200000,
//                 "category": "Shoes",
//                 "type": "expense",
//                 "date": "2025-06-18T00:00:00.000Z",
//                 "description": "New Balance 574",
//                 "UserId": 6,
//                 "BudgetId": 17,
//                 "createdAt": "2025-06-18T06:27:12.213Z",
//                 "updatedAt": "2025-06-18T06:27:12.213Z",
//                 "deletedAt": null
//             },
//             {
//                 "id": 20,
//                 "amount": 1200000,
//                 "category": "Shoes",
//                 "type": "expense",
//                 "date": "2025-06-18T00:00:00.000Z",
//                 "description": "New Balance 574",
//                 "UserId": 6,
//                 "BudgetId": 17,
//                 "createdAt": "2025-06-18T06:27:14.133Z",
//                 "updatedAt": "2025-06-18T06:27:14.133Z",
//                 "deletedAt": null
//             }
//         ]
//     },
//     "month": 6,
//     "year": 2025
// }
