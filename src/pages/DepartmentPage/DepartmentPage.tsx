import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import {
  fallbackImageUrl,
  getDepartment,
  objectUrlFromKey,
} from "../../modules/departmentsApi";
import type { Department } from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK } from "../../modules/mock";
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
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setMediaError(false);
      try {
        const data = await getDepartment(Number(id));
        const resolved =
          data ?? DEPARTMENTS_MOCK.find((d) => d.department_id === Number(id)) ?? null;

        if (!cancelled) {
          setDepartment(resolved);
        }
      } catch {
        const resolved =
          DEPARTMENTS_MOCK.find((d) => d.department_id === Number(id)) ?? null;
        if (!cancelled) {
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
