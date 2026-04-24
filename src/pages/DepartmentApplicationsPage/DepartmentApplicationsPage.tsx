import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Table, Button, Form } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setListFilters } from "../../store/slices/departmentApplicationSlice";
import {
  fetchDepartmentApplicationsList,
  finishDepartmentApplication,
} from "../../store/thunks/departmentApplicationThunks";
import { ROUTES } from "../../Routes";
import RequestBlockingOverlay from "../../components/RequestBlockingOverlay/RequestBlockingOverlay";
import { useShortPolling } from "../../hooks/useShortPolling";
import "./DepartmentApplicationsPage.css";

const DEPARTMENT_APPLICATIONS_POLL_MS = 4000;

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGN_IN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useShortPolling(
    () => {
      void dispatch(fetchDepartmentApplicationsList());
    },
    isAuthenticated,
    DEPARTMENT_APPLICATIONS_POLL_MS,
  );

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

  const mutationOverlay = Object.keys(itemMutationLoading).length > 0;

  if (!isAuthenticated) return null;

  return (
    <div className="dept-apps-page">
      <div className="dept-apps-page__inner dept-apps-page__inner--relative">
        <RequestBlockingOverlay active={mutationOverlay} />
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
                disabled={mutationOverlay}
              />
            </Form.Group>
            <Form.Group className="dept-apps-page__fg">
              <Form.Label>По дату</Form.Label>
              <Form.Control
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                disabled={mutationOverlay}
              />
            </Form.Group>
            <Form.Group className="dept-apps-page__fg">
              <Form.Label>Статус</Form.Label>
              <Form.Select
                value={draftStatus}
                onChange={(e) => setDraftStatus(e.target.value)}
                disabled={mutationOverlay}
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
                  disabled={mutationOverlay}
                />
              </Form.Group>
            ) : null}
          </div>
          <Button
            className="dept-apps-page__apply"
            onClick={handleApplyFilters}
            disabled={listLoading || mutationOverlay}
          >
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
              {visible.map((row, rowIdx) => {
                const id = row.department_application_id;
                const finKey = id != null ? `finish-${id}` : "";
                const finBusy = finKey ? Boolean(itemMutationLoading[finKey]) : false;
                return (
                  <tr key={id != null ? String(id) : `row-${rowIdx}`}>
                    <td>
                      <button
                        type="button"
                        className="dept-apps-page__linkish"
                        onClick={() => goApp(id)}
                        disabled={mutationOverlay}
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
