import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";
import type { AppThunk } from "./types";
import type { DepartmentApplicationDetailPayload } from "../slices/departmentApplicationSlice";
import {
  setApplicationMutationLoading,
  setCart,
  setCartLoading,
  setDetail,
  setDetailError,
  setDetailLoading,
  setItemMutationKey,
  setList,
  setListError,
  setListLoading,
  setTableMutationBusy,
} from "../slices/departmentApplicationSlice";
import type {
  WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON,
  WebBackendInternalAppSerializerDepartmentApplicationJSON,
} from "../../api/Api";

type CartSliceUser = { user: { isAuthenticated: boolean } };

function emptyGuestCartPayload() {
  return {
    has_draft: false,
    departments_count: 0,
    incomplete_items_count: 0 as number | undefined,
    id: undefined as number | undefined,
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

function axiosStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "response" in e) {
    const r = (e as { response?: { status?: number } }).response;
    return r?.status;
  }
  return undefined;
}

export const fetchDepartmentApplicationCart = (): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(setCartLoading(true));
    const before = getState() as CartSliceUser;
    if (!before.user.isAuthenticated) {
      dispatch(setCart(emptyGuestCartPayload()));
      dispatch(setCartLoading(false));
      return;
    }
    try {
      const r = await api.departmentApplication.departmentApplicationCartList();
      const after = getState() as CartSliceUser;
      if (!after.user.isAuthenticated) {
        dispatch(setCart(emptyGuestCartPayload()));
        return;
      }
      const d = r.data as Record<string, unknown>;
      dispatch(
        setCart({
          has_draft: Boolean(d.has_draft),
          departments_count: Number(d.departments_count ?? 0),
          id: typeof d.id === "number" ? d.id : undefined,
          incomplete_items_count:
            typeof d.incomplete_items_count === "number" ? d.incomplete_items_count : undefined,
        }),
      );
    } catch {
      dispatch(
        setCart({
          has_draft: false,
          departments_count: 0,
          incomplete_items_count: 0,
        }),
      );
    } finally {
      dispatch(setCartLoading(false));
    }
  };
};

export const fetchDepartmentApplicationDetail =
  (applicationId: number): AppThunk<Promise<boolean>> => {
    return async (dispatch) => {
      dispatch(setDetailLoading(true));
      dispatch(setDetailError(null));
      dispatch(setDetail(null));
      try {
        const r = await api.departmentApplication.departmentApplicationDetail(applicationId);
        const detail = asDetail(r.data);
        if (!detail) {
          dispatch(setDetailError("Неверный ответ сервера"));
          return false;
        }
        dispatch(setDetail(detail));
        return true;
      } catch (e) {
        dispatch(setDetailError(apiErrMessage(e)));
        return false;
      } finally {
        dispatch(setDetailLoading(false));
      }
    };
  };

export const addDepartmentToApplication =
  (departmentId: number): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      dispatch(setApplicationMutationLoading(true));
      try {
        await api.depAppDep.postDepAppDep(departmentId);
        await dispatch(fetchDepartmentApplicationCart());
      } catch (e) {
        if (axiosStatus(e) === 409) {
          await dispatch(fetchDepartmentApplicationCart());
          return;
        }
        dispatch(setApplicationMutationLoading(false));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setApplicationMutationLoading(false));
    };
  };

export const moveDepartmentInApplication =
  (args: {
    departmentId: number;
    applicationId: number;
    direction: "up" | "down";
  }): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      dispatch(setTableMutationBusy(true));
      try {
        await api.depAppDep.depAppDepUpdate(args.departmentId, args.applicationId, {
          direction: args.direction,
        });
        await dispatch(fetchDepartmentApplicationDetail(args.applicationId));
      } catch (e) {
        dispatch(setTableMutationBusy(false));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setTableMutationBusy(false));
    };
  };

