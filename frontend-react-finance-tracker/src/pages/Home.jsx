import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import instance from "../axiosInstance";
import { FaPlus } from "react-icons/fa";

export default function Home() {
  const [user, setUser] = useState(null);
  console.log(user, "ini user di home");

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

  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <div className="pt-24 w-full min-h-screen bg-black text-white px-14">
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
    </div>
  );
}
