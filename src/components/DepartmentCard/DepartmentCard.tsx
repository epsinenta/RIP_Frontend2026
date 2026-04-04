import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type Department,
} from "../../modules/departmentsApi";
import { addDepartmentToMockApplication } from "../../modules/mock";
import "./DepartmentCard.css";

const CART_UPDATED = "department-cart-updated";

function resolvePhotoSrc(photo_url: string, imageError: boolean): string {
  if (imageError || !photo_url) return fallbackImageUrl();
  return resolveMediaUrl(photo_url);
}

export default function DepartmentCard({ department }: { department: Department }) {
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
    setAdding(true);
    try {
      const result = await addDepartmentToMockApplication(department.department_id);
      if (result.ok) {
        window.dispatchEvent(new Event(CART_UPDATED));
      } else {
        window.alert("message" in result ? result.message : "Не удалось добавить отдел в заявку.");
      }
    } finally {
      setAdding(false);
    }
  };

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
      <button
        type="button"
        className="card-add-btn"
        onClick={handleAdd}
        disabled={adding}
      >
        {adding ? "Добавление…" : "Добавить в заявку"}
      </button>
    </div>
  );
}
