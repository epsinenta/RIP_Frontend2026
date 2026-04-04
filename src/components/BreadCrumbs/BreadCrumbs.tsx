import { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { getMockDepartment } from "../../modules/mock";
import { ROUTES } from "../../Routes";
import "./Breadcrumbs.css";

type Crumb = { label: string; to?: string };

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const [departmentTitle, setDepartmentTitle] = useState<string | null>(null);

  useEffect(() => {
    const m = matchPath(ROUTES.DEPARTMENT, pathname);
    const rawId = m?.params.id;
    if (rawId == null) {
      setDepartmentTitle(null);
      return;
    }
    const id = Number(rawId);
    const dep = getMockDepartment(id);
    setDepartmentTitle(dep?.title ?? `Департамент ${id}`);
  }, [pathname]);

  const crumbs: Crumb[] = (() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Главная" }];
    }

    const deptMatch = matchPath(ROUTES.DEPARTMENT, pathname);
    if (deptMatch?.params.id) {
      const title =
        departmentTitle ?? (deptMatch.params.id ? `Департамент ${deptMatch.params.id}` : "Департамент");
      return [{ label: "Главная", to: "/" }, { label: title }];
    }

    const appMatch = matchPath(ROUTES.DEPARTMENT_APPLICATION, pathname);
    if (appMatch?.params.id) {
      return [
        { label: "Главная", to: "/" },
        { label: `Заявка №${appMatch.params.id}` },
      ];
    }

    return [{ label: "Главная", to: "/" }, { label: "Страница" }];
  })();

  return (
    <nav className="app-breadcrumbs" aria-label="Навигационная цепочка">
      <ol className="app-breadcrumbs__list">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="app-breadcrumbs__item">
              {crumb.to != null && !last ? (
                <Link to={crumb.to} className="app-breadcrumbs__link">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={last ? "app-breadcrumbs__current" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
