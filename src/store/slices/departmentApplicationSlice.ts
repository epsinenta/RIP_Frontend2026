import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON,
  WebBackendInternalAppSerializerDepartmentApplicationJSON,
} from "../../api/Api";

export interface DepartmentApplicationDetailPayload {
  department_application: WebBackendInternalAppSerializerDepartmentApplicationJSON;
  items: WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON[];
}

function defaultListFilters() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  return { fromDate: day, toDate: day, status: "", creatorLogin: "" };
}

function buildDepartmentApplicationInitialState() {
  return {
    cart: null as {
      has_draft: boolean;
      departments_count: number;
      id?: number;
      incomplete_items_count?: number;
    } | null,
    cartLoading: false,
    detail: null as DepartmentApplicationDetailPayload | null,
    detailLoading: false,
    detailError: null as string | null,
    list: [] as WebBackendInternalAppSerializerDepartmentApplicationJSON[],
    listLoading: false,
    listError: null as string | null,
    filters: defaultListFilters(),
    itemMutationLoading: {} as Record<string, boolean>,
    applicationMutationLoading: false,
    tableMutationBusy: false,
  };
}

type DepartmentApplicationState = ReturnType<typeof buildDepartmentApplicationInitialState>;

const departmentApplicationSlice = createSlice({
  name: "departmentApplication",
  initialState: buildDepartmentApplicationInitialState(),
  reducers: {
    resetDepartmentApplicationState: () => buildDepartmentApplicationInitialState(),
    clearDepartmentApplicationDetailError: (state) => {
      state.detailError = null;
    },
    setListFilters: (
      state,
      action: PayloadAction<Partial<ReturnType<typeof defaultListFilters>>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetListFiltersToToday: (state) => {
      state.filters = defaultListFilters();
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.cartLoading = action.payload;
    },
    setCart: (
      state,
      action: PayloadAction<DepartmentApplicationState["cart"]>,
    ) => {
      state.cart = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.detailLoading = action.payload;
    },
    setDetailError: (state, action: PayloadAction<string | null>) => {
      state.detailError = action.payload;
    },
    setDetail: (state, action: PayloadAction<DepartmentApplicationDetailPayload | null>) => {
      state.detail = action.payload;
    },
    setListLoading: (state, action: PayloadAction<boolean>) => {
      state.listLoading = action.payload;
    },
    setListError: (state, action: PayloadAction<string | null>) => {
      state.listError = action.payload;
    },
    setList: (
      state,
      action: PayloadAction<WebBackendInternalAppSerializerDepartmentApplicationJSON[]>,
    ) => {
      state.list = action.payload;
    },
    setApplicationMutationLoading: (state, action: PayloadAction<boolean>) => {
      state.applicationMutationLoading = action.payload;
    },
    setTableMutationBusy: (state, action: PayloadAction<boolean>) => {
      state.tableMutationBusy = action.payload;
    },
    setItemMutationKey: (
      state,
      action: PayloadAction<{ key: string; value: boolean }>,
    ) => {
      const { key, value } = action.payload;
      if (value) state.itemMutationLoading[key] = true;
      else delete state.itemMutationLoading[key];
    },
  },
});

export const {
  resetDepartmentApplicationState,
  clearDepartmentApplicationDetailError,
  setListFilters,
  resetListFiltersToToday,
  setCartLoading,
  setCart,
  setDetailLoading,
  setDetailError,
  setDetail,
  setListLoading,
  setListError,
  setList,
  setApplicationMutationLoading,
  setTableMutationBusy,
  setItemMutationKey,
} = departmentApplicationSlice.actions;

export default departmentApplicationSlice.reducer;
