import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import departmentApplicationReducer from "./slices/departmentApplicationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    departmentApplication: departmentApplicationReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
