import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Table, Button, Form } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchDepartmentApplicationsList,
  finishDepartmentApplication,
  setListFilters,
} from "../../store/slices/departmentApplicationSlice";
import { ROUTES } from "../../Routes";
import "./DepartmentApplicationsPage.css";

function statusLabel(s: string | undefined): string {
  const m: Record<string, string> = {
    draft: "Черновик",
    formed: "Сформирована",
    completed: "Завершена",
    rejected: "Отклонена",
    deleted: "Удалена",
  };
  return s ? (m[s] ?? s) : "—";
}

export default function DepartmentApplicationsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isModerator } = useAppSelector((s) => s.user);
  const { list, listLoading, listError, filters, itemMutationLoading } = useAppSelector(
    (s) => s.departmentApplication,
  );
  const [creatorFilter, setCreatorFilter] = useState("");
  const [draftFrom, setDraftFrom] = useState(filters.fromDate);
  const [draftTo, setDraftTo] = useState(filters.toDate);
  const [draftStatus, setDraftStatus] = useState(filters.status);

  useEffect(() => {
    setDraftFrom(filters.fromDate);
    setDraftTo(filters.toDate);
    setDraftStatus(filters.status);
  }, [filters.fromDate, filters.toDate, filters.status]);

  const load = useCallback(() => {
    void dispatch(fetchDepartmentApplicationsList());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGN_IN, { replace: true });
      return;
    }
    load();
    const id = window.setInterval(load, 4000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, navigate, load]);

  const visible = useMemo(() => {
    const q = creatorFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => (a.creator_login ?? "").toLowerCase().includes(q));
  }, [list, creatorFilter]);

  const handleApplyFilters = () => {
    dispatch(
      setListFilters({
        fromDate: draftFrom,
        toDate: draftTo,
        status: draftStatus,
      }),
    );
    void dispatch(fetchDepartmentApplicationsList());
  };

  const goApp = (id: number | undefined) => {
    if (id != null) navigate(`/department_application/${id}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="dept-apps-page">
      <div className="dept-apps-page__inner">
        <h1 className="dept-apps-page__heading">
          {isModerator ? "Заявки (модератор)" : "Мои заявки"}
        </h1>

        <section className="dept-apps-page__filters">
          <div className="dept-apps-page__filter-row">
            <Form.Group className="dept-apps-page__fg">
              <Form.Label>С даты</Form.Label>
              <Form.Control
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="dept-apps-page__fg">
              <Form.Label>По дату</Form.Label>
              <Form.Control
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="dept-apps-page__fg">
              <Form.Label>Статус</Form.Label>
              <Form.Select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
              >
                <option value="">Все</option>
                <option value="formed">Сформирована</option>
                <option value="completed">Завершена</option>
                <option value="rejected">Отклонена</option>
              </Form.Select>
            </Form.Group>
            {isModerator ? (
              <Form.Group className="dept-apps-page__fg dept-apps-page__fg--grow">
                <Form.Label>Создатель</Form.Label>
                <Form.Control
                  type="text"
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  placeholder="Часть логина"
                />
              </Form.Group>
            ) : null}
          </div>
          <Button className="dept-apps-page__apply" onClick={handleApplyFilters}>
            Применить фильтры
          </Button>
        </section>

        {listError ? <div className="dept-apps-page__error">{listError}</div> : null}

        {listLoading && visible.length === 0 ? (
          <div className="dept-apps-page__loader">
            <Spinner animation="border" />
          </div>
        ) : null}

        <div className="dept-apps-page__table-wrap">
          <Table striped bordered hover responsive className="dept-apps-page__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Статус</th>
                <th>Создатель</th>
                <th>Создана</th>
                <th>Формирование</th>
                <th>Завершение</th>
                <th>Модератор</th>
                {isModerator ? <th>Действия</th> : null}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const id = row.department_application_id;
                const finKey = id != null ? `finish-${id}` : "";
                const finBusy = finKey ? Boolean(itemMutationLoading[finKey]) : false;
                return (
                  <tr key={id ?? Math.random()}>
                    <td>
                      <button
                        type="button"
                        className="dept-apps-page__linkish"
                        onClick={() => goApp(id)}
                      >
                        {id}
                      </button>
                    </td>
                    <td>{statusLabel(row.status)}</td>
                    <td>{row.creator_login ?? "—"}</td>
                    <td>
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString("ru-RU")
                        : "—"}
                    </td>
                    <td>
                      {row.forming_date
                        ? new Date(row.forming_date).toLocaleDateString("ru-RU")
                        : "—"}
                    </td>
                    <td>
                      {row.finish_date
                        ? new Date(row.finish_date).toLocaleString("ru-RU")
                        : "—"}
                    </td>
                    <td>{row.moderator_login ?? "—"}</td>
                    {isModerator ? (
                      <td>
                        {row.status === "formed" && id != null ? (
                          <div className="dept-apps-page__actions">
                            <Button
                              size="sm"
                              className="dept-apps-page__btn-finish"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishDepartmentApplication({
                                    applicationId: id,
                                    status: "completed",
                                  }),
                                )
                              }
                            >
                              Завершить
                            </Button>
                            <Button
                              size="sm"
                              className="dept-apps-page__btn-reject"
                              disabled={finBusy}
                              onClick={() =>
                                void dispatch(
                                  finishDepartmentApplication({
                                    applicationId: id,
                                    status: "rejected",
                                  }),
                                )
                              }
                            >
                              Отклонить
                            </Button>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {!listLoading && visible.length === 0 ? (
          <p className="dept-apps-page__empty">Нет заявок по текущим условиям.</p>
        ) : null}
      </div>
    </div>
  );
}
