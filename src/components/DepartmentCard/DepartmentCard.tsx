import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import type { Department } from "../../modules/departmentsApi";
import { fallbackImageUrl, objectUrlFromKey } from "../../modules/departmentsApi";
import "./DepartmentCard.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addDepartmentToApplication } from "../../store/thunks/departmentApplicationThunks";

const CART_UPDATED = "department-cart-updated";

function resolvePhotoSrc(photo_url: string, imageError: boolean): string {
  if (imageError || !photo_url) return fallbackImageUrl();
  if (
    photo_url.startsWith("http://") ||
    photo_url.startsWith("https://") ||
    photo_url.startsWith("/") ||
    photo_url.startsWith("blob:")
  ) {
    return photo_url;
  }
  return objectUrlFromKey(photo_url);
}

export default function DepartmentCard({ department }: { department: Department }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const applicationMutationLoading = useAppSelector(
    (s) => s.departmentApplication.applicationMutationLoading,
  );
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(resolvePhotoSrc(department.photo_url, false));
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageUrl(resolvePhotoSrc(department.photo_url, false));
  }, [department.photo_url]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(fallbackImageUrl());
  };

  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setAdding(true);
    try {
      await dispatch(addDepartmentToApplication(department.department_id));
      window.dispatchEvent(new Event(CART_UPDATED));
    } catch {
      void 0;
    } finally {
      setAdding(false);
    }
  };

  const busy = adding || applicationMutationLoading;

  return (
    <div className="card-wrapper">
      <Link to={`/department/${department.department_id}`} className="card">
        <div className="card-accent-bar" />
        <img
          src={imageError ? fallbackImageUrl() : imageUrl}
          alt={department.title}
          onError={handleImageError}
        />
        <div className="card__body">
          <h1>{department.title}</h1>
          <p className="card__employees">Сотрудников: {department.employee_count}</p>
          <p className="card__description">{department.short_description}</p>
        </div>
      </Link>
      <button type="button" className="card-add-btn" onClick={handleAdd} disabled={busy}>
        {busy ? "Добавление…" : "Добавить в заявку"}
      </button>
    </div>
  );
}
