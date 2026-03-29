export const ROUTES = {
  DEPARTMENTS: "/",
  DEPARTMENT: "/department/:id",
  DEPARTMENT_APPLICATION: "/department_application/:id",
};
export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  DEPARTMENTS: "Главная",
  DEPARTMENT: "Департамент",
  DEPARTMENT_APPLICATION: "Заявка",
};
