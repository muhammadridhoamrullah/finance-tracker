import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import instance from "../axiosInstance";
import { FaPlus } from "react-icons/fa";

export default function Home() {
  const [user, setUser] = useState(null);
  console.log(user, "ini user di home");

  const [data, setData] = useState({
    totalBudget: 0,
    remainingBudget: 0,
    spentBudget: 0,
    incomeBudget: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  console.log(data, "ini data di home");

  async function fetchUserData() {
    try {
      const response = await instance.get("/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setUser(response.data.profile);
    } catch (error) {
      console.log(error, "ini error fetch user data");

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data user",
      });
    }
  }

  async function getSummaryThisMonth() {
    try {
      const response = await instance.get("/summary/this-month", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setData(response.data.summary);
    } catch (error) {
      if (error.response?.data?.message === "BUDGET_NOT_FOUND") {
        setData({
          totalBudget: 0,
          remainingBudget: 0,
          spentBudget: 0,
          incomeBudget: 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
      }
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    getSummaryThisMonth();
  }, []);

  function styleCard() {
    return "w-72 h-36 rounded-xl pl-6 flex flex-col justify-center items-start ";
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  }
  return (
    <div className="pt-24 w-full min-h-screen bg-black text-white px-14 flex flex-col">
      {/* Awal Bagian Hello + Tambah Transaksi */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-2 items-end ">
          <div className="">Hello,</div>
          <div className="font-bold text-xl">{user?.firstName}</div>
        </div>
        <div className="flex items-center gap-2 border border-white px-3 py-2 rounded-md cursor-pointer hover:bg-blue-950 hover:border-black transition-all duration-75 ease-in-out">
          <FaPlus className="w-5 h-5 text-green-400" />
          <div className="font-semibold">Tambah Transaksi</div>
        </div>
      </div>
      {/* Akhir Bagian Hello + Tambah Transaksi */}

      {/* Awal Bagian Info Keuangan */}
      <div className="flex justify-between flex-wrap ">
        <div className={`${styleCard()} bg-blue-800`}>
          <div className="font-semibold">Total Balance</div>
          <div className="font-bold text-2xl">
            {formatRupiah(data?.totalBudget)}
          </div>
          <div className="text-xs font-semibold">Total Balance</div>
        </div>
        <div className={`${styleCard()} bg-green-800`}>Income</div>
        <div className={`${styleCard()} bg-red-800`}>Expenses</div>
        <div className={`${styleCard()} bg-[#FE5000]`}>Savings</div>
      </div>
      {/* Akhir Bagian Info Keuangan */}
    </div>
  );
}
