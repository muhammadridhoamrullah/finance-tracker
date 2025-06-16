import { createBrowserRouter, redirect } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

const checkLogin = () => {
  if (!localStorage.access_token) {
    return redirect("/login");
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
    loader: () => {
      if (localStorage.access_token) {
        return redirect("/home");
      }
      return null;
    },
  },
  {
    path: "/home",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    loader: checkLogin,
    children: [
      {
        path: "budget",
        element: <div>Budget</div>,
      },
      {
        path: "transaction",
        element: <div>Transaction</div>,
      },
    ],
  },
]);

export default router;
