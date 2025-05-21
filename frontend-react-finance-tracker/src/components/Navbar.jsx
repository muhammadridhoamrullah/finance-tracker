import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { IoWalletSharp } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { BiUserCircle } from "react-icons/bi";
import { GiTakeMyMoney } from "react-icons/gi";

export default function Navbar() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("home");
  const [checkLogin, setCheckLogin] = useState(false);
  console.log(checkLogin, "ini checkLogin");

  async function checkingLogin() {
    if (localStorage.access_token) {
      setCheckLogin(true);
    }
  }

  function stylingMenu(path) {
    return `flex justify-center items-center gap-2 ${
      location.pathname.includes(path)
        ? " text-green-400"
        : "text-white hover:text-gray-400"
    } font-semibold  cursor-pointer`;
  }

  useEffect(() => {
    checkingLogin();
  }, []);

  return (
    <div className="bg-black text-white font-semibold w-full h-20 flex justify-between items-center pl-10 pr-20">
      <NavLink to={"/home"} className="flex justify-center items-center gap-2 ">
        <GiTakeMyMoney className="w-6 h-6" />
        <div className="text-md font-bold">Vibe$</div>
      </NavLink>
      <div className=" flex justify-center items-center gap-10 border border-white rounded-full py-2 px-7 text-sm">
        <div
          className={stylingMenu("home")}
          onClick={() => setActiveMenu("home")}
        >
          {activeMenu === "home" ? <IoHome /> : <IoHomeOutline />}
          <NavLink to={"/home"}>Home</NavLink>
        </div>

        <div
          className={stylingMenu("budget")}
          onClick={() => setActiveMenu("budget")}
        >
          {activeMenu === "budget" ? <IoWalletSharp /> : <IoWalletOutline />}
          <NavLink to={"/budget"}>Budget</NavLink>
        </div>

        <div
          className={stylingMenu("transaction")}
          onClick={() => setActiveMenu("transaction")}
        >
          {activeMenu === "transaction" ? (
            <RiMoneyDollarCircleFill />
          ) : (
            <RiMoneyDollarCircleLine />
          )}
          <NavLink to={"/transaction"}>Transaction</NavLink>
        </div>
      </div>
      <div>
        {checkLogin ? (
          <div>
            <div className="flex justify-center items-center gap-2 cursor-pointer">
              <BiUserCircle className="w-6 h-6" />
            </div>
          </div>
        ) : (
          <NavLink
            to={"/login"}
            className="border border-white text-sm rounded-lg py-1 px-5 cursor-pointer hover:bg-purple-950 "
          >
            Sign In
          </NavLink>
        )}
      </div>
    </div>
  );
}
