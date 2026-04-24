import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import {
  fallbackImageUrl,
  listDepartments,
  objectUrlFromKey,
  type Department,
  type DepartmentApplicationItemJSON,
} from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK, MOCK_APPLICATION_DETAIL } from "../../modules/mock";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteDepartmentApplication,
  editDepartmentApplication,
  fetchDepartmentApplicationDetail,
  formDepartmentApplication,
  moveDepartmentInApplication,
  removeDepartmentLineFromApplication,
  updateDepartmentLineInApplication,
} from "../../store/thunks/departmentApplicationThunks";
import type { DepartmentApplicationDetailPayload } from "../../store/slices/departmentApplicationSlice";
import { ROUTES } from "../../Routes";
import type {
  WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON,
  WebBackendInternalAppSerializerDepartmentApplicationJSON,
} from "../../api/Api";
import RequestBlockingOverlay from "../../components/RequestBlockingOverlay/RequestBlockingOverlay";
import "./DepartmentApplicationPage.css";

const ROLE_OPTIONS = ["Головной", "Руководящий", "Подчинённый"] as const;

function hierarchyClass(role: string): string {
  const r = role.trim();
  if (r === "Головной" || r === "Головное подразделение") return "hierarchy-level-1";
  if (r === "Руководящий" || r === "Руководящий отдел") return "hierarchy-level-2";
  return "hierarchy-level-3";
}

function roleForSelect(role: string): string {
  const r = role.trim();
  if (r === "Головное подразделение" || r === "Головной") return "Головной";
  if (r === "Руководящий отдел" || r === "Руководящий") return "Руководящий";
  if (r === "Подчинённый отдел" || r === "Подчинённый") return "Подчинённый";
  return ROLE_OPTIONS.includes(r as (typeof ROLE_OPTIONS)[number]) ? r : "Подчинённый";
}

function resolvePhoto(photoKey: string): string {
  if (!photoKey) return fallbackImageUrl();
  if (
    photoKey.startsWith("http://") ||
    photoKey.startsWith("https://") ||
    photoKey.startsWith("/") ||
    photoKey.startsWith("blob:")
  ) {
    return photoKey;
  }
  return objectUrlFromKey(photoKey);
}

function toItemJson(row: DepartmentApplicationDetailPayload["items"][0]): DepartmentApplicationItemJSON {
  return {
    department_application_id: row.department_application_id ?? 0,
    department_id: row.department_id ?? 0,
    main_department_id: row.main_department_id ?? null,
    sort_order: row.sort_order ?? 0,
    role: row.role ?? "",
    salary: row.salary ?? null,
  };
}

function swapMockLineOrder(
  items: WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON[],
  departmentId: number,
  direction: "up" | "down",
): WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON[] {
  const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const idx = sorted.findIndex((i) => (i.department_id ?? 0) === departmentId);
  if (idx < 0) return items;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= sorted.length) return items;
  const soA = sorted[idx].sort_order ?? idx + 1;
  const soB = sorted[swapWith].sort_order ?? swapWith + 1;
  const idA = sorted[idx].department_id ?? 0;
  const idB = sorted[swapWith].department_id ?? 0;
  return items.map((it) => {
    const id = it.department_id ?? 0;
    if (id === idA) return { ...it, sort_order: soB };
    if (id === idB) return { ...it, sort_order: soA };
    return it;
  });
}

