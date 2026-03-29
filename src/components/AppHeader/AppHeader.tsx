import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./AppHeader.css";

export default function AppHeader() {
  return (
    <header className="app-header">
      <nav className="app-header__navbar" aria-label="Основная навигация">
        <Link to="/" className="app-header__logo">
          <img src={logo} alt="Логотип" />
        </Link>
      </nav>
    </header>
  );
}
