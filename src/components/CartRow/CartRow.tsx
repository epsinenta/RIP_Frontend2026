import "./CartRow.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDepartmentApplicationCart, objectUrlFromKey } from "../../modules/departmentsApi";

export default function CartRow() {
  const [count, setCount] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [applicationId, setApplicationId] = useState<number | undefined>();

  useEffect(() => {
    const load = () => {
      void getDepartmentApplicationCart().then((data) => {
        setCount(data.departments_count);
        setHasDraft(data.has_draft);
        setApplicationId(data.id);
      });
    };
    load();
    window.addEventListener("department-cart-updated", load);
    return () => window.removeEventListener("department-cart-updated", load);
  }, []);

  const iconSrc = objectUrlFromKey("department.svg");

  const inner = (
    <>
      <img src={iconSrc} alt="" className="cart-row__icon" />
      <span className="cart-row__text">Отделов в заявке: {count}</span>
    </>
  );

  if (hasDraft && count > 0 && applicationId != null) {
    return (
      <div className="cart-row">
        <Link to={`/department_application/${applicationId}`} className="cart-row__link">
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-row">
      <div className="cart-row__inactive">{inner}</div>
    </div>
  );
}
