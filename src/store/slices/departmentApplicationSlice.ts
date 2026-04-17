import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";
import { logoutUser } from "./userSlice";
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

function buildInitialState() {
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
  };
}

function asDetail(data: unknown): DepartmentApplicationDetailPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const app = o.department_application;
  const items = o.items;
  if (!app || typeof app !== "object" || !Array.isArray(items)) return null;
  return {
    department_application: app as WebBackendInternalAppSerializerDepartmentApplicationJSON,
    items: items as WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON[],
  };
}

type CartSliceUser = { user: { isAuthenticated: boolean } };

function emptyGuestCartPayload() {
  return {
    has_draft: false,
    departments_count: 0,
    incomplete_items_count: 0 as number | undefined,
    id: undefined as number | undefined,
  };
}

export const fetchDepartmentApplicationCart = createAsyncThunk(
  "departmentApplication/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const before = getState() as CartSliceUser;
    if (!before.user.isAuthenticated) {
      return emptyGuestCartPayload();
    }
    try {
      const r = await api.departmentApplication.departmentApplicationCartList();
      const after = getState() as CartSliceUser;
      if (!after.user.isAuthenticated) {
        return emptyGuestCartPayload();
      }
      const d = r.data as Record<string, unknown>;
      return {
        has_draft: Boolean(d.has_draft),
        departments_count: Number(d.departments_count ?? 0),
        id: typeof d.id === "number" ? d.id : undefined,
        incomplete_items_count:
          typeof d.incomplete_items_count === "number" ? d.incomplete_items_count : undefined,
      };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const fetchDepartmentApplicationDetail = createAsyncThunk(
  "departmentApplication/fetchDetail",
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const r = await api.departmentApplication.departmentApplicationDetail(applicationId);
      const detail = asDetail(r.data);
      if (!detail) return rejectWithValue("Неверный ответ сервера");
      return detail;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const addDepartmentToApplication = createAsyncThunk(
  "departmentApplication/addDepartment",
  async (departmentId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.depAppDep.postDepAppDep(departmentId);
      await dispatch(fetchDepartmentApplicationCart());
      return departmentId;
    } catch (e) {
      if (axiosStatus(e) === 409) {
        await dispatch(fetchDepartmentApplicationCart());
        return departmentId;
      }
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

function axiosStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "response" in e) {
    const r = (e as { response?: { status?: number } }).response;
    return r?.status;
  }
  return undefined;
}

export const moveDepartmentInApplication = createAsyncThunk(
  "departmentApplication/moveDepartment",
  async (
    {
      departmentId,
      applicationId,
      direction,
    }: { departmentId: number; applicationId: number; direction: "up" | "down" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.depAppDep.depAppDepUpdate(departmentId, applicationId, { direction });
      await dispatch(fetchDepartmentApplicationDetail(applicationId));
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const updateDepartmentLineInApplication = createAsyncThunk(
  "departmentApplication/updateLine",
  async (
    {
      departmentId,
      applicationId,
      body,
    }: {
      departmentId: number;
      applicationId: number;
      body: WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON;
    },
    { rejectWithValue, dispatch },
  ) => {
    const key = `${departmentId}-${applicationId}`;
    try {
      await api.depAppDep.depAppDepUpdate(departmentId, applicationId, body);
      await dispatch(fetchDepartmentApplicationDetail(applicationId));
      return key;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const removeDepartmentLineFromApplication = createAsyncThunk(
  "departmentApplication/removeLine",
  async (
    { departmentId, applicationId }: { departmentId: number; applicationId: number },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.depAppDep.depAppDepDelete(departmentId, applicationId);
      await dispatch(fetchDepartmentApplicationDetail(applicationId));
      await dispatch(fetchDepartmentApplicationCart());
      return departmentId;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const editDepartmentApplication = createAsyncThunk(
  "departmentApplication/editApplication",
  async (
    {
      applicationId,
      body,
    }: {
      applicationId: number;
      body: WebBackendInternalAppSerializerDepartmentApplicationJSON;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.departmentApplication.editDepartmentApplicationUpdate(applicationId, body);
      await dispatch(fetchDepartmentApplicationDetail(applicationId));
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const formDepartmentApplication = createAsyncThunk(
  "departmentApplication/form",
  async (applicationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.departmentApplication.formDepartmentApplicationUpdate(applicationId);
      await dispatch(fetchDepartmentApplicationDetail(applicationId));
      await dispatch(fetchDepartmentApplicationCart());
      await dispatch(fetchDepartmentApplicationsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const deleteDepartmentApplication = createAsyncThunk(
  "departmentApplication/deleteApplication",
  async (applicationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.departmentApplication.deleteDepartmentApplicationDelete(applicationId);
      await dispatch(fetchDepartmentApplicationCart());
      await dispatch(fetchDepartmentApplicationsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const finishDepartmentApplication = createAsyncThunk(
  "departmentApplication/finish",
  async (
    { applicationId, status }: { applicationId: number; status: "completed" | "rejected" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.departmentApplication.finishDepartmentApplicationUpdate(applicationId, {
        status,
      });
      await dispatch(fetchDepartmentApplicationsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const fetchDepartmentApplicationsList = createAsyncThunk(
  "departmentApplication/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const st = getState() as {
        departmentApplication: { filters: ReturnType<typeof defaultListFilters> };
      };
      const f = st.departmentApplication.filters;
      const query: { "from-date"?: string; "to-date"?: string; status?: string } = {};
      if (f.fromDate) query["from-date"] = f.fromDate;
      if (f.toDate) query["to-date"] = f.toDate;
      if (f.status) query.status = f.status;
      const r = await api.departmentApplication.allDepartmentApplicationsList(query);
      return r.data;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

const departmentApplicationSlice = createSlice({
  name: "departmentApplication",
  initialState: buildInitialState(),
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, () => buildInitialState())
      .addCase(logoutUser.rejected, () => buildInitialState())
      .addCase(fetchDepartmentApplicationCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(fetchDepartmentApplicationCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchDepartmentApplicationCart.rejected, (state) => {
        state.cartLoading = false;
        state.cart = {
          has_draft: false,
          departments_count: 0,
          incomplete_items_count: 0,
        };
      })
      .addCase(fetchDepartmentApplicationDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detail = null;
      })
      .addCase(fetchDepartmentApplicationDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchDepartmentApplicationDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      })
      .addCase(fetchDepartmentApplicationsList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchDepartmentApplicationsList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchDepartmentApplicationsList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
      })
      .addCase(addDepartmentToApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(addDepartmentToApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(addDepartmentToApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(editDepartmentApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(editDepartmentApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(editDepartmentApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(formDepartmentApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(formDepartmentApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(formDepartmentApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(deleteDepartmentApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(deleteDepartmentApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
        state.detail = null;
      })
      .addCase(deleteDepartmentApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(finishDepartmentApplication.pending, (state, action) => {
        const id = action.meta.arg.applicationId;
        state.itemMutationLoading[`finish-${id}`] = true;
      })
      .addCase(finishDepartmentApplication.fulfilled, (state, action) => {
        const id = action.meta.arg.applicationId;
        delete state.itemMutationLoading[`finish-${id}`];
      })
      .addCase(finishDepartmentApplication.rejected, (state, action) => {
        const id = action.meta?.arg?.applicationId;
        if (id != null) delete state.itemMutationLoading[`finish-${id}`];
      })
      .addCase(removeDepartmentLineFromApplication.pending, (state, action) => {
        const id = action.meta.arg.departmentId;
        state.itemMutationLoading[`rm-${id}`] = true;
      })
      .addCase(removeDepartmentLineFromApplication.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.itemMutationLoading[`rm-${id}`];
      })
      .addCase(removeDepartmentLineFromApplication.rejected, (state, action) => {
        const id = action.meta?.arg?.departmentId;
        if (id != null) delete state.itemMutationLoading[`rm-${id}`];
      });
  },
});

export const {
  clearDepartmentApplicationDetailError,
  setListFilters,
  resetListFiltersToToday,
} = departmentApplicationSlice.actions;
export default departmentApplicationSlice.reducer;
