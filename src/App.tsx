import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DepartmentsPage from "./pages/DepartmentsPage/DepartmentsPage";
import { ROUTES } from "./Routes";
import DepartmentPage from "./pages/DepartmentPage/DepartmentPage";
import DepartmentApplicationPage from "./pages/DepartmentApplicationPage/DepartmentApplicationPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./theme-1c.css";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.DEPARTMENTS} element={<DepartmentsPage />} />
        <Route path="/departments" element={<Navigate to="/" replace />} />
        <Route path={ROUTES.DEPARTMENT} element={<DepartmentPage />} />
        <Route path={ROUTES.DEPARTMENT_APPLICATION} element={<DepartmentApplicationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
