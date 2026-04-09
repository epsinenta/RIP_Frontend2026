import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DepartmentsPage from "./pages/DepartmentsPage/DepartmentsPage";
import { ROUTES } from "./Routes";
import DepartmentPage from "./pages/DepartmentPage/DepartmentPage";
import DepartmentApplicationPage from "./pages/DepartmentApplicationPage/DepartmentApplicationPage";
import SignInPage from "./pages/SignInPage/SignInPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import DepartmentApplicationsPage from "./pages/DepartmentApplicationsPage/DepartmentApplicationsPage";
import MainLayout from "./layouts/MainLayout";
import { isTauriGuest } from "./modules/appEnv";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";
import "./theme-1c.css";
import "./index.css";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DEPARTMENTS} element={<DepartmentsPage />} />
          <Route path="/departments" element={<Navigate to="/" replace />} />
          <Route path={ROUTES.DEPARTMENT} element={<DepartmentPage />} />
          <Route path={ROUTES.DEPARTMENT_APPLICATION} element={<DepartmentApplicationPage />} />
          {isTauriGuest ? (
            <Route path="*" element={<Navigate to={ROUTES.DEPARTMENTS} replace />} />
          ) : (
            <>
              <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
              <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
              <Route path={ROUTES.DEPARTMENT_APPLICATIONS} element={<DepartmentApplicationsPage />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
