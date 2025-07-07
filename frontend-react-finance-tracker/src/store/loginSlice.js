import { createSlice } from "@reduxjs/toolkit";
import instance from "../axiosInstance";

export const loginSlice = createSlice({
  name: "login",
  initialState: {
    isLogin: false,
    loading: false,
    error: null,
    data: null,
  },
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isLogin = true;
      state.data = action.payload;
    },
    loginError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLogin = false;
    },
  },
});

export const { loginRequest, loginSuccess, loginError } = loginSlice.actions;

export function doLogin(data) {
  return async (dispatch) => {
    try {
      dispatch(loginRequest());
      const response = await instance.post(`/login`, data);
      console.log(response, "Response from login");

      localStorage.access_token = response.data.access_token;

      dispatch(loginSuccess(response.data));
    } catch (error) {
      console.log("Error:", error);

      dispatch(loginError(error.response.data.message));
    }
  };
}

export default loginSlice.reducer;
