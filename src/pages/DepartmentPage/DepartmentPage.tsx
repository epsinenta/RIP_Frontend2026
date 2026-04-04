import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, ProgressBar, Spinner } from "react-bootstrap";
import {
  addDepartmentToApplication,
  departmentClipDescription,
  fallbackImageUrl,
  getDepartment,
  listDepartments,
  objectUrlFromKey,
} from "../../modules/departmentsApi";
import type { Department } from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK } from "../../modules/mock";
import { useDepartmentSimilarity } from "../../hooks/useDepartmentSimilarity";
import "./DepartmentPage.css";

function resolveMediaUrl(key: string): string {
  if (!key) return "";
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:")
  ) {
    return key;
  }
  return objectUrlFromKey(key);
}

export default function DepartmentPage() {
  const [department, setDepartment] = useState<Department | null>(null);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [adding, setAdding] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setMediaError(false);
      try {
        const list = await listDepartments();
        const baseList = list.length > 0 ? list : DEPARTMENTS_MOCK;
        const data = await getDepartment(Number(id));
        const resolved =
          data ?? DEPARTMENTS_MOCK.find((d) => d.department_id === Number(id)) ?? null;

        const map = new Map(baseList.map((d) => [d.department_id, d]));
        if (resolved) {
          map.set(resolved.department_id, resolved);
        }

        if (!cancelled) {
          setAllDepartments(Array.from(map.values()));
          setDepartment(resolved);
        }
      } catch {
        const resolved =
          DEPARTMENTS_MOCK.find((d) => d.department_id === Number(id)) ?? null;
        if (!cancelled) {
          setAllDepartments(DEPARTMENTS_MOCK);
          setDepartment(resolved);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const clipItems = useMemo(
    () =>
      allDepartments.map((d) => ({
        id: d.department_id,
        description: departmentClipDescription(d),
      })),
    [allDepartments],
  );

  const { ready, progress, error, rankedSimilar, hasEmbeddings } = useDepartmentSimilarity(
    clipItems,
    department?.department_id ?? null,
    6,
  );

  const depById = useMemo(() => {
    const m = new Map<number, Department>();
    allDepartments.forEach((d) => m.set(d.department_id, d));
    return m;
  }, [allDepartments]);

  const handleAdd = async () => {
    if (!department) return;
    setAdding(true);
    try {
      const result = await addDepartmentToApplication(department.department_id);
      if (result.ok) {
        window.dispatchEvent(new Event("department-cart-updated"));
      } else {
        window.alert(result.message ?? "Не удалось добавить отдел в заявку.");
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="vibes-page">
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="vibes-page">
        <div className="department-not-found">
          <h1>Подразделение не найдено</h1>
        </div>
      </div>
    );
  }

  const videoUrl = resolveMediaUrl(department.video);
  const posterUrl = resolveMediaUrl(department.photo_url) || fallbackImageUrl();
  const showVideo = Boolean(department.video?.trim()) && !mediaError;
  const showSimilarProgress = clipItems.length > 0 && !ready && !error;
  const showSimilarEmpty = ready && hasEmbeddings && rankedSimilar.length === 0;

  return (
    <div className="vibes-page vibes-page--scroll">
      <div className="vibes-hero">
        <div className="vibes-viewport">
          <div className="vibes-media">
            {showVideo ? (
              <video
                className="vibes-video"
                controls
                autoPlay
                muted
                loop
                playsInline
                poster={posterUrl}
                onError={() => setMediaError(true)}
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div
                className="vibes-fallback"
                style={{
                  backgroundImage: `url(${posterUrl})`,
                }}
              />
            )}
            <div className="vibes-overlay" aria-hidden />
            <div className="vibes-content">
              <h1 className="vibes-title">{department.title}</h1>
              <p className="vibes-meta">
                Сотрудников: {department.employee_count} · Подчиняется: {department.reports_to}
              </p>
              <p className="vibes-description">{department.short_description}</p>
              <div className="vibes-manager">
                <span className="vibes-manager__label">Руководитель</span>
                <span className="vibes-manager__name">{department.head}</span>
              </div>
              <div className="vibes-actions">
                <button
                  type="button"
                  className="search-btn"
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? "Добавление…" : "Добавить в заявку"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="department-similar" aria-labelledby="department-similar-title">
        <div className="department-similar__inner">
          <h2 id="department-similar-title" className="department-similar__title">
            Похожие подразделения
          </h2>
          <p className="department-similar__subtitle">
            Список построен по смысловой близости официальных описаний подразделений в оргструктуре.
          </p>

          {error ? (
            <Alert variant="warning" className="department-similar__alert">
              Не удалось сформировать рекомендации. Обновите страницу или зайдите позже.
            </Alert>
          ) : null}

          {showSimilarProgress ? (
            <div className="department-similar__progress-wrap">
              <p className="department-similar__progress-label">
                Анализируем описания подразделений…
              </p>
              <ProgressBar
                now={progress}
                label={`${Math.round(progress)}%`}
                animated
                className="department-similar__progress"
              />
            </div>
          ) : null}

          {showSimilarEmpty ? (
            <p className="department-similar__empty">Нет других отделов для сравнения.</p>
          ) : null}

          <ul className="department-similar__list">
            {rankedSimilar.map(({ id: sid, score }) => {
              const d = depById.get(sid);
              if (!d) return null;
              const thumb = resolveMediaUrl(d.photo_url) || fallbackImageUrl();
              return (
                <li key={sid}>
                  <Link to={`/department/${sid}`} className="department-similar__row">
                    <img src={thumb} alt="" className="department-similar__thumb" />
                    <div className="department-similar__body">
                      <span className="department-similar__name">{d.title}</span>
                      <span className="department-similar__desc">{d.short_description}</span>
                    </div>
                    <div className="department-similar__stats">
                      <span className="department-similar__stats-label">Сходство</span>
                      <span className="department-similar__stats-value">
                        {(score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
