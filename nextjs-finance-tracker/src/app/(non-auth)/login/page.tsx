"use client";

import { poppins } from "@/font";
import { EyeIcon, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { z } from "zod";
const Cookies = require("js-cookie");

export default function Login() {
  const navigate = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleShowPassword() {
    setShowPassword(!showPassword);
  }

  const CheckCookies = Cookies.get("access_token");
  console.log(CheckCookies, "ini cookies access_token");

  if (CheckCookies) {
    navigate.push("/");
  }

  useEffect(() => {
    const checkCookies = Cookies.get("access_token");
    console.log(checkCookies, "ini cookies access_token");

    if (checkCookies) {
      navigate.push("/home");
    }
  }, []);

  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });

  function changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormLogin({
      ...formLogin,
      [name]: value,
    });
  }

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formLogin),
        cache: "no-cache",
      });

      console.log(response, "ini response login");

      const result = await response.json();
      console.log(result, "ini result login");

      if (response.ok) {
        Cookies.set("access_token", result.access_token);

        navigate.push("/home");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: result.message,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message,
        });
      } else if (error instanceof z.ZodError) {
        console.log(error, "ini error zod");

        const path = error.issues[0].path[0];
        const message = error.issues[0].message;
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: `Invalid on path: ${path}, error message: ${message}`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Internal Server Error",
        });
      }
    }
  }
  return (
    <form
      onSubmit={submitHandler}
      className="flex justify-center items-center h-screen bg-black text-white"
    >
      <div className="flex w-[900px] h-[500px] rounded-lg bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
        <div
          className={` ${poppins.className} w-1/2 h-full flex flex-col p-10 justify-between`}
        >
          <div className={`${poppins.className} text-3xl`}>Vibe$</div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="text-2xl">Welcome Back</div>
              <div className="text-[10px] font-extralight">
                Please enter your account details
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs">Email</label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  onChange={changeHandler}
                  value={formLogin.email}
                  className="w-full h-10 p-2 rounded-md border text-xs border-white bg-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    onChange={changeHandler}
                    value={formLogin.password}
                    className="w-full h-10 p-2 rounded-md border border-white text-xs bg-transparent focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <EyeIcon size={16} />
                    )}
                  </button>
                </div>
                <Link
                  className="text-xs flex justify-end hover:text-blue-500"
                  href={"/forgot-password"}
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                className="bg-blue-800 h-12 hover:bg-blue-600 rounded-md font-semibold transition duration-300 ease-in-out text-xs cursor-pointer"
              >
                SIGN IN
              </button>
              <div className="text-xs">
                Dont have an account?{" "}
                <Link
                  className="text-blue-500 hover:text-white"
                  href={"/register"}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-1/2 h-full relative">
          <img
            src={"/login-regis.jpg"}
            alt="Image Form Login"
            className="absolute w-full h-full object-cover rounded-l-4xl"
          />
        </div>
      </div>
    </form>
  );
}
