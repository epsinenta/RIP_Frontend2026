import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Department } from "../../modules/departmentsApi";
import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";

export interface DepartmentsState {
  catalogDepartments: Department[];
  displayDepartments: Department[];
  loading: boolean;
  error: string | null;
  useMock: boolean;
}

const initialState: DepartmentsState = {
  catalogDepartments: [],
  displayDepartments: [],
  loading: false,
  error: null,
  useMock: false,
};

export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (searchTitle: string | undefined, { rejectWithValue }) => {
    try {
      const response = await api.departments.departmentsList(
        searchTitle ? { Title: searchTitle } : {},
      );
      return response.data as Department[];
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    setCatalogDepartments: (state, action: PayloadAction<Department[]>) => {
      state.catalogDepartments = action.payload;
    },
    setDisplayDepartments: (state, action: PayloadAction<Department[]>) => {
      state.displayDepartments = action.payload;
    },
    setDepartmentLists: (
      state,
      action: PayloadAction<{ catalog: Department[]; display: Department[] }>,
    ) => {
      state.catalogDepartments = action.payload.catalog;
      state.displayDepartments = action.payload.display;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUseMock: (state, action: PayloadAction<boolean>) => {
      state.useMock = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        const list = action.payload as Department[];
        state.catalogDepartments = list;
        state.displayDepartments = list;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Ошибка загрузки";
      });
  },
});

export const {
  setCatalogDepartments,
  setDisplayDepartments,
  setDepartmentLists,
  setLoading,
  setError,
  clearError,
  setUseMock,
} = departmentSlice.actions;

export default departmentSlice.reducer;
