import "./Header.css";
import logo from "../../assets/logo.png";

type HeaderProps = {
  variant?: "default" | "center";
};

export default function Header({ variant = "default" }: HeaderProps) {
  const cls = variant === "center" ? "header-center" : undefined;

  return (
    <header className={cls}>
      <a href="/" className="header-logo">
        <img src={logo} alt="Логотип" />
      </a>
    </header>
  );
}
