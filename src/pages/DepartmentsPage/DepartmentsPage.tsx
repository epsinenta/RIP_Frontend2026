import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Search from "../../components/InputField/InputField";
import DepartmentsList from "../../components/DepartmentsList/DepartmentsList";
import CartRow from "../../components/CartRow/CartRow";
import type { Department } from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK, filterMockDepartmentsByTitle } from "../../modules/mock";
import "./DepartmentsPage.css";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS_MOCK);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDepartments(DEPARTMENTS_MOCK);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    try {
      setDepartments(filterMockDepartmentsByTitle(searchTitle));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="departments-page">
      <Search query={searchTitle} onQueryChange={setSearchTitle} onSearch={handleSearch} />
      <div className="space">
        <main className="departments-page__main">
          <CartRow />
          {loading ? (
            <div className="departments-page__loading">
              <Spinner animation="border" role="status" aria-label="Загрузка">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : (
            <div className="services-grid departments-page__grid">
              {departments.length > 0 ? (
                <DepartmentsList departments={departments} />
              ) : (
                <div className="departments-page__empty">
                  {searchTitle
                    ? `По запросу «${searchTitle}» ничего не найдено`
                    : "Подразделения не найдены"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
