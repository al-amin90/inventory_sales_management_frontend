import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/types";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
}

const initialState: AuthState = { user: null, accessToken: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: IUser; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
