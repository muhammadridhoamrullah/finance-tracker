import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeOff, EyeIcon } from "lucide-react";
import instance from "../axiosInstance";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { doRegister } from "../store/registerSlice";
import { useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hidePassword, setHidePassword] = useState(false);
  const { loading, data, error, isRegistered } = useSelector(
    (state) => state.register
  );
  const [formRegister, setFormRegister] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
  });

  function changeHandler(e) {
    const { name, value } = e.target;

    setFormRegister({
      ...formRegister,
      [name]: value,
    });
  }

  async function submitHandler(e) {
    e.preventDefault();
    dispatch(doRegister(formRegister));
  }

  async function togglePassword() {
    setHidePassword(!hidePassword);
  }

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error,
      });
    }
  }, [error]);

  useEffect(() => {
    if (isRegistered) {
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You can now log in with your account.",
      });
      navigate("/login");
    }
  }, [isRegistered]);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-black">
      <div className="w-[900px] h-[500px] bg-white/10 rounded-lg flex justify-center items-center overflow-hidden text-white">
        <div className="w-1/2 h-full flex flex-col justify-between items-start pl-20 gap-3 py-5">
          <div className="flex flex-col">
            {/* <div className="text-3xl font-bold">Register Please</div> */}
            <div className="text-xs font-bold">
              Please enter your account details
            </div>
          </div>
          <form
            onSubmit={submitHandler}
            className="flex flex-col gap-3 w-[300px] "
          >
            <div className="flex gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  onChange={changeHandler}
                  value={formRegister.firstName}
                  className="w-36 h-10 p-2 border border-white rounded-lg text-xs bg-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  onChange={changeHandler}
                  value={formRegister.lastName}
                  className="w-36 h-10 p-2 border border-white rounded-lg text-xs bg-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={changeHandler}
                value={formRegister.email}
                className="w-full h-10 p-2 border border-white rounded-lg text-xs bg-transparent focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Password</label>
              <div className="relative">
                <input
                  type={hidePassword ? "text" : "password"}
                  name="password"
                  id="password"
                  onChange={changeHandler}
                  value={formRegister.password}
                  className="w-full h-10 p-2 border border-white rounded-lg text-xs bg-transparent focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {hidePassword ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                onChange={changeHandler}
                value={formRegister.phoneNumber}
                className="w-full h-10 p-2 border border-white rounded-lg text-xs bg-transparent focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Address</label>
              <input
                type="text"
                name="address"
                id="address"
                onChange={changeHandler}
                value={formRegister.address}
                className="w-full h-10 p-2 border border-white rounded-lg text-xs bg-transparent focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-900 h-10 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <AiOutlineLoading3Quarters className="text-lg animate-spin" />
                </div>
              ) : (
                <div className="font-bold">SUBMIT</div>
              )}
            </button>
            <div className="text-xs font-extralight">
              Already have an account?{" "}
              <Link
                className="text-blue-500 font-bold hover:text-white"
                to={"/login"}
              >
                LOGIN
              </Link>
            </div>
          </form>
        </div>
        <div className=" w-1/2 h-full relative">
          <img
            src={"/register.jpg"}
            alt="Register Image"
            className="w-full h-full absolute object-cover rounded-l-4xl"
          />
        </div>
      </div>
    </div>
  );
}

// {
//   "UserId": 1,
//   "firstName": "John",
//   "lastName": "Doe",
//   "email": "john.doe@example.com",
//   "password": "1234567890",
//   "phoneNumber": "081234567890",
//   "address": "Jl. Contoh No. 123, Jakarta"
//   },
