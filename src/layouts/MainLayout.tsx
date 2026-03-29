import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <AppHeader />
      <Breadcrumbs />
      <Outlet />
    </div>
  );
}
