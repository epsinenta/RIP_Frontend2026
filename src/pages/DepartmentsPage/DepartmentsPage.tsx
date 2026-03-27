import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Search from "../../components/InputField/InputField";
import DepartmentsList from "../../components/DepartmentsList/DepartmentsList";
import CartRow from "../../components/CartRow/CartRow";
import { listDepartments } from "../../modules/departmentsApi";
import type { Department } from "../../modules/departmentsApi";
import { DEPARTMENTS_MOCK } from "../../modules/mock";
import "./DepartmentsPage.css";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (useMock) {
      setDepartments(DEPARTMENTS_MOCK);
    } else {
      listDepartments()
        .then((data) => {
          if (data.length > 0) {
            setDepartments(data);
          } else {
            setDepartments(DEPARTMENTS_MOCK);
            setUseMock(true);
          }
        })
        .catch(() => {
          setDepartments(DEPARTMENTS_MOCK);
          setUseMock(true);
        });
    }
  }, [useMock]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filtered = await listDepartments({ title: searchTitle });

      if (filtered.length > 0) {
        setDepartments(filtered);
        setUseMock(false);
      } else {
        if (useMock) {
          const filteredMock = DEPARTMENTS_MOCK.filter((d) =>
            d.title.toLowerCase().includes(searchTitle.toLowerCase()),
          );
          setDepartments(filteredMock);
        } else {
          setDepartments([]);
        }
      }
    } catch {
      const filteredMock = DEPARTMENTS_MOCK.filter((d) =>
        d.title.toLowerCase().includes(searchTitle.toLowerCase()),
      );
      setDepartments(filteredMock);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="departments-page">
      <Header />
      <Search query={searchTitle} onQueryChange={setSearchTitle} onSearch={handleSearch} />
      <div className="space">
        <main className="departments-page__main">
          <CartRow />
          {loading ? (
            <div>Загрузка...</div>
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
