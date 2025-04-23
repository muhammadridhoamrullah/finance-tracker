import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Register from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