export const updateDepartmentLineInApplication =
  (args: {
    departmentId: number;
    applicationId: number;
    body: WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON;
  }): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      dispatch(setTableMutationBusy(true));
      try {
        await api.depAppDep.depAppDepUpdate(args.departmentId, args.applicationId, args.body);
        await dispatch(fetchDepartmentApplicationDetail(args.applicationId));
      } catch (e) {
        dispatch(setTableMutationBusy(false));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setTableMutationBusy(false));
    };
  };

export const removeDepartmentLineFromApplication =
  (args: { departmentId: number; applicationId: number }): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      const key = `rm-${args.departmentId}`;
      dispatch(setItemMutationKey({ key, value: true }));
      try {
        await api.depAppDep.depAppDepDelete(args.departmentId, args.applicationId);
        await dispatch(fetchDepartmentApplicationDetail(args.applicationId));
        await dispatch(fetchDepartmentApplicationCart());
      } catch (e) {
        dispatch(setItemMutationKey({ key, value: false }));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setItemMutationKey({ key, value: false }));
    };
  };

export const editDepartmentApplication =
  (args: {
    applicationId: number;
    body: WebBackendInternalAppSerializerDepartmentApplicationJSON;
  }): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      dispatch(setApplicationMutationLoading(true));
      try {
        await api.departmentApplication.editDepartmentApplicationUpdate(
          args.applicationId,
          args.body,
        );
        await dispatch(fetchDepartmentApplicationDetail(args.applicationId));
      } catch (e) {
        dispatch(setApplicationMutationLoading(false));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setApplicationMutationLoading(false));
    };
  };

export const formDepartmentApplication =
  (applicationId: number): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      dispatch(setApplicationMutationLoading(true));
      try {
        await api.departmentApplication.formDepartmentApplicationUpdate(applicationId);
        await dispatch(fetchDepartmentApplicationDetail(applicationId));
        await dispatch(fetchDepartmentApplicationCart());
        await dispatch(fetchDepartmentApplicationsList());
      } catch (e) {
        dispatch(setApplicationMutationLoading(false));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setApplicationMutationLoading(false));
    };
  };

export const deleteDepartmentApplication =
  (applicationId: number): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      dispatch(setApplicationMutationLoading(true));
      try {
        await api.departmentApplication.deleteDepartmentApplicationDelete(applicationId);
        dispatch(setDetail(null));
        await dispatch(fetchDepartmentApplicationCart());
        await dispatch(fetchDepartmentApplicationsList());
      } catch (e) {
        dispatch(setApplicationMutationLoading(false));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setApplicationMutationLoading(false));
    };
  };

export const finishDepartmentApplication =
  (args: { applicationId: number; status: "completed" | "rejected" }): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      const key = `finish-${args.applicationId}`;
      dispatch(setItemMutationKey({ key, value: true }));
      try {
        await api.departmentApplication.finishDepartmentApplicationUpdate(args.applicationId, {
          status: args.status,
        });
        await dispatch(fetchDepartmentApplicationsList());
      } catch (e) {
        dispatch(setItemMutationKey({ key, value: false }));
        throw new Error(apiErrMessage(e));
      }
      dispatch(setItemMutationKey({ key, value: false }));
    };
  };

export const fetchDepartmentApplicationsList = (): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(setListLoading(true));
    dispatch(setListError(null));
    try {
      const st = getState() as {
        departmentApplication: {
          filters: { fromDate: string; toDate: string; status: string };
        };
      };
      const f = st.departmentApplication.filters;
      const query: { "from-date"?: string; "to-date"?: string; status?: string } = {};
      if (f.fromDate) query["from-date"] = f.fromDate;
      if (f.toDate) query["to-date"] = f.toDate;
      if (f.status) query.status = f.status;
      const r = await api.departmentApplication.allDepartmentApplicationsList(query);
      dispatch(setList(r.data));
    } catch (e) {
      dispatch(setListError(apiErrMessage(e)));
    } finally {
      dispatch(setListLoading(false));
    }
  };
};
