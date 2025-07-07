import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./loginSlice";
import registerReducer from "./registerSlice";

export default configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
  },
});
