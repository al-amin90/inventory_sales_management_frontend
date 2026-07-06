import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { logoutUser } from "../features/auth/authSlice";

import { RootState } from "../store";
import { removeToken } from "@/utils/auth";

const baseQuery = fetchBaseQuery({
  baseUrl: `http://localhost:5000/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    let token = state?.auth?.accessToken;

    if (!token) {
      try {
        const raw = localStorage.getItem("persist:auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed.accessToken ? JSON.parse(parsed.accessToken) : null;
        }
      } catch (e) {
        console.error("Error parsing auth:", e);
      }
    }

    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const errorData = result.error.data as { message?: string };
    toast.error(errorData?.message || "Session expired. Please login again.");

    removeToken();

    api.dispatch(logoutUser());
    window.location.href = "/login";
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["auth", "products", "sales", "dashboard", "roles"],
  endpoints: () => ({}),
});
