import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteDepartmentApplication,
  editDepartmentInApplication,
  fallbackImageUrl,
  getDepartmentApplication,
  listDepartments,
  objectUrlFromKey,
  type Department,
  type DepartmentApplicationDetailResponse,
  type DepartmentApplicationItemJSON,
} from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK, MOCK_APPLICATION_DETAIL } from "../../modules/mock";
import { Spinner } from "react-bootstrap";
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

export default function DepartmentApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DepartmentApplicationDetailResponse | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadApplication = useCallback(async () => {
    if (!id) return;
    const res = await getDepartmentApplication(Number(id));
    if (res) setData(res);
    else if (Number(id) === MOCK_APPLICATION_DETAIL.department_application.department_application_id) {
      setData(MOCK_APPLICATION_DETAIL);
    } else {
      setData(null);
    }
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
    if (!id) return;
    const load = async () => {
      setLoading(true);
      await reloadApplication();
      setLoading(false);
    };
    void load();
  }, [id, reloadApplication]);

  const depById = useMemo(() => {
    const m = new Map<number, Department>();
    departments.forEach((d) => m.set(d.department_id, d));
    return m;
  }, [departments]);

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => a.sort_order - b.sort_order);
  }, [data?.items]);

  const handleMove = async (departmentId: number, direction: "up" | "down") => {
    if (!data) return;
    const ok = await editDepartmentInApplication(departmentId, data.department_application.department_application_id, {
      direction,
    });
    if (ok) await reloadApplication();
    else window.alert("Не удалось изменить порядок. Нужна авторизация или ошибка сервера.");
  };

  const handleRoleChange = async (item: DepartmentApplicationItemJSON, role: string) => {
    if (!data) return;
    const ok = await editDepartmentInApplication(
      item.department_id,
      data.department_application.department_application_id,
      {
        role,
        sort_order: item.sort_order,
        salary: item.salary ?? undefined,
      },
    );
    if (ok) await reloadApplication();
    else window.alert("Не удалось сохранить роль. Нужна авторизация или ошибка сервера.");
  };

  const handleDeleteApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    if (!window.confirm("Удалить заявку?")) return;
    const ok = await deleteDepartmentApplication(data.department_application.department_application_id);
    if (ok) navigate("/");
    else window.alert("Не удалось удалить заявку. Нужна авторизация или ошибка сервера.");
  };

  if (loading) {
    return (
      <div className="department-application-page">
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="department-application-page">
        <p className="application-not-found">Заявка не найдена.</p>
      </div>
    );
  }

  const app = data.department_application;

  return (
    <div className="department-application-page">
      <div className="application-detail">
        <div className="application-detail__header-card">
          <h1 className="application-detail__title">Заявка на объединение департаментов</h1>
          <div className="application-detail__info">
            <div className="application-detail__info-item">
              <strong>ID заявки:</strong> {app.department_application_id}
            </div>
            <div className="application-detail__info-item">
              <strong>Количество отделов:</strong> {data.items.length}
            </div>
          </div>
        </div>

        <div className="app-table-wrapper department-application-page__table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="app-table__col-order" aria-hidden="true" />
                <th className="app-table__col-photo">Фото</th>
                <th className="app-table__col-name">Наименование отдела</th>
                <th className="app-table__col-employees">Сотрудников</th>
                <th className="app-table__col-salary">Зарплата руководителя</th>
                <th className="app-table__col-role">Роль в структуре</th>
                <th className="app-table__col-main">Руководящий отдел</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => {
                const dep = depById.get(item.department_id);
                const mainDep =
                  item.main_department_id != null
                    ? depById.get(item.main_department_id)
                    : undefined;
                const photoUrl = dep ? resolvePhoto(dep.photo_url) : fallbackImageUrl();
                const salaryStr = item.salary != null ? `${Math.round(item.salary)} ₽` : "—";
                const mainCell =
                  item.main_department_id == null || item.main_department_id === item.department_id
                    ? "нет"
                    : (mainDep?.title ?? "—");
                return (
                  <tr key={`${item.department_id}-${item.sort_order}`} className={hierarchyClass(item.role)}>
                    <td className="app-table__col-order">
                      <div className="order-buttons">
                        <button
                          type="button"
                          className="move-btn"
                          disabled={idx === 0}
                          title="Выше"
                          onClick={() => void handleMove(item.department_id, "up")}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="move-btn"
                          disabled={idx === sortedItems.length - 1}
                          title="Ниже"
                          onClick={() => void handleMove(item.department_id, "down")}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="app-table__col-photo">
                      <img src={photoUrl} alt="" />
                    </td>
                    <td className="app-table__col-name">{dep?.title ?? `ID ${item.department_id}`}</td>
                    <td className="app-table__col-employees">{dep?.employee_count ?? "—"}</td>
                    <td className="app-table__col-salary">{salaryStr}</td>
                    <td className="app-table__col-role">
                      <div className="role-form">
                        <select
                          className="role-select"
                          value={roleForSelect(item.role)}
                          onChange={(e) => void handleRoleChange(item, e.target.value)}
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="app-table__col-main">{mainCell}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form className="department-application-page__delete-form" onSubmit={handleDeleteApplication}>
          <button type="submit" className="search-btn department-application-page__delete-btn">
            Удалить заявку
          </button>
        </form>
      </div>
    </div>
  );
}
