import { type MouseEvent } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/userSlice";
import { ROUTES } from "../../Routes";
import { isTauriGuest } from "../../modules/appEnv";
import "./AppHeader.css";

export default function AppHeader() {
  const { isAuthenticated, username } = useAppSelector((s) => s.user);
  const dispatch = useAppDispatch();

  const handleBurgerClick = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.classList.toggle("active");
  };

  const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleLogout = () => {
    void dispatch(logoutUser());
  };

  return (
    <header className="app-header">
      <div className="app-header__wrapper">
        <div className="app-header__logo">
          <NavLink to={ROUTES.DEPARTMENTS} className="app-header__logo-link">
            <img src={logo} alt="Логотип" />
          </NavLink>
        </div>

        <nav className="app-header__nav" aria-label="Основная навигация">
          <NavLink to={ROUTES.DEPARTMENTS} className="app-header__link" end>
            Главная
          </NavLink>
          {isTauriGuest ? (
            <NavLink to="/department_application/1" className="app-header__link">
              Демо-заявка
            </NavLink>
          ) : isAuthenticated ? (
            <>
              <NavLink to={ROUTES.DEPARTMENT_APPLICATIONS} className="app-header__link">
                Заявки
              </NavLink>
              <Link to={ROUTES.DEPARTMENTS} className="app-header__link" onClick={handleLogout}>
                Выход
              </Link>
              <span className="app-header__username">{username}</span>
            </>
          ) : (
            <>
              <NavLink to={ROUTES.SIGN_IN} className="app-header__link">
                Вход
              </NavLink>
              <NavLink to={ROUTES.SIGN_UP} className="app-header__link">
                Регистрация
              </NavLink>
            </>
          )}
        </nav>

        <div className="app-header__mobile-wrapper" onClick={handleBurgerClick}>
          <div className="app-header__mobile-target" />
          <div className="app-header__mobile-menu" onClick={handleMenuClick}>
            <NavLink to={ROUTES.DEPARTMENTS} className="app-header__link" end>
              Главная
            </NavLink>
            {isTauriGuest ? (
              <NavLink to="/department_application/1" className="app-header__link">
                Демо-заявка
              </NavLink>
            ) : isAuthenticated ? (
              <>
                <NavLink to={ROUTES.DEPARTMENT_APPLICATIONS} className="app-header__link">
                  Заявки
                </NavLink>
                <NavLink to={ROUTES.DEPARTMENTS} className="app-header__link" onClick={handleLogout}>
                  Выход
                </NavLink>
                <span className="app-header__username app-header__username--mobile">{username}</span>
              </>
            ) : (
              <>
                <NavLink to={ROUTES.SIGN_IN} className="app-header__link">
                  Вход
                </NavLink>
                <NavLink to={ROUTES.SIGN_UP} className="app-header__link">
                  Регистрация
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
