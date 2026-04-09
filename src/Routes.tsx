export const ROUTES = {
  DEPARTMENTS: "/",
  DEPARTMENT: "/department/:id",
  DEPARTMENT_APPLICATION: "/department_application/:id",
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  DEPARTMENT_APPLICATIONS: "/department_applications",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  DEPARTMENTS: "Главная",
  DEPARTMENT: "Департамент",
  DEPARTMENT_APPLICATION: "Заявка",
  SIGN_IN: "Вход",
  SIGN_UP: "Регистрация",
  DEPARTMENT_APPLICATIONS: "Заявки",
};
