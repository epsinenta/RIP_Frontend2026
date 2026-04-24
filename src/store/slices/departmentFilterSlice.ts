import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type DepartmentFilterState = {
  titleQuery: string;
};

const initialState: DepartmentFilterState = {
  titleQuery: "",
};

const departmentFilterSlice = createSlice({
  name: "departmentFilter",
  initialState,
  reducers: {
    setDepartmentTitleQuery(state, action: PayloadAction<string>) {
      state.titleQuery = action.payload;
    },
  },
});

export const { setDepartmentTitleQuery } = departmentFilterSlice.actions;
export default departmentFilterSlice.reducer;
