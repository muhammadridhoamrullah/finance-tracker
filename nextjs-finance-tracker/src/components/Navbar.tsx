"use client";

import { handleLogout } from "@/action";
import { poppins } from "@/font";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

export default function Navbar() {
  const path = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  function isActive(tab: string) {
    return path.includes(tab)
      ? " bg-blue-950 rounded-b-4xl  text-white"
      : " text-slate-500";
  }

  return (
    <div
      className={`${poppins.className} flex w-full h-20 justify-between  gap-3 text-black px-12 `}
    >
      <div className="flex items-center w-3/4 h-full   font-bold text-sm ">
        <Link
          href={"/home"}
          className={`${isActive(
            "home"
          )}  w-fit px-5 h-full flex items-center justify-center`}
        >
          Home
        </Link>
        <Link
          href={"/budget"}
          className={`${isActive(
            "budget"
          )} w-fit px-5 h-full flex items-center justify-center`}
        >
          Budget
        </Link>
        <Link
          href={"/transaction"}
          className={`${isActive(
            "transaction"
          )} w-fit px-5 h-full flex items-center justify-center`}
        >
          Transaction
        </Link>
      </div>
      <div className=" flex items-center justify-end w-1/4 h-full">
        <div
          onClick={toggleDropdown}
          className="relative flex items-center justify-center gap-2 cursor-pointer"
        >
          <img
            src={
              "https://upload.wikimedia.org/wikipedia/commons/0/06/Kang_Haerin_for_OLENS_2.jpg"
            }
            alt="Foto Profil"
            className="w-10 h-10 rounded-full "
          />
          {dropdownOpen ? (
            <IoIosArrowUp className="text-blue-950" />
          ) : (
            <IoIosArrowDown className="text-blue-950" />
          )}
        </div>

        {dropdownOpen && (
          <div className="absolute top-16 right-6 bg-blue-950 rounded-lg shadow-lg text-sm text-white p-4 w-32">
            <ul className="flex flex-col gap-2">
              <li>
                <Link className="hover:text-yellow-500" href={"/account"}>
                  Account
                </Link>
              </li>
              <li>
                <Link href={"/settings"} className="hover:text-yellow-500">
                  Settings
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:text-yellow-500 cursor-pointer"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
