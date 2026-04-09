import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import {
  editDepartmentInApplication,
  fallbackImageUrl,
  listDepartments,
  objectUrlFromKey,
  type Department,
  type DepartmentApplicationItemJSON,
} from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK, MOCK_APPLICATION_DETAIL } from "../../modules/mock";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteDepartmentApplication as deleteDepartmentApplicationThunk,
  fetchDepartmentApplicationDetail,
  formDepartmentApplication,
  moveDepartmentInApplication,
  updateDepartmentLineInApplication,
  type DepartmentApplicationDetailPayload,
} from "../../store/slices/departmentApplicationSlice";
import type {
  WebBackendInternalAppSerializerDepartmentApplicationDepartmentJSON,
  WebBackendInternalAppSerializerDepartmentApplicationJSON,
} from "../../api/Api";
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

export default function DepartmentApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const { detail, detailLoading, applicationMutationLoading } = useAppSelector(
    (s) => s.departmentApplication,
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [mockData, setMockData] = useState<DepartmentApplicationDetailPayload | null>(null);

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
    void dispatch(fetchDepartmentApplicationDetail(Number(id))).then((a) => {
      if (fetchDepartmentApplicationDetail.rejected.match(a)) {
        void reloadMock();
      }
    });
  }, [id, isAuthenticated, dispatch, reloadMock]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
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

  const handleMove = async (departmentId: number, direction: "up" | "down") => {
    if (!applicationId || !isDraft) return;
    if (mockData && !detail) {
      const ok = await editDepartmentInApplication(departmentId, applicationId, { direction });
      if (ok) void reloadMock();
      return;
    }
    void dispatch(moveDepartmentInApplication({ departmentId, applicationId, direction }));
  };

  const handleRoleChange = async (item: DepartmentApplicationDetailPayload["items"][0], role: string) => {
    if (!applicationId || !isDraft) return;
    const row = toItemJson(item);
    if (mockData && !detail) {
      const ok = await editDepartmentInApplication(item.department_id ?? 0, applicationId, {
        role,
        sort_order: row.sort_order,
      });
      if (ok) void reloadMock();
      return;
    }
    void dispatch(
      updateDepartmentLineInApplication({
        departmentId: item.department_id ?? 0,
        applicationId,
        body: {
          role,
          sort_order: row.sort_order,
        },
      }),
    );
  };

  const handleForm = () => {
    if (!applicationId || !isDraft) return;
    if (mockData && !detail) {
      setMockData((prev) =>
        prev
          ? {
              ...prev,
              department_application: { ...prev.department_application, status: "formed" },
            }
          : null,
      );
      return;
    }
    void dispatch(formDepartmentApplication(applicationId));
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
      await dispatch(deleteDepartmentApplicationThunk(applicationId)).unwrap();
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

  return (
    <div className="department-application-page">
      <div className="application-detail">
        <div className="application-detail__header-card">
          <h1 className="application-detail__title">Заявка на изменение структуры</h1>
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
          </div>
        </div>

        {isDraft ? (
          <div className="department-application-page__actions">
            <Button
              type="button"
              className="department-application-page__btn-form"
              onClick={handleForm}
              disabled={applicationMutationLoading}
            >
              Подтвердить заявку (сформировать)
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
                          disabled={!isDraft || idx === 0}
                          title="Выше"
                          onClick={() => void handleMove(did, "up")}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="move-btn"
                          disabled={!isDraft || idx === sortedItems.length - 1}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isDraft ? (
          <form className="department-application-page__delete-form" onSubmit={handleDeleteApplication}>
            <button type="submit" className="search-btn department-application-page__delete-btn">
              Удалить заявку
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
