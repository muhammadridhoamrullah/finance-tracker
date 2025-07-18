import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeOff, EyeIcon } from "lucide-react";
import instance from "../axiosInstance";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { doLogin } from "../store/loginSlice";
import { useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Login() {
  const navigate = useNavigate();
  const [hidePassword, setHidePassword] = useState(false);
  const { loading, data, error, isLogin } = useSelector((state) => state.login);
  console.log("Login State:", { loading, data, error, isLogin });

  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  function changeHandler(e) {
    const { name, value } = e.target;

    setFormLogin({
      ...formLogin,
      [name]: value,
    });
  }

  async function submitHandler(e) {
    e.preventDefault();

    dispatch(doLogin(formLogin));
  }

  async function togglePassword() {
    setHidePassword(!hidePassword);
  }

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error,
      });
    }
  }, [error]);

  useEffect(() => {
    if (isLogin) {
      navigate("/home");
    }
  }, [isLogin]);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-black">
      <div className="w-[900px] h-[500px] bg-white/10 rounded-lg flex justify-center items-center overflow-hidden text-white">
        {/* Awal Form */}
        <div className="w-1/2 h-full flex flex-col justify-center items-start pl-20 gap-3 py-5">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={changeHandler}
                value={formLogin.email}
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
                  value={formLogin.password}
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

            <button
              type="submit"
              className="bg-blue-900 h-10 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                </div>
              ) : (
                <div className="font-bold">LOG IN</div>
              )}
            </button>
            <div className="text-xs font-extralight">
              Dont have an account?{" "}
              <Link
                className="text-blue-500 font-bold hover:text-white"
                to={"/register"}
              >
                REGISTER
              </Link>
            </div>
          </form>
        </div>
        {/* Akhir Form */}

        {/* Awal Gambar */}
        <div className=" w-1/2 h-full relative">
          <img
            src={"/register.jpg"}
            alt="Register Image"
            className="w-full h-full absolute object-cover rounded-l-4xl"
          />
        </div>
        {/* Akhir Gambar */}
      </div>
    </div>
  );
}
