"use client";
import { poppins } from "@/font";
import { EyeIcon, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { z } from "zod";

export default function Register() {
  const navigate = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleShowPassword() {
    setShowPassword(!showPassword);
  }

  const [formRegister, setFormRegister] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
  });

  function changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormRegister({
      ...formRegister,
      [name]: value,
    });
  }

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
        body: JSON.stringify(formRegister),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: result.message,
        });
        navigate.push("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      } else if (error instanceof z.ZodError) {
        const path = error.issues[0].path[0];
        const message = error.issues[0].message;

        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: `Invalid on path: ${path}, error message: ${message}`,
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

  return (
    <form
      onSubmit={submitHandler}
      className="flex justify-center items-center h-screen bg-black text-white"
    >
      <div
        className={`${poppins.className} flex w-[900px] h-[500px] rounded-lg bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden`}
      >
        <div className="w-1/2 h-full flex flex-col p-10 justify-between">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-4xl">Vibe$</div>
            <div className="text-sm">it's time to create yours.</div>
          </div>
          <div className="flex flex-col gap-2 text-xs">
            {/* Awal First Name dan Last Name */}
            <div className=" flex justify-between gap-2">
              <div className="w-1/2 flex flex-col gap-2">
                <div>First Name</div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  onChange={changeHandler}
                  value={formRegister.firstName}
                  className="p-2 rounded-md border   border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <div>Last Name</div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  onChange={changeHandler}
                  value={formRegister.lastName}
                  className="p-2 rounded-md border  border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            {/* Akhir First Name dan Last Name */}

            {/* Awal Email dan Password */}
            <div className="flex justify-between gap-2">
              <div className="w-1/2 flex flex-col gap-2">
                <div>Email</div>
                <input
                  type="text"
                  name="email"
                  id="email"
                  onChange={changeHandler}
                  value={formRegister.email}
                  className="p-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <div>Password</div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    onChange={changeHandler}
                    value={formRegister.password}
                    className="w-full p-2 pr-8 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  />

                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={handleShowPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <EyeIcon size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Akhir Email dan Password */}

            {/* Awal Phone Number dan Address */}
            <div className="flex justify-between gap-2">
              <div className="w-1/2 flex flex-col gap-2">
                <div>Phone Number</div>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  onChange={changeHandler}
                  value={formRegister.phoneNumber}
                  className="p-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <div>Address</div>
                <input
                  type="text"
                  name="address"
                  id="address"
                  onChange={changeHandler}
                  value={formRegister.address}
                  className="p-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            {/* Akhir Phone Number dan Address */}

            <div className="flex flex-col gap-2 mt-5">
              <button
                type="submit"
                className="h-12 bg-blue-800 hover:bg-blue-600 rounded-md font-semibold transition duration-300 ease-in-out text-xs cursor-pointer"
              >
                SIGN UP
              </button>
              <div>
                Already have an account?{" "}
                <Link
                  href={"/login"}
                  className="text-blue-500 hover:text-white"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/2 h-full relative ">
          <img
            src={"/login-regis.jpg"}
            alt="Register"
            className="absolute w-full h-full object-cover rounded-l-4xl"
          />
        </div>
      </div>
    </form>
  );
}

//  firstName: z.string(),
//   lastName: z.string(),
//   email: z.string().email(),
//   password: z.string().min(8),
//   phoneNumber: z.string().min(10).max(13),
//   address: z.string(),
