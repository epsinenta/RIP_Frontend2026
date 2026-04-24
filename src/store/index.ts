import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import departmentApplicationReducer from "./slices/departmentApplicationSlice";
import departmentFilterReducer from "./slices/departmentFilterSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    departmentApplication: departmentApplicationReducer,
    departmentFilter: departmentFilterReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
