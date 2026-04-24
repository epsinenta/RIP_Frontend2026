import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  username: string;
  isAuthenticated: boolean;
  isModerator: boolean;
}

const initialState: UserState = {
  username: "",
  isAuthenticated: false,
  isModerator: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{ username: string; isModerator: boolean }>,
    ) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.isModerator = action.payload.isModerator;
    },
    clearSession: () => ({ ...initialState }),
  },
});

export const { setSession, clearSession } = userSlice.actions;
export default userSlice.reducer;