export default function DepartmentApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const {
    detail,
    detailLoading,
    applicationMutationLoading,
    itemMutationLoading,
    tableMutationBusy,
  } = useAppSelector((s) => s.departmentApplication);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [mockData, setMockData] = useState<DepartmentApplicationDetailPayload | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  const reloadMock = useCallback(async () => {
    if (!id) return;
    if (Number(id) !== MOCK_APPLICATION_DETAIL.department_application.department_application_id) {
      setMockData(null);
      return;
    }
    setMockData({
      department_application: {
        ...MOCK_APPLICATION_DETAIL.department_application,
      } as WebBackendInternalAppSerializerDepartmentApplicationJSON,
      items: MOCK_APPLICATION_DETAIL.items.map(
        (x) => ({ ...x }) as WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON,
      ),
    });
  }, [id]);

  useEffect(() => {
    listDepartments()
      .then((list) => {
        if (list.length > 0) setDepartments(list);
        else setDepartments(DEPARTMENTS_MOCK);
      })
      .catch(() => setDepartments(DEPARTMENTS_MOCK));
  }, []);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    setMockData(null);
    void dispatch(fetchDepartmentApplicationDetail(Number(id))).then((ok) => {
      if (ok !== true) void reloadMock();
    });
  }, [id, isAuthenticated, dispatch, reloadMock]);

  useEffect(() => {
    if (isAuthenticated) return;
    navigate(ROUTES.SIGN_IN, { replace: true });
  }, [isAuthenticated, navigate]);

  const data = detail ?? mockData;

  const depById = useMemo(() => {
    const m = new Map<number, Department>();
    departments.forEach((d) => m.set(d.department_id, d));
    return m;
  }, [departments]);

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [data?.items]);

  const app = data?.department_application;
  const isDraft = app?.status === "draft";
  const applicationId = app?.department_application_id;

  useEffect(() => {
    if (!app) return;
    setTitleDraft(app.title ?? "");
  }, [applicationId, app?.title]);

  const controlsLocked =
    applicationMutationLoading ||
    tableMutationBusy ||
    Object.keys(itemMutationLoading).length > 0;

  const handleMove = async (departmentId: number, direction: "up" | "down") => {
    if (!applicationId || !isDraft) return;
    if (mockData && !detail) {
      setMockData((prev) =>
        prev
          ? {
              ...prev,
              items: swapMockLineOrder(prev.items, departmentId, direction),
            }
          : null,
      );
      return;
    }
    try {
      await dispatch(
        moveDepartmentInApplication({ departmentId, applicationId, direction }),
      );
    } catch {
      void 0;
    }
  };

  const handleRoleChange = async (
    item: DepartmentApplicationDetailPayload["items"][0],
    role: string,
  ) => {
    if (!applicationId || !isDraft) return;
    const row = toItemJson(item);
    if (mockData && !detail) {
      setMockData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) =>
                (i.department_id ?? 0) === (item.department_id ?? 0) ? { ...i, role } : i,
              ),
            }
          : null,
      );
      return;
    }
    try {
      await dispatch(
        updateDepartmentLineInApplication({
          departmentId: item.department_id ?? 0,
          applicationId,
          body: {
            role,
            sort_order: row.sort_order,
          },
        }),
      );
    } catch {
      void 0;
    }
  };

  const handleSaveTitle = async () => {
    if (!applicationId || !isDraft || !app) return;
    const trimmed = titleDraft.trim();
    if (mockData && !detail) {
      setMockData((prev) =>
        prev
          ? {
              ...prev,
              department_application: {
                ...prev.department_application,
                title: trimmed || prev.department_application.title,
              },
            }
          : null,
      );
      return;
    }
    try {
      await dispatch(
        editDepartmentApplication({
          applicationId,
          body: { department_application_id: applicationId, title: trimmed || app.title },
        }),
      );
    } catch {
      void 0;
    }
  };

  const handleForm = async () => {
    if (!applicationId || !isDraft || !app) return;
    const trimmed = titleDraft.trim();
    if (mockData && !detail) {
      setMockData((prev) =>
        prev
          ? {
              ...prev,
              department_application: {
                ...prev.department_application,
                title: trimmed || prev.department_application.title,
                status: "formed",
              },
            }
          : null,
      );
      return;
    }
    try {
      await dispatch(
        editDepartmentApplication({
          applicationId,
          body: { department_application_id: applicationId, title: trimmed || app.title },
        }),
      );
      await dispatch(formDepartmentApplication(applicationId));
    } catch {
      void 0;
    }
  };

  const handleRemoveLine = async (departmentId: number) => {
    if (!applicationId || !isDraft) return;
    if (!window.confirm("Убрать подразделение из заявки?")) return;
    if (mockData && !detail) {
      setMockData((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.department_id !== departmentId) } : null,
      );
      return;
    }
    try {
      await dispatch(removeDepartmentLineFromApplication({ departmentId, applicationId }));
    } catch {
      void 0;
    }
  };

  const handleDeleteApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !isDraft) return;
    if (!window.confirm("Удалить заявку?")) return;
    if (mockData && !detail) {
      navigate("/");
      return;
    }
    try {
      await dispatch(deleteDepartmentApplication(applicationId));
      navigate("/");
    } catch {
      void 0;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (detailLoading && !data) {
    return (
      <div className="department-application-page">
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!data || !app || applicationId == null) {
    return (
      <div className="department-application-page">
        <p className="application-not-found">Заявка не найдена.</p>
      </div>
    );
  }

  const overlayActive =
    (detailLoading && Boolean(data)) ||
    applicationMutationLoading ||
    tableMutationBusy ||
    Object.keys(itemMutationLoading).length > 0;

  return (
    <div className="department-application-page department-application-page--relative">
      <RequestBlockingOverlay active={overlayActive} />
      <div className="application-detail">
        <div className="application-detail__header-card">
          <h1 className="application-detail__title">Заявка на изменение структуры</h1>
          {isDraft ? (
            <Form.Group className="department-application-page__title-field" controlId="application-title">
              <Form.Label>Название заявки</Form.Label>
              <Form.Control
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Сохраняется кнопкой ниже или при подтверждении заявки"
                maxLength={255}
                disabled={controlsLocked}
              />
              <div className="department-application-page__title-actions">
                <button
                  type="button"
                  className="search-btn department-application-page__delete-btn"
                  onClick={() => void handleSaveTitle()}
                  disabled={controlsLocked}
                >
                  Сохранить название
                </button>
              </div>
            </Form.Group>
          ) : null}
          <div className="application-detail__info">
            <div className="application-detail__info-item">
              <strong>ID:</strong> {applicationId}
            </div>
            <div className="application-detail__info-item">
              <strong>Статус:</strong> {app.status}
            </div>
            <div className="application-detail__info-item">
              <strong>Отделов:</strong> {sortedItems.length}
            </div>
            {!isDraft && app.title ? (
              <div className="application-detail__info-item">
                <strong>Название:</strong> {app.title}
              </div>
            ) : null}
          </div>
        </div>

        {isDraft ? (
          <div className="department-application-page__actions">
            <Button
              type="button"
              className="department-application-page__btn-form"
              onClick={() => void handleForm()}
              disabled={controlsLocked}
            >
              Подтвердить заявку
            </Button>
          </div>
        ) : null}

        <div className="app-table-wrapper department-application-page__table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="app-table__col-order" aria-hidden />
                <th className="app-table__col-photo">Фото</th>
                <th className="app-table__col-name">Отдел</th>
                <th className="app-table__col-employees">Сотрудников</th>
                <th className="app-table__col-salary">Зарплата руководителя</th>
                <th className="app-table__col-role">Роль</th>
                <th className="app-table__col-main">Руководящий отдел</th>
                <th className="app-table__col-remove" scope="col">
                  {isDraft ? "Из заявки" : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => {
                const dep = depById.get(item.department_id ?? 0);
                const mainDep =
                  item.main_department_id != null
                    ? depById.get(item.main_department_id)
                    : undefined;
                const photoUrl = dep ? resolvePhoto(dep.photo_url) : fallbackImageUrl();
                const mainCell =
                  item.main_department_id == null || item.main_department_id === item.department_id
                    ? "нет"
                    : (mainDep?.title ?? "—");
                const did = item.department_id ?? 0;
                return (
                  <tr key={`${did}-${item.sort_order}`} className={hierarchyClass(item.role ?? "")}>
                    <td className="app-table__col-order">
                      <div className="order-buttons">
                        <button
                          type="button"
                          className="move-btn"
                          disabled={!isDraft || idx === 0 || controlsLocked}
                          title="Выше"
                          onClick={() => void handleMove(did, "up")}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="move-btn"
                          disabled={
                            !isDraft || idx === sortedItems.length - 1 || controlsLocked
                          }
                          title="Ниже"
                          onClick={() => void handleMove(did, "down")}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="app-table__col-photo">
                      <img src={photoUrl} alt="" />
                    </td>
                    <td className="app-table__col-name">{dep?.title ?? `ID ${did}`}</td>
                    <td className="app-table__col-employees">{dep?.employee_count ?? "—"}</td>
                    <td className="app-table__col-salary">
                      {item.salary != null && !Number.isNaN(item.salary)
                        ? `${Math.round(item.salary)} ₽`
                        : "—"}
                    </td>
                    <td className="app-table__col-role">
                      <div className="role-form">
                        {isDraft ? (
                          <select
                            className="role-select"
                            value={roleForSelect(item.role ?? "")}
                            onChange={(e) => void handleRoleChange(item, e.target.value)}
                            disabled={controlsLocked}
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{item.role}</span>
                        )}
                      </div>
                    </td>
                    <td className="app-table__col-main">{mainCell}</td>
                    <td className="app-table__col-remove">
                      {isDraft ? (
                        <button
                          type="button"
                          className="department-application-page__btn-remove-line"
                          disabled={controlsLocked}
                          onClick={() => void handleRemoveLine(did)}
                        >
                          Удалить
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isDraft ? (
          <form className="department-application-page__delete-form" onSubmit={handleDeleteApplication}>
            <button
              type="submit"
              className="search-btn department-application-page__delete-btn"
              disabled={controlsLocked}
            >
              Удалить заявку
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
