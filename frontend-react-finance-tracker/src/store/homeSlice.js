import { createSlice } from "@reduxjs/toolkit";
import instance from "../axiosInstance";

export const homeSlice = createSlice({
  name: "home",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {
    fetchHomeDataRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchHomeDataSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    fetchHomeDataError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchHomeDataRequest,
  fetchHomeDataSuccess,
  fetchHomeDataError,
} = homeSlice.actions;

export function fetchUserData() {
  return async (dispatch) => {
    try {
      dispatch(fetchHomeDataRequest());
      const response = await instance.get("/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      dispatch(fetchHomeDataSuccess(response.data.profile));
    } catch (error) {
      dispatch(fetchHomeDataError(error.response.data.message));
    }
  };
}

export function getSummaryThisMonth() {
  return async (dispatch) => {
    try {
      dispatch(fetchHomeDataRequest());
      const response = await instance.get("/summary/this-month", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      console.log("Response from getSummaryThisMonth:", response);

      dispatch(fetchHomeDataSuccess(response.data.summary));
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "An error occurred";
      dispatch(fetchHomeDataError(errorMsg));
    }
  };
}

export default homeSlice.reducer;
