import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addDepartmentToMockApplication,
  DEPARTMENTS_MOCK,
  getMockDepartment,
} from "../../modules/mock";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type Department,
} from "../../modules/departmentsApi";
import "./DepartmentPage.css";

export default function DepartmentPage() {
  const [department, setDepartment] = useState<Department | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [adding, setAdding] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      setDepartment(null);
      return;
    }
    setMediaError(false);
    const resolved =
      getMockDepartment(Number(id)) ??
      DEPARTMENTS_MOCK.find((d) => d.department_id === Number(id)) ??
      null;
    setDepartment(resolved);
  }, [id]);

  const videoUrl = useMemo(
    () => (department ? resolveMediaUrl(department.video) : ""),
    [department],
  );
  const posterUrl = useMemo(
    () =>
      department ? resolveMediaUrl(department.photo_url) || fallbackImageUrl() : fallbackImageUrl(),
    [department],
  );
  const showVideo = Boolean(department?.video?.trim()) && !mediaError;

  const handleAdd = async () => {
    if (!department) return;
    setAdding(true);
    try {
      const result = await addDepartmentToMockApplication(department.department_id);
      if (result.ok) {
        window.dispatchEvent(new Event("department-cart-updated"));
      } else {
        window.alert("message" in result ? result.message : "Не удалось добавить отдел в заявку.");
      }
    } finally {
      setAdding(false);
    }
  };

  if (!id || !department) {
    return (
      <div className="vibes-page vibes-page--scroll">
        <div className="department-not-found">
          <h1>Подразделение не найдено</h1>
        </div>
      </div>
    );
  }

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
    </div>
  );
}
