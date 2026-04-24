import "./CartRow.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDepartmentApplicationCart } from "../../store/thunks/departmentApplicationThunks";

export default function CartRow() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const { cart, cartLoading } = useAppSelector((s) => s.departmentApplication);

  useEffect(() => {
    void dispatch(fetchDepartmentApplicationCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const load = () => {
      void dispatch(fetchDepartmentApplicationCart());
    };
    window.addEventListener("department-cart-updated", load);
    return () => window.removeEventListener("department-cart-updated", load);
  }, [dispatch]);

  const count = isAuthenticated ? (cart?.departments_count ?? 0) : 0;
  const hasDraft = isAuthenticated && Boolean(cart?.has_draft);
  const applicationId = isAuthenticated ? cart?.id : undefined;
  const iconSrc = `${import.meta.env.BASE_URL}department.svg`;

  const inner = (
    <>
      <img src={iconSrc} alt="" className="cart-row__icon" />
      <span className="cart-row__text">
        Отделов в заявке: {count}
        {cartLoading ? "…" : ""}
      </span>
    </>
  );

  if (isAuthenticated && hasDraft && count > 0 && applicationId != null) {
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
